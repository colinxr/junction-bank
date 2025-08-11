import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetMonthlySpendingByCategory } from './GetMonthlySpendingByCategory';
import { formatCurrency } from '@/infrastructure/utils';
import type { ITransactionRepository } from '@/domains/Transactions/Repositories/ITransactionRepository';
import type { CategorySpendingDTO } from '@/domains/Transactions/DTOs/TransactionDTO';
import type { USDSpending } from '@/app/types';

// Mock the formatCurrency function
vi.mock('@/lib/utils', () => ({
  formatCurrency: vi.fn((amount) => `$${amount.toFixed(2)}`)
}));

describe('GetMonthlySpendingByCategory', () => {
  // Create mock repository
  const mockRepository = {
    getTotalSpendingByCategory: vi.fn(),
    getUSDSpendingByCategory: vi.fn()
  };
  
  const getMonthlySpendingByCategory = new GetMonthlySpendingByCategory(
    mockRepository as unknown as ITransactionRepository
  );
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('returns formatted spending by category sorted by total amount', async () => {
    const monthId = 1;
    
    // Mock data for category spending
    const categorySpendingData: CategorySpendingDTO[] = [
      {
        categoryId: 1,
        categoryName: 'Food',
        totalSpent: 500,
        transactionCount: 10
      },
      {
        categoryId: 2,
        categoryName: 'Transportation',
        totalSpent: 300,
        transactionCount: 5
      },
      {
        categoryId: 3,
        categoryName: 'Entertainment',
        totalSpent: 800,
        transactionCount: 8
      }
    ];
    
    // Mock data for USD spending
    const usdSpendingData: USDSpending[] = [
      {
        categoryId: 1,
        _sum: { amountCAD: 100 }
      },
      {
        categoryId: 3,
        _sum: { amountCAD: 200 }
      },
      // No USD spending for category 2
    ];
    
    mockRepository.getTotalSpendingByCategory.mockResolvedValue(categorySpendingData);
    mockRepository.getUSDSpendingByCategory.mockResolvedValue(usdSpendingData);
    
    const result = await getMonthlySpendingByCategory.execute(monthId);
    
    expect(mockRepository.getTotalSpendingByCategory).toHaveBeenCalledWith(monthId);
    expect(mockRepository.getUSDSpendingByCategory).toHaveBeenCalledWith(monthId);
    
    // Verify results are sorted by total amount in descending order
    expect(result).toHaveLength(3);
    expect(result[0].categoryId).toBe(3); // Entertainment with highest total
    expect(result[1].categoryId).toBe(1); // Food second
    expect(result[2].categoryId).toBe(2); // Transportation last
    
    // Check individual category data
    expect(result[0]).toEqual({
      categoryId: 3,
      categoryName: 'Entertainment',
      totalAmountCAD: '$600.00', // 800 - 200
      totalAmountUSD: '$200.00',
      total: 800 // 600 + 200
    });
    
    expect(result[1]).toEqual({
      categoryId: 1,
      categoryName: 'Food',
      totalAmountCAD: '$400.00', // 500 - 100
      totalAmountUSD: '$100.00',
      total: 500 // 400 + 100
    });
    
    expect(result[2]).toEqual({
      categoryId: 2, 
      categoryName: 'Transportation',
      totalAmountCAD: '$300.00',
      totalAmountUSD: '$0.00',
      total: 300 // No USD spending
    });
  });
  
  it('handles empty spending data', async () => {
    const monthId = 1;
    
    mockRepository.getTotalSpendingByCategory.mockResolvedValue([]);
    mockRepository.getUSDSpendingByCategory.mockResolvedValue([]);
    
    const result = await getMonthlySpendingByCategory.execute(monthId);
    
    expect(result).toEqual([]);
  });
  
  it('handles missing USD data for categories', async () => {
    const monthId = 1;
    
    const categorySpendingData = [
      {
        categoryId: 1,
        categoryName: 'Food',
        totalSpent: 500,
        transactionCount: 10
      }
    ];
    
    // No USD spending data at all
    mockRepository.getTotalSpendingByCategory.mockResolvedValue(categorySpendingData);
    mockRepository.getUSDSpendingByCategory.mockResolvedValue([]);
    
    const result = await getMonthlySpendingByCategory.execute(monthId);
    
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      categoryId: 1,
      categoryName: 'Food',
      totalAmountCAD: '$500.00',
      totalAmountUSD: '$0.00',
      total: 500
    });
  });
}); 