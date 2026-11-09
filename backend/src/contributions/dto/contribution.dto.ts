import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContributionOrderDto {
  @ApiPropertyOptional({
    description: 'Group UUID (optional when passed as a URL parameter)',
  })
  groupId?: string;

  @ApiPropertyOptional({
    description: 'Member UUID (optional when passed as a URL parameter)',
  })
  memberId?: string;

  @ApiPropertyOptional({
    example: 1000,
    description:
      'Contribution amount in group base currency (defaults to member expected contribution if omitted)',
  })
  amount?: number | string;

  @ApiPropertyOptional({
    example: 'USD',
    description: '3-letter ISO currency code (defaults to group baseCurrency)',
  })
  currency?: string;

  @ApiPropertyOptional({
    example: 'http://localhost:3000/groups/return',
    description: 'Redirect URL after buyer approves PayPal payment',
  })
  returnUrl?: string;

  @ApiPropertyOptional({
    example: 'http://localhost:3000/groups/cancel',
    description: 'Redirect URL if buyer cancels PayPal checkout',
  })
  cancelUrl?: string;
}

export class PaypalWebhookEventDto {
  @ApiProperty({ example: 'WH-2WR32451HC0233532-67976317FL4543714' })
  id!: string;

  @ApiProperty({ example: 'PAYMENT.CAPTURE.COMPLETED' })
  event_type!: string;

  @ApiProperty({
    description: 'PayPal webhook resource payload (order or capture object)',
  })
  resource!: Record<string, any>;

  @ApiPropertyOptional({ example: '2026-11-09T15:00:00Z' })
  create_time?: string;

  @ApiPropertyOptional({ example: 'Payment capture completed' })
  summary?: string;
}

