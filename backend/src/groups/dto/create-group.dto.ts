import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SharedCostRule } from '@prisma/client';

export class InlineUserDto {
  @ApiProperty({ example: 'Chidi Okonkwo', description: 'Full name of the user' })
  name!: string;

  @ApiProperty({
    example: 'chidi.traveler@trustload.africa',
    description: 'Unique email address of the user',
  })
  email!: string;
}

export class CreateOrderLineDto {
  @ApiProperty({
    example: '65W GaN USB-C Fast Charger',
    description: 'Item name or description to purchase on the trip',
  })
  item!: string;

  @ApiProperty({
    example: 100,
    description: 'Positive integer quantity requested by the vendor',
  })
  quantity!: number;

  @ApiProperty({
    example: 800,
    description: 'Budget allocated for this order line in the group base currency',
  })
  budget!: number | string;
}

export class CreateGroupMemberDto {
  @ApiPropertyOptional({
    description: 'Existing vendor User ID (if not providing inline name + email)',
  })
  userId?: string;

  @ApiPropertyOptional({
    example: 'Amaka Nwosu',
    description: 'Vendor full name (when creating/upserting inline)',
  })
  name?: string;

  @ApiPropertyOptional({
    example: 'amaka@trustload.africa',
    description: 'Vendor email address (when creating/upserting inline)',
  })
  email?: string;

  @ApiPropertyOptional({
    type: () => InlineUserDto,
    description: 'Alternative nested user object for inline vendor creation',
  })
  user?: InlineUserDto;

  @ApiPropertyOptional({
    example: 1200,
    description:
      'Expected contribution in group base currency (defaults to sum of orderLines budgets if omitted)',
  })
  contributionExpected?: number | string;

  @ApiPropertyOptional({
    type: () => [CreateOrderLineDto],
    description: 'Order lines requested by this vendor',
  })
  orderLines?: CreateOrderLineDto[];

  @ApiPropertyOptional({
    type: () => [CreateOrderLineDto],
    description: 'Alias for orderLines',
  })
  orders?: CreateOrderLineDto[];
}

export class CreateGroupDto {
  @ApiProperty({
    example: 'Guangzhou & Dubai Electronics Run (Nov 2026)',
    description: 'Name of the pooled buying trip group',
  })
  name!: string;

  @ApiPropertyOptional({
    description: 'Existing traveler User ID (if not providing inline traveler)',
  })
  travelerId?: string;

  @ApiPropertyOptional({
    type: () => InlineUserDto,
    description: 'Traveler details (upserted by email if travelerId is omitted)',
  })
  traveler?: InlineUserDto;

  @ApiPropertyOptional({
    example: 'USD',
    default: 'USD',
    description: '3-letter ISO base currency code for the group ledger',
  })
  baseCurrency?: string;

  @ApiPropertyOptional({
    example: 3,
    description:
      'Number of vendor approvals required to release a staged payout (defaults to majority)',
  })
  approvalThreshold?: number;

  @ApiPropertyOptional({
    enum: SharedCostRule,
    default: SharedCostRule.PROPORTIONAL_TO_VALUE,
    description: 'Rule used to split shared shipping/transport/customs costs',
  })
  sharedCostRule?: SharedCostRule;

  @ApiPropertyOptional({
    type: () => [CreateGroupMemberDto],
    description: 'Vendor members participating in the buying group and their orders',
  })
  members?: CreateGroupMemberDto[];
}

export class AddMemberOrdersDto {
  @ApiProperty({
    type: () => [CreateOrderLineDto],
    description: 'New order lines to add for the member',
  })
  orderLines!: CreateOrderLineDto[];
}
