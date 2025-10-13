import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecalculateRecurringExpenses, RecalculateRecurringExpensesDTO } from './RecalculateRecurringExpenses';
import type { IMonthRepository } from '../IMonthRepository';

describe('RecalculateRecurringExpenses', () => {
  // Create mock repository with all required methods
  const mockRepository = {
    index: vi.fn(),
    show: vi.fn(),
    findByDate: vi.fn(),
    findLatest: vi.fn(),
    store: vi.fn(),
    update: vi.fn(),
    destroy: vi.fn(),
    findByMonthAndYear: vi.fn(),
    hasTransactions: vi.fn(),
    recalculateRecurringExpenses: vi.fn()
  };
  
  const action = new RecalculateRecurringExpenses(mockRepository as unknown as IMonthRepository);
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should recalculate for specific month when monthId provided', async () => {
    // Set up mock
    mockRepository.recalculateRecurringExpenses.mockResolvedValue(undefined);
    
    const data: RecalculateRecurringExpensesDTO = {
      monthId: 5
    };
    
    // Execute
    await action.execute(data);
    
    // Assert
    expect(mockRepository.recalculateRecurringExpenses).toHaveBeenCalledWith(5);
    expect(mockRepository.recalculateRecurringExpenses).toHaveBeenCalledTimes(1);
  });
  
  it('should recalculate for all months when no monthId provided', async () => {
    // Set up mock
    mockRepository.recalculateRecurringExpenses.mockResolvedValue(undefined);
    
    const data: RecalculateRecurringExpensesDTO = {};
    
    // Execute
    await action.execute(data);
    
    // Assert
    expect(mockRepository.recalculateRecurringExpenses).toHaveBeenCalledWith(undefined);
    expect(mockRepository.recalculateRecurringExpenses).toHaveBeenCalledTimes(1);
  });
  
  it('should recalculate for all months when no data provided', async () => {
    // Set up mock
    mockRepository.recalculateRecurringExpenses.mockResolvedValue(undefined);
    
    // Execute
    await action.execute();
    
    // Assert
    expect(mockRepository.recalculateRecurringExpenses).toHaveBeenCalledWith(undefined);
    expect(mockRepository.recalculateRecurringExpenses).toHaveBeenCalledTimes(1);
  });
  
  it('should recalculate for all months when data.monthId is undefined', async () => {
    // Set up mock
    mockRepository.recalculateRecurringExpenses.mockResolvedValue(undefined);
    
    const data: RecalculateRecurringExpensesDTO = {
      monthId: undefined
    };
    
    // Execute
    await action.execute(data);
    
    // Assert
    expect(mockRepository.recalculateRecurringExpenses).toHaveBeenCalledWith(undefined);
    expect(mockRepository.recalculateRecurringExpenses).toHaveBeenCalledTimes(1);
  });
  
  it('should handle monthId value of 0', async () => {
    // Set up mock
    mockRepository.recalculateRecurringExpenses.mockResolvedValue(undefined);
    
    const data: RecalculateRecurringExpensesDTO = {
      monthId: 0
    };
    
    // Execute
    await action.execute(data);
    
    // Assert
    expect(mockRepository.recalculateRecurringExpenses).toHaveBeenCalledWith(0);
    expect(mockRepository.recalculateRecurringExpenses).toHaveBeenCalledTimes(1);
  });
  
  it('should propagate repository errors', async () => {
    // Set up mock to throw error
    const error = new Error('Database connection failed');
    mockRepository.recalculateRecurringExpenses.mockRejectedValue(error);
    
    const data: RecalculateRecurringExpensesDTO = {
      monthId: 1
    };
    
    // Execute and expect error
    await expect(action.execute(data)).rejects.toThrow('Database connection failed');
    
    // Assert repository was called
    expect(mockRepository.recalculateRecurringExpenses).toHaveBeenCalledWith(1);
  });
  
  it('should handle repository errors when no monthId provided', async () => {
    // Set up mock to throw error
    const error = new Error('Bulk update failed');
    mockRepository.recalculateRecurringExpenses.mockRejectedValue(error);
    
    // Execute and expect error
    await expect(action.execute()).rejects.toThrow('Bulk update failed');
    
    // Assert repository was called
    expect(mockRepository.recalculateRecurringExpenses).toHaveBeenCalledWith(undefined);
  });
});
