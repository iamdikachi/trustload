import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ReleaseRequestStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FxRatesService } from '../release-requests/fx-rates.service';
import type { UploadedInvoiceFile } from '../release-requests/release-requests.service';
import { AiExtractionService } from './ai-extraction.service';
import type {
  ExtractedLineItem,
  InvoiceExtractionResult,
} from './dto/extract-invoice.dto';
import type {
  InvoiceVerificationReport,
  LineItemVerificationMatch,
  VerificationFlag,
  VerifyInvoiceDto,
} from './dto/verify-invoice.dto';

interface CombinedOrderItem {
  item: string;
  normalizedTokens: string[];
  totalQuantity: number;
  totalBudget: number;
  budgetedUnitPriceBase: number;
}

const ARITHMETIC_TOLERANCE = 0.05;
const MAX_EARLIER_PRICE_SPIKE_PCT = 20; // Flag if >20% above earlier invoice price
const MAX_BUDGET_PRICE_SPIKE_PCT = 25; // Flag if >25% above group order budgeted unit price

@Injectable()
export class AiVerificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiExtractionService: AiExtractionService,
    private readonly fxRatesService: FxRatesService,
  ) {}

  /**
   * Verify an uploaded invoice file or extracted JSON payload against a group's combined order
   * and earlier invoices/receipts.
   */
  async verifyInvoice(
    groupIdParam: string | undefined,
    dto: VerifyInvoiceDto,
    file?: UploadedInvoiceFile,
  ): Promise<InvoiceVerificationReport> {
    let groupId = (groupIdParam ?? dto?.groupId)?.trim();
    const releaseRequestId = dto?.releaseRequestId?.trim() || undefined;

    let linkedReleaseRequest:
      | {
          id: string;
          groupId: string;
          supplier: string | null;
          currency: string;
          originalAmount: Prisma.Decimal;
          amount: Prisma.Decimal;
          fxRate: Prisma.Decimal;
          sourceLanguage: string | null;
          invoiceFile: string;
          aiReport: Prisma.JsonValue;
        }
      | null = null;

    if (releaseRequestId) {
      linkedReleaseRequest = await this.prisma.releaseRequest.findUnique({
        where: { id: releaseRequestId },
      });
      if (!linkedReleaseRequest) {
        throw new NotFoundException(
          `Release request "${releaseRequestId}" not found.`,
        );
      }
      if (!groupId) {
        groupId = linkedReleaseRequest.groupId;
      }
    }

    if (!groupId) {
      throw new BadRequestException(
        'groupId (or a valid releaseRequestId) is required to verify an invoice against the group order.',
      );
    }

    let extraction: InvoiceExtractionResult;

    if (file) {
      extraction = await this.aiExtractionService.extractFromUploadedFile(
        file,
        {
          languageHint: undefined,
          qualityHint: undefined,
        },
      );
    } else if (
      dto?.extractedInvoice &&
      Array.isArray(dto.extractedInvoice.lineItems)
    ) {
      extraction = this.aiExtractionService.validateAndNormalizeExtraction(
        {
          ...dto.extractedInvoice,
          supplier: dto.supplier ?? dto.extractedInvoice.supplier,
          currency:
            dto.currency ??
            dto.extractedInvoice.currency ??
            dto.extractedInvoice.originalCurrency,
          grandTotal: dto.grandTotal ?? dto.extractedInvoice.grandTotal,
        },
        dto.extractedInvoice.sourceFile ?? 'inline-json-payload',
        dto.extractedInvoice.modelUsed ?? 'inline-extraction-payload',
      );
    } else if (Array.isArray(dto?.lineItems) && dto.lineItems.length > 0) {
      extraction = this.aiExtractionService.validateAndNormalizeExtraction(
        {
          supplier:
            dto.supplier ?? linkedReleaseRequest?.supplier ?? 'Invoice Supplier',
          date: new Date().toISOString().slice(0, 10),
          currency:
            dto.currency ?? linkedReleaseRequest?.currency ?? 'USD',
          sourceLanguage: linkedReleaseRequest?.sourceLanguage ?? 'en',
          grandTotal: dto.grandTotal,
          lineItems: dto.lineItems,
        },
        linkedReleaseRequest?.invoiceFile ?? 'inline-json-payload',
        'inline-extraction-payload',
      );
    } else if (linkedReleaseRequest) {
      const existingReport = linkedReleaseRequest.aiReport as Record<
        string,
        any
      > | null;
      if (existingReport && Array.isArray(existingReport.lineItems)) {
        extraction = this.aiExtractionService.validateAndNormalizeExtraction(
          {
            ...existingReport,
            supplier:
              dto?.supplier ??
              existingReport.supplier ??
              linkedReleaseRequest.supplier,
            currency:
              dto?.currency ??
              existingReport.currency ??
              linkedReleaseRequest.currency,
            grandTotal:
              dto?.grandTotal !== undefined
                ? Number(dto.grandTotal)
                : existingReport.grandTotal,
          },
          linkedReleaseRequest.invoiceFile,
          existingReport.modelUsed ?? 'stored-release-request',
        );
      } else {
        extraction = await this.aiExtractionService.extractFromStoredFile({
          invoiceFilePath: linkedReleaseRequest.invoiceFile,
          supplierHint: linkedReleaseRequest.supplier ?? undefined,
          currencyHint: linkedReleaseRequest.currency,
          amountHint: Number(linkedReleaseRequest.originalAmount),
          languageHint: linkedReleaseRequest.sourceLanguage,
        });
      }
    } else {
      throw new BadRequestException(
        'Provide an invoice file upload, extractedInvoice JSON, lineItems array, or releaseRequestId to verify.',
      );
    }

    // Override grandTotal or currency if explicitly supplied in DTO
    if (dto?.grandTotal !== undefined && Number.isFinite(Number(dto.grandTotal))) {
      extraction.grandTotal = Number(Number(dto.grandTotal).toFixed(2));
    }
    if (dto?.currency?.trim()) {
      const normCurr = dto.currency.trim().toUpperCase();
      extraction.currency = normCurr;
      extraction.originalCurrency = normCurr;
    }
    if (dto?.supplier?.trim()) {
      extraction.supplier = dto.supplier.trim();
    }

    const requestedAmount =
      dto?.requestedAmount !== undefined
        ? Number(dto.requestedAmount)
        : linkedReleaseRequest
          ? Number(linkedReleaseRequest.originalAmount)
          : undefined;

    const requestedAmountCurrency =
      dto?.requestedAmountCurrency?.trim().toUpperCase() ||
      linkedReleaseRequest?.currency ||
      extraction.currency;

    const explicitFxRate =
      dto?.fxRate !== undefined
        ? Number(dto.fxRate)
        : linkedReleaseRequest
          ? Number(linkedReleaseRequest.fxRate)
          : undefined;

    const report = await this.verifyExtractionAgainstGroupOrder({
      groupId,
      releaseRequestId,
      extraction,
      requestedAmount,
      requestedAmountCurrency,
      explicitFxRate,
    });

    if (linkedReleaseRequest) {
      const mergedAiReport = {
        ...extraction,
        passedAllChecks: report.passedAllChecks,
        verificationStatus: report.status,
        flags: report.flags,
        checks: report.checks,
        lineItemMatches: report.lineItemMatches,
        verificationSummary: report.summary,
        verification: report,
      };

      await this.prisma.releaseRequest.update({
        where: { id: linkedReleaseRequest.id },
        data: {
          aiReport: mergedAiReport as unknown as Prisma.InputJsonValue,
        },
      });
    }

    return report;
  }

  /**
   * Core verification engine that compares an InvoiceExtractionResult against:
   * 1. Group combined order items (items match)
   * 2. Group combined order quantities & cumulative released quantities (quantities within order)
   * 3. Line-item arithmetic (qty * unitPrice == total) and sum of line items == grandTotal (line totals add up)
   * 4. Requested release amount (invoice total within requested amount)
   * 5. Earlier invoice/receipt prices & order budget unit prices (prices not far above earlier prices)
   */
  async verifyExtractionAgainstGroupOrder(params: {
    groupId: string;
    releaseRequestId?: string;
    extraction: InvoiceExtractionResult;
    requestedAmount?: number;
    requestedAmountCurrency?: string;
    explicitFxRate?: number;
  }): Promise<InvoiceVerificationReport> {
    const { groupId, releaseRequestId, extraction } = params;

    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        orderLines: true,
        releaseRequests: {
          orderBy: { createdAt: 'asc' },
        },
        receipts: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!group) {
      throw new NotFoundException(`Group with id "${groupId}" not found.`);
    }

    const baseCurrency = (group.baseCurrency || 'USD').toUpperCase();
    const invoiceCurrency = (
      extraction.currency ||
      extraction.originalCurrency ||
      baseCurrency
    ).toUpperCase();

    const { fxRate: fxRateToBase } = this.fxRatesService.getConversionRate(
      invoiceCurrency,
      baseCurrency,
      params.explicitFxRate,
    );

    // 1. Aggregate combined order lines by item name
    const combinedMap = new Map<
      string,
      { item: string; totalQuantity: number; totalBudget: number }
    >();
    for (const line of group.orderLines) {
      const key = line.item.trim().toLowerCase();
      const existing = combinedMap.get(key);
      if (existing) {
        existing.totalQuantity += line.quantity;
        existing.totalBudget = Number(
          (existing.totalBudget + Number(line.budget)).toFixed(2),
        );
      } else {
        combinedMap.set(key, {
          item: line.item.trim(),
          totalQuantity: line.quantity,
          totalBudget: Number(Number(line.budget).toFixed(2)),
        });
      }
    }

    const combinedOrderItems: CombinedOrderItem[] = Array.from(
      combinedMap.values(),
    ).map((entry) => ({
      item: entry.item,
      normalizedTokens: this.tokenizeItemName(entry.item),
      totalQuantity: entry.totalQuantity,
      totalBudget: entry.totalBudget,
      budgetedUnitPriceBase:
        entry.totalQuantity > 0
          ? Number((entry.totalBudget / entry.totalQuantity).toFixed(2))
          : 0,
    }));

    // 2. Collect historical quantities and historical unit prices (in baseCurrency) from earlier release requests & receipts
    const historicalQuantities = new Map<string, number>();
    const historicalPricesBase = new Map<string, number[]>();

    for (const earlierReq of group.releaseRequests) {
      if (releaseRequestId && earlierReq.id === releaseRequestId) {
        continue;
      }
      if (earlierReq.status === ReleaseRequestStatus.REJECTED) {
        continue;
      }

      const reportJson = earlierReq.aiReport as Record<string, any> | null;
      const earlierLines = Array.isArray(reportJson?.lineItems)
        ? (reportJson.lineItems as Array<Record<string, any>>)
        : [];
      const earlierFx = Number(earlierReq.fxRate) || 1;

      for (const eLine of earlierLines) {
        const desc = String(
          eLine.translatedDescription ??
            eLine.description ??
            eLine.originalDescription ??
            '',
        );
        const matchedOrder = this.findMatchingOrderItem(
          desc,
          String(eLine.originalDescription ?? ''),
          combinedOrderItems,
        );
        if (!matchedOrder) continue;

        const key = matchedOrder.item.toLowerCase();
        const qty = Number(eLine.quantity) || 0;
        const unitPriceOrig = Number(eLine.unitPrice) || 0;
        const unitPriceBase = Number((unitPriceOrig * earlierFx).toFixed(4));

        // Only count APPROVED or RELEASED requests toward previouslyReleasedQuantity so pending drafts don't self-block
        if (
          earlierReq.status === ReleaseRequestStatus.APPROVED ||
          earlierReq.status === ReleaseRequestStatus.RELEASED
        ) {
          historicalQuantities.set(
            key,
            (historicalQuantities.get(key) ?? 0) + qty,
          );
        }

        if (unitPriceBase > 0) {
          const arr = historicalPricesBase.get(key) ?? [];
          arr.push(unitPriceBase);
          historicalPricesBase.set(key, arr);
        }
      }
    }

    for (const receipt of group.receipts) {
      const receiptJson = receipt.aiExtraction as Record<string, any> | null;
      const rLines = Array.isArray(receiptJson?.lineItems)
        ? (receiptJson.lineItems as Array<Record<string, any>>)
        : [];
      const rFx = Number(receipt.fxRate) || 1;

      for (const rLine of rLines) {
        const desc = String(
          rLine.translatedDescription ??
            rLine.description ??
            rLine.originalDescription ??
            '',
        );
        const matchedOrder = this.findMatchingOrderItem(
          desc,
          String(rLine.originalDescription ?? ''),
          combinedOrderItems,
        );
        if (!matchedOrder) continue;

        const key = matchedOrder.item.toLowerCase();
        const unitPriceOrig = Number(rLine.unitPrice) || 0;
        const unitPriceBase = Number((unitPriceOrig * rFx).toFixed(4));
        if (unitPriceBase > 0) {
          const arr = historicalPricesBase.get(key) ?? [];
          arr.push(unitPriceBase);
          historicalPricesBase.set(key, arr);
        }
      }
    }

    // 3. Evaluate each extracted line item
    const allFlags: VerificationFlag[] = [];
    const lineItemMatches: LineItemVerificationMatch[] = [];

    let matchedItemCount = 0;
    let unmatchedItemCount = 0;
    let allQuantitiesWithinOrder = true;
    let allLineArithmeticValid = true;
    let allPricesReasonable = true;

    extraction.lineItems.forEach((line: ExtractedLineItem, idx: number) => {
      const lineFlags: VerificationFlag[] = [];
      const invoiceDesc =
        line.translatedDescription || line.description || line.originalDescription;
      const origDesc = line.originalDescription || invoiceDesc;

      const matchedOrder = this.findMatchingOrderItem(
        invoiceDesc,
        origDesc,
        combinedOrderItems,
      );

      const itemMatched = Boolean(matchedOrder);
      if (itemMatched) {
        matchedItemCount++;
      } else {
        unmatchedItemCount++;
        const flag: VerificationFlag = {
          code: 'UNORDERED_ITEM',
          severity: 'HIGH',
          check: 'itemsMatch',
          field: `lineItems[${idx}].description`,
          item: invoiceDesc,
          message: `Invoice item "${invoiceDesc}" does not match any item in the group's combined order.`,
          reason: `Item "${invoiceDesc}" is not in the group's combined order (${combinedOrderItems.map((c) => c.item).join(', ') || 'no items'}).`,
          expected: combinedOrderItems.map((c) => c.item).join(' | '),
          actual: invoiceDesc,
        };
        lineFlags.push(flag);
        allFlags.push(flag);
      }

      // Check 2: Quantities within order
      const invoiceQuantity = Number(line.quantity) || 0;
      const orderedQuantity = matchedOrder ? matchedOrder.totalQuantity : null;
      const previouslyReleasedQuantity = matchedOrder
        ? (historicalQuantities.get(matchedOrder.item.toLowerCase()) ?? 0)
        : 0;
      const cumulativeQuantity = previouslyReleasedQuantity + invoiceQuantity;

      let quantityWithinOrder = true;
      if (matchedOrder && orderedQuantity !== null) {
        if (invoiceQuantity > orderedQuantity) {
          quantityWithinOrder = false;
          allQuantitiesWithinOrder = false;
          const excess = invoiceQuantity - orderedQuantity;
          const flag: VerificationFlag = {
            code: 'QUANTITY_EXCEEDS_ORDER',
            severity: 'HIGH',
            check: 'quantitiesWithinOrder',
            field: `lineItems[${idx}].quantity`,
            item: matchedOrder.item,
            message: `Invoice bills for ${invoiceQuantity} units of "${matchedOrder.item}", but the group combined order only requested ${orderedQuantity} units (inflated by ${excess} units).`,
            reason: `Inflated quantity for "${matchedOrder.item}": invoice quantity (${invoiceQuantity}) exceeds ordered quantity (${orderedQuantity}) by ${excess} units.`,
            expected: orderedQuantity,
            actual: invoiceQuantity,
          };
          lineFlags.push(flag);
          allFlags.push(flag);
        } else if (cumulativeQuantity > orderedQuantity) {
          quantityWithinOrder = false;
          allQuantitiesWithinOrder = false;
          const excess = cumulativeQuantity - orderedQuantity;
          const flag: VerificationFlag = {
            code: 'CUMULATIVE_QUANTITY_EXCEEDS_ORDER',
            severity: 'HIGH',
            check: 'quantitiesWithinOrder',
            field: `lineItems[${idx}].quantity`,
            item: matchedOrder.item,
            message: `Cumulative quantity (${cumulativeQuantity}) for "${matchedOrder.item}" (${previouslyReleasedQuantity} previously released + ${invoiceQuantity} on this invoice) exceeds the group order of ${orderedQuantity} units by ${excess}.`,
            reason: `Cumulative quantity (${cumulativeQuantity}) exceeds ordered quantity (${orderedQuantity}).`,
            expected: orderedQuantity - previouslyReleasedQuantity,
            actual: invoiceQuantity,
          };
          lineFlags.push(flag);
          allFlags.push(flag);
        }
      }

      // Check 3a: Line item arithmetic (qty * unitPrice == statedLineTotal)
      const invoiceUnitPriceOriginal = Number(line.unitPrice) || 0;
      const computedLineTotal = Number(
        (invoiceQuantity * invoiceUnitPriceOriginal).toFixed(2),
      );
      const statedLineTotal = Number(
        Number(line.total ?? line.lineTotal ?? computedLineTotal).toFixed(2),
      );
      const lineTotalDiscrepancy = Number(
        Math.abs(computedLineTotal - statedLineTotal).toFixed(2),
      );
      const lineTotalMatches = lineTotalDiscrepancy <= ARITHMETIC_TOLERANCE;

      if (!lineTotalMatches) {
        allLineArithmeticValid = false;
        const flag: VerificationFlag = {
          code: 'LINE_TOTAL_ARITHMETIC_MISMATCH',
          severity: 'HIGH',
          check: 'lineTotalsAddUp',
          field: `lineItems[${idx}].total`,
          item: matchedOrder?.item ?? invoiceDesc,
          message: `Line item "${invoiceDesc}" arithmetic mismatch: ${invoiceQuantity} × ${invoiceUnitPriceOriginal.toFixed(2)} = ${computedLineTotal.toFixed(2)} ${invoiceCurrency}, but invoice states ${statedLineTotal.toFixed(2)} ${invoiceCurrency}.`,
          reason: `Wrong line total for "${invoiceDesc}": computed ${computedLineTotal.toFixed(2)} ${invoiceCurrency} vs stated ${statedLineTotal.toFixed(2)} ${invoiceCurrency} (diff ${lineTotalDiscrepancy.toFixed(2)} ${invoiceCurrency}).`,
          expected: computedLineTotal,
          actual: statedLineTotal,
        };
        lineFlags.push(flag);
        allFlags.push(flag);
      }

      // Check 5: Prices not far above earlier prices or group order budget
      const invoiceUnitPriceBase = Number(
        (invoiceUnitPriceOriginal * fxRateToBase).toFixed(2),
      );
      const budgetedUnitPriceBase = matchedOrder
        ? matchedOrder.budgetedUnitPriceBase
        : null;

      const earlierPrices = matchedOrder
        ? (historicalPricesBase.get(matchedOrder.item.toLowerCase()) ?? [])
        : [];
      const earlierUnitPriceBase =
        earlierPrices.length > 0
          ? Number(
              (
                earlierPrices.reduce((s, p) => s + p, 0) / earlierPrices.length
              ).toFixed(2),
            )
          : null;

      const priceIncreasePctVsEarlier =
        earlierUnitPriceBase && earlierUnitPriceBase > 0
          ? Number(
              (
                ((invoiceUnitPriceBase - earlierUnitPriceBase) /
                  earlierUnitPriceBase) *
                100
              ).toFixed(2),
            )
          : null;

      const priceIncreasePctVsBudget =
        budgetedUnitPriceBase && budgetedUnitPriceBase > 0
          ? Number(
              (
                ((invoiceUnitPriceBase - budgetedUnitPriceBase) /
                  budgetedUnitPriceBase) *
                100
              ).toFixed(2),
            )
          : null;

      let priceReasonable = true;

      if (
        priceIncreasePctVsEarlier !== null &&
        priceIncreasePctVsEarlier > MAX_EARLIER_PRICE_SPIKE_PCT
      ) {
        priceReasonable = false;
        allPricesReasonable = false;
        const flag: VerificationFlag = {
          code: 'PRICE_SPIKE_ABOVE_EARLIER_PRICE',
          severity: 'HIGH',
          check: 'pricesReasonable',
          field: `lineItems[${idx}].unitPrice`,
          item: matchedOrder?.item ?? invoiceDesc,
          message: `Unit price for "${matchedOrder?.item ?? invoiceDesc}" (${invoiceUnitPriceBase.toFixed(2)} ${baseCurrency}) is ${priceIncreasePctVsEarlier}% higher than earlier invoice unit price (${earlierUnitPriceBase?.toFixed(2)} ${baseCurrency}).`,
          reason: `Unit price spike of +${priceIncreasePctVsEarlier}% above earlier price (${invoiceUnitPriceBase.toFixed(2)} ${baseCurrency} vs ${earlierUnitPriceBase?.toFixed(2)} ${baseCurrency}).`,
          expected: earlierUnitPriceBase ?? undefined,
          actual: invoiceUnitPriceBase,
        };
        lineFlags.push(flag);
        allFlags.push(flag);
      } else if (
        priceIncreasePctVsBudget !== null &&
        priceIncreasePctVsBudget > MAX_BUDGET_PRICE_SPIKE_PCT
      ) {
        priceReasonable = false;
        allPricesReasonable = false;
        const flag: VerificationFlag = {
          code: 'UNIT_PRICE_EXCEEDS_ORDER_BUDGET',
          severity: 'HIGH',
          check: 'pricesReasonable',
          field: `lineItems[${idx}].unitPrice`,
          item: matchedOrder?.item ?? invoiceDesc,
          message: `Unit price for "${matchedOrder?.item ?? invoiceDesc}" (${invoiceUnitPriceBase.toFixed(2)} ${baseCurrency}) is ${priceIncreasePctVsBudget}% above the group order budgeted unit price (${budgetedUnitPriceBase?.toFixed(2)} ${baseCurrency}).`,
          reason: `Unit price exceeds group order budget by +${priceIncreasePctVsBudget}% (${invoiceUnitPriceBase.toFixed(2)} ${baseCurrency} vs budgeted ${budgetedUnitPriceBase?.toFixed(2)} ${baseCurrency}).`,
          expected: budgetedUnitPriceBase ?? undefined,
          actual: invoiceUnitPriceBase,
        };
        lineFlags.push(flag);
        allFlags.push(flag);
      }

      lineItemMatches.push({
        lineIndex: idx,
        invoiceDescription: invoiceDesc,
        originalDescription: origDesc,
        matchedOrderItem: matchedOrder?.item ?? null,
        itemMatched,
        invoiceQuantity,
        orderedQuantity,
        previouslyReleasedQuantity,
        cumulativeQuantity,
        quantityWithinOrder,
        invoiceUnitPriceOriginal,
        invoiceUnitPriceBase,
        budgetedUnitPriceBase,
        earlierUnitPriceBase,
        priceIncreasePctVsEarlier,
        priceIncreasePctVsBudget,
        priceReasonable,
        computedLineTotal,
        statedLineTotal,
        lineTotalDiscrepancy,
        lineTotalMatches,
        flags: lineFlags,
      });
    });

    // Check 3b: Sum of stated line totals == stated invoice grandTotal
    const computedLineSum = Number(
      lineItemMatches
        .reduce((sum, item) => sum + item.statedLineTotal, 0)
        .toFixed(2),
    );
    const statedGrandTotal = Number(Number(extraction.grandTotal).toFixed(2));
    const grandTotalDiscrepancy = Number(
      Math.abs(computedLineSum - statedGrandTotal).toFixed(2),
    );
    const grandTotalMatchesLines =
      grandTotalDiscrepancy <= ARITHMETIC_TOLERANCE;

    if (!grandTotalMatchesLines) {
      const flag: VerificationFlag = {
        code: 'GRAND_TOTAL_MISMATCH',
        severity: 'HIGH',
        check: 'lineTotalsAddUp',
        field: 'grandTotal',
        message: `Sum of invoice line totals (${computedLineSum.toFixed(2)} ${invoiceCurrency}) does not match the stated invoice grand total (${statedGrandTotal.toFixed(2)} ${invoiceCurrency}) — discrepancy of ${grandTotalDiscrepancy.toFixed(2)} ${invoiceCurrency}.`,
        reason: `Wrong invoice grand total: line totals add up to ${computedLineSum.toFixed(2)} ${invoiceCurrency}, but invoice states ${statedGrandTotal.toFixed(2)} ${invoiceCurrency}.`,
        expected: computedLineSum,
        actual: statedGrandTotal,
      };
      allFlags.push(flag);
    }

    const lineTotalsAddUpPassed =
      allLineArithmeticValid && grandTotalMatchesLines;

    // Check 4: Invoice total within the requested amount
    const invoiceOriginalTotal = statedGrandTotal;
    const invoiceTotalInBase = this.fxRatesService.convertAmount(
      invoiceOriginalTotal,
      fxRateToBase,
    );

    let requestedOriginalAmount: number | null = null;
    let requestedAmountInBase: number | null = null;
    let discrepancyInOriginal: number | null = null;
    let invoiceTotalWithinRequestedPassed = true;

    if (
      params.requestedAmount !== undefined &&
      Number.isFinite(params.requestedAmount) &&
      params.requestedAmount > 0
    ) {
      const reqCurr = (
        params.requestedAmountCurrency || invoiceCurrency
      ).toUpperCase();

      if (reqCurr === invoiceCurrency) {
        requestedOriginalAmount = Number(params.requestedAmount.toFixed(2));
        requestedAmountInBase = this.fxRatesService.convertAmount(
          requestedOriginalAmount,
          fxRateToBase,
        );
      } else if (reqCurr === baseCurrency) {
        requestedAmountInBase = Number(params.requestedAmount.toFixed(2));
        requestedOriginalAmount =
          fxRateToBase > 0
            ? Number((requestedAmountInBase / fxRateToBase).toFixed(2))
            : requestedAmountInBase;
      } else {
        const { fxRate: reqToBase } = this.fxRatesService.getConversionRate(
          reqCurr,
          baseCurrency,
        );
        requestedAmountInBase = this.fxRatesService.convertAmount(
          params.requestedAmount,
          reqToBase,
        );
        requestedOriginalAmount =
          fxRateToBase > 0
            ? Number((requestedAmountInBase / fxRateToBase).toFixed(2))
            : requestedAmountInBase;
      }

      discrepancyInOriginal = Number(
        Math.abs(invoiceOriginalTotal - requestedOriginalAmount).toFixed(2),
      );

      if (invoiceOriginalTotal > requestedOriginalAmount + ARITHMETIC_TOLERANCE) {
        invoiceTotalWithinRequestedPassed = false;
        const flag: VerificationFlag = {
          code: 'INVOICE_TOTAL_EXCEEDS_REQUESTED_AMOUNT',
          severity: 'HIGH',
          check: 'invoiceTotalWithinRequestedAmount',
          field: 'grandTotal',
          message: `Invoice grand total (${invoiceOriginalTotal.toFixed(2)} ${invoiceCurrency}) exceeds the requested release amount (${requestedOriginalAmount.toFixed(2)} ${invoiceCurrency}).`,
          reason: `Invoice total (${invoiceOriginalTotal.toFixed(2)} ${invoiceCurrency}) is greater than the requested release amount (${requestedOriginalAmount.toFixed(2)} ${invoiceCurrency}).`,
          expected: requestedOriginalAmount,
          actual: invoiceOriginalTotal,
        };
        allFlags.push(flag);
      } else if (discrepancyInOriginal > ARITHMETIC_TOLERANCE) {
        invoiceTotalWithinRequestedPassed = false;
        const flag: VerificationFlag = {
          code: 'INVOICE_TOTAL_MISMATCH_REQUESTED_AMOUNT',
          severity: 'HIGH',
          check: 'invoiceTotalWithinRequestedAmount',
          field: 'grandTotal',
          message: `Invoice grand total (${invoiceOriginalTotal.toFixed(2)} ${invoiceCurrency}) does not match the requested release amount (${requestedOriginalAmount.toFixed(2)} ${invoiceCurrency}) — difference of ${discrepancyInOriginal.toFixed(2)} ${invoiceCurrency}.`,
          reason: `Requested release amount (${requestedOriginalAmount.toFixed(2)} ${invoiceCurrency}) exceeds or differs from the invoice total (${invoiceOriginalTotal.toFixed(2)} ${invoiceCurrency}).`,
          expected: invoiceOriginalTotal,
          actual: requestedOriginalAmount,
        };
        allFlags.push(flag);
      }
    }

    // Bonus Check: Low extraction confidence warning
    if (
      Array.isArray(extraction.lowConfidenceFields) &&
      extraction.lowConfidenceFields.length > 0
    ) {
      allFlags.push({
        code: 'LOW_EXTRACTION_CONFIDENCE',
        severity: 'MEDIUM',
        check: 'extractionConfidence',
        field: extraction.lowConfidenceFields.join(', '),
        message: `AI extraction reported low confidence (< 0.80) on fields: ${extraction.lowConfidenceFields.join(', ')}. Manual visual inspection recommended.`,
        reason: `Blurry or handwritten regions detected on fields: ${extraction.lowConfidenceFields.join(', ')}.`,
      });
    }

    const itemsMatchPassed =
      extraction.lineItems.length > 0 && unmatchedItemCount === 0;
    const highSeverityFlags = allFlags.filter((f) => f.severity === 'HIGH');
    const passedAllChecks =
      itemsMatchPassed &&
      allQuantitiesWithinOrder &&
      lineTotalsAddUpPassed &&
      invoiceTotalWithinRequestedPassed &&
      allPricesReasonable &&
      highSeverityFlags.length === 0;

    const summary = passedAllChecks
      ? `Verified: All ${extraction.lineItems.length} invoice line item(s) match the group order, quantities are within limits, line totals add up to ${statedGrandTotal.toFixed(2)} ${invoiceCurrency} (${invoiceTotalInBase.toFixed(2)} ${baseCurrency}), and unit prices are within expected range.`
      : `Flagged (${allFlags.length} issue${allFlags.length === 1 ? '' : 's'}): ${allFlags.map((f) => f.reason).join(' ')}`;

    return {
      groupId: group.id,
      groupName: group.name,
      baseCurrency,
      releaseRequestId,
      supplier: extraction.supplier,
      invoiceCurrency,
      fxRateToBase,
      passedAllChecks,
      status: passedAllChecks ? 'VERIFIED' : 'FLAGGED',
      flagCount: allFlags.length,
      highSeverityFlagCount: highSeverityFlags.length,
      summary,
      checks: {
        itemsMatch: {
          passed: itemsMatchPassed,
          matchedCount: matchedItemCount,
          unmatchedCount: unmatchedItemCount,
          details: itemsMatchPassed
            ? `All ${matchedItemCount} invoice item(s) matched the group's combined order.`
            : `${unmatchedItemCount} of ${extraction.lineItems.length} invoice item(s) did not match the group's combined order.`,
        },
        quantitiesWithinOrder: {
          passed: allQuantitiesWithinOrder,
          details: allQuantitiesWithinOrder
            ? 'All matched item quantities are within the group combined order quantities.'
            : 'One or more invoice item quantities exceed the group combined order quantities.',
        },
        lineTotalsAddUp: {
          passed: lineTotalsAddUpPassed,
          computedLineSum,
          statedGrandTotal,
          discrepancy: grandTotalDiscrepancy,
          details: lineTotalsAddUpPassed
            ? `Line item totals sum cleanly to ${statedGrandTotal.toFixed(2)} ${invoiceCurrency}.`
            : `Arithmetic mismatch detected between line items (sum ${computedLineSum.toFixed(2)} ${invoiceCurrency}) and stated grand total (${statedGrandTotal.toFixed(2)} ${invoiceCurrency}).`,
        },
        invoiceTotalWithinRequestedAmount: {
          passed: invoiceTotalWithinRequestedPassed,
          invoiceOriginalTotal,
          invoiceTotalInBase,
          requestedOriginalAmount,
          requestedAmountInBase,
          discrepancyInOriginal,
          details:
            requestedOriginalAmount === null
              ? `Invoice total is ${invoiceOriginalTotal.toFixed(2)} ${invoiceCurrency} (${invoiceTotalInBase.toFixed(2)} ${baseCurrency}).`
              : invoiceTotalWithinRequestedPassed
                ? `Invoice total (${invoiceOriginalTotal.toFixed(2)} ${invoiceCurrency}) matches the requested release amount (${requestedOriginalAmount.toFixed(2)} ${invoiceCurrency}).`
                : `Invoice total (${invoiceOriginalTotal.toFixed(2)} ${invoiceCurrency}) does not match the requested release amount (${requestedOriginalAmount.toFixed(2)} ${invoiceCurrency}).`,
        },
        pricesReasonable: {
          passed: allPricesReasonable,
          maxSpikeThresholdPct: MAX_EARLIER_PRICE_SPIKE_PCT,
          details: allPricesReasonable
            ? 'All unit prices are within expected historical and order budget ranges.'
            : 'One or more unit prices are significantly higher than earlier invoices or the group order budget.',
        },
      },
      lineItemMatches,
      flags: allFlags,
      extraction,
      verifiedAt: new Date().toISOString(),
    };
  }

  private findMatchingOrderItem(
    invoiceDesc: string,
    originalDesc: string,
    orderItems: CombinedOrderItem[],
  ): CombinedOrderItem | null {
    if (orderItems.length === 0) return null;

    const normInvoice = invoiceDesc.trim().toLowerCase();
    const normOrig = originalDesc.trim().toLowerCase();

    // 1. Exact or substring match
    for (const candidate of orderItems) {
      const normCandidate = candidate.item.toLowerCase();
      if (
        normCandidate === normInvoice ||
        normCandidate === normOrig ||
        (normInvoice.length >= 5 && normCandidate.includes(normInvoice)) ||
        (normCandidate.length >= 5 && normInvoice.includes(normCandidate))
      ) {
        return candidate;
      }
    }

    // 2. Token overlap similarity
    const invoiceTokens = new Set([
      ...this.tokenizeItemName(invoiceDesc),
      ...this.tokenizeItemName(originalDesc),
    ]);

    let bestCandidate: CombinedOrderItem | null = null;
    let bestScore = 0;

    for (const candidate of orderItems) {
      if (candidate.normalizedTokens.length === 0) continue;
      let shared = 0;
      for (const token of candidate.normalizedTokens) {
        if (invoiceTokens.has(token)) {
          shared++;
        }
      }
      const score =
        shared /
        Math.min(
          candidate.normalizedTokens.length,
          Math.max(1, invoiceTokens.size),
        );
      if (score > bestScore) {
        bestScore = score;
        bestCandidate = candidate;
      }
    }

    return bestScore >= 0.4 ? bestCandidate : null;
  }

  private tokenizeItemName(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fff\u0600-\u06ff]+/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length >= 2);
  }
}

