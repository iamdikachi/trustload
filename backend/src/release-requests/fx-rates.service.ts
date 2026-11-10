import { BadRequestException, Injectable } from '@nestjs/common';

/**
 * Fixed demo exchange rate table timestamp (ISO 8601).
 * Every currency conversion in TrustLoad is computed deterministically in code
 * (never by the AI model) using this stored rate table and its date.
 */
export const FIXED_FX_RATE_TABLE_DATE = '2026-11-08T00:00:00.000Z';

/**
 * Deterministic reference FX table (value of 1 unit of currency in USD)
 * as specified in PRD Section 7 & 13 ("Pick one rate source or a fixed rate table
 * for the demo and store the rate with every entry").
 */
export const USD_PER_UNIT_RATES: Record<
  string,
  { usdPerUnit: number; unitsPerUsd: number; name: string }
> = {
  USD: { usdPerUnit: 1.0, unitsPerUsd: 1.0, name: 'US Dollar' },
  CNY: { usdPerUnit: 0.138889, unitsPerUsd: 7.2, name: 'Chinese Yuan Renminbi' },
  AED: { usdPerUnit: 0.272294, unitsPerUsd: 3.6725, name: 'UAE Dirham' },
  TRY: { usdPerUnit: 0.029412, unitsPerUsd: 34.0, name: 'Turkish Lira' },
  GBP: { usdPerUnit: 1.29, unitsPerUsd: 0.775194, name: 'British Pound' },
  EUR: { usdPerUnit: 1.08, unitsPerUsd: 0.925926, name: 'Euro' },
  NGN: { usdPerUnit: 0.000625, unitsPerUsd: 1600.0, name: 'Nigerian Naira' },
  GHS: { usdPerUnit: 0.0625, unitsPerUsd: 16.0, name: 'Ghanaian Cedi' },
  KES: { usdPerUnit: 0.007752, unitsPerUsd: 129.0, name: 'Kenyan Shilling' },
  HKD: { usdPerUnit: 0.128205, unitsPerUsd: 7.8, name: 'Hong Kong Dollar' },
  INR: { usdPerUnit: 0.011905, unitsPerUsd: 84.0, name: 'Indian Rupee' },
  JPY: { usdPerUnit: 0.006579, unitsPerUsd: 152.0, name: 'Japanese Yen' },
};

export interface FxConversionResult {
  originalAmount: number;
  originalCurrency: string;
  baseCurrency: string;
  fxRate: number;
  rateUsed: number;
  fxRateDate: Date;
  rateDate: string;
  convertedBaseAmount: number;
  convertedInCode: true;
  source: 'FIXED_RATE_TABLE' | 'CUSTOM_OVERRIDE';
}

@Injectable()
export class FxRatesService {
  /**
   * Returns the full fixed exchange rate table relative to `baseCurrency` (defaults to USD).
   */
  getRateTable(baseCurrency = 'USD') {
    const base = baseCurrency.trim().toUpperCase();
    const baseEntry = USD_PER_UNIT_RATES[base];
    if (!baseEntry) {
      throw new BadRequestException(
        `Unsupported base currency "${base}". Supported currencies: ${Object.keys(USD_PER_UNIT_RATES).join(', ')}.`,
      );
    }

    const rates = Object.entries(USD_PER_UNIT_RATES).map(([code, meta]) => {
      const rateToBase = Number((meta.usdPerUnit / baseEntry.usdPerUnit).toFixed(6));
      const unitsPerBase = Number((baseEntry.usdPerUnit / meta.usdPerUnit).toFixed(6));
      return {
        currency: code,
        name: meta.name,
        baseCurrency: base,
        fxRate: rateToBase,
        rateUsed: rateToBase,
        unitsPerBase,
        fxRateDate: FIXED_FX_RATE_TABLE_DATE,
      };
    });

    return {
      baseCurrency: base,
      fxRateDate: FIXED_FX_RATE_TABLE_DATE,
      source: 'FIXED_RATE_TABLE',
      convertedInCode: true,
      rates,
    };
  }

  /**
   * Returns the conversion multiplier from `fromCurrency` to `toBaseCurrency`
   * such that `amountInBase = originalAmount * fxRate`, along with the stored rate date.
   */
  getConversionRate(
    fromCurrency: string,
    toBaseCurrency: string,
    customRate?: number | string,
    customRateDate?: Date | string,
  ): {
    fxRate: number;
    fxRateDate: Date;
    source: 'FIXED_RATE_TABLE' | 'CUSTOM_OVERRIDE';
  } {
    const from = fromCurrency.trim().toUpperCase();
    const to = toBaseCurrency.trim().toUpperCase();
    const resolvedDate = customRateDate
      ? new Date(customRateDate)
      : new Date(FIXED_FX_RATE_TABLE_DATE);

    if (customRate !== undefined && customRate !== null && customRate !== '') {
      const parsed = Number(customRate);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new BadRequestException('fxRate must be a positive number.');
      }
      return {
        fxRate: Number(parsed.toFixed(6)),
        fxRateDate: resolvedDate,
        source: 'CUSTOM_OVERRIDE',
      };
    }

    if (from === to) {
      return {
        fxRate: 1.0,
        fxRateDate: resolvedDate,
        source: 'FIXED_RATE_TABLE',
      };
    }

    const fromEntry = USD_PER_UNIT_RATES[from];
    const toEntry = USD_PER_UNIT_RATES[to];

    if (!fromEntry) {
      throw new BadRequestException(
        `Unsupported currency "${from}". Provide an explicit fxRate or use one of: ${Object.keys(USD_PER_UNIT_RATES).join(', ')}.`,
      );
    }

    if (!toEntry) {
      throw new BadRequestException(
        `Unsupported base currency "${to}". Provide an explicit fxRate or use one of: ${Object.keys(USD_PER_UNIT_RATES).join(', ')}.`,
      );
    }

    const rate = fromEntry.usdPerUnit / toEntry.usdPerUnit;
    return {
      fxRate: Number(rate.toFixed(6)),
      fxRateDate: resolvedDate,
      source: 'FIXED_RATE_TABLE',
    };
  }

  /**
   * Converts an amount using the supplied rate in code (rounded to 2 decimal places).
   */
  convertAmount(originalAmount: number, fxRate: number): number {
    return Number((originalAmount * fxRate).toFixed(2));
  }

  /**
   * Converts an invoice total from its original currency to the group's base currency
   * strictly in code using the stored rate table and date.
   */
  convertInvoiceTotalToBase(params: {
    originalAmount: number;
    fromCurrency: string;
    toBaseCurrency?: string;
    customRate?: number | string;
    customRateDate?: Date | string;
  }): FxConversionResult {
    const originalCurrency = params.fromCurrency.trim().toUpperCase();
    const baseCurrency = (params.toBaseCurrency ?? 'USD').trim().toUpperCase();
    const originalAmount = Number(Number(params.originalAmount).toFixed(2));

    if (!Number.isFinite(originalAmount) || originalAmount < 0) {
      throw new BadRequestException('originalAmount must be a non-negative number.');
    }

    const { fxRate, fxRateDate, source } = this.getConversionRate(
      originalCurrency,
      baseCurrency,
      params.customRate,
      params.customRateDate,
    );

    const convertedBaseAmount = this.convertAmount(originalAmount, fxRate);

    return {
      originalAmount,
      originalCurrency,
      baseCurrency,
      fxRate,
      rateUsed: fxRate,
      fxRateDate,
      rateDate: fxRateDate.toISOString(),
      convertedBaseAmount,
      convertedInCode: true,
      source,
    };
  }
}
