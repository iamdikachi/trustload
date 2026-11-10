import { BadRequestException, Injectable } from '@nestjs/common';

/**
 * Deterministic reference FX table (value of 1 unit of currency in USD)
 * as specified in PRD Section 7 & 13 ("Pick one rate source or a fixed rate table
 * for the demo and store the rate with every entry").
 */
const USD_PER_UNIT_RATES: Record<string, number> = {
  USD: 1.0,
  CNY: 0.138889, // ~7.20 CNY per USD (China)
  AED: 0.272294, // ~3.6725 AED per USD (Dubai / UAE)
  TRY: 0.029412, // ~34.00 TRY per USD (Turkey)
  GBP: 1.29, // ~0.775 GBP per USD (UK)
  EUR: 1.08, // ~0.926 EUR per USD (Eurozone)
  NGN: 0.000625, // ~1,600 NGN per USD (Nigeria)
  HKD: 0.128205, // ~7.80 HKD per USD (Hong Kong)
  INR: 0.011905, // ~84.00 INR per USD (India)
  JPY: 0.006579, // ~152.00 JPY per USD (Japan)
};

@Injectable()
export class FxRatesService {
  /**
   * Returns the conversion multiplier from `fromCurrency` to `toBaseCurrency`
   * such that `amountInBase = originalAmount * fxRate`.
   */
  getConversionRate(
    fromCurrency: string,
    toBaseCurrency: string,
    customRate?: number | string,
  ): { fxRate: number; fxRateDate: Date } {
    const from = fromCurrency.trim().toUpperCase();
    const to = toBaseCurrency.trim().toUpperCase();

    if (customRate !== undefined && customRate !== null && customRate !== '') {
      const parsed = Number(customRate);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new BadRequestException('fxRate must be a positive number.');
      }
      return {
        fxRate: Number(parsed.toFixed(6)),
        fxRateDate: new Date(),
      };
    }

    if (from === to) {
      return {
        fxRate: 1.0,
        fxRateDate: new Date(),
      };
    }

    const fromUsd = USD_PER_UNIT_RATES[from];
    const toUsd = USD_PER_UNIT_RATES[to];

    if (!fromUsd) {
      throw new BadRequestException(
        `Unsupported currency "${from}". Provide an explicit fxRate or use one of: ${Object.keys(USD_PER_UNIT_RATES).join(', ')}.`,
      );
    }

    if (!toUsd) {
      throw new BadRequestException(
        `Unsupported base currency "${to}". Provide an explicit fxRate or use one of: ${Object.keys(USD_PER_UNIT_RATES).join(', ')}.`,
      );
    }

    const rate = fromUsd / toUsd;
    return {
      fxRate: Number(rate.toFixed(6)),
      fxRateDate: new Date(),
    };
  }

  convertAmount(originalAmount: number, fxRate: number): number {
    return Number((originalAmount * fxRate).toFixed(2));
  }
}


