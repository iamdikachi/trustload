import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ContributionStatus,
  GroupStatus,
  LedgerEntryType,
  Prisma,
  SharedCostRule,
} from '@prisma/client';
import { ContributionsService } from '../contributions/contributions.service';
import { PaypalService } from '../contributions/paypal.service';
import { PrismaService } from '../prisma/prisma.service';
import { SettleGroupDto } from './dto/settlement.dto';

export interface ComputedMemberSettlement {
  memberId: string;
  vendorName: string;
  vendorEmail: string;
  contributionExpected: number;
  amountContributed: number;
  goodsTotal: number;
  sharedCostShare: number;
  totalAllocatedSpend: number;
  netOwedOrRefund: number;
  refundDue: number;
  amountOwed: number;
  latestPaypalCaptureId: string | null;
}

@Injectable()
export class SettlementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paypalService: PaypalService,
    private readonly contributionsService: ContributionsService,
  ) {}

  async calculateSettlement(groupId: string, dto?: SettleGroupDto) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: true,
            contributions: {
              orderBy: { createdAt: 'desc' },
            },
            orderLines: true,
            allocations: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        receipts: true,
        releaseRequests: true,
        allocations: true,
        ledgerEntries: true,
      },
    });

    if (!group) {
      throw new NotFoundException(`Group with id "${groupId}" not found.`);
    }

    const rule = dto?.sharedCostRule ?? group.sharedCostRule;

    // Map each member's actual completed contributions
    const memberContributions = new Map<
      string,
      { paid: number; latestCaptureId: string | null }
    >();


    
    for (const member of group.members) {
      const paid = member.contributions
        .filter(
          (c) =>
            c.status === ContributionStatus.COMPLETED ||
            c.status === ContributionStatus.REFUNDED,
        )
        .reduce((sum, c) => sum + Number(c.amount), 0);

      const latestCapture =
        member.contributions.find(
          (c) =>
            (c.status === ContributionStatus.COMPLETED ||
              c.status === ContributionStatus.REFUNDED) &&
            c.paypalCaptureId,
        )?.paypalCaptureId ?? null;

      memberContributions.set(member.id, {
        paid: Number(paid.toFixed(2)),
        latestCaptureId: latestCapture,
      });
    }

    // Determine raw goodsTotal per member
    const goodsByMember = new Map<string, number>();
    const explicitSharedByMember = new Map<string, number>();

    if (
      Array.isArray(dto?.memberAllocations) &&
      dto.memberAllocations.length > 0
    ) {
      for (const m of group.members) {
        goodsByMember.set(m.id, 0);
      }

      for (const item of dto.memberAllocations) {
        const belongsToGroup = group.members.some(
          (m) => m.id === item.memberId,
        );
        if (!belongsToGroup) {
          throw new BadRequestException(
            `Member "${item.memberId}" does not belong to group "${groupId}".`,
          );
        }

        const goodsVal = Number(item.goodsTotal);
        if (!Number.isFinite(goodsVal) || goodsVal < 0) {
          throw new BadRequestException(
            `goodsTotal for member "${item.memberId}" must be a non-negative number.`,
          );
        }
        goodsByMember.set(item.memberId, Number(goodsVal.toFixed(2)));

        if (item.sharedCostShare !== undefined && item.sharedCostShare !== null) {
          const sharedVal = Number(item.sharedCostShare);
          if (!Number.isFinite(sharedVal) || sharedVal < 0) {
            throw new BadRequestException(
              `sharedCostShare for member "${item.memberId}" must be a non-negative number.`,
            );
          }
          explicitSharedByMember.set(
            item.memberId,
            Number(sharedVal.toFixed(2)),
          );
        }
      }
    } else if (group.allocations.length > 0) {
      for (const m of group.members) {
        const existingAlloc = group.allocations.find(
          (a) => a.memberId === m.id,
        );
        goodsByMember.set(
          m.id,
          existingAlloc ? Number(existingAlloc.goodsTotal) : 0,
        );
        if (existingAlloc && dto?.totalSharedCosts === undefined) {
          explicitSharedByMember.set(
            m.id,
            Number(existingAlloc.sharedCostShare),
          );
        }
      }
    } else {
      // Derive goods total from receipts or released spend across funded members
      const totalSharedFromDto = Number(dto?.totalSharedCosts ?? 0);
      const receiptTotalBase = group.receipts.reduce(
        (sum, r) => sum + Number(r.originalAmount) * Number(r.fxRate),
        0,
      );
      const releasedTotalBase = group.ledgerEntries
        .filter((e) => e.type === LedgerEntryType.STAGED_RELEASE)
        .reduce((sum, e) => sum + Math.abs(Number(e.amount)), 0);

      const totalGoodsPool = Math.max(
        0,
        (receiptTotalBase > 0 ? receiptTotalBase : releasedTotalBase) -
          totalSharedFromDto,
      );

      const fundedMembers = group.members.filter(
        (m) => (memberContributions.get(m.id)?.paid ?? 0) > 0,
      );
      const activeMembers =
        fundedMembers.length > 0 ? fundedMembers : group.members;

      const totalWeight = activeMembers.reduce((sum, m) => {
        const orderSum = m.orderLines.reduce(
          (oSum, l) => oSum + Number(l.budget),
          0,
        );
        return sum + (orderSum > 0 ? orderSum : Number(m.contributionExpected));
      }, 0);

      for (const m of group.members) {
        if (!activeMembers.some((am) => am.id === m.id) || totalWeight <= 0) {
          goodsByMember.set(m.id, 0);
          continue;
        }
        const orderSum = m.orderLines.reduce(
          (oSum, l) => oSum + Number(l.budget),
          0,
        );
        const weight =
          orderSum > 0 ? orderSum : Number(m.contributionExpected);
        const share = Number(((totalGoodsPool * weight) / totalWeight).toFixed(2));
        goodsByMember.set(m.id, share);
      }
    }

    // Calculate sharedCostShare per member
    const totalSharedCosts =
      dto?.totalSharedCosts !== undefined ? Number(dto.totalSharedCosts) : 0;
    if (!Number.isFinite(totalSharedCosts) || totalSharedCosts < 0) {
      throw new BadRequestException(
        'totalSharedCosts must be a non-negative number.',
      );
    }

    const sharedByMember = this.splitSharedCosts(
      group.members.map((m) => ({
        memberId: m.id,
        goodsTotal: goodsByMember.get(m.id) ?? 0,
        contribution:
          (memberContributions.get(m.id)?.paid ?? 0) ||
          Number(m.contributionExpected),
      })),
      totalSharedCosts,
      rule,
      explicitSharedByMember,
    );

    const settlements: ComputedMemberSettlement[] = group.members.map((m) => {
      const contribInfo = memberContributions.get(m.id) ?? {
        paid: 0,
        latestCaptureId: null,
      };
      const goodsTotal = Number((goodsByMember.get(m.id) ?? 0).toFixed(2));
      const sharedCostShare = Number(
        (sharedByMember.get(m.id) ?? 0).toFixed(2),
      );
      const totalAllocatedSpend = Number(
        (goodsTotal + sharedCostShare).toFixed(2),
      );

      // If a member actually paid into the pot, compare paid vs allocated spend.
      // Otherwise compare expected contribution vs allocated spend (if they ordered goods without paying yet).
      const baselinePaid =
        contribInfo.paid > 0
          ? contribInfo.paid
          : totalAllocatedSpend > 0
            ? 0
            : 0;

      const netOwedOrRefund = Number(
        (baselinePaid - totalAllocatedSpend).toFixed(2),
      );
      const refundDue =
        contribInfo.paid > 0 && netOwedOrRefund > 0 ? netOwedOrRefund : 0;
      const amountOwed = netOwedOrRefund < 0 ? Math.abs(netOwedOrRefund) : 0;

      return {
        memberId: m.id,
        vendorName: m.user.name,
        vendorEmail: m.user.email,
        contributionExpected: Number(m.contributionExpected),
        amountContributed: contribInfo.paid,
        goodsTotal,
        sharedCostShare,
        totalAllocatedSpend,
        netOwedOrRefund,
        refundDue,
        amountOwed,
        latestPaypalCaptureId: contribInfo.latestCaptureId,
      };
    });

    // Persist Allocation records
    await this.prisma.$transaction(
      settlements.map((s) =>
        this.prisma.allocation.upsert({
          where: {
            groupId_memberId: {
              groupId,
              memberId: s.memberId,
            },
          },
          update: {
            goodsTotal: s.goodsTotal.toFixed(2),
            sharedCostShare: s.sharedCostShare.toFixed(2),
            netOwedOrRefund: s.netOwedOrRefund.toFixed(2),
          },
          create: {
            groupId,
            memberId: s.memberId,
            goodsTotal: s.goodsTotal.toFixed(2),
            sharedCostShare: s.sharedCostShare.toFixed(2),
            netOwedOrRefund: s.netOwedOrRefund.toFixed(2),
          },
        }),
      ),
      { maxWait: 15000, timeout: 30000 },
    );

    const totalContributed = settlements.reduce(
      (sum, s) => sum + s.amountContributed,
      0,
    );
    const totalGoods = settlements.reduce((sum, s) => sum + s.goodsTotal, 0);
    const totalShared = settlements.reduce(
      (sum, s) => sum + s.sharedCostShare,
      0,
    );
    const totalRefundsDue = settlements.reduce(
      (sum, s) => sum + s.refundDue,
      0,
    );
    const totalOwed = settlements.reduce((sum, s) => sum + s.amountOwed, 0);

    return {
      groupId: group.id,
      groupName: group.name,
      status: group.status,
      baseCurrency: group.baseCurrency,
      sharedCostRule: rule,
      totals: {
        totalContributed: Number(totalContributed.toFixed(2)),
        totalGoods: Number(totalGoods.toFixed(2)),
        totalSharedCosts: Number(totalShared.toFixed(2)),
        totalSpent: Number((totalGoods + totalShared).toFixed(2)),
        totalRefundsDue: Number(totalRefundsDue.toFixed(2)),
        totalOwed: Number(totalOwed.toFixed(2)),
      },
      memberSettlements: settlements,
    };
  }

  async settleGroup(groupId: string, dto?: SettleGroupDto) {
    const calculation = await this.calculateSettlement(groupId, dto);

    const group = await this.prisma.group.findUniqueOrThrow({
      where: { id: groupId },
      include: {
        traveler: true,
        ledgerEntries: true,
      },
    });

    // Calculate current pot movements before settlement refunds
    const totalReleased = group.ledgerEntries
      .filter(
        (e) =>
          e.type === LedgerEntryType.STAGED_RELEASE ||
          e.type === LedgerEntryType.RECEIPT_SPEND,
      )
      .reduce((sum, e) => sum + Math.abs(Number(e.amount)), 0);

    const existingReversals = group.ledgerEntries
      .filter((e) => e.type === LedgerEntryType.REVERSAL)
      .reduce((sum, e) => sum + Math.abs(Number(e.amount)), 0);

    const existingRefunds = group.ledgerEntries.filter(
      (e) => e.type === LedgerEntryType.REFUND,
    );

    const fundedMemberSpend = calculation.memberSettlements
      .filter((s) => s.amountContributed > 0)
      .reduce((sum, s) => sum + s.totalAllocatedSpend, 0);

    // Reconcile staged releases against final allocated spend so the ledger reflects exact trip spend
    const netReleasedSoFar = Number(
      (totalReleased - existingReversals).toFixed(2),
    );
    const unspentFromRelease = Number(
      (netReleasedSoFar - fundedMemberSpend).toFixed(2),
    );

    if (unspentFromRelease > 0.009) {
      const reversalRef = `PAYPAL-RETURN-${groupId.slice(0, 8)}-${Date.now()}`;
      await this.prisma.ledgerEntry.create({
        data: {
          groupId,
          type: LedgerEntryType.REVERSAL,
          amount: unspentFromRelease.toFixed(2),
          originalAmount: unspentFromRelease.toFixed(2),
          currency: group.baseCurrency,
          fxRate: '1.000000',
          fxRateDate: new Date(),
          paypalRef: reversalRef,
          description: `Unspent staged release returned by traveler ${group.traveler.name} prior to final settlement`,
        },
      });
    } else if (unspentFromRelease < -0.009 && fundedMemberSpend > 0) {
      const additionalSpend = Number(Math.abs(unspentFromRelease).toFixed(2));
      const spendRef = `PAYPAL-SPEND-${groupId.slice(0, 8)}-${Date.now()}`;
      await this.prisma.ledgerEntry.create({
        data: {
          groupId,
          type: LedgerEntryType.RECEIPT_SPEND,
          amount: (-additionalSpend).toFixed(2),
          originalAmount: additionalSpend.toFixed(2),
          currency: group.baseCurrency,
          fxRate: '1.000000',
          fxRateDate: new Date(),
          paypalRef: spendRef,
          description: `Final settled receipt spend (${group.name})`,
        },
      });
    }

    const refundsExecuted: Array<{
      memberId: string;
      vendorName: string;
      vendorEmail: string;
      amount: number;
      currency: string;
      paypalRef: string;
      method: string;
      ledgerEntryId: string;
    }> = [];

    for (const memberSettlement of calculation.memberSettlements) {
      if (memberSettlement.refundDue <= 0) {
        continue;
      }

      // Idempotency check: skip if a REFUND ledger entry already exists for this member
      const alreadyRefunded = existingRefunds.find(
        (e) => e.memberId === memberSettlement.memberId,
      );
      if (alreadyRefunded) {
        refundsExecuted.push({
          memberId: memberSettlement.memberId,
          vendorName: memberSettlement.vendorName,
          vendorEmail: memberSettlement.vendorEmail,
          amount: Math.abs(Number(alreadyRefunded.amount)),
          currency: alreadyRefunded.currency,
          paypalRef: alreadyRefunded.paypalRef,
          method: 'EXISTING_REFUND',
          ledgerEntryId: alreadyRefunded.id,
        });
        continue;
      }

      const refundResult = await this.paypalService.refundVendor({
        memberId: memberSettlement.memberId,
        recipientEmail: memberSettlement.vendorEmail,
        amount: memberSettlement.refundDue.toFixed(2),
        currency: group.baseCurrency,
        paypalCaptureId: memberSettlement.latestPaypalCaptureId,
        note: `TrustLoad final settlement leftover refund (${group.name})`,
      });

      const refundEntry = await this.prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          const entry = await tx.ledgerEntry.create({
            data: {
              groupId,
              memberId: memberSettlement.memberId,
              type: LedgerEntryType.REFUND,
              amount: (-memberSettlement.refundDue).toFixed(2),
              originalAmount: memberSettlement.refundDue.toFixed(2),
              currency: group.baseCurrency,
              fxRate: '1.000000',
              fxRateDate: new Date(),
              paypalRef: refundResult.paypalRef,
              description: `Final settlement refund to ${memberSettlement.vendorName} (PayPal ${refundResult.paypalRef})`,
            },
          });

          await tx.contribution.updateMany({
            where: {
              memberId: memberSettlement.memberId,
              status: ContributionStatus.COMPLETED,
            },
            data: {
              status: ContributionStatus.REFUNDED,
            },
          });

          return entry;
        },
        { maxWait: 15000, timeout: 30000 },
      );

      refundsExecuted.push({
        memberId: memberSettlement.memberId,
        vendorName: memberSettlement.vendorName,
        vendorEmail: memberSettlement.vendorEmail,
        amount: memberSettlement.refundDue,
        currency: group.baseCurrency,
        paypalRef: refundResult.paypalRef,
        method: refundResult.method,
        ledgerEntryId: refundEntry.id,
      });
    }

    // Close the group now that refunds and allocations are settled
    const closedGroup = await this.prisma.group.update({
      where: { id: groupId },
      data: { status: GroupStatus.CLOSED },
      include: {
        allocations: {
          include: {
            member: {
              include: { user: true },
            },
          },
        },
      },
    });

    const ledger = await this.contributionsService.getGroupLedger(groupId);

    return {
      groupId: closedGroup.id,
      groupName: closedGroup.name,
      status: closedGroup.status,
      baseCurrency: closedGroup.baseCurrency,
      isBalanced: ledger.summary.isBalanced,
      potBalance: ledger.summary.potBalance,
      totals: calculation.totals,
      memberSettlements: calculation.memberSettlements,
      refundsExecuted,
      allocations: closedGroup.allocations,
      ledger: ledger.summary,
      ledgerEntries: ledger.ledgerEntries,
    };
  }

  async getGroupSettlement(groupId: string) {
    const calculation = await this.calculateSettlement(groupId);
    const ledger = await this.contributionsService.getGroupLedger(groupId);

    const refundEntries = ledger.ledgerEntries.filter(
      (e: { type: LedgerEntryType }) => e.type === LedgerEntryType.REFUND,
    );

    return {
      groupId: calculation.groupId,
      groupName: calculation.groupName,
      status: calculation.status,
      baseCurrency: calculation.baseCurrency,
      isBalanced: ledger.summary.isBalanced,
      potBalance: ledger.summary.potBalance,
      totals: calculation.totals,
      memberSettlements: calculation.memberSettlements,
      refundEntries,
      ledger: ledger.summary,
    };
  }

  private splitSharedCosts(
    members: Array<{
      memberId: string;
      goodsTotal: number;
      contribution: number;
    }>,
    totalSharedCosts: number,
    rule: SharedCostRule,
    explicitOverrides: Map<string, number>,
  ): Map<string, number> {
    const result = new Map<string, number>();

    if (explicitOverrides.size === members.length) {
      for (const [id, val] of explicitOverrides.entries()) {
        result.set(id, val);
      }
      return result;
    }

    if (totalSharedCosts <= 0 || members.length === 0) {
      for (const m of members) {
        result.set(m.memberId, explicitOverrides.get(m.memberId) ?? 0);
      }
      return result;
    }

    const activeMembers = members.filter((m) => m.goodsTotal > 0);
    const poolMembers = activeMembers.length > 0 ? activeMembers : members;

    const weights = poolMembers.map((m) => {
      if (rule === SharedCostRule.EQUAL) {
        return 1;
      }
      if (rule === SharedCostRule.BY_CONTRIBUTION) {
        return m.contribution > 0 ? m.contribution : 1;
      }
      // Default: PROPORTIONAL_TO_VALUE
      return m.goodsTotal > 0 ? m.goodsTotal : 1;
    });

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    let allocatedSoFar = 0;
    for (const m of members) {
      result.set(m.memberId, 0);
    }

    poolMembers.forEach((m, index) => {
      if (index === poolMembers.length - 1) {
        const remainder = Number(
          (totalSharedCosts - allocatedSoFar).toFixed(2),
        );
        result.set(m.memberId, Math.max(0, remainder));
      } else {
        const share = Number(
          ((totalSharedCosts * weights[index]) / totalWeight).toFixed(2),
        );
        allocatedSoFar = Number((allocatedSoFar + share).toFixed(2));
        result.set(m.memberId, share);
      }
    });

    return result;
  }
}
