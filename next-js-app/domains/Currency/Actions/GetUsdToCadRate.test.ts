import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetUsdToCadRate } from './GetUsdToCadRate';
import { ExchangeRateVO } from '../Entity/ExchangeRate';
import { IExchangeRateApiService } from '../Service/IExchangeRateApiService';
import { ExchangeRateFetchException, StaleExchangeRateException } from '../Exception/CurrencyException';

describe('GetUsdToCadRate', () => {
  const mockCurrencyService: IExchangeRateApiService = {
    getUsdToCadRate: vi.fn(),
    clearCache: vi.fn()
  };

  const getUsdToCadRate = new GetUsdToCadRate(mockCurrencyService);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return fresh exchange rate', async () => {
    const mockRate = new ExchangeRateVO(1.35);
    vi.mocked(mockCurrencyService.getUsdToCadRate).mockResolvedValue(mockRate);

    const result = await getUsdToCadRate.execute();
    expect(result).toBe(mockRate);
    expect(mockCurrencyService.getUsdToCadRate).toHaveBeenCalledTimes(1);
    expect(mockCurrencyService.clearCache).not.toHaveBeenCalled();
  });

  it('should attempt to refresh stale rate', async () => {
    const staleRate = new ExchangeRateVO(1.35, new Date(Date.now() - 25 * 60 * 60 * 1000));
    const freshRate = new ExchangeRateVO(1.36);
    
    vi.mocked(mockCurrencyService.getUsdToCadRate)
      .mockResolvedValueOnce(staleRate)
      .mockResolvedValueOnce(freshRate);

    const result = await getUsdToCadRate.execute();
    expect(result).toBe(freshRate);
    expect(mockCurrencyService.clearCache).toHaveBeenCalledTimes(1);
    expect(mockCurrencyService.getUsdToCadRate).toHaveBeenCalledTimes(2);
  });

  it('should throw StaleExchangeRateException when refresh fails', async () => {
    const staleRate = new ExchangeRateVO(1.35, new Date(Date.now() - 25 * 60 * 60 * 1000));
    
    vi.mocked(mockCurrencyService.getUsdToCadRate)
      .mockResolvedValueOnce(staleRate)
      .mockRejectedValueOnce(new Error('API Error'));

    await expect(getUsdToCadRate.execute()).rejects.toThrow(StaleExchangeRateException);
    expect(mockCurrencyService.clearCache).toHaveBeenCalledTimes(1);
  });

  it('should throw ExchangeRateFetchException on service failure', async () => {
    vi.mocked(mockCurrencyService.getUsdToCadRate).mockRejectedValue(new Error('API Error'));

    await expect(getUsdToCadRate.execute()).rejects.toThrow(ExchangeRateFetchException);
    expect(mockCurrencyService.clearCache).not.toHaveBeenCalled();
  });
}); 