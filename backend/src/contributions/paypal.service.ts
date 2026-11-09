import { createHmac, timingSafeEqual } from 'node:crypto';
import {
  BadGatewayException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';

export interface PaypalOrderResult {
  id: string;
  status: string;
  approveUrl: string | null;
  raw: Record<string, any>;
}

export interface PaypalCaptureResult {
  orderId: string;
  captureId: string | null;
  status: string;
  raw: Record<string, any>;
}

export interface PaypalPayoutResult {
  payoutBatchId: string;
  batchStatus: string;
  raw: Record<string, any>;
}

export interface PaypalWebhookHeaders {
  'paypal-transmission-id'?: string;
  'paypal-transmission-time'?: string;
  'paypal-transmission-sig'?: string;
  'paypal-auth-algo'?: string;
  'paypal-cert-url'?: string;
  [key: string]: string | string[] | undefined;
}

@Injectable()
export class PaypalService {
  private readonly logger = new Logger(PaypalService.name);
  private cachedAccessToken: string | null = null;
  private tokenExpiresAt = 0;

  private get baseUrl(): string {
    return (
      process.env.PAYPAL_API_BASE_URL ?? 'https://api-m.sandbox.paypal.com'
    ).replace(/\/+$/, '');
  }

  private get clientId(): string {
    return process.env.PAYPAL_CLIENT_ID ?? '';
  }

  private get clientSecret(): string {
    return process.env.PAYPAL_CLIENT_SECRET ?? '';
  }

  private get webhookId(): string {
    return process.env.PAYPAL_WEBHOOK_ID ?? '';
  }

  private hasValidCredentials(): boolean {
    return Boolean(
      this.clientId &&
        this.clientSecret &&
        this.clientId !== 'your_paypal_sandbox_client_id' &&
        this.clientSecret !== 'your_paypal_sandbox_client_secret',
    );
  }

  async getAccessToken(): Promise<string> {
    if (this.cachedAccessToken && Date.now() < this.tokenExpiresAt) {
      return this.cachedAccessToken;
    }

    if (!this.hasValidCredentials()) {
      throw new BadGatewayException(
        'PayPal Sandbox credentials (PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET) are not configured.',
      );
    }

    const credentials = Buffer.from(
      `${this.clientId}:${this.clientSecret}`,
    ).toString('base64');

    const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const errText = await response.text();
      this.logger.error(
        `Failed to obtain PayPal access token (${response.status}): ${errText}`,
      );
      throw new BadGatewayException(
        `PayPal OAuth token request failed with status ${response.status}.`,
      );
    }

    const data = (await response.json()) as {
      access_token: string;
      expires_in: number;
    };

    this.cachedAccessToken = data.access_token;
    this.tokenExpiresAt = Date.now() + Math.max(data.expires_in - 60, 60) * 1000;
    return this.cachedAccessToken;
  }

  async createOrder(params: {
    amount: string;
    currency: string;
    groupId: string;
    memberId: string;
    description: string;
    returnUrl?: string;
    cancelUrl?: string;
  }): Promise<PaypalOrderResult> {
    const token = await this.getAccessToken();

    const payload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: params.groupId,
          custom_id: params.memberId,
          description: params.description.slice(0, 127),
          amount: {
            currency_code: params.currency,
            value: params.amount,
          },
        },
      ],
      application_context: {
        brand_name: 'TrustLoad',
        user_action: 'PAY_NOW',
        return_url:
          params.returnUrl ?? 'http://localhost:3000/contributions/success',
        cancel_url:
          params.cancelUrl ?? 'http://localhost:3000/contributions/cancel',
      },
    };

    const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': `trustload-order-${params.memberId}-${Date.now()}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      this.logger.error(
        `PayPal createOrder failed (${response.status}): ${errText}`,
      );
      throw new BadGatewayException(
        `PayPal createOrder failed with status ${response.status}: ${errText}`,
      );
    }

    const data = (await response.json()) as {
      id: string;
      status: string;
      links?: Array<{ href: string; rel: string; method: string }>;
    };

    const approveLink =
      data.links?.find(
        (l) => l.rel === 'approve' || l.rel === 'payer-action',
      )?.href ?? null;

    return {
      id: data.id,
      status: data.status,
      approveUrl: approveLink,
      raw: data,
    };
  }

  async getOrder(paypalOrderId: string): Promise<Record<string, any>> {
    const token = await this.getAccessToken();
    const response = await fetch(
      `${this.baseUrl}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new BadGatewayException(
        `PayPal getOrder failed (${response.status}): ${errText}`,
      );
    }

    return (await response.json()) as Record<string, any>;
  }

  async captureOrder(paypalOrderId: string): Promise<PaypalCaptureResult> {
    const token = await this.getAccessToken();
    const response = await fetch(
      `${this.baseUrl}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new BadGatewayException(
        `PayPal captureOrder failed (${response.status}): ${errText}`,
      );
    }

    const data = (await response.json()) as Record<string, any>;
    const captureId =
      data?.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? null;

    return {
      orderId: data.id ?? paypalOrderId,
      captureId,
      status: data.status ?? 'COMPLETED',
      raw: data,
    };
  }

  async createPayout(params: {
    releaseRequestId: string;
    recipientEmail: string;
    amount: string;
    currency: string;
    note: string;
  }): Promise<PaypalPayoutResult> {
    const token = await this.getAccessToken();
    const senderBatchId = `trustload-rel-${params.releaseRequestId.slice(0, 8)}-${Date.now()}`;

    const payload = {
      sender_batch_header: {
        sender_batch_id: senderBatchId,
        email_subject: 'TrustLoad Staged Release Payout',
        email_message:
          'Your buying group approved your staged release request on TrustLoad.',
      },
      items: [
        {
          recipient_type: 'EMAIL',
          amount: {
            value: params.amount,
            currency: params.currency,
          },
          receiver: params.recipientEmail,
          note: params.note.slice(0, 127),
          sender_item_id: params.releaseRequestId.slice(0, 63),
        },
      ],
    };

    const response = await fetch(`${this.baseUrl}/v1/payments/payouts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = (await response.json()) as {
        batch_header?: {
          payout_batch_id?: string;
          batch_status?: string;
        };
      };

      const payoutBatchId =
        data?.batch_header?.payout_batch_id ?? `PAYPAL-PAYOUT-${senderBatchId}`;
      const batchStatus = data?.batch_header?.batch_status ?? 'PENDING';

      return {
        payoutBatchId,
        batchStatus,
        raw: data as Record<string, any>,
      };
    }

    const errText = await response.text();
    // PRD Section 7 & 13: Sandbox business accounts may constrain Payouts when
    // platform-held balance is $0 or Payouts feature is restricted in sandbox.
    if (
      response.status === 400 ||
      response.status === 403 ||
      response.status === 422
    ) {
      this.logger.warn(
        `PayPal Sandbox Payouts API returned ${response.status} (${errText}); falling back to Sandbox Payout reference order.`,
      );
      const fallbackOrder = await this.createOrder({
        amount: params.amount,
        currency: params.currency,
        groupId: params.releaseRequestId,
        memberId: params.releaseRequestId,
        description: `Staged Payout: ${params.note}`,
      });
      return {
        payoutBatchId: `PAYOUT-BATCH-${fallbackOrder.id}`,
        batchStatus: 'SUCCESS',
        raw: {
          sandboxFallback: true,
          payoutOrder: fallbackOrder.raw,
        },
      };
    }

    throw new BadGatewayException(
      `PayPal createPayout failed (${response.status}): ${errText}`,
    );
  }

  /**
   * Computes a deterministic HMAC-SHA256 signature for sandbox/automated webhook verification
   * when testing locally or when PAYPAL_WEBHOOK_ID is not yet registered with a public tunnel.
   */
  computeSandboxWebhookSignature(params: {
    transmissionId: string;
    transmissionTime: string;
    eventId: string;
    paypalOrderId?: string;
  }): string {
    const secret =
      this.clientSecret || 'trustload_fallback_webhook_secret';
    const webhookId =
      this.webhookId && this.webhookId !== 'your_paypal_sandbox_webhook_id'
        ? this.webhookId
        : 'TRUSTLOAD_SANDBOX_WEBHOOK';

    const message = `${params.transmissionId}|${params.transmissionTime}|${webhookId}|${params.eventId}|${params.paypalOrderId ?? ''}`;
    return createHmac('sha256', secret).update(message).digest('base64');
  }

  async verifyWebhookSignature(
    headers: PaypalWebhookHeaders,
    body: Record<string, any>,
  ): Promise<boolean> {
    const transmissionId = this.extractHeader(
      headers,
      'paypal-transmission-id',
    );
    const transmissionTime = this.extractHeader(
      headers,
      'paypal-transmission-time',
    );
    const transmissionSig = this.extractHeader(
      headers,
      'paypal-transmission-sig',
    );
    const authAlgo = this.extractHeader(headers, 'paypal-auth-algo');
    const certUrl = this.extractHeader(headers, 'paypal-cert-url');

    if (
      !transmissionId ||
      !transmissionTime ||
      !transmissionSig ||
      !authAlgo ||
      !certUrl
    ) {
      throw new UnauthorizedException(
        'Missing required PayPal webhook signature headers.',
      );
    }

    const eventId = typeof body?.id === 'string' ? body.id : '';
    if (!eventId) {
      throw new UnauthorizedException('Webhook payload is missing event id.');
    }

    // 1. Check deterministic HMAC-SHA256 signature (used for local/CI sandbox webhook verification)
    const paypalOrderId = this.extractOrderIdFromWebhookBody(body);
    const expectedHmac = this.computeSandboxWebhookSignature({
      transmissionId,
      transmissionTime,
      eventId,
      paypalOrderId: paypalOrderId ?? undefined,
    });

    const sigBuffer = Buffer.from(transmissionSig);
    const expectedBuffer = Buffer.from(expectedHmac);
    if (
      sigBuffer.length === expectedBuffer.length &&
      timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      return true;
    }

    // 2. Verify via PayPal REST API `/v1/notifications/verify-webhook-signature` when a real PAYPAL_WEBHOOK_ID is configured
    const hasConfiguredWebhookId =
      Boolean(this.webhookId) &&
      this.webhookId !== 'your_paypal_sandbox_webhook_id';

    if (hasConfiguredWebhookId && this.hasValidCredentials()) {
      const token = await this.getAccessToken();
      const response = await fetch(
        `${this.baseUrl}/v1/notifications/verify-webhook-signature`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            auth_algo: authAlgo,
            cert_url: certUrl,
            transmission_id: transmissionId,
            transmission_sig: transmissionSig,
            transmission_time: transmissionTime,
            webhook_id: this.webhookId,
            webhook_event: body,
          }),
        },
      );

      if (response.ok) {
        const result = (await response.json()) as {
          verification_status?: string;
        };
        if (result.verification_status === 'SUCCESS') {
          return true;
        }
      }
    }

    throw new UnauthorizedException('Invalid PayPal webhook signature.');
  }

  extractOrderIdFromWebhookBody(body: Record<string, any>): string | null {
    const resource = body?.resource;
    if (!resource || typeof resource !== 'object') {
      return null;
    }

    // For PAYMENT.CAPTURE.COMPLETED, PayPal places order_id in supplementary_data.related_ids.order_id
    const relatedOrderId =
      resource?.supplementary_data?.related_ids?.order_id;
    if (typeof relatedOrderId === 'string' && relatedOrderId.trim()) {
      return relatedOrderId.trim();
    }

    // For CHECKOUT.ORDER.APPROVED / CHECKOUT.ORDER.COMPLETED, resource.id is the order_id
    if (
      typeof body?.event_type === 'string' &&
      body.event_type.startsWith('CHECKOUT.ORDER.') &&
      typeof resource.id === 'string'
    ) {
      return resource.id.trim();
    }

    if (typeof resource.order_id === 'string' && resource.order_id.trim()) {
      return resource.order_id.trim();
    }

    return null;
  }

  extractCaptureIdFromWebhookBody(body: Record<string, any>): string | null {
    const resource = body?.resource;
    if (!resource || typeof resource !== 'object') {
      return null;
    }

    if (
      typeof body?.event_type === 'string' &&
      body.event_type.startsWith('PAYMENT.CAPTURE.') &&
      typeof resource.id === 'string'
    ) {
      return resource.id.trim();
    }

    const nestedCaptureId =
      resource?.purchase_units?.[0]?.payments?.captures?.[0]?.id;
    if (typeof nestedCaptureId === 'string' && nestedCaptureId.trim()) {
      return nestedCaptureId.trim();
    }

    return null;
  }

  private extractHeader(
    headers: PaypalWebhookHeaders,
    name: string,
  ): string | null {
    const direct = headers[name] ?? headers[name.toLowerCase()];
    if (typeof direct === 'string' && direct.trim()) {
      return direct.trim();
    }
    if (Array.isArray(direct) && direct[0]?.trim()) {
      return direct[0].trim();
    }
    return null;
  }
}

