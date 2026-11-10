import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ContributionStatus,
  LedgerEntryType,
  Prisma,
  SharedCostRule,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FxRatesService } from '../release-requests/fx-rates.service';
import type { UploadedInvoiceFile } from '../release-requests/release-requests.service';
import { AiExtractionService } from './ai-extraction.service';
import type {
  AllocateReceiptsDto,
  AssignedVendorGoodsItem,
  CreateReceiptDto,
  ExtractedSharedCostBreakdown,
  InlineReceiptInputDto,
  ReceiptAllocationReport,
  VendorAllocationResult,
} from './dto/receipt-allocation.dto';

const SHARED_COST_KEYWORDS_REGEX =
  /\b(shipping|freight|transport|transportation|delivery|customs|clearance|duty|duties|tax|taxes|fee|fees|carton|packing|packaging|handling|logistics|courier|cargo|port|surcharge)\b|运费|物流|打包|包装费|清关|税费|服务费|شحن|نقل|جمارك|رسوم|تغليف|kargo|nakliye|gümrük|ücret/i;

@Injectable()
export class AiAllocationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiExtractionService: AiExtractionService,
    private readonly fxRatesService: FxRatesService,
  ) {}

  /**
   * Upload and extract a final trip receipt (image/PDF or JSON), convert its amount to
   * the group's base currency in code using stored FX rates, and save to `receipts`.
   */
  async createGroupReceipt(
    groupId: string,
    dto?: CreateReceiptDto,
    file?: UploadedInvoiceFile,
  ) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });
    if (!group) {
      throw new NotFoundException(`Group with id "${groupId}" not found.`);
    }

    let storedFilePath = 'uploads/inline-receipt.json';
    if (file && file.size > 0) {
      storedFilePath = await this.persistReceiptFile(groupId, file);
    }

    const currencyHint = (dto?.currency ?? group.baseCurrency ?? 'USD')
      .trim()
      .toUpperCase();
    const amountHint =
      dto?.originalAmount !== undefined
        ? Number(dto.originalAmount)
        : undefined;

    let extractedObj: Record<string, any>;

    if (file && file.size > 0) {
      const buffer =
        file.buffer ??
        (file.path ? await fs.promises.readFile(file.path) : Buffer.alloc(0));

      const rawText = buffer.toString('utf-8');
      const extraction = await this.aiExtractionService.extractInvoiceBuffer({
        buffer,
        mimeType: file.mimetype || 'application/pdf',
        originalName: file.originalname || path.basename(storedFilePath),
        sourceFile: storedFilePath,
        supplierHint: dto?.supplier,
        currencyHint,
        amountHint,
        languageHint: dto?.sourceLanguage,
        baseCurrency: group.baseCurrency,
      });

      // Also parse any explicit `SharedCost: <desc> | Total: <amount>` lines from rawText
      const sharedCostLinesFromText = this.parseSharedCostLinesFromText(rawText);
      const explicitSharedFromDto = Array.isArray(dto?.sharedCosts)
        ? dto.sharedCosts
        : [];

      const classifiedItems = this.classifyExtractedItems(
        extraction.lineItems,
        [...sharedCostLinesFromText, ...explicitSharedFromDto],
      );

      const computedTotal = Number(
        (
          classifiedItems.goodsSubtotal + classifiedItems.sharedCostsSubtotal
        ).toFixed(2),
      );
      const finalOriginalAmount =
        amountHint && amountHint > 0
          ? amountHint
          : sharedCostLinesFromText.length > 0 || explicitSharedFromDto.length > 0
            ? computedTotal
            : extraction.grandTotal;

      extractedObj = {
        ...extraction,
        supplier: dto?.supplier ?? extraction.supplier,
        currency: dto?.currency?.trim().toUpperCase() || extraction.currency,
        lineItems: classifiedItems.lineItems,
        sharedCosts: classifiedItems.sharedCosts,
        goodsSubtotal: classifiedItems.goodsSubtotal,
        sharedCostsSubtotal: classifiedItems.sharedCostsSubtotal,
        grandTotal: finalOriginalAmount,
      };
    } else if (
      (Array.isArray(dto?.lineItems) && dto.lineItems.length > 0) ||
      (Array.isArray(dto?.sharedCosts) && dto.sharedCosts.length > 0)
    ) {
      const classified = this.classifyExtractedItems(
        dto?.lineItems ?? [],
        dto?.sharedCosts ?? [],
      );
      const computedGrandTotal = Number(
        (classified.goodsSubtotal + classified.sharedCostsSubtotal).toFixed(2),
      );
      const finalGrandTotal =
        amountHint && amountHint > 0 ? amountHint : computedGrandTotal;

      extractedObj = {
        supplier: dto?.supplier ?? 'Trip Final Receipt Supplier',
        date: new Date().toISOString().slice(0, 10),
        currency: currencyHint,
        originalCurrency: currencyHint,
        sourceLanguage: dto?.sourceLanguage ?? 'en',
        lineItems: classified.lineItems,
        sharedCosts: classified.sharedCosts,
        goodsSubtotal: classified.goodsSubtotal,
        sharedCostsSubtotal: classified.sharedCostsSubtotal,
        grandTotal: finalGrandTotal,
      };
    } else {
      throw new BadRequestException(
        'Provide either a receipt file upload (image or PDF) or lineItems/sharedCosts in the request body.',
      );
    }

    const receiptCurrency = (
      extractedObj.currency ??
      currencyHint ??
      group.baseCurrency
    )
      .toString()
      .trim()
      .toUpperCase();

    const originalAmount = Number(
      Number(extractedObj.grandTotal ?? amountHint ?? 0).toFixed(2),
    );

    const fxConversion = this.fxRatesService.convertInvoiceTotalToBase({
      originalAmount,
      fromCurrency: receiptCurrency,
      toBaseCurrency: group.baseCurrency,
      customRate: dto?.fxRate,
    });

    extractedObj.baseCurrency = group.baseCurrency;
    extractedObj.fxRate = fxConversion.fxRate;
    extractedObj.rateUsed = fxConversion.rateUsed;
    extractedObj.fxRateDate = fxConversion.rateDate;
    extractedObj.convertedBaseAmount = fxConversion.convertedBaseAmount;
    extractedObj.convertedInCode = true;

    const receipt = await this.prisma.receipt.create({
      data: {
        groupId: group.id,
        file: storedFilePath,
        aiExtraction: extractedObj as unknown as Prisma.InputJsonValue,
        currency: receiptCurrency,
        originalAmount: originalAmount.toFixed(2),
        fxRate: fxConversion.fxRate.toFixed(6),
        fxRateDate: fxConversion.fxRateDate,
        sourceLanguage:
          dto?.sourceLanguage ?? extractedObj.sourceLanguage ?? 'en',
      },
    });

    return {
      ...receipt,
      originalCurrency: receipt.currency,
      baseCurrency: group.baseCurrency,
      rateUsed: Number(receipt.fxRate),
      rateDate: receipt.fxRateDate.toISOString(),
      convertedBaseAmount: fxConversion.convertedBaseAmount,
      convertedInCode: true,
    };
  }

  /**
   * List all final receipts stored for a group with code-computed conversion metadata.
   */
  async listGroupReceipts(groupId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        receipts: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!group) {
      throw new NotFoundException(`Group with id "${groupId}" not found.`);
    }

    const enrichedReceipts = group.receipts.map((r) => ({
      ...r,
      originalCurrency: r.currency,
      baseCurrency: group.baseCurrency,
      rateUsed: Number(r.fxRate),
      rateDate: r.fxRateDate.toISOString(),
      convertedBaseAmount: this.fxRatesService.convertAmount(
        Number(r.originalAmount),
        Number(r.fxRate),
      ),
      convertedInCode: true,
    }));

    return {
      groupId: group.id,
      groupName: group.name,
      baseCurrency: group.baseCurrency,
      receiptCount: enrichedReceipts.length,
      receipts: enrichedReceipts,
    };
  }

  /**
   * Read final receipts for a group, assign purchased goods to the vendor(s) who ordered them,
   * split shared costs (shipping, transport, fees) according to the group's configurable rule
   * (PROPORTIONAL_TO_VALUE, EQUAL, BY_CONTRIBUTION), persist Allocation records, and reconcile
   * all totals with the pot (FR6).
   */
  async allocateGroupReceipts(
    groupId: string,
    dto?: AllocateReceiptsDto,
    files?: UploadedInvoiceFile[],
  ): Promise<ReceiptAllocationReport> {
    const groupCheck = await this.prisma.group.findUnique({
      where: { id: groupId },
    });
    if (!groupCheck) {
      throw new NotFoundException(`Group with id "${groupId}" not found.`);
    }

    if (dto?.replaceExistingReceipts) {
      await this.prisma.receipt.deleteMany({
        where: { groupId },
      });
    }

    // 1. If any receipt files were uploaded in this call, extract and store them first
    if (Array.isArray(files) && files.length > 0) {
      for (const file of files) {
        if (file && file.size > 0) {
          await this.createGroupReceipt(groupId, undefined, file);
        }
      }
    }

    // 2. If any inline JSON receipts were passed in dto.receipts, store them as well
    if (Array.isArray(dto?.receipts) && dto.receipts.length > 0) {
      for (const inlineRec of dto.receipts) {
        await this.persistInlineReceipt(groupId, inlineRec);
      }
    }

    // 3. If a configurable sharedCostRule override is provided, update the group's rule
    const effectiveRule = dto?.sharedCostRule ?? groupCheck.sharedCostRule;
    if (
      dto?.sharedCostRule &&
      dto.sharedCostRule !== groupCheck.sharedCostRule
    ) {
      await this.prisma.group.update({
        where: { id: groupId },
        data: { sharedCostRule: dto.sharedCostRule },
      });
    }

    // 4. Reload full group state with members, orderLines, contributions, receipts, and ledgerEntries
    const group = await this.prisma.group.findUniqueOrThrow({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: true,
            orderLines: true,
            contributions: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        orderLines: true,
        receipts: {
          orderBy: { createdAt: 'asc' },
        },
        ledgerEntries: true,
      },
    });

    const baseCurrency = (group.baseCurrency || 'USD').toUpperCase();

    // Build catalog of ordered items -> list of member orders { memberId, quantity, budget }
    const itemOrderDirectory = new Map<
      string,
      {
        canonicalItemName: string;
        tokens: string[];
        totalOrderedQty: number;
        vendorOrders: Array<{
          memberId: string;
          quantity: number;
          budget: number;
        }>;
      }
    >();

    for (const line of group.orderLines) {
      const key = line.item.trim().toLowerCase();
      const existing = itemOrderDirectory.get(key);
      if (existing) {
        existing.totalOrderedQty += line.quantity;
        const vIdx = existing.vendorOrders.findIndex(
          (v) => v.memberId === line.memberId,
        );
        if (vIdx >= 0) {
          existing.vendorOrders[vIdx].quantity += line.quantity;
          existing.vendorOrders[vIdx].budget = Number(
            (existing.vendorOrders[vIdx].budget + Number(line.budget)).toFixed(
              2,
            ),
          );
        } else {
          existing.vendorOrders.push({
            memberId: line.memberId,
            quantity: line.quantity,
            budget: Number(Number(line.budget).toFixed(2)),
          });
        }
      } else {
        itemOrderDirectory.set(key, {
          canonicalItemName: line.item.trim(),
          tokens: this.tokenize(line.item),
          totalOrderedQty: line.quantity,
          vendorOrders: [
            {
              memberId: line.memberId,
              quantity: line.quantity,
              budget: Number(Number(line.budget).toFixed(2)),
            },
          ],
        });
      }
    }

    const assignedItemsByMember = new Map<string, AssignedVendorGoodsItem[]>();
    const goodsTotalByMember = new Map<string, number>();
    for (const m of group.members) {
      assignedItemsByMember.set(m.id, []);
      goodsTotalByMember.set(m.id, 0);
    }

    const sharedCostsBreakdown: ExtractedSharedCostBreakdown[] = [];
    let goodsItemsAssignedCount = 0;

    // 5. Process every stored receipt
    for (const receipt of group.receipts) {
      const rCurrency = (receipt.currency || baseCurrency).toUpperCase();
      const rFxRate = Number(receipt.fxRate) || 1;
      const extraction = (receipt.aiExtraction ?? {}) as Record<string, any>;
      const supplier = String(extraction.supplier ?? 'Receipt Supplier');

      const rawLineItems = Array.isArray(extraction.lineItems)
        ? (extraction.lineItems as Array<Record<string, any>>)
        : [];
      const rawSharedCosts = Array.isArray(extraction.sharedCosts)
        ? (extraction.sharedCosts as Array<Record<string, any>>)
        : [];

      // Track whether any shared cost line items were already included inside rawLineItems
      const sharedDescriptionsSeen = new Set<string>();

      for (const item of rawLineItems) {
        const desc = String(
          item.translatedDescription ??
            item.description ??
            item.originalDescription ??
            'Item',
        ).trim();
        const origDesc = String(item.originalDescription ?? desc).trim();
        const lineTotalOrig = Number(
          Number(
            item.total ??
              item.lineTotal ??
              (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0),
          ).toFixed(2),
        );
        const lineTotalBase = this.fxRatesService.convertAmount(
          lineTotalOrig,
          rFxRate,
        );
        const qty = Math.max(1, Number(item.quantity) || 1);

        const isSharedCost =
          item.category === 'SHARED_COST' ||
          this.isSharedCostDescription(desc, origDesc);

        if (isSharedCost) {
          sharedDescriptionsSeen.add(desc.toLowerCase());
          sharedCostsBreakdown.push({
            receiptId: receipt.id,
            description: desc,
            originalAmount: lineTotalOrig,
            originalCurrency: rCurrency,
            fxRateUsed: rFxRate,
            amountInBase: lineTotalBase,
          });
          continue;
        }

        // Match goods item to the vendor(s) who ordered it
        const explicitMemberId =
          typeof item.memberId === 'string' &&
          group.members.some((m) => m.id === item.memberId)
            ? item.memberId
            : null;

        if (explicitMemberId) {
          goodsItemsAssignedCount++;
          const currentGoods = goodsTotalByMember.get(explicitMemberId) ?? 0;
          goodsTotalByMember.set(
            explicitMemberId,
            Number((currentGoods + lineTotalBase).toFixed(2)),
          );
          assignedItemsByMember.get(explicitMemberId)?.push({
            receiptId: receipt.id,
            supplier,
            originalDescription: origDesc,
            translatedDescription: desc,
            matchedOrderItem: desc,
            receiptQuantity: qty,
            vendorOrderedQuantity: qty,
            totalGroupOrderedQuantity: qty,
            quantityAssignedToVendor: qty,
            allocationShareRatio: 1,
            originalLineTotal: lineTotalOrig,
            originalCurrency: rCurrency,
            fxRateUsed: rFxRate,
            convertedLineTotalBase: lineTotalBase,
            assignedAmountBase: lineTotalBase,
          });
          continue;
        }

        const matchedOrder = this.matchOrderEntry(
          desc,
          origDesc,
          Array.from(itemOrderDirectory.values()),
        );

        if (matchedOrder && matchedOrder.vendorOrders.length > 0) {
          goodsItemsAssignedCount++;
          let allocatedLineBaseSoFar = 0;
          const totalOrdQty = Math.max(1, matchedOrder.totalOrderedQty);

          matchedOrder.vendorOrders.forEach((vOrder, idx) => {
            const ratio = vOrder.quantity / totalOrdQty;
            const isLast = idx === matchedOrder.vendorOrders.length - 1;
            const assignedBase = isLast
              ? Number((lineTotalBase - allocatedLineBaseSoFar).toFixed(2))
              : Number((lineTotalBase * ratio).toFixed(2));
            allocatedLineBaseSoFar = Number(
              (allocatedLineBaseSoFar + assignedBase).toFixed(2),
            );

            const assignedQty = Number((qty * ratio).toFixed(2));
            const prevGoods = goodsTotalByMember.get(vOrder.memberId) ?? 0;
            goodsTotalByMember.set(
              vOrder.memberId,
              Number((prevGoods + assignedBase).toFixed(2)),
            );

            assignedItemsByMember.get(vOrder.memberId)?.push({
              receiptId: receipt.id,
              supplier,
              originalDescription: origDesc,
              translatedDescription: desc,
              matchedOrderItem: matchedOrder.canonicalItemName,
              receiptQuantity: qty,
              vendorOrderedQuantity: vOrder.quantity,
              totalGroupOrderedQuantity: matchedOrder.totalOrderedQty,
              quantityAssignedToVendor: assignedQty,
              allocationShareRatio: Number(ratio.toFixed(4)),
              originalLineTotal: lineTotalOrig,
              originalCurrency: rCurrency,
              fxRateUsed: rFxRate,
              convertedLineTotalBase: lineTotalBase,
              assignedAmountBase: assignedBase,
            });
          });
        }
      }

      // Process explicit `sharedCosts` array on the receipt (avoiding double-counting if already in lineItems)
      for (const sc of rawSharedCosts) {
        const scDesc = String(sc.description ?? 'Shared Trip Fee').trim();
        if (sharedDescriptionsSeen.has(scDesc.toLowerCase())) {
          continue;
        }
        const scOrigAmount = Number(Number(sc.amount ?? sc.total ?? 0).toFixed(2));
        if (scOrigAmount <= 0) continue;
        const scBase = this.fxRatesService.convertAmount(scOrigAmount, rFxRate);
        sharedCostsBreakdown.push({
          receiptId: receipt.id,
          description: scDesc,
          originalAmount: scOrigAmount,
          originalCurrency: rCurrency,
          fxRateUsed: rFxRate,
          amountInBase: scBase,
        });
      }
    }

    // 6. Also add any extra sharedCosts passed directly in `dto.sharedCosts`
    if (Array.isArray(dto?.sharedCosts) && dto.sharedCosts.length > 0) {
      for (const extraSc of dto.sharedCosts) {
        const scOrig = Number(Number(extraSc.amount).toFixed(2));
        if (!Number.isFinite(scOrig) || scOrig <= 0) continue;
        const scCurr = (extraSc.currency ?? baseCurrency).trim().toUpperCase();
        const conv = this.fxRatesService.convertInvoiceTotalToBase({
          originalAmount: scOrig,
          fromCurrency: scCurr,
          toBaseCurrency: baseCurrency,
          customRate: extraSc.fxRate,
        });
        sharedCostsBreakdown.push({
          description: extraSc.description || 'Additional Trip Shared Cost',
          originalAmount: scOrig,
          originalCurrency: scCurr,
          fxRateUsed: conv.fxRate,
          amountInBase: conv.convertedBaseAmount,
        });
      }
    }

    const totalGoods = Number(
      Array.from(goodsTotalByMember.values())
        .reduce((sum, v) => sum + v, 0)
        .toFixed(2),
    );
    const totalSharedCosts = Number(
      sharedCostsBreakdown
        .reduce((sum, sc) => sum + sc.amountInBase, 0)
        .toFixed(2),
    );

    // 7. Determine each member's contribution baseline
    //    If ANY member has completed PayPal contributions AND only a subset of members participated,
    //    we check whether all members with assigned goods have paid or if expected contributions should be used for unfunded members.
    const paidByMember = new Map<string, number>();
    for (const m of group.members) {
      const paid = m.contributions
        .filter(
          (c) =>
            c.status === ContributionStatus.COMPLETED ||
            c.status === ContributionStatus.REFUNDED,
        )
        .reduce((sum, c) => sum + Number(c.amount), 0);
      paidByMember.set(m.id, Number(paid.toFixed(2)));
    }

    // Split shared costs across members according to `effectiveRule`
    const sharedCostByMember = this.splitSharedCostsAcrossVendors(
      group.members.map((m) => ({
        memberId: m.id,
        goodsTotal: goodsTotalByMember.get(m.id) ?? 0,
        contributionWeight:
          (paidByMember.get(m.id) ?? 0) > 0
            ? (paidByMember.get(m.id) ?? 0)
            : Number(m.contributionExpected),
      })),
      totalSharedCosts,
      effectiveRule,
    );

    // 8. Build per-vendor allocation results
    const vendorAllocations: VendorAllocationResult[] = group.members.map(
      (m) => {
        const goodsVal = Number((goodsTotalByMember.get(m.id) ?? 0).toFixed(2));
        const sharedVal = Number(
          (sharedCostByMember.get(m.id) ?? 0).toFixed(2),
        );
        const totalAllocatedSpend = Number((goodsVal + sharedVal).toFixed(2));
        const amountContributed = paidByMember.get(m.id) ?? 0;
        const contributionExpected = Number(
          Number(m.contributionExpected).toFixed(2),
        );

        // Use actual PayPal contribution if paid; otherwise use expected contribution when goods are assigned to this vendor
        const effectiveContribution =
          amountContributed > 0
            ? amountContributed
            : totalAllocatedSpend > 0
              ? contributionExpected
              : 0;

        const netOwedOrRefund = Number(
          (effectiveContribution - totalAllocatedSpend).toFixed(2),
        );
        const refundDue = netOwedOrRefund > 0 ? netOwedOrRefund : 0;
        const amountOwed = netOwedOrRefund < 0 ? Math.abs(netOwedOrRefund) : 0;
        const settlementDirection: 'REFUND_DUE' | 'AMOUNT_OWED' | 'EXACT_MATCH' =
          netOwedOrRefund > 0
            ? 'REFUND_DUE'
            : netOwedOrRefund < 0
              ? 'AMOUNT_OWED'
              : 'EXACT_MATCH';

        const goodsValueSharePct =
          totalGoods > 0
            ? Number(((goodsVal / totalGoods) * 100).toFixed(2))
            : 0;

        return {
          memberId: m.id,
          vendorName: m.user.name,
          vendorEmail: m.user.email,
          contributionExpected,
          amountContributed,
          effectiveContribution,
          goodsTotal: goodsVal,
          goodsValueSharePct,
          sharedCostShare: sharedVal,
          totalAllocatedSpend,
          netOwedOrRefund,
          refundDue,
          amountOwed,
          settlementDirection,
          assignedGoodsItems: assignedItemsByMember.get(m.id) ?? [],
        };
      },
    );

    // 9. Persist Allocation records in PostgreSQL
    await this.prisma.$transaction(
      vendorAllocations.map((va) =>
        this.prisma.allocation.upsert({
          where: {
            groupId_memberId: {
              groupId: group.id,
              memberId: va.memberId,
            },
          },
          update: {
            goodsTotal: va.goodsTotal.toFixed(2),
            sharedCostShare: va.sharedCostShare.toFixed(2),
            netOwedOrRefund: va.netOwedOrRefund.toFixed(2),
          },
          create: {
            groupId: group.id,
            memberId: va.memberId,
            goodsTotal: va.goodsTotal.toFixed(2),
            sharedCostShare: va.sharedCostShare.toFixed(2),
            netOwedOrRefund: va.netOwedOrRefund.toFixed(2),
          },
        }),
      ),
      { maxWait: 15000, timeout: 30000 },
    );

    // 10. Compute totals and pot reconciliation
    const totalPotContributed = Number(
      vendorAllocations
        .reduce((sum, v) => sum + v.amountContributed, 0)
        .toFixed(2),
    );
    const totalExpectedContributions = Number(
      vendorAllocations
        .reduce((sum, v) => sum + v.contributionExpected, 0)
        .toFixed(2),
    );
    const effectivePotBaseline = Number(
      vendorAllocations
        .reduce((sum, v) => sum + v.effectiveContribution, 0)
        .toFixed(2),
    );
    const totalReleasedToTraveler = Number(
      group.ledgerEntries
        .filter(
          (e) =>
            e.type === LedgerEntryType.STAGED_RELEASE ||
            e.type === LedgerEntryType.RECEIPT_SPEND,
        )
        .reduce((sum, e) => sum + Math.abs(Number(e.amount)), 0)
        .toFixed(2),
    );

    const totalAllocatedSpend = Number(
      (totalGoods + totalSharedCosts).toFixed(2),
    );
    const totalNetOwedOrRefund = Number(
      vendorAllocations
        .reduce((sum, v) => sum + v.netOwedOrRefund, 0)
        .toFixed(2),
    );
    const totalRefundsDue = Number(
      vendorAllocations.reduce((sum, v) => sum + v.refundDue, 0).toFixed(2),
    );
    const totalAmountOwed = Number(
      vendorAllocations.reduce((sum, v) => sum + v.amountOwed, 0).toFixed(2),
    );

    const unspentPotBalance = Number(
      (effectivePotBaseline - totalAllocatedSpend).toFixed(2),
    );
    const discrepancy = Number(
      Math.abs(unspentPotBalance - totalNetOwedOrRefund).toFixed(2),
    );
    const reconciledWithPot = discrepancy <= 0.01;

    return {
      groupId: group.id,
      groupName: group.name,
      baseCurrency,
      sharedCostRule: effectiveRule,
      receiptCount: group.receipts.length,
      goodsItemsAssignedCount,
      sharedCostsBreakdown,
      vendorAllocations,
      totals: {
        totalGoods,
        totalSharedCosts,
        totalAllocatedSpend,
        totalPotContributed,
        totalEffectiveContribution: effectivePotBaseline,
        totalNetOwedOrRefund,
        totalRefundsDue,
        totalAmountOwed,
      },
      reconciliation: {
        baseCurrency,
        totalPotContributed,
        totalExpectedContributions,
        effectivePotBaseline,
        totalReleasedToTraveler,
        totalGoodsAllocated: totalGoods,
        totalSharedCostsAllocated: totalSharedCosts,
        totalReceiptSpend: totalAllocatedSpend,
        totalNetOwedOrRefund,
        totalRefundsDue,
        totalAmountOwed,
        unspentPotBalance,
        discrepancy,
        reconciledWithPot,
      },
      allocatedAt: new Date().toISOString(),
    };
  }

  /**
   * Get the current receipt allocations and pot reconciliation for a group.
   */
  async getGroupAllocations(groupId: string): Promise<ReceiptAllocationReport> {
    return this.allocateGroupReceipts(groupId);
  }

  private async persistInlineReceipt(
    groupId: string,
    inline: InlineReceiptInputDto,
  ) {
    return this.createGroupReceipt(groupId, {
      supplier: inline.supplier,
      currency: inline.currency,
      originalAmount: inline.grandTotal,
      fxRate: inline.fxRate,
      sourceLanguage: inline.sourceLanguage,
      lineItems: inline.lineItems,
      sharedCosts: inline.sharedCosts,
    });
  }

  private classifyExtractedItems(
    rawLineItems: Array<Record<string, any>>,
    explicitSharedCosts: Array<{ description: string; amount: number }>,
  ): {
    lineItems: Array<Record<string, any>>;
    sharedCosts: Array<{ description: string; amount: number }>;
    goodsSubtotal: number;
    sharedCostsSubtotal: number;
  } {
    const lineItems: Array<Record<string, any>> = [];
    const sharedCosts: Array<{ description: string; amount: number }> = [];
    let goodsSubtotal = 0;
    let sharedCostsSubtotal = 0;

    for (const item of rawLineItems) {
      const desc = String(
        item.translatedDescription ??
          item.description ??
          item.originalDescription ??
          'Item',
      ).trim();
      const origDesc = String(item.originalDescription ?? desc).trim();
      const qty = Math.max(1, Number(item.quantity) || 1);
      const unitPrice = Number(Number(item.unitPrice ?? item.total ?? 0).toFixed(2));
      const total = Number(
        Number(item.total ?? item.lineTotal ?? qty * unitPrice).toFixed(2),
      );

      const isShared =
        item.category === 'SHARED_COST' ||
        this.isSharedCostDescription(desc, origDesc);

      const category: 'GOODS' | 'SHARED_COST' = isShared
        ? 'SHARED_COST'
        : 'GOODS';

      lineItems.push({
        ...item,
        description: desc,
        originalDescription: origDesc,
        translatedDescription: desc,
        quantity: qty,
        unitPrice,
        total,
        lineTotal: total,
        category,
      });

      if (isShared) {
        sharedCostsSubtotal = Number((sharedCostsSubtotal + total).toFixed(2));
        sharedCosts.push({
          description: desc,
          amount: total,
        });
      } else {
        goodsSubtotal = Number((goodsSubtotal + total).toFixed(2));
      }
    }

    for (const sc of explicitSharedCosts) {
      const amt = Number(Number(sc.amount).toFixed(2));
      if (!Number.isFinite(amt) || amt <= 0) continue;
      sharedCosts.push({
        description: sc.description || 'Shared Trip Cost',
        amount: amt,
      });
      sharedCostsSubtotal = Number((sharedCostsSubtotal + amt).toFixed(2));
    }

    return {
      lineItems,
      sharedCosts,
      goodsSubtotal,
      sharedCostsSubtotal,
    };
  }

  private parseSharedCostLinesFromText(
    rawText: string,
  ): Array<{ description: string; amount: number }> {
    const results: Array<{ description: string; amount: number }> = [];
    const regex = /SharedCost:\s*([^|]+)\|\s*(?:Total|Amount):\s*([\d.]+)/gi;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(rawText)) !== null) {
      const description = match[1].trim();
      const amount = Number(match[2]);
      if (description && Number.isFinite(amount) && amount > 0) {
        results.push({ description, amount });
      }
    }
    return results;
  }

  private isSharedCostDescription(desc: string, origDesc: string): boolean {
    return (
      SHARED_COST_KEYWORDS_REGEX.test(desc) ||
      SHARED_COST_KEYWORDS_REGEX.test(origDesc)
    );
  }

  private matchOrderEntry(
    desc: string,
    origDesc: string,
    candidates: Array<{
      canonicalItemName: string;
      tokens: string[];
      totalOrderedQty: number;
      vendorOrders: Array<{
        memberId: string;
        quantity: number;
        budget: number;
      }>;
    }>,
  ) {
    if (candidates.length === 0) return null;
    const normDesc = desc.trim().toLowerCase();
    const normOrig = origDesc.trim().toLowerCase();

    for (const c of candidates) {
      const normCand = c.canonicalItemName.toLowerCase();
      if (
        normCand === normDesc ||
        normCand === normOrig ||
        (normDesc.length >= 5 && normCand.includes(normDesc)) ||
        (normCand.length >= 5 && normDesc.includes(normCand))
      ) {
        return c;
      }
    }

    const itemTokens = new Set([
      ...this.tokenize(desc),
      ...this.tokenize(origDesc),
    ]);

    let bestCandidate: (typeof candidates)[0] | null = null;
    let bestScore = 0;

    for (const c of candidates) {
      if (c.tokens.length === 0) continue;
      let shared = 0;
      for (const t of c.tokens) {
        if (itemTokens.has(t)) shared++;
      }
      const score =
        shared / Math.min(c.tokens.length, Math.max(1, itemTokens.size));
      if (score > bestScore) {
        bestScore = score;
        bestCandidate = c;
      }
    }

    return bestScore >= 0.4 ? bestCandidate : null;
  }

  private splitSharedCostsAcrossVendors(
    members: Array<{
      memberId: string;
      goodsTotal: number;
      contributionWeight: number;
    }>,
    totalSharedCosts: number,
    rule: SharedCostRule,
  ): Map<string, number> {
    const result = new Map<string, number>();
    for (const m of members) {
      result.set(m.memberId, 0);
    }

    if (totalSharedCosts <= 0 || members.length === 0) {
      return result;
    }

    const activeMembers = members.filter((m) => m.goodsTotal > 0);
    const pool = activeMembers.length > 0 ? activeMembers : members;

    const weights = pool.map((m) => {
      if (rule === SharedCostRule.EQUAL) {
        return 1;
      }
      if (rule === SharedCostRule.BY_CONTRIBUTION) {
        return m.contributionWeight > 0 ? m.contributionWeight : 1;
      }
      // Default: PROPORTIONAL_TO_VALUE
      return m.goodsTotal > 0 ? m.goodsTotal : 1;
    });

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let allocatedSoFar = 0;

    pool.forEach((m, idx) => {
      if (idx === pool.length - 1) {
        const remainder = Number(
          (totalSharedCosts - allocatedSoFar).toFixed(2),
        );
        result.set(m.memberId, Math.max(0, remainder));
      } else {
        const share = Number(
          ((totalSharedCosts * weights[idx]) / totalWeight).toFixed(2),
        );
        allocatedSoFar = Number((allocatedSoFar + share).toFixed(2));
        result.set(m.memberId, share);
      }
    });

    return result;
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fff\u0600-\u06ff]+/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length >= 2);
  }

  private async persistReceiptFile(
    groupId: string,
    file: UploadedInvoiceFile,
  ): Promise<string> {
    const uploadRoot = process.env.UPLOAD_DIR ?? './uploads';
    const receiptsDir = path.resolve(
      process.cwd(),
      uploadRoot,
      'receipts',
      groupId,
    );
    await fs.promises.mkdir(receiptsDir, { recursive: true });

    const safeName = path
      .basename(file.originalname || 'receipt.pdf')
      .replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `receipt-${Date.now()}-${safeName}`;
    const fullPath = path.join(receiptsDir, fileName);

    if (file.buffer) {
      await fs.promises.writeFile(fullPath, file.buffer);
    } else if (file.path) {
      await fs.promises.copyFile(file.path, fullPath);
    }

    return path
      .relative(process.cwd(), fullPath)
      .split(path.sep)
      .join('/');
  }
}

