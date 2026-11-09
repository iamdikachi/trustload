import { SharedCostRule } from '@prisma/client';

export class InlineUserDto {
  name!: string;
  email!: string;
}

export class CreateOrderLineDto {
  item!: string;
  quantity!: number;
  budget!: number | string;
}

export class CreateGroupMemberDto {
  userId?: string;
  name?: string;
  email?: string;
  user?: InlineUserDto;
  contributionExpected?: number | string;
  orderLines?: CreateOrderLineDto[];
  orders?: CreateOrderLineDto[];
}

export class CreateGroupDto {
  name!: string;
  travelerId?: string;
  traveler?: InlineUserDto;
  baseCurrency?: string;
  approvalThreshold?: number;
  sharedCostRule?: SharedCostRule;
  members?: CreateGroupMemberDto[];
}

export class AddMemberOrdersDto {
  orderLines!: CreateOrderLineDto[];
}
