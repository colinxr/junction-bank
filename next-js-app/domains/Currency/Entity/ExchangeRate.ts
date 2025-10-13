import { Decimal } from 'decimal.js';

export interface ExchangeRate {
  fromCurrency: "USD";
  toCurrency: "CAD";
  rate: number;
  timestamp: Date;
  expiresAt: Date;
}

export class ExchangeRateVO implements ExchangeRate {
  public readonly fromCurrency: "USD";
  public readonly toCurrency: "CAD";
  public readonly rate: number;
  public readonly timestamp: Date;
  public readonly expiresAt: Date;

  constructor(rate: number, timestamp: Date = new Date()) {
    this.fromCurrency = "USD";
    this.toCurrency = "CAD";
    this.rate = new Decimal(rate).toDecimalPlaces(4).toNumber();
    this.timestamp = timestamp;
    this.expiresAt = new Date(timestamp.getTime() + 24 * 60 * 60 * 1000); // 24 hours from timestamp
  }

  public isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  public convert(amountUSD: number): number {
    if (amountUSD < 0) {
      throw new Error("Amount cannot be negative");
    }
    return new Decimal(amountUSD).times(this.rate).toDecimalPlaces(2).toNumber();
  }

  static createFallback(): ExchangeRateVO {
    return new ExchangeRateVO(1.35);
  }
} 