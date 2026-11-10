import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SharedCostRule } from '@prisma/client';

export class ReceiptLineItemInputDto {
  @ApiProperty({ example: 'Type-C Laptop Power Bank 20000mAh' })
  description!: string;

  @ApiPropertyOptional({ example: '20000mAh Type-C 笔记本移动电源' })
  originalDescription?: string;

  @ApiPropertyOptional({ example: 'Type-C Laptop Power Bank 20000mAh' })
  translatedDescription?: string;

  @ApiPropertyOptional({ example: 40, default: 1 })
  quantity?: number;

  @ApiPropertyOptional({ example: 108 })
  unitPrice?: number;

  @ApiProperty({ example: 4320 })
  total!: number;

  @ApiPropertyOptional({
    enum: ['GOODS', 'SHARED_COST'],
    description:
      'Optional explicit category; if omitted, AI classifies shipping/transport/customs/fees as SHARED_COST and ordered items as GOODS',
  })
  category?: 'GOODS' | 'SHARED_COST';

  @ApiPropertyOptional({
    description: 'Optional explicit memberId if a line item is pre-assigned to a specific vendor',
  })
  memberId?: string;
}

export class SharedCostItemInputDto {
  @ApiProperty({ example: 'International Air Freight & Consolidation Fee' })
  description!: string;

  @ApiProperty({ example: 1080 })
  amount!: number;

  @ApiPropertyOptional({
    example: 'CNY',
    description: 'Currency of this shared cost item (defaults to receipt currency or group base currency)',
  })
  currency?: string;

  @ApiPropertyOptional({
    example: 0.138889,
    description: 'Optional custom FX rate to group base currency',
  })
  fxRate?: number;
}

export class InlineReceiptInputDto {
  @ApiPropertyOptional({ example: 'Shenzhen Golden Dragon Electronics Co.' })
  supplier?: string;

  @ApiPropertyOptional({ example: 'CNY', default: 'USD' })
  currency?: string;

  @ApiPropertyOptional({ example: 0.138889 })
  fxRate?: number;

  @ApiPropertyOptional({ example: 'zh-CN' })
  sourceLanguage?: string;

  @ApiPropertyOptional({ example: 12400 })
  grandTotal?: number;

  @ApiPropertyOptional({ type: [ReceiptLineItemInputDto] })
  lineItems?: ReceiptLineItemInputDto[];

  @ApiPropertyOptional({ type: [SharedCostItemInputDto] })
  sharedCosts?: SharedCostItemInputDto[];
}

export class CreateReceiptDto {
  @ApiPropertyOptional({ example: 'Shenzhen Golden Dragon Electronics Co.' })
  supplier?: string;

  @ApiPropertyOptional({
    example: 'CNY',
    description: '3-letter ISO currency code of the receipt (e.g. CNY, AED, TRY, USD)',
  })
  currency?: string;

  @ApiPropertyOptional({
    example: 12400,
    description: 'Original total amount on the receipt (if omitted, computed from extracted line items)',
  })
  originalAmount?: number | string;

  @ApiPropertyOptional({
    example: 0.138889,
    description: 'Optional FX rate override to group base currency',
  })
  fxRate?: number | string;

  @ApiPropertyOptional({
    example: 'zh-CN',
    description: 'Optional source language hint',
  })
  sourceLanguage?: string;

  @ApiPropertyOptional({
    type: [ReceiptLineItemInputDto],
    description: 'Optional structured line items if submitting receipt JSON without a binary file',
  })
  lineItems?: ReceiptLineItemInputDto[];

  @ApiPropertyOptional({
    type: [SharedCostItemInputDto],
    description: 'Optional shared cost items (shipping, transport, customs, fees) on the receipt',
  })
  sharedCosts?: SharedCostItemInputDto[];

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Receipt image or PDF file upload',
  })
  receipt?: any;
}

export class AllocateReceiptsDto {
  @ApiPropertyOptional({
    enum: SharedCostRule,
    example: SharedCostRule.PROPORTIONAL_TO_VALUE,
    description:
      'Configurable rule for splitting shared costs across vendors (PROPORTIONAL_TO_VALUE, EQUAL, BY_CONTRIBUTION). Defaults to the group sharedCostRule.',
  })
  sharedCostRule?: SharedCostRule;

  @ApiPropertyOptional({
    type: [InlineReceiptInputDto],
    description:
      'Optional additional receipts to persist and include in the allocation alongside any already-stored receipts for the group',
  })
  receipts?: InlineReceiptInputDto[];

  @ApiPropertyOptional({
    type: [SharedCostItemInputDto],
    description:
      'Optional additional trip shared costs (shipping, transport, fees) to split across vendors',
  })
  sharedCosts?: SharedCostItemInputDto[];

  @ApiPropertyOptional({
    example: false,
    description:
      'If true, replaces previously stored receipts with the newly provided receipts in this request before allocating',
  })
  replaceExistingReceipts?: boolean;
}

export interface AssignedVendorGoodsItem {
  receiptId: string;
  supplier: string;
  originalDescription: string;
  translatedDescription: string;
  matchedOrderItem: string;
  receiptQuantity: number;
  vendorOrderedQuantity: number;
  totalGroupOrderedQuantity: number;
  quantityAssignedToVendor: number;
  allocationShareRatio: number;
  originalLineTotal: number;
  originalCurrency: string;
  fxRateUsed: number;
  convertedLineTotalBase: number;
  assignedAmountBase: number;
}

export interface ExtractedSharedCostBreakdown {
  receiptId?: string;
  description: string;
  originalAmount: number;
  originalCurrency: string;
  fxRateUsed: number;
  amountInBase: number;
}

export interface VendorAllocationResult {
  memberId: string;
  vendorName: string;
  vendorEmail: string;
  contributionExpected: number;
  amountContributed: number;
  effectiveContribution: number;
  goodsTotal: number;
  goodsValueSharePct: number;
  sharedCostShare: number;
  totalAllocatedSpend: number;
  netOwedOrRefund: number;
  refundDue: number;
  amountOwed: number;
  settlementDirection: 'REFUND_DUE' | 'AMOUNT_OWED' | 'EXACT_MATCH';
  assignedGoodsItems: AssignedVendorGoodsItem[];
}

export interface PotReconciliationSummary {
  baseCurrency: string;
  totalPotContributed: number;
  totalExpectedContributions: number;
  effectivePotBaseline: number;
  totalReleasedToTraveler: number;
  totalGoodsAllocated: number;
  totalSharedCostsAllocated: number;
  totalReceiptSpend: number;
  totalNetOwedOrRefund: number;
  totalRefundsDue: number;
  totalAmountOwed: number;
  unspentPotBalance: number;
  discrepancy: number;
  reconciledWithPot: boolean;
}

export interface ReceiptAllocationReport {
  groupId: string;
  groupName: string;
  baseCurrency: string;
  sharedCostRule: SharedCostRule;
  receiptCount: number;
  goodsItemsAssignedCount: number;
  sharedCostsBreakdown: ExtractedSharedCostBreakdown[];
  vendorAllocations: VendorAllocationResult[];
  totals: {
    totalGoods: number;
    totalSharedCosts: number;
    totalAllocatedSpend: number;
    totalPotContributed: number;
    totalEffectiveContribution: number;
    totalNetOwedOrRefund: number;
    totalRefundsDue: number;
    totalAmountOwed: number;
  };
  reconciliation: PotReconciliationSummary;
  allocatedAt: string;
}

