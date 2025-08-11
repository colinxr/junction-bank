import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ensureAmountCAD } from '../Services/currency';
import { TransactionImportDTO } from '../TransactionImportDTO';
import { CurrencyService } from '@/domains/Currency/Service/CurrencyService';

describe('Currency Service Integration', () => {
  let mockCurrencyService: CurrencyService;

  beforeEach(() => {
    // Create a mock instance manually with common setup
    mockCurrencyService = {
      processCurrencyAmounts: vi.fn()
    } as any;
    vi.clearAllMocks();
  });

  // Helper function to create test transaction DTO
  const createTestDTO = (overrides: Partial<TransactionImportDTO> = {}): TransactionImportDTO => ({
    clerkId: 'user_123',
    name: 'Test Transaction',
    categoryId: 1,
    notes: null,
    type: 'Expense',
    date: new Date('2025-01-01'),
    monthId: 1,
    ...overrides
  });

  describe('ensureAmountCAD', () => {
    it('converts USD to CAD when only amountUSD provided', async () => {
      const importDto = createTestDTO({ amountUSD: 75 });

      (mockCurrencyService.processCurrencyAmounts as any).mockResolvedValue({
        amountCAD: 100,
        amountUSD: 75
      });

      const result = await ensureAmountCAD(importDto, mockCurrencyService);
      
      expect(result.amountCAD).toBe(100);
      expect(result.amountUSD).toBe(75);
      expect(mockCurrencyService.processCurrencyAmounts).toHaveBeenCalledWith(undefined, 75);
    });

    it('preserves amountCAD when already provided', async () => {
      const importDto = createTestDTO({ amountCAD: 100 });

      (mockCurrencyService.processCurrencyAmounts as any).mockResolvedValue({
        amountCAD: 100
      });

      const result = await ensureAmountCAD(importDto, mockCurrencyService);
      
      expect(result.amountCAD).toBe(100);
      expect(result.amountUSD).toBeNull(); // Function converts undefined to null for database
      expect(mockCurrencyService.processCurrencyAmounts).toHaveBeenCalledWith(100, undefined);
    });

    it('handles both amounts provided', async () => {
      const importDto = createTestDTO({ amountCAD: 100, amountUSD: 75 });

      (mockCurrencyService.processCurrencyAmounts as any).mockResolvedValue({
        amountCAD: 100,
        amountUSD: 75
      });

      const result = await ensureAmountCAD(importDto, mockCurrencyService);
      
      expect(result.amountCAD).toBe(100);
      expect(result.amountUSD).toBe(75);
      expect(mockCurrencyService.processCurrencyAmounts).toHaveBeenCalledWith(100, 75);
    });

    it('throws error when both amounts are missing', async () => {
      const importDto = createTestDTO(); // No amounts provided

      (mockCurrencyService.processCurrencyAmounts as any).mockRejectedValue(
        new Error("Either CAD or USD amount must be provided")
      );

      await expect(ensureAmountCAD(importDto, mockCurrencyService)).rejects.toThrow(
        "Either CAD or USD amount must be provided"
      );
    });

    it('throws error when both amounts are null', async () => {
      const importDto = createTestDTO({ amountCAD: null, amountUSD: null });

      (mockCurrencyService.processCurrencyAmounts as any).mockRejectedValue(
        new Error("Either CAD or USD amount must be provided")
      );

      await expect(ensureAmountCAD(importDto, mockCurrencyService)).rejects.toThrow(
        "Either CAD or USD amount must be provided"
      );
    });
  });
});
