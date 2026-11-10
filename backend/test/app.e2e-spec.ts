import * as fs from 'node:fs';
import * as path from 'node:path';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PaypalService } from './../src/contributions/paypal.service';
import { PrismaService } from './../src/prisma/prisma.service';

describe('TrustLoad API (e2e)', () => {
  jest.setTimeout(60000);
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let paypalService: PaypalService;
  let createdGroupId: string | undefined;
  let firstMemberId: string | undefined;
  let memberIds: string[] = [];
  let createdReleaseRequestId: string | undefined;
  let uploadedInvoicePath: string | undefined;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    paypalService = moduleFixture.get<PaypalService>(PaypalService);
    await app.init();
  });

  afterAll(async () => {
    if (uploadedInvoicePath) {
      const fullPath = path.resolve(process.cwd(), uploadedInvoicePath);
      await fs.promises.unlink(fullPath).catch(() => undefined);
    }
    if (createdGroupId) {
      await prisma.group
        .delete({ where: { id: createdGroupId } })
        .catch(() => undefined);
    }
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('POST /groups and GET /groups/:id — creates and fetches a group with 5 vendors and their orders (FR1)', async () => {
    const uniqueSuffix = Date.now();
    const payload = {
      name: `Istanbul & Guangzhou Group Buy (${uniqueSuffix})`,
      baseCurrency: 'USD',
      approvalThreshold: 3,
      sharedCostRule: 'PROPORTIONAL_TO_VALUE',
      traveler: {
        name: 'Emeka Okafor',
        email: `emeka.traveler.${uniqueSuffix}@trustload.africa`,
      },
      members: [
        {
          name: 'Vendor One',
          email: `vendor1.${uniqueSuffix}@trustload.africa`,
          contributionExpected: 1000,
          orderLines: [
            {
              item: 'Type-C Laptop Power Bank 20000mAh',
              quantity: 40,
              budget: 600,
            },
            { item: 'GaN 100W Desktop Charger', quantity: 20, budget: 400 },
          ],
        },
        {
          name: 'Vendor Two',
          email: `vendor2.${uniqueSuffix}@trustload.africa`,
          contributionExpected: 1200,
          orderLines: [
            { item: 'Turkish Cotton Towel Bale', quantity: 30, budget: 1200 },
          ],
        },
        {
          name: 'Vendor Three',
          email: `vendor3.${uniqueSuffix}@trustload.africa`,
          contributionExpected: 800,
          orderLines: [
            { item: 'Bluetooth Label Printer', quantity: 25, budget: 800 },
          ],
        },
        {
          name: 'Vendor Four',
          email: `vendor4.${uniqueSuffix}@trustload.africa`,
          contributionExpected: 950,
          orderLines: [
            { item: 'Leather Crossbody Handbag', quantity: 50, budget: 950 },
          ],
        },
        {
          name: 'Vendor Five',
          email: `vendor5.${uniqueSuffix}@trustload.africa`,
          contributionExpected: 650,
          orderLines: [
            { item: 'GaN 100W Desktop Charger', quantity: 30, budget: 650 },
          ],
        },
      ],
    };

    const createRes = await request(app.getHttpServer())
      .post('/groups')
      .send(payload)
      .expect(201);

    expect(createRes.body.id).toBeDefined();
    createdGroupId = createRes.body.id;
    firstMemberId = createRes.body.members[0].id;
    memberIds = createRes.body.members.map((m: { id: string }) => m.id);

    expect(createRes.body.name).toBe(payload.name);
    expect(createRes.body.baseCurrency).toBe('USD');
    expect(createRes.body.approvalThreshold).toBe(3);
    expect(createRes.body.members).toHaveLength(5);
    expect(createRes.body.orderLines).toHaveLength(6);
    expect(createRes.body.summary).toMatchObject({
      memberCount: 5,
      orderLineCount: 6,
      totalExpectedContribution: 4600,
      totalOrderBudget: 4600,
    });

    // Fetch the group by ID through GET /groups/:id
    const getRes = await request(app.getHttpServer())
      .get(`/groups/${createdGroupId}`)
      .expect(200);

    expect(getRes.body.id).toBe(createdGroupId);
    expect(getRes.body.traveler.email).toBe(
      `emeka.traveler.${uniqueSuffix}@trustload.africa`,
    );
    expect(getRes.body.members).toHaveLength(5);
    expect(getRes.body.members[0].orderLines).toHaveLength(2);

    // Fetch combined orders through GET /groups/:id/orders
    const ordersRes = await request(app.getHttpServer())
      .get(`/groups/${createdGroupId}/orders`)
      .expect(200);

    expect(ordersRes.body.combinedItems).toHaveLength(5);
    const ganCharger = ordersRes.body.combinedItems.find(
      (item: { item: string }) => item.item === 'GaN 100W Desktop Charger',
    );
    expect(ganCharger).toMatchObject({
      totalQuantity: 50,
      totalBudget: 1050,
    });
  });

  it('POST /groups/:groupId/members/:memberId/contributions/orders & POST /webhooks/paypal — creates a PayPal Sandbox order, confirms via signature-verified webhook, records in ledger, and prevents double-counting on repeated webhooks (FR2)', async () => {
    expect(createdGroupId).toBeDefined();
    expect(firstMemberId).toBeDefined();

    // 1. Create a real PayPal Sandbox Order for Vendor One ($1000.00)
    const orderRes = await request(app.getHttpServer())
      .post(
        `/groups/${createdGroupId}/members/${firstMemberId}/contributions/orders`,
      )
      .send({})
      .expect(201);

    const paypalOrderId: string = orderRes.body.paypalOrder.id;
    expect(paypalOrderId).toBeDefined();
    expect(orderRes.body.paypalOrder.status).toBe('CREATED');
    expect(orderRes.body.paypalOrder.approveUrl).toContain('sandbox.paypal.com');
    expect(orderRes.body.contribution).toMatchObject({
      memberId: firstMemberId,
      paypalOrderId,
      status: 'PENDING',
      amount: '1000',
      currency: 'USD',
    });

    // 2. Construct PayPal PAYMENT.CAPTURE.COMPLETED webhook payload
    const eventId = `WH-SBX-${Date.now()}`;
    const transmissionId = `tx-${Date.now()}`;
    const transmissionTime = new Date().toISOString();
    const webhookPayload = {
      id: eventId,
      event_type: 'PAYMENT.CAPTURE.COMPLETED',
      create_time: transmissionTime,
      resource: {
        id: `CAP-SBX-${Date.now()}`,
        status: 'COMPLETED',
        amount: {
          currency_code: 'USD',
          value: '1000.00',
        },
        supplementary_data: {
          related_ids: {
            order_id: paypalOrderId,
          },
        },
      },
    };

    // 3. Verify that an invalid signature is rejected with 401 Unauthorized
    await request(app.getHttpServer())
      .post('/webhooks/paypal')
      .set('paypal-transmission-id', transmissionId)
      .set('paypal-transmission-time', transmissionTime)
      .set('paypal-transmission-sig', 'invalid-signature')
      .set('paypal-auth-algo', 'SHA256withRSA')
      .set('paypal-cert-url', 'https://api.sandbox.paypal.com/v1/notifications/certs/CERT-123')
      .send(webhookPayload)
      .expect(401);

    // 4. Send valid signature-verified webhook (1st delivery)
    const validSig = paypalService.computeSandboxWebhookSignature({
      transmissionId,
      transmissionTime,
      eventId,
      paypalOrderId,
    });

    const webhookRes1 = await request(app.getHttpServer())
      .post('/webhooks/paypal')
      .set('paypal-transmission-id', transmissionId)
      .set('paypal-transmission-time', transmissionTime)
      .set('paypal-transmission-sig', validSig)
      .set('paypal-auth-algo', 'SHA256withRSA')
      .set('paypal-cert-url', 'https://api.sandbox.paypal.com/v1/notifications/certs/CERT-123')
      .send(webhookPayload)
      .expect(200);

    expect(webhookRes1.body).toMatchObject({
      received: true,
      idempotentReplay: false,
      potBalance: 1000,
    });
    expect(webhookRes1.body.contribution.status).toBe('COMPLETED');
    expect(webhookRes1.body.ledgerEntry.paypalRef).toBe(paypalOrderId);

    // 5. Verify the sandbox payment appears in the group ledger with its PayPal Order ID
    const ledgerRes1 = await request(app.getHttpServer())
      .get(`/groups/${createdGroupId}/ledger`)
      .expect(200);

    expect(ledgerRes1.body.summary).toMatchObject({
      totalIn: 1000,
      totalReleased: 0,
      potBalance: 1000,
      entryCount: 1,
    });
    expect(ledgerRes1.body.ledgerEntries).toHaveLength(1);
    expect(ledgerRes1.body.ledgerEntries[0]).toMatchObject({
      type: 'CONTRIBUTION',
      paypalRef: paypalOrderId,
      amount: '1000',
      currency: 'USD',
    });

    // 6. Replay the exact same webhook (2nd delivery) — must NOT double-count
    const webhookRes2 = await request(app.getHttpServer())
      .post('/webhooks/paypal')
      .set('paypal-transmission-id', transmissionId)
      .set('paypal-transmission-time', transmissionTime)
      .set('paypal-transmission-sig', validSig)
      .set('paypal-auth-algo', 'SHA256withRSA')
      .set('paypal-cert-url', 'https://api.sandbox.paypal.com/v1/notifications/certs/CERT-123')
      .send(webhookPayload)
      .expect(200);

    expect(webhookRes2.body).toMatchObject({
      received: true,
      idempotentReplay: true,
      potBalance: 1000,
    });

    // 7. Re-check the ledger and group summary to confirm no duplicate ledger entry or pot inflation
    const ledgerRes2 = await request(app.getHttpServer())
      .get(`/groups/${createdGroupId}/ledger`)
      .expect(200);

    expect(ledgerRes2.body.summary).toMatchObject({
      totalIn: 1000,
      potBalance: 1000,
      entryCount: 1,
    });
    expect(ledgerRes2.body.ledgerEntries).toHaveLength(1);
  });

  it('POST /groups/:groupId/release-requests — traveler submits a release request with amount, supplier, currency, and invoice upload; stored with file and shows as pending for the group (FR3)', async () => {
    expect(createdGroupId).toBeDefined();

    const samplePdfBuffer = Buffer.from(
      '%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF\n',
      'utf-8',
    );

    const createReleaseRes = await request(app.getHttpServer())
      .post(`/groups/${createdGroupId}/release-requests`)
      .field('amount', '7200')
      .field('supplier', 'Shenzhen Golden Dragon Electronics Co.')
      .field('currency', 'CNY')
      .field('sourceLanguage', 'zh-CN')
      .attach('invoice', samplePdfBuffer, {
        filename: 'shenzhen-supplier-invoice.pdf',
        contentType: 'application/pdf',
      })
      .expect(201);

    const releaseId: string = createReleaseRes.body.id;
    expect(releaseId).toBeDefined();
    createdReleaseRequestId = releaseId;
    uploadedInvoicePath = createReleaseRes.body.invoiceFile;

    expect(createReleaseRes.body).toMatchObject({
      groupId: createdGroupId,
      supplier: 'Shenzhen Golden Dragon Electronics Co.',
      currency: 'CNY',
      originalAmount: '7200',
      amount: '1000', // 7200 CNY * 0.138889 USD/CNY = 1000.00 USD
      status: 'PENDING',
      isPending: true,
    });
    expect(createReleaseRes.body.invoiceFile).toContain(
      'shenzhen-supplier-invoice.pdf',
    );

    // Verify the file exists on disk and is downloadable via GET /release-requests/:id/invoice
    const downloadRes = await request(app.getHttpServer())
      .get(`/release-requests/${releaseId}/invoice`)
      .expect(200);
    expect(downloadRes.headers['content-type']).toContain('application/pdf');

    // Verify the release request shows as pending for the group via GET /groups/:groupId/release-requests
    const groupReleasesRes = await request(app.getHttpServer())
      .get(`/groups/${createdGroupId}/release-requests`)
      .expect(200);

    expect(groupReleasesRes.body.pendingCount).toBe(1);
    expect(groupReleasesRes.body.pendingReleaseRequests).toHaveLength(1);
    expect(groupReleasesRes.body.pendingReleaseRequests[0]).toMatchObject({
      id: releaseId,
      supplier: 'Shenzhen Golden Dragon Electronics Co.',
      status: 'PENDING',
      isPending: true,
      invoiceFile: uploadedInvoicePath,
    });

    // Also verify it shows as pending on GET /groups/:id
    const groupRes = await request(app.getHttpServer())
      .get(`/groups/${createdGroupId}`)
      .expect(200);

    expect(groupRes.body.summary.pendingReleaseRequestCount).toBe(1);
    expect(groupRes.body.pendingReleaseRequests).toHaveLength(1);
    expect(groupRes.body.pendingReleaseRequests[0].id).toBe(releaseId);
  });

  it('POST /release-requests/:id/approvals & /payout — enforces no payout without approval record, triggers PayPal sandbox payout when threshold is met, and writes a ledger entry with the PayPal reference (FR5)', async () => {
    expect(createdReleaseRequestId).toBeDefined();
    expect(memberIds.length).toBeGreaterThanOrEqual(3);

    // 1. Attempting payout with 0 approval records must fail with 400 Bad Request
    await request(app.getHttpServer())
      .post(`/release-requests/${createdReleaseRequestId}/payout`)
      .expect(400);

    // 2. Vendor 1 approves (1 of 3 required) — threshold not yet met
    const approval1Res = await request(app.getHttpServer())
      .post(`/release-requests/${createdReleaseRequestId}/approvals`)
      .send({
        memberId: memberIds[0],
        decision: 'APPROVED',
        comment: 'Looks good from Vendor 1',
      })
      .expect(201);

    expect(approval1Res.body).toMatchObject({
      approvedCount: 1,
      rejectedCount: 0,
      approvalThreshold: 3,
      thresholdMet: false,
      payoutTriggered: false,
    });
    expect(approval1Res.body.releaseRequest.status).toBe('AWAITING_APPROVAL');

    // 3. Vendor 2 approves (2 of 3 required) — threshold still not met
    const approval2Res = await request(app.getHttpServer())
      .post(`/release-requests/${createdReleaseRequestId}/approvals`)
      .send({
        memberId: memberIds[1],
        decision: 'APPROVED',
        comment: 'Confirmed by Vendor 2',
      })
      .expect(201);

    expect(approval2Res.body).toMatchObject({
      approvedCount: 2,
      rejectedCount: 0,
      approvalThreshold: 3,
      thresholdMet: false,
      payoutTriggered: false,
    });

    // Attempting manual payout before threshold is met must still fail
    await request(app.getHttpServer())
      .post(`/release-requests/${createdReleaseRequestId}/payout`)
      .expect(400);

    // 4. Vendor 3 approves (3 of 3 required) — threshold is reached, triggering PayPal Sandbox Payout
    const approval3Res = await request(app.getHttpServer())
      .post(`/release-requests/${createdReleaseRequestId}/approvals`)
      .send({
        memberId: memberIds[2],
        decision: 'APPROVED',
        comment: 'Threshold met by Vendor 3',
      })
      .expect(201);

    expect(approval3Res.body).toMatchObject({
      approvedCount: 3,
      rejectedCount: 0,
      approvalThreshold: 3,
      thresholdMet: true,
      payoutTriggered: true,
    });

    const payoutBatchId: string = approval3Res.body.paypalPayoutId;
    expect(payoutBatchId).toBeDefined();
    expect(approval3Res.body.releaseRequest).toMatchObject({
      id: createdReleaseRequestId,
      status: 'RELEASED',
      paypalPayoutId: payoutBatchId,
      isPending: false,
    });
    expect(approval3Res.body.ledgerEntry).toMatchObject({
      groupId: createdGroupId,
      type: 'STAGED_RELEASE',
      amount: '-1000',
      originalAmount: '7200',
      currency: 'CNY',
      paypalRef: payoutBatchId,
    });

    // 5. Verify the STAGED_RELEASE entry appears in the group ledger with its PayPal payout reference
    const ledgerRes = await request(app.getHttpServer())
      .get(`/groups/${createdGroupId}/ledger`)
      .expect(200);

    expect(ledgerRes.body.summary).toMatchObject({
      totalIn: 1000,
      totalReleased: 1000,
      potBalance: 0,
      entryCount: 2,
    });

    const releaseLedgerEntry = ledgerRes.body.ledgerEntries.find(
      (e: { type: string }) => e.type === 'STAGED_RELEASE',
    );
    expect(releaseLedgerEntry).toBeDefined();
    expect(releaseLedgerEntry).toMatchObject({
      type: 'STAGED_RELEASE',
      paypalRef: payoutBatchId,
      amount: '-1000',
      originalAmount: '7200',
      currency: 'CNY',
    });
  });

  it('POST /groups/:groupId/settlement — calculates each vendor final amount owed or refunded, executes PayPal refunds, and closes the group with a balanced ledger (FR7)', async () => {
    expect(createdGroupId).toBeDefined();
    expect(memberIds.length).toBeGreaterThanOrEqual(2);

    // 1. Fund Vendor 2 ($1200.00) so two vendors have funded the pot ($1000 + $1200 = $2200)
    const order2Res = await request(app.getHttpServer())
      .post(
        `/groups/${createdGroupId}/members/${memberIds[1]}/contributions/orders`,
      )
      .send({})
      .expect(201);

    const paypalOrder2Id: string = order2Res.body.paypalOrder.id;
    const eventId2 = `WH-SBX-V2-${Date.now()}`;
    const transmissionId2 = `tx-v2-${Date.now()}`;
    const transmissionTime2 = new Date().toISOString();
    const validSig2 = paypalService.computeSandboxWebhookSignature({
      transmissionId: transmissionId2,
      transmissionTime: transmissionTime2,
      eventId: eventId2,
      paypalOrderId: paypalOrder2Id,
    });

    await request(app.getHttpServer())
      .post('/webhooks/paypal')
      .set('paypal-transmission-id', transmissionId2)
      .set('paypal-transmission-time', transmissionTime2)
      .set('paypal-transmission-sig', validSig2)
      .set('paypal-auth-algo', 'SHA256withRSA')
      .set(
        'paypal-cert-url',
        'https://api.sandbox.paypal.com/v1/notifications/certs/CERT-123',
      )
      .send({
        id: eventId2,
        event_type: 'PAYMENT.CAPTURE.COMPLETED',
        create_time: transmissionTime2,
        resource: {
          id: `CAP-SBX-V2-${Date.now()}`,
          status: 'COMPLETED',
          amount: { currency_code: 'USD', value: '1200.00' },
          supplementary_data: {
            related_ids: { order_id: paypalOrder2Id },
          },
        },
      })
      .expect(200);

    // 2. Execute final settlement:
    // Vendor 1 ($1000 paid): goods = $600, proportional shared cost (40% of $150) = $60 -> total spend $660 -> refund due = $340
    // Vendor 2 ($1200 paid): goods = $900, proportional shared cost (60% of $150) = $90 -> total spend $990 -> refund due = $210
    const settleRes = await request(app.getHttpServer())
      .post(`/groups/${createdGroupId}/settlement`)
      .send({
        totalSharedCosts: 150,
        memberAllocations: [
          { memberId: memberIds[0], goodsTotal: 600 },
          { memberId: memberIds[1], goodsTotal: 900 },
        ],
      })
      .expect(201);

    expect(settleRes.body).toMatchObject({
      groupId: createdGroupId,
      status: 'CLOSED',
      isBalanced: true,
      potBalance: 0,
      totals: {
        totalContributed: 2200,
        totalGoods: 1500,
        totalSharedCosts: 150,
        totalSpent: 1650,
        totalRefundsDue: 550,
        totalOwed: 0,
      },
    });

    expect(settleRes.body.refundsExecuted).toHaveLength(2);
    expect(settleRes.body.refundsExecuted[0]).toMatchObject({
      memberId: memberIds[0],
      amount: 340,
      currency: 'USD',
    });
    expect(settleRes.body.refundsExecuted[0].paypalRef).toBeDefined();

    expect(settleRes.body.refundsExecuted[1]).toMatchObject({
      memberId: memberIds[1],
      amount: 210,
      currency: 'USD',
    });
    expect(settleRes.body.refundsExecuted[1].paypalRef).toBeDefined();

    // 3. Verify the group ledger is balanced and contains the REFUND entries with PayPal references
    const finalLedgerRes = await request(app.getHttpServer())
      .get(`/groups/${createdGroupId}/ledger`)
      .expect(200);

    expect(finalLedgerRes.body).toMatchObject({
      groupId: createdGroupId,
      status: 'CLOSED',
      summary: {
        totalIn: 2200,
        netSpend: 1650,
        totalRefunded: 550,
        potBalance: 0,
        isBalanced: true,
      },
    });

    const refundLedgerEntries = finalLedgerRes.body.ledgerEntries.filter(
      (e: { type: string }) => e.type === 'REFUND',
    );
    expect(refundLedgerEntries).toHaveLength(2);
  });
});
