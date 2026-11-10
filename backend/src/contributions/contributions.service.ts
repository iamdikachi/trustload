import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ContributionStatus,
  GroupStatus,
  LedgerEntryType,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateContributionOrderDto,
  PaypalWebhookEventDto,
} from './dto/contribution.dto';
import { PaypalService, PaypalWebhookHeaders } from './paypal.service';

@Injectable()
export class ContributionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paypalService: PaypalService,
  ) {}

  async createContributionOrder(
    groupIdParam: string | undefined,
    memberIdParam: string | undefined,
    dto: CreateContributionOrderDto,
  ) {
    const groupId = (groupIdParam ?? dto?.groupId)?.trim();
    const memberId = (memberIdParam ?? dto?.memberId)?.trim();

    if (!groupId || !memberId) {
      throw new BadRequestException('Both groupId and memberId are required.');
    }

    const member = await this.prisma.member.findFirst({
      where: { id: memberId, groupId },
      include: {
        user: true,
        group: true,
        contributions: true,
      },
    });

    if (!member) {
      throw new NotFoundException(
        `Member "${memberId}" was not found in group "${groupId}".`,
      );
    }

    const completedSum = member.contributions
      .filter((c) => c.status === ContributionStatus.COMPLETED)
      .reduce((sum, c) => sum + Number(c.amount), 0);

    const remainingExpected = Math.max(
      0,
      Number(member.contributionExpected) - completedSum,
    );

    const rawAmount =
      dto?.amount !== undefined
        ? Number(dto.amount)
        : remainingExpected > 0
          ? remainingExpected
          : Number(member.contributionExpected);

    if (!Number.isFinite(rawAmount) || rawAmount <= 0) {
      throw new BadRequestException(
        'Contribution amount must be a positive number.',
      );
    }

    const formattedAmount = rawAmount.toFixed(2);
    const currency = (dto?.currency ?? member.group.baseCurrency ?? 'USD')
      .trim()
      .toUpperCase();

    const paypalOrder = await this.paypalService.createOrder({
      amount: formattedAmount,
      currency,
      groupId,
      memberId,
      description: `TrustLoad group contribution (${member.group.name}) - ${member.user.name}`,
      returnUrl: dto?.returnUrl,
      cancelUrl: dto?.cancelUrl,
    });

    const contribution = await this.prisma.contribution.create({
      data: {
        memberId: member.id,
        amount: formattedAmount,
        currency,
        paypalOrderId: paypalOrder.id,
        status: ContributionStatus.PENDING,
      },
      include: {
        member: {
          include: {
            user: true,
          },
        },
      },
    });

    return {
      contribution,
      paypalOrder: {
        id: paypalOrder.id,
        status: paypalOrder.status,
        approveUrl: paypalOrder.approveUrl,
      },
    };
  }

  async captureContributionOrder(paypalOrderId: string) {
    const trimmedOrderId = paypalOrderId?.trim();
    if (!trimmedOrderId) {
      throw new BadRequestException('paypalOrderId is required.');
    }

    const existing = await this.prisma.contribution.findUnique({
      where: { paypalOrderId: trimmedOrderId },
    });

    if (!existing) {
      throw new NotFoundException(
        `Contribution with PayPal order ID "${trimmedOrderId}" not found.`,
      );
    }

    if (existing.status === ContributionStatus.COMPLETED) {
      return this.confirmContributionPayment({
        paypalOrderId: trimmedOrderId,
        paypalCaptureId: existing.paypalCaptureId,
      });
    }

    const captureResult =
      await this.paypalService.captureOrder(trimmedOrderId);

    return this.confirmContributionPayment({
      paypalOrderId: trimmedOrderId,
      paypalCaptureId: captureResult.captureId,
    });
  }

  async handlePaypalWebhook(
    headers: PaypalWebhookHeaders,
    body: PaypalWebhookEventDto,
  ) {
    await this.paypalService.verifyWebhookSignature(headers, body);

    const eventType = body.event_type;
    const supportedEvents = new Set([
      'PAYMENT.CAPTURE.COMPLETED',
      'CHECKOUT.ORDER.COMPLETED',
      'CHECKOUT.ORDER.APPROVED',
    ]);

    if (!supportedEvents.has(eventType)) {
      return {
        received: true,
        ignored: true,
        eventId: body.id,
        eventType,
      };
    }

    const paypalOrderId =
      this.paypalService.extractOrderIdFromWebhookBody(body);
    if (!paypalOrderId) {
      throw new BadRequestException(
        `Could not extract PayPal order ID from ${eventType} webhook payload.`,
      );
    }

    const paypalCaptureId =
      this.paypalService.extractCaptureIdFromWebhookBody(body);

    const confirmation = await this.confirmContributionPayment({
      paypalOrderId,
      paypalCaptureId,
    });

    return {
      received: true,
      eventId: body.id,
      eventType,
      ...confirmation,
    };
  }

  async confirmContributionPayment(params: {
    paypalOrderId: string;
    paypalCaptureId?: string | null;
  }) {
    const { paypalOrderId, paypalCaptureId } = params;

    return this.prisma.$transaction(
      async (tx) => {
        const contribution = await tx.contribution.findUnique({
          where: { paypalOrderId },
          include: {
            member: {
              include: {
                user: true,
                group: true,
              },
            },
          },
        });

        if (!contribution) {
          throw new NotFoundException(
            `Contribution for PayPal order "${paypalOrderId}" not found.`,
          );
        }

        const groupId = contribution.member.groupId;

        // Atomic conditional status transition to prevent race-condition double counting
        const updateResult = await tx.contribution.updateMany({
          where: {
            id: contribution.id,
            status: { not: ContributionStatus.COMPLETED },
          },
          data: {
            status: ContributionStatus.COMPLETED,
            ...(paypalCaptureId ? { paypalCaptureId } : {}),
          },
        });

        let idempotentReplay = updateResult.count === 0;

        // Check if ledger entry for this PayPal order ID already exists
        let ledgerEntry = await tx.ledgerEntry.findFirst({
          where: {
            groupId,
            type: LedgerEntryType.CONTRIBUTION,
            paypalRef: paypalOrderId,
          },
        });

        if (!idempotentReplay && !ledgerEntry) {
          ledgerEntry = await tx.ledgerEntry.create({
            data: {
              groupId,
              memberId: contribution.memberId,
              type: LedgerEntryType.CONTRIBUTION,
              amount: contribution.amount,
              originalAmount: contribution.amount,
              currency: contribution.currency,
              fxRate: '1.000000',
              fxRateDate: new Date(),
              paypalRef: paypalOrderId,
              description: `Vendor contribution from ${contribution.member.user.name} (PayPal Order ${paypalOrderId})`,
            },
          });
        } else {
          idempotentReplay = true;
        }

        const updatedContribution = await tx.contribution.findUniqueOrThrow({
          where: { id: contribution.id },
          include: {
            member: {
              include: {
                user: true,
              },
            },
          },
        });

        // Calculate updated pot balance & check if all members have funded their share
        const allMembers = await tx.member.findMany({
          where: { groupId },
          include: {
            contributions: {
              where: { status: ContributionStatus.COMPLETED },
            },
          },
        });

        const totalPotFunded = allMembers.reduce(
          (sum, m) =>
            sum +
            m.contributions.reduce((cSum, c) => cSum + Number(c.amount), 0),
          0,
        );

        const allMembersFunded =
          allMembers.length > 0 &&
          allMembers.every((m) => {
            const memberPaid = m.contributions.reduce(
              (cSum, c) => cSum + Number(c.amount),
              0,
            );
            return memberPaid >= Number(m.contributionExpected);
          });

        if (
          allMembersFunded &&
          (contribution.member.group.status === GroupStatus.SETUP ||
            contribution.member.group.status === GroupStatus.FUNDING)
        ) {
          await tx.group.update({
            where: { id: groupId },
            data: { status: GroupStatus.ACTIVE },
          });
        }

        return {
          idempotentReplay,
          contribution: updatedContribution,
          ledgerEntry,
          potBalance: Number(totalPotFunded.toFixed(2)),
        };
      },
      { maxWait: 15000, timeout: 30000 },
    );
  }

  async listGroupContributions(groupId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      select: { id: true, name: true, baseCurrency: true },
    });

    if (!group) {
      throw new NotFoundException(`Group with id "${groupId}" not found.`);
    }

    const contributions = await this.prisma.contribution.findMany({
      where: {
        member: { groupId },
      },
      include: {
        member: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalCompleted = contributions
      .filter((c) => c.status === ContributionStatus.COMPLETED)
      .reduce((sum, c) => sum + Number(c.amount), 0);

    return {
      groupId: group.id,
      groupName: group.name,
      baseCurrency: group.baseCurrency,
      totalCompleted: Number(totalCompleted.toFixed(2)),
      contributions,
    };
  }

  async getGroupLedger(groupId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        ledgerEntries: {
          include: {
            member: {
              include: {
                user: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!group) {
      throw new NotFoundException(`Group with id "${groupId}" not found.`);
    }

    const totalIn = group.ledgerEntries
      .filter((e) => e.type === LedgerEntryType.CONTRIBUTION)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const totalReleased = group.ledgerEntries
      .filter(
        (e) =>
          e.type === LedgerEntryType.STAGED_RELEASE ||
          e.type === LedgerEntryType.RECEIPT_SPEND,
      )
      .reduce((sum, e) => sum + Math.abs(Number(e.amount)), 0);

    const totalReversals = group.ledgerEntries
      .filter((e) => e.type === LedgerEntryType.REVERSAL)
      .reduce((sum, e) => sum + Math.abs(Number(e.amount)), 0);

    const totalRefunded = group.ledgerEntries
      .filter((e) => e.type === LedgerEntryType.REFUND)
      .reduce((sum, e) => sum + Math.abs(Number(e.amount)), 0);

    const netSpend = Number((totalReleased - totalReversals).toFixed(2));
    const potBalance = Number(
      (totalIn - netSpend - totalRefunded).toFixed(2),
    );

    return {
      groupId: group.id,
      groupName: group.name,
      status: group.status,
      baseCurrency: group.baseCurrency,
      summary: {
        totalIn: Number(totalIn.toFixed(2)),
        totalReleased: Number(totalReleased.toFixed(2)),
        totalReversals: Number(totalReversals.toFixed(2)),
        netSpend,
        totalRefunded: Number(totalRefunded.toFixed(2)),
        potBalance,
        isBalanced: Math.abs(potBalance) < 0.01,
        entryCount: group.ledgerEntries.length,
      },
      ledgerEntries: group.ledgerEntries,
    };
  }
}

