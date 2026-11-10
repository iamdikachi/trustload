import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { InvoiceExtractionResult } from './extract-invoice.dto';

export class VerifyInvoiceLineItemInputDto {
  @ApiProperty({ example: 'Type-C Laptop Power Bank 20000mAh' })
  description!: string;

  @ApiPropertyOptional({ example: '20000mAh Type-C 笔记本移动电源' })
  originalDescription?: string;

  @ApiPropertyOptional({ example: 'Type-C Laptop Power Bank 20000mAh' })
  translatedDescription?: string;

  @ApiProperty({ example: 65 })
  quantity!: number;

  @ApiProperty({ example: 110 })
  unitPrice!: number;

  @ApiPropertyOptional({ example: 7150 })
  total?: number;

  @ApiPropertyOptional({ example: 7150 })
  lineTotal?: number;
}

export class VerifyInvoiceDto {
  @ApiPropertyOptional({
    example: 'group-uuid',
    description: 'Group ID whose combined order and earlier invoices are compared against',
  })
  groupId?: string;

  @ApiPropertyOptional({
    example: 'release-request-uuid',
    description: 'Optional ReleaseRequest ID to associate or update with the verification report',
  })
  releaseRequestId?: string;

  @ApiPropertyOptional({
    example: 'Shenzhen Golden Dragon Electronics Co.',
    description: 'Supplier name (used when verifying raw payload or overriding extraction)',
  })
  supplier?: string;

  @ApiPropertyOptional({
    example: 'CNY',
    description: '3-letter ISO currency code of the invoice',
  })
  currency?: string;

  @ApiPropertyOptional({
    example: 7200,
    description: 'Stated grand total on the invoice (in original currency)',
  })
  grandTotal?: number;

  @ApiPropertyOptional({
    example: 7200,
    description: 'Traveler requested release amount (in original currency, or base currency if requestedAmountCurrency matches base)',
  })
  requestedAmount?: number;

  @ApiPropertyOptional({
    example: 'CNY',
    description: 'Currency of requestedAmount (defaults to invoice currency)',
  })
  requestedAmountCurrency?: string;

  @ApiPropertyOptional({
    example: 0.138889,
    description: 'Optional explicit FX rate from invoice currency to group base currency',
  })
  fxRate?: number;

  @ApiPropertyOptional({
    type: [VerifyInvoiceLineItemInputDto],
    description: 'Optional explicit extracted line items when calling verification via JSON without file upload',
  })
  lineItems?: VerifyInvoiceLineItemInputDto[];

  @ApiPropertyOptional({
    description: 'Optional full InvoiceExtractionResult payload from POST /ai/invoices/extract',
  })
  extractedInvoice?: Partial<InvoiceExtractionResult>;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Optional invoice file (image or PDF) to extract and verify in a single call',
  })
  invoice?: any;
}

export type VerificationFlagSeverity = 'HIGH' | 'MEDIUM' | 'LOW';

export type VerificationFlagCode =
  | 'UNORDERED_ITEM'
  | 'QUANTITY_EXCEEDS_ORDER'
  | 'CUMULATIVE_QUANTITY_EXCEEDS_ORDER'
  | 'LINE_TOTAL_ARITHMETIC_MISMATCH'
  | 'GRAND_TOTAL_MISMATCH'
  | 'INVOICE_TOTAL_EXCEEDS_REQUESTED_AMOUNT'
  | 'INVOICE_TOTAL_MISMATCH_REQUESTED_AMOUNT'
  | 'PRICE_SPIKE_ABOVE_EARLIER_PRICE'
  | 'UNIT_PRICE_EXCEEDS_ORDER_BUDGET'
  | 'LOW_EXTRACTION_CONFIDENCE';

export interface VerificationFlag {
  code: VerificationFlagCode;
  severity: VerificationFlagSeverity;
  check:
    | 'itemsMatch'
    | 'quantitiesWithinOrder'
    | 'lineTotalsAddUp'
    | 'invoiceTotalWithinRequestedAmount'
    | 'pricesReasonable'
    | 'extractionConfidence';
  field?: string;
  item?: string;
  message: string;
  reason: string;
  expected?: number | string;
  actual?: number | string;
}

export interface LineItemVerificationMatch {
  lineIndex: number;
  invoiceDescription: string;
  originalDescription: string;
  matchedOrderItem: string | null;
  itemMatched: boolean;
  invoiceQuantity: number;
  orderedQuantity: number | null;
  previouslyReleasedQuantity: number;
  cumulativeQuantity: number;
  quantityWithinOrder: boolean;
  invoiceUnitPriceOriginal: number;
  invoiceUnitPriceBase: number;
  budgetedUnitPriceBase: number | null;
  earlierUnitPriceBase: number | null;
  priceIncreasePctVsEarlier: number | null;
  priceIncreasePctVsBudget: number | null;
  priceReasonable: boolean;
  computedLineTotal: number;
  statedLineTotal: number;
  lineTotalDiscrepancy: number;
  lineTotalMatches: boolean;
  flags: VerificationFlag[];
}

export interface InvoiceVerificationReport {
  groupId: string;
  groupName: string;
  baseCurrency: string;
  releaseRequestId?: string;
  supplier: string;
  invoiceCurrency: string;
  fxRateToBase: number;
  passedAllChecks: boolean;
  status: 'VERIFIED' | 'FLAGGED';
  flagCount: number;
  highSeverityFlagCount: number;
  summary: string;
  checks: {
    itemsMatch: {
      passed: boolean;
      matchedCount: number;
      unmatchedCount: number;
      details: string;
    };
    quantitiesWithinOrder: {
      passed: boolean;
      details: string;
    };
    lineTotalsAddUp: {
      passed: boolean;
      computedLineSum: number;
      statedGrandTotal: number;
      discrepancy: number;
      details: string;
    };
    invoiceTotalWithinRequestedAmount: {
      passed: boolean;
      invoiceOriginalTotal: number;
      invoiceTotalInBase: number;
      requestedOriginalAmount: number | null;
      requestedAmountInBase: number | null;
      discrepancyInOriginal: number | null;
      details: string;
    };
    pricesReasonable: {
      passed: boolean;
      maxSpikeThresholdPct: number;
      details: string;
    };
  };
  lineItemMatches: LineItemVerificationMatch[];
  flags: VerificationFlag[];
  extraction?: InvoiceExtractionResult;
  verifiedAt: string;
}

