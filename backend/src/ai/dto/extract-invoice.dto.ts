import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExtractInvoiceDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description:
      'Invoice photo (JPEG, PNG, WebP, HEIC) or PDF, potentially blurry, handwritten, or in Chinese, Arabic, Turkish, English, or mixed languages',
  })
  invoice?: any;

  @ApiPropertyOptional({
    example: 'zh-CN, ar-AE, en',
    description: 'Optional hint about languages present on the invoice',
  })
  languageHint?: string;

  @ApiPropertyOptional({
    example: 'blurry',
    description: 'Optional image quality hint (e.g. clean, blurry, handwritten)',
  })
  qualityHint?: string;
}

export interface FieldConfidenceMap {
  supplier: number;
  date: number;
  currency: number;
  originalCurrency: number;
  grandTotal: number;
  sourceLanguage: number;
  lineItems: number;
}

export interface LineItemFieldConfidenceMap {
  description: number;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ExtractedLineItem {
  description: string;
  originalDescription: string;
  translatedDescription: string;
  quantity: number;
  unitPrice: number;
  total: number;
  lineTotal: number;
  confidence: number;
  fieldConfidence: LineItemFieldConfidenceMap;
  lowConfidenceFields: string[];
}

export interface InvoiceExtractionResult {
  supplier: string;
  date: string;
  currency: string;
  originalCurrency: string;
  sourceLanguage: string;
  isBlurryOrNoisy: boolean;
  lineItems: ExtractedLineItem[];
  grandTotal: number;
  confidencePerField: FieldConfidenceMap;
  fieldConfidence: FieldConfidenceMap;
  overallConfidence: number;
  lowConfidenceFields: string[];
  requiresManualReview: boolean;
  sourceFile: string;
  extractedAt: string;
  modelUsed: string;
}

