import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  ApprovalDecision,
  ContributionStatus,
  GroupStatus,
  LedgerEntryType,
  PrismaClient,
  ReleaseRequestStatus,
  SharedCostRule,
  UserRole,
} from '@prisma/client';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required to run seed.');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding TrustLoad database...');

  // Clean existing records in reverse dependency order for idempotent seeding
  await prisma.ledgerEntry.deleteMany();
  await prisma.allocation.deleteMany();
  await prisma.receipt.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.releaseRequest.deleteMany();
  await prisma.contribution.deleteMany();
  await prisma.orderLine.deleteMany();
  await prisma.member.deleteMany();
  await prisma.group.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Traveler + 5 Vendors
  const traveler = await prisma.user.create({
    data: {
      name: 'Chidi Okonkwo',
      email: 'chidi.traveler@trustload.africa',
      role: UserRole.TRAVELER,
    },
  });

  const vendorUsers = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Amaka Nwosu',
        email: 'amaka@trustload.africa',
        role: UserRole.VENDOR,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Tunde Bakare',
        email: 'tunde@trustload.africa',
        role: UserRole.VENDOR,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Ngozi Eze',
        email: 'ngozi@trustload.africa',
        role: UserRole.VENDOR,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Ibrahim Musa',
        email: 'ibrahim@trustload.africa',
        role: UserRole.VENDOR,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Funke Adeyemi',
        email: 'funke@trustload.africa',
        role: UserRole.VENDOR,
      },
    }),
  ]);

  // 2. Create Buying Group
  const fxDate = new Date('2026-11-06T10:00:00Z');
  const group = await prisma.group.create({
    data: {
      name: 'Guangzhou & Dubai Electronics & Textiles Run (Nov 2026)',
      travelerId: traveler.id,
      status: GroupStatus.ACTIVE,
      approvalThreshold: 3,
      sharedCostRule: SharedCostRule.PROPORTIONAL_TO_VALUE,
      baseCurrency: 'USD',
    },
  });

  // 3. Create 5 Members with Expected Contributions
  const memberSpecs = [
    {
      user: vendorUsers[0],
      contributionExpected: '1200.00',
      paypalOrderId: 'PAYPAL-ORD-SBX-1001',
      paypalCaptureId: 'PAYPAL-CAP-SBX-1001',
      orders: [
        { item: '65W GaN USB-C Fast Charger', quantity: 100, budget: '800.00' },
        { item: 'Braided MagSafe Cable (2m)', quantity: 200, budget: '400.00' },
      ],
    },
    {
      user: vendorUsers[1],
      contributionExpected: '1500.00',
      paypalOrderId: 'PAYPAL-ORD-SBX-1002',
      paypalCaptureId: 'PAYPAL-CAP-SBX-1002',
      orders: [
        { item: 'OLED Replacement Display Assembly', quantity: 30, budget: '1500.00' },
      ],
    },
    {
      user: vendorUsers[2],
      contributionExpected: '900.00',
      paypalOrderId: 'PAYPAL-ORD-SBX-1003',
      paypalCaptureId: 'PAYPAL-CAP-SBX-1003',
      orders: [
        { item: 'ANC Wireless Earbuds Pro', quantity: 60, budget: '900.00' },
      ],
    },
    {
      user: vendorUsers[3],
      contributionExpected: '1100.00',
      paypalOrderId: 'PAYPAL-ORD-SBX-1004',
      paypalCaptureId: 'PAYPAL-CAP-SBX-1004',
      orders: [
        { item: 'Embroidered Crepe Abaya Fabric Roll', quantity: 25, budget: '1100.00' },
      ],
    },
    {
      user: vendorUsers[4],
      contributionExpected: '800.00',
      paypalOrderId: 'PAYPAL-ORD-SBX-1005',
      paypalCaptureId: 'PAYPAL-CAP-SBX-1005',
      orders: [
        { item: 'Smart Fitness Watch Series 9', quantity: 40, budget: '800.00' },
      ],
    },
  ];

  const members = [];
  for (const spec of memberSpecs) {
    const member = await prisma.member.create({
      data: {
        groupId: group.id,
        userId: spec.user.id,
        contributionExpected: spec.contributionExpected,
      },
    });
    members.push(member);

    for (const line of spec.orders) {
      await prisma.orderLine.create({
        data: {
          groupId: group.id,
          memberId: member.id,
          item: line.item,
          quantity: line.quantity,
          budget: line.budget,
        },
      });
    }

    await prisma.contribution.create({
      data: {
        memberId: member.id,
        amount: spec.contributionExpected,
        currency: 'USD',
        paypalOrderId: spec.paypalOrderId,
        paypalCaptureId: spec.paypalCaptureId,
        status: ContributionStatus.COMPLETED,
      },
    });

    await prisma.ledgerEntry.create({
      data: {
        groupId: group.id,
        memberId: member.id,
        type: LedgerEntryType.CONTRIBUTION,
        amount: spec.contributionExpected,
        originalAmount: spec.contributionExpected,
        currency: 'USD',
        fxRate: '1.000000',
        fxRateDate: fxDate,
        paypalRef: spec.paypalCaptureId,
        description: `Vendor contribution from ${spec.user.name}`,
      },
    });
  }

  // 4. Create 2 Staged Release Requests (CNY verified & released; AED with planted mismatch flagged)
  const release1Supplier: Record<string, unknown> = {
    supplier: 'Shenzhen Huaqiangbei Golden Tech Co., Ltd.',
  };
  const release1 = await prisma.releaseRequest.create({
    data: {
      groupId: group.id,
      ...release1Supplier,
      amount: '2625.00',
      currency: 'CNY',
      originalAmount: '18900.00',
      fxRate: '0.138889', // 1 CNY = 0.138889 USD (7.20 CNY/USD)
      fxRateDate: fxDate,
      sourceLanguage: 'zh-CN',
      invoiceFile: 'uploads/seed-shenzhen-electronics-invoice.pdf',
      status: ReleaseRequestStatus.RELEASED,
      paypalPayoutId: 'PAYPAL-PAYOUT-SBX-2001',
      aiReport: {
        supplier: 'Shenzhen Huaqiangbei Golden Tech Co., Ltd.',
        date: '2026-11-07',
        sourceLanguage: 'zh-CN',
        currency: 'CNY',
        grandTotal: 18900,
        convertedTotalUsd: 2625.0,
        overallConfidence: 0.96,
        passedAllChecks: true,
        flags: [],
        lineItems: [
          {
            originalDescription: '65W 氮化镓快充充电器',
            translatedDescription: '65W GaN USB-C Fast Charger',
            quantity: 100,
            unitPrice: 54,
            lineTotal: 5400,
            confidence: 0.98,
          },
          {
            originalDescription: '磁吸编织数据线 2米',
            translatedDescription: 'Braided MagSafe Cable (2m)',
            quantity: 200,
            unitPrice: 13.5,
            lineTotal: 2700,
            confidence: 0.95,
          },
          {
            originalDescription: 'OLED 屏幕总成',
            translatedDescription: 'OLED Replacement Display Assembly',
            quantity: 30,
            unitPrice: 360,
            lineTotal: 10800,
            confidence: 0.96,
          },
        ],
      },
    },
  });

  // 3 vendor approvals for release 1
  for (let i = 0; i < 3; i++) {
    await prisma.approval.create({
      data: {
        releaseRequestId: release1.id,
        memberId: members[i].id,
        decision: ApprovalDecision.APPROVED,
        comment: 'AI verification passed; quantities and prices match order.',
      },
    });
  }

  await prisma.ledgerEntry.create({
    data: {
      groupId: group.id,
      type: LedgerEntryType.STAGED_RELEASE,
      amount: '-2625.00',
      originalAmount: '18900.00',
      currency: 'CNY',
      fxRate: '0.138889',
      fxRateDate: fxDate,
      paypalRef: 'PAYPAL-PAYOUT-SBX-2001',
      description: 'Staged payout for Shenzhen Huaqiangbei Golden Tech invoice',
    },
  });

  // Release Request 2: Dubai AED invoice with planted quantity mismatch flagged by AI
  const release2Supplier: Record<string, unknown> = {
    supplier: 'Al Ras Royal Textiles Trading LLC (Deira, Dubai)',
  };
  await prisma.releaseRequest.create({
    data: {
      groupId: group.id,
      ...release2Supplier,
      amount: '1280.00',
      currency: 'AED',
      originalAmount: '4700.00',
      fxRate: '0.272294', // 1 AED = 0.272294 USD (3.6725 AED/USD)
      fxRateDate: fxDate,
      sourceLanguage: 'ar-AE',
      invoiceFile: 'uploads/seed-dubai-deira-textiles-invoice.jpg',
      status: ReleaseRequestStatus.AWAITING_APPROVAL,
      aiReport: {
        supplier: 'Al Ras Royal Textiles Trading LLC (Deira, Dubai)',
        date: '2026-11-08',
        sourceLanguage: 'ar-AE',
        currency: 'AED',
        grandTotal: 4700,
        convertedTotalUsd: 1279.78,
        overallConfidence: 0.91,
        passedAllChecks: false,
        flags: [
          {
            code: 'QUANTITY_EXCEEDS_ORDER',
            severity: 'HIGH',
            message:
              'Invoice bills for 35 rolls of Embroidered Crepe Abaya Fabric Roll, but group combined order only requested 25 rolls.',
          },
        ],
        lineItems: [
          {
            originalDescription: 'رول قماش عباية كريب مطرز',
            translatedDescription: 'Embroidered Crepe Abaya Fabric Roll',
            quantity: 35,
            unitPrice: 134.28,
            lineTotal: 4700,
            confidence: 0.91,
          },
        ],
      },
    },
  });

  // 5. Create Sample Final Receipt & Initial Allocations
  await prisma.receipt.create({
    data: {
      groupId: group.id,
      file: 'uploads/seed-shenzhen-final-receipt.jpg',
      currency: 'CNY',
      originalAmount: '19620.00',
      fxRate: '0.138889',
      fxRateDate: fxDate,
      sourceLanguage: 'zh-CN',
      aiExtraction: {
        supplier: 'Shenzhen Huaqiangbei Golden Tech Co., Ltd.',
        date: '2026-11-08',
        currency: 'CNY',
        goodsSubtotal: 18900,
        sharedCosts: [
          { description: 'Freight Forwarding & Consolidation Carton Fee', amount: 720 },
        ],
        grandTotal: 19620,
      },
    },
  });

  const allocationSeeds = [
    { member: members[0], goodsTotal: '1125.00', sharedCostShare: '42.86', netOwedOrRefund: '32.14' },
    { member: members[1], goodsTotal: '1500.00', sharedCostShare: '57.14', netOwedOrRefund: '-57.14' },
    { member: members[2], goodsTotal: '850.00', sharedCostShare: '32.38', netOwedOrRefund: '17.62' },
    { member: members[3], goodsTotal: '1050.00', sharedCostShare: '40.00', netOwedOrRefund: '10.00' },
    { member: members[4], goodsTotal: '750.00', sharedCostShare: '28.57', netOwedOrRefund: '21.43' },
  ];

  for (const alloc of allocationSeeds) {
    await prisma.allocation.create({
      data: {
        groupId: group.id,
        memberId: alloc.member.id,
        goodsTotal: alloc.goodsTotal,
        sharedCostShare: alloc.sharedCostShare,
        netOwedOrRefund: alloc.netOwedOrRefund,
      },
    });
  }

  console.log('Seed completed successfully:', {
    traveler: traveler.email,
    group: group.name,
    vendorsCount: members.length,
  });
}

main()
  .catch((err) => {
    console.error('Error seeding database:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

