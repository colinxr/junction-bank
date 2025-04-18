import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConvertUsdToCad } from './ConvertUsdToCad';
import { GetUsdToCadRate } from './GetUsdToCadRate';
import { ExchangeRateVO } from '../Entity/ExchangeRate';
import { InvalidAmountException } from '../Exception/CurrencyException';

describe('ConvertUsdToCad', () => {
  const mockExecute = vi.fn();
  const mockGetUsdToCadRate = { execute: mockExecute } as unknown as GetUsdToCadRate;
  const converter = new ConvertUsdToCad(mockGetUsdToCadRate);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should convert USD to CAD using current rate', async () => {
    const mockRate = new ExchangeRateVO(1.35);
    mockExecute.mockImplementation(() => Promise.resolve(mockRate));

    const result = await converter.execute(100);
    expect(result).toBe(135.00);
    expect(mockExecute).toHaveBeenCalledTimes(1);
  });

  it('should handle decimal amounts correctly', async () => {
    const mockRate = new ExchangeRateVO(1.35);
    mockExecute.mockImplementation(() => Promise.resolve(mockRate));

    const result = await converter.execute(10.50);
    expect(result).toBe(14.18);
  });

  it('should throw InvalidAmountException for negative amounts', async () => {
    await expect(converter.execute(-100)).rejects.toThrow(InvalidAmountException);
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('should throw InvalidAmountException for NaN', async () => {
    await expect(converter.execute(NaN)).rejects.toThrow(InvalidAmountException);
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('should handle zero amount', async () => {
    const mockRate = new ExchangeRateVO(1.35);
    mockExecute.mockImplementation(() => Promise.resolve(mockRate));

    const result = await converter.execute(0);
    expect(result).toBe(0.00);
  });

  it('should propagate errors from GetUsdToCadRate', async () => {
    const error = new Error('Rate fetch failed');
    mockExecute.mockImplementation(() => Promise.reject(error));

    await expect(converter.execute(100)).rejects.toThrow('Rate fetch failed');
  });
}); 