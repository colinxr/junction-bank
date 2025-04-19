import { describe, it, expect } from 'vitest';
import { ExchangeRateVO } from "./ExchangeRate";

describe("ExchangeRateVO", () => {
  describe("constructor", () => {
    it("should create an exchange rate with current timestamp", () => {
      const rate = new ExchangeRateVO(1.35);
      expect(rate.fromCurrency).toBe("USD");
      expect(rate.toCurrency).toBe("CAD");
      expect(rate.rate).toBe(1.35);
      expect(rate.timestamp).toBeInstanceOf(Date);
      expect(rate.expiresAt).toBeInstanceOf(Date);
    });

    it("should round rate to 4 decimal places", () => {
      const rate = new ExchangeRateVO(1.34567891);
      expect(rate.rate).toBe(1.3457);
    });

    it("should set expiry to 24 hours from timestamp", () => {
      const now = new Date("2024-01-01T12:00:00Z");
      const rate = new ExchangeRateVO(1.35, now);
      const expected = new Date("2024-01-02T12:00:00Z");
      expect(rate.expiresAt.getTime()).toBe(expected.getTime());
    });
  });

  describe("isExpired", () => {
    it("should return false for future expiry", () => {
      const rate = new ExchangeRateVO(1.35);
      expect(rate.isExpired()).toBe(false);
    });

    it("should return true for past expiry", () => {
      const oldDate = new Date(Date.now() - 25 * 60 * 60 * 1000); // 25 hours ago
      const rate = new ExchangeRateVO(1.35, oldDate);
      expect(rate.isExpired()).toBe(true);
    });
  });

  describe("convert", () => {
    const rate = new ExchangeRateVO(1.35);

    it("should convert USD to CAD correctly", () => {
      expect(rate.convert(100)).toBe(135.00);
      expect(rate.convert(10.50)).toBe(14.18);
    });

    it("should handle zero amount", () => {
      expect(rate.convert(0)).toBe(0.00);
    });

    it("should throw error for negative amounts", () => {
      expect(() => rate.convert(-100)).toThrow("Amount cannot be negative");
    });

    it("should round to 2 decimal places", () => {
      expect(rate.convert(10.333333)).toBe(13.95);
    });
  });

  describe("createFallback", () => {
    it("should create rate with fallback value", () => {
      const rate = ExchangeRateVO.createFallback();
      expect(rate.rate).toBe(1.35);
      expect(rate instanceof ExchangeRateVO).toBe(true);
    });
  });
}); 