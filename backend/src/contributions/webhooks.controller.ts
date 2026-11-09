import { Body, Controller, Headers, HttpCode, Post } from '@nestjs/common';
import {
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ContributionsService } from './contributions.service';
import { PaypalWebhookEventDto } from './dto/contribution.dto';
import type { PaypalWebhookHeaders } from './paypal.service';

@ApiTags('PayPal Webhooks (FR2)')
@Controller('webhooks/paypal')
export class PaypalWebhooksController {
  constructor(private readonly contributionsService: ContributionsService) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({
    summary:
      'Signature-verified, idempotent PayPal webhook receiver for contribution confirmations (FR2)',
  })
  @ApiHeader({ name: 'paypal-transmission-id', required: true })
  @ApiHeader({ name: 'paypal-transmission-time', required: true })
  @ApiHeader({ name: 'paypal-transmission-sig', required: true })
  @ApiHeader({ name: 'paypal-auth-algo', required: true })
  @ApiHeader({ name: 'paypal-cert-url', required: true })
  @ApiResponse({
    status: 200,
    description:
      'Webhook verified and processed idempotently (repeated webhooks do not double-count).',
  })
  @ApiResponse({
    status: 401,
    description: 'Missing or invalid PayPal webhook signature.',
  })
  async handleWebhook(
    @Headers() headers: PaypalWebhookHeaders,
    @Body() body: PaypalWebhookEventDto,
  ) {
    return this.contributionsService.handlePaypalWebhook(headers, body);
  }
}

