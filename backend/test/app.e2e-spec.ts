import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('TrustLoad API (e2e)', () => {
  jest.setTimeout(30000);
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let createdGroupId: string | undefined;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    if (createdGroupId) {
      await prisma.group.delete({ where: { id: createdGroupId } }).catch(() => undefined);
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
            { item: 'Type-C Laptop Power Bank 20000mAh', quantity: 40, budget: 600 },
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
});
