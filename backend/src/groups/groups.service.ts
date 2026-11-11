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
  ReleaseRequestStatus,
  SharedCostRule,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  AddMemberOrdersDto,
  CreateGroupDto,
  CreateGroupMemberDto,
  CreateOrderLineDto,
} from './dto/create-group.dto';

const GROUP_RELATIONS = {
  traveler: true,
  members: {
    include: {
      user: true,
      orderLines: {
        orderBy: { createdAt: 'asc' as const },
      },
      contributions: {
        orderBy: { createdAt: 'desc' as const },
      },
      allocations: true,
    },
    orderBy: { createdAt: 'asc' as const },
  },
  orderLines: {
    include: {
      member: {
        include: {
          user: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' as const },
  },
  releaseRequests: {
    include: {
      approvals: {
        include: {
          member: {
            include: {
              user: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' as const },
  },
  receipts: {
    orderBy: { createdAt: 'desc' as const },
  },
  allocations: {
    include: {
      member: {
        include: {
          user: true,
        },
      },
    },
  },
  ledgerEntries: {
    include: {
      member: {
        include: {
          user: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' as const },
  },
} satisfies Prisma.GroupInclude;

type GroupWithRelations = Prisma.GroupGetPayload<{
  include: typeof GROUP_RELATIONS;
}>;

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async createGroup(dto: CreateGroupDto) {
    if (!dto || typeof dto.name !== 'string' || !dto.name.trim()) {
      throw new BadRequestException('Group name is required.');
    }

    if (!dto.travelerId && (!dto.traveler?.email || !dto.traveler?.name)) {
      throw new BadRequestException(
        'Either travelerId or traveler { name, email } must be provided.',
      );
    }

    const baseCurrency = (dto.baseCurrency ?? 'USD').trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(baseCurrency)) {
      throw new BadRequestException(
        'baseCurrency must be a 3-letter ISO currency code (e.g. USD, NGN).',
      );
    }

    const sharedCostRule =
      dto.sharedCostRule ?? SharedCostRule.PROPORTIONAL_TO_VALUE;
    if (!Object.values(SharedCostRule).includes(sharedCostRule)) {
      throw new BadRequestException(
        `sharedCostRule must be one of: ${Object.values(SharedCostRule).join(', ')}`,
      );
    }

    const memberInputs = dto.members ?? [];
    const defaultThreshold =
      memberInputs.length > 0 ? Math.ceil(memberInputs.length / 2) : 1;
    const approvalThreshold = dto.approvalThreshold ?? defaultThreshold;

    if (
      !Number.isInteger(approvalThreshold) ||
      approvalThreshold < 1 ||
      (memberInputs.length > 0 && approvalThreshold > memberInputs.length)
    ) {
      throw new BadRequestException(
        memberInputs.length > 0
          ? `approvalThreshold must be an integer between 1 and ${memberInputs.length}.`
          : 'approvalThreshold must be a positive integer.',
      );
    }

    // Validate all members and their order lines upfront
    const normalizedMembers = memberInputs.map((m, idx) =>
      this.normalizeMemberInput(m, idx),
    );

    const createdGroupId = await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
      // 1. Resolve or upsert Traveler
      let travelerId = dto.travelerId;
      if (!travelerId && dto.traveler) {
        const email = dto.traveler.email.trim().toLowerCase();
        const name = dto.traveler.name.trim();
        const travelerUser = await tx.user.upsert({
          where: { email },
          update: { name },
          create: {
            name,
            email,
            role: UserRole.TRAVELER,
          },
        });
        travelerId = travelerUser.id;
      } else if (travelerId) {
        const existingTraveler = await tx.user.findUnique({
          where: { id: travelerId },
        });
        if (!existingTraveler) {
          throw new NotFoundException(
            `Traveler user with id "${travelerId}" was not found.`,
          );
        }
      }

      // 2. Create Group
      const group = await tx.group.create({
        data: {
          name: dto.name.trim(),
          travelerId: travelerId!,
          baseCurrency,
          approvalThreshold,
          sharedCostRule,
          status:
            normalizedMembers.length > 0
              ? GroupStatus.FUNDING
              : GroupStatus.SETUP,
        },
      });

      // 3. Create each Member and their OrderLines
      const seenUserIds = new Set<string>();
      for (const memberInput of normalizedMembers) {
        let userId = memberInput.userId;
        if (!userId && memberInput.email && memberInput.name) {
          const vendorUser = await tx.user.upsert({
            where: { email: memberInput.email },
            update: { name: memberInput.name },
            create: {
              name: memberInput.name,
              email: memberInput.email,
              role: UserRole.VENDOR,
            },
          });
          userId = vendorUser.id;
        } else if (userId) {
          const existingVendor = await tx.user.findUnique({
            where: { id: userId },
          });
          if (!existingVendor) {
            throw new NotFoundException(
              `Vendor user with id "${userId}" was not found.`,
            );
          }
        }

        if (seenUserIds.has(userId!)) {
          throw new BadRequestException(
            `Duplicate member user "${memberInput.email ?? userId}" in the same group.`,
          );
        }
        seenUserIds.add(userId!);

          const member = await tx.member.create({
            data: {
              groupId: group.id,
              userId: userId!,
              contributionExpected: memberInput.contributionExpected.toFixed(2),
            },
          });

          if (memberInput.orderLines.length > 0) {
            await tx.orderLine.createMany({
              data: memberInput.orderLines.map((line) => ({
                groupId: group.id,
                memberId: member.id,
                item: line.item,
                quantity: line.quantity,
                budget: line.budget.toFixed(2),
              })),
            });
          }
        }

        return group.id;
      },
      { maxWait: 15000, timeout: 30000 },
    );

    return this.getGroupById(createdGroupId);
  }

  async listGroups() {
    const groups = await this.prisma.group.findMany({
      include: GROUP_RELATIONS,
      orderBy: { createdAt: 'desc' },
    });

    return groups.map((group) => this.formatGroupResponse(group));
  }

  async getGroupById(id: string) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: GROUP_RELATIONS,
    });

    if (!group) {
      throw new NotFoundException(`Group with id "${id}" not found.`);
    }

    return this.formatGroupResponse(group);
  }

  async addMemberToGroup(groupId: string, dto: CreateGroupMemberDto) {
    await this.ensureGroupExists(groupId);
    const normalized = this.normalizeMemberInput(dto, 0);

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      let userId = normalized.userId;
      if (!userId && normalized.email && normalized.name) {
        const vendorUser = await tx.user.upsert({
          where: { email: normalized.email },
          update: { name: normalized.name },
          create: {
            name: normalized.name,
            email: normalized.email,
            role: UserRole.VENDOR,
          },
        });
        userId = vendorUser.id;
      } else if (userId) {
        const existingVendor = await tx.user.findUnique({
          where: { id: userId },
        });
        if (!existingVendor) {
          throw new NotFoundException(
            `Vendor user with id "${userId}" was not found.`,
          );
        }
      }

      const existingMembership = await tx.member.findUnique({
        where: {
          groupId_userId: {
            groupId,
            userId: userId!,
          },
        },
      });
      if (existingMembership) {
        throw new BadRequestException(
          'This user is already a member of the group.',
        );
      }

      const member = await tx.member.create({
        data: {
          groupId,
          userId: userId!,
          contributionExpected: normalized.contributionExpected.toFixed(2),
        },
      });

      if (normalized.orderLines.length > 0) {
        await tx.orderLine.createMany({
          data: normalized.orderLines.map((line) => ({
            groupId,
            memberId: member.id,
            item: line.item,
            quantity: line.quantity,
            budget: line.budget.toFixed(2),
          })),
        });
      }
    }, { maxWait: 15000, timeout: 30000 });

    return this.getGroupById(groupId);
  }

  async addMemberOrders(
    groupId: string,
    memberId: string,
    dto: AddMemberOrdersDto,
  ) {
    const member = await this.prisma.member.findFirst({
      where: { id: memberId, groupId },
    });

    if (!member) {
      throw new NotFoundException(
        `Member "${memberId}" not found in group "${groupId}".`,
      );
    }

    if (!Array.isArray(dto?.orderLines) || dto.orderLines.length === 0) {
      throw new BadRequestException(
        'orderLines must be a non-empty array of order items.',
      );
    }

    const lines = dto.orderLines.map((line, index) =>
      this.normalizeOrderLine(line, index),
    );

    await this.prisma.$transaction(
      lines.map((line) =>
        this.prisma.orderLine.create({
          data: {
            groupId,
            memberId,
            item: line.item,
            quantity: line.quantity,
            budget: line.budget.toFixed(2),
          },
        }),
      ),
    );

    return this.getGroupById(groupId);
  }

  async getGroupCombinedOrders(groupId: string) {
    const group = await this.getGroupById(groupId);

    const combinedMap = new Map<
      string,
      {
        item: string;
        totalQuantity: number;
        totalBudget: number;
        vendorBreakdown: Array<{
          memberId: string;
          vendorName: string;
          quantity: number;
          budget: number;
        }>;
      }
    >();

    for (const line of group.orderLines) {
      const key = line.item.trim().toLowerCase();
      const budgetNum = Number(line.budget);
      const existing = combinedMap.get(key) ?? {
        item: line.item,
        totalQuantity: 0,
        totalBudget: 0,
        vendorBreakdown: [],
      };

      existing.totalQuantity += line.quantity;
      existing.totalBudget = Number(
        (existing.totalBudget + budgetNum).toFixed(2),
      );
      existing.vendorBreakdown.push({
        memberId: line.memberId,
        vendorName: line.member.user.name,
        quantity: line.quantity,
        budget: budgetNum,
      });

      combinedMap.set(key, existing);
    }

    return {
      groupId: group.id,
      groupName: group.name,
      baseCurrency: group.baseCurrency,
      combinedItems: Array.from(combinedMap.values()),
      orderLines: group.orderLines,
    };
  }

  private async ensureGroupExists(groupId: string) {
    const exists = await this.prisma.group.findUnique({
      where: { id: groupId },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException(`Group with id "${groupId}" not found.`);
    }
  }

  private normalizeOrderLine(line: CreateOrderLineDto, index: number) {
    if (!line || typeof line.item !== 'string' || !line.item.trim()) {
      throw new BadRequestException(
        `Order line at index ${index} must have a non-empty item description.`,
      );
    }

    const quantity = Number(line.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new BadRequestException(
        `Order line "${line.item}" must have a positive integer quantity.`,
      );
    }

    const budget = Number(line.budget);
    if (!Number.isFinite(budget) || budget < 0) {
      throw new BadRequestException(
        `Order line "${line.item}" must have a valid non-negative budget.`,
      );
    }

    return {
      item: line.item.trim(),
      quantity,
      budget,
    };
  }

  private normalizeMemberInput(member: CreateGroupMemberDto, index: number) {
    const userId = member?.userId?.trim();
    const name = (member?.name ?? member?.user?.name)?.trim();
    const email = (member?.email ?? member?.user?.email)?.trim().toLowerCase();

    if (!userId && (!name || !email)) {
      throw new BadRequestException(
        `Member at index ${index} must provide either userId or { name, email }.`,
      );
    }

    const rawLines = member.orderLines ?? member.orders ?? [];
    if (!Array.isArray(rawLines)) {
      throw new BadRequestException(
        `Member at index ${index} orderLines must be an array.`,
      );
    }

    const orderLines = rawLines.map((line, lineIdx) =>
      this.normalizeOrderLine(line, lineIdx),
    );

    const orderBudgetSum = orderLines.reduce(
      (sum, line) => sum + line.budget,
      0,
    );

    const contributionExpected =
      member.contributionExpected !== undefined
        ? Number(member.contributionExpected)
        : orderBudgetSum;

    if (!Number.isFinite(contributionExpected) || contributionExpected < 0) {
      throw new BadRequestException(
        `Member at index ${index} has an invalid contributionExpected amount.`,
      );
    }

    return {
      userId,
      name,
      email,
      contributionExpected,
      orderLines,
    };
  }

  private formatGroupResponse(group: GroupWithRelations) {
    const totalExpectedContribution = group.members.reduce(
      (sum, m) => sum + Number(m.contributionExpected),
      0,
    );

    const totalContributionsCompleted = group.members.reduce(
      (sum, m) =>
        sum +
        m.contributions
          .filter(
            (c) =>
              c.status === ContributionStatus.COMPLETED ||
              c.status === ContributionStatus.REFUNDED,
          )
          .reduce((cSum, c) => cSum + Number(c.amount), 0),
      0,
    );

    const totalOrderBudget = group.orderLines.reduce(
      (sum, line) => sum + Number(line.budget),
      0,
    );

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
      (totalContributionsCompleted - netSpend - totalRefunded).toFixed(2),
    );

    const pendingStatuses = new Set<ReleaseRequestStatus>([
      'PENDING' as ReleaseRequestStatus,
      ReleaseRequestStatus.PENDING_VERIFICATION,
      ReleaseRequestStatus.AWAITING_APPROVAL,
    ]);

    const pendingReleaseRequests = group.releaseRequests.filter((r) =>
      pendingStatuses.has(r.status),
    );

    return {
      ...group,
      pendingReleaseRequests,
      summary: {
        memberCount: group.members.length,
        orderLineCount: group.orderLines.length,
        pendingReleaseRequestCount: pendingReleaseRequests.length,
        totalExpectedContribution: Number(totalExpectedContribution.toFixed(2)),
        totalContributionsCompleted: Number(
          totalContributionsCompleted.toFixed(2),
        ),
        totalOrderBudget: Number(totalOrderBudget.toFixed(2)),
        totalReleased: Number(totalReleased.toFixed(2)),
        totalReversals: Number(totalReversals.toFixed(2)),
        netSpend,
        totalRefunded: Number(totalRefunded.toFixed(2)),
        potBalance,
        isBalanced: Math.abs(potBalance) < 0.01,
      },
    };
  }
}

