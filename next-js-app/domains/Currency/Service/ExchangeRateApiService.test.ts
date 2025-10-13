import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExchangeRateApiService } from './ExchangeRateApiService';
import { ExchangeRateVO } from '../Entity/ExchangeRate';

describe('ExchangeRateApiService', () => {
  const service = new ExchangeRateApiService();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    service.clearCache();
  });

  it('should fetch and cache exchange rate', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ rates: { CAD: 1.35 } })
    };
    
    global.fetch = vi.fn().mockResolvedValue(mockResponse);

    const rate = await service.getUsdToCadRate();
    expect(rate).toBeInstanceOf(ExchangeRateVO);
    expect(rate.rate).toBe(1.35);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Second call should use cache
    const cachedRate = await service.getUsdToCadRate();
    expect(cachedRate).toBe(rate);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('should use fallback rate on API failure', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const rate = await service.getUsdToCadRate();
    expect(rate).toBeInstanceOf(ExchangeRateVO);
    expect(rate.rate).toBe(1.35); // Fallback rate
  });

  it('should use fallback rate on invalid API response', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ rates: {} }) // Missing CAD rate
    };
    
    global.fetch = vi.fn().mockResolvedValue(mockResponse);

    const rate = await service.getUsdToCadRate();
    expect(rate).toBeInstanceOf(ExchangeRateVO);
    expect(rate.rate).toBe(1.35); // Fallback rate
  });

  it('should clear cached rate', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ rates: { CAD: 1.35 } })
    };
    
    global.fetch = vi.fn().mockResolvedValue(mockResponse);

    // First call to cache the rate
    await service.getUsdToCadRate();
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Clear cache
    await service.clearCache();

    // Should fetch again
    await service.getUsdToCadRate();
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('should handle non-ok API response', async () => {
    const mockResponse = {
      ok: false,
      status: 500
    };
    
    global.fetch = vi.fn().mockResolvedValue(mockResponse);

    const rate = await service.getUsdToCadRate();
    expect(rate).toBeInstanceOf(ExchangeRateVO);
    expect(rate.rate).toBe(1.35); // Fallback rate
  });
}); 