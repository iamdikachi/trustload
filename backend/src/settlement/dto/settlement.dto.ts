import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SharedCostRule } from '@prisma/client';

export class MemberAllocationInputDto {
  @ApiProperty({
    description: 'Member UUID of the vendor',
  })
  memberId!: string;

  @ApiProperty({
    example: 650,
    description: 'Final value of goods allocated to this vendor in base currency',
  })
  goodsTotal!: number | string;

  @ApiPropertyOptional({
    example: 50,
    description:
      'Optional explicit share of shared costs (if omitted, computed automatically from totalSharedCosts and group sharedCostRule)',
  })
  sharedCostShare?: number | string;
}

export class SettleGroupDto {
  @ApiPropertyOptional({
    type: () => [MemberAllocationInputDto],
    description:
      'Optional per-member goods breakdown. If omitted, uses existing Allocation records or derives from group receipts/orders.',
  })
  memberAllocations?: MemberAllocationInputDto[];

  @ApiPropertyOptional({
    example: 100,
    description:
      'Total shared shipping/transport/customs costs in group base currency to split across vendors',
  })
  totalSharedCosts?: number | string;

  @ApiPropertyOptional({
    enum: SharedCostRule,
    description:
      'Optional override for how shared costs are split (defaults to the group sharedCostRule)',
  })
  sharedCostRule?: SharedCostRule;
}

