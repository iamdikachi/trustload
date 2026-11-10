import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReleaseRequestDto {
  @ApiPropertyOptional({
    description: 'Group UUID (optional when provided in URL path)',
  })
  groupId?: string;

  @ApiProperty({
    example: 18900,
    description:
      'Amount requested by the traveler (in the submitted invoice currency unless originalAmount is specified separately)',
  })
  amount!: number | string;

  @ApiPropertyOptional({
    example: 18900,
    description:
      'Optional explicit original invoice amount if `amount` is already provided in the group base currency',
  })
  originalAmount?: number | string;

  @ApiProperty({
    example: 'Shenzhen Huaqiangbei Golden Tech Co., Ltd.',
    description: 'Supplier name for this staged release request',
  })
  supplier!: string;

  @ApiProperty({
    example: 'CNY',
    default: 'USD',
    description: '3-letter ISO currency code of the supplier invoice (e.g. CNY, AED, TRY, USD)',
  })
  currency!: string;

  @ApiPropertyOptional({
    example: 0.138889,
    description:
      'Optional exchange rate multiplier from invoice currency to group base currency (auto-resolved if omitted)',
  })
  fxRate?: number | string;

  @ApiPropertyOptional({
    example: 'zh-CN',
    description: 'Optional source language code of the invoice',
  })
  sourceLanguage?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Supplier invoice file upload (image JPEG/PNG/WebP or PDF)',
  })
  invoice?: any;
}

export class ConvertFxRateDto {
  @ApiProperty({
    example: 7200,
    description: 'Original invoice amount to convert in code',
  })
  originalAmount!: number;

  @ApiProperty({
    example: 'CNY',
    description: '3-letter ISO currency code of the original invoice (e.g. CNY, AED, TRY)',
  })
  fromCurrency!: string;

  @ApiPropertyOptional({
    example: 'USD',
    default: 'USD',
    description: 'Target group base currency (defaults to USD)',
  })
  toBaseCurrency?: string;

  @ApiPropertyOptional({
    example: 0.138889,
    description: 'Optional custom FX rate override',
  })
  customRate?: number | string;
}


