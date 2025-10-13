import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateMonth } from './UpdateMonth';
import { Month } from '../Month';
import { MonthNotFoundException, MonthAlreadyExistsException } from '../MonthException';
import type { IMonthRepository } from '../IMonthRepository';

describe('UpdateMonth', () => {
  // Create mock repository
  const mockRepository = {
    index: vi.fn(),
    show: vi.fn(),
    findByDate: vi.fn(),
    store: vi.fn(),
    update: vi.fn(),
    destroy: vi.fn(),
    findByMonthAndYear: vi.fn(),
    hasTransactions: vi.fn()
  };
  
  const updateMonth = new UpdateMonth(mockRepository as unknown as IMonthRepository);
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('updates a month when it exists and no conflicts', async () => {
    const existingMonth = new Month({
      id: 1,
      month: 3,
      year: 2023,
      notes: 'March 2023'
    });
    
    const updatedMonth = new Month({
      id: 1,
      month: 3,
      year: 2023,
      notes: 'Updated March 2023'
    });
    
    mockRepository.show.mockResolvedValue(existingMonth);
    mockRepository.update.mockResolvedValue(updatedMonth);
    
    const result = await updateMonth.execute(1, { notes: 'Updated March 2023' });
    
    expect(mockRepository.show).toHaveBeenCalledWith(1);
    expect(mockRepository.findByMonthAndYear).not.toHaveBeenCalled();
    expect(mockRepository.update).toHaveBeenCalledWith(1, { notes: 'Updated March 2023' });
    expect(result).toBe(updatedMonth);
  });
  
  it('throws MonthNotFoundException when month does not exist', async () => {
    mockRepository.show.mockResolvedValue(null);
    
    await expect(updateMonth.execute(999, { notes: 'Updated notes' }))
      .rejects.toThrow(MonthNotFoundException);
    
    expect(mockRepository.show).toHaveBeenCalledWith(999);
    expect(mockRepository.update).not.toHaveBeenCalled();
  });
  
  it('checks for conflicts when changing month/year and there are none', async () => {
    const existingMonth = new Month({
      id: 1,
      month: 3,
      year: 2023,
      notes: 'March 2023'
    });
    
    const updatedMonth = new Month({
      id: 1,
      month: 4,
      year: 2023,
      notes: 'Now April 2023'
    });
    
    mockRepository.show.mockResolvedValue(existingMonth);
    mockRepository.findByMonthAndYear.mockResolvedValue(false);
    mockRepository.update.mockResolvedValue(updatedMonth);
    
    const result = await updateMonth.execute(1, { 
      month: 4,
      notes: 'Now April 2023'
    });
    
    expect(mockRepository.show).toHaveBeenCalledWith(1);
    expect(mockRepository.findByMonthAndYear).toHaveBeenCalledWith(4, 2023);
    expect(mockRepository.update).toHaveBeenCalledWith(1, { 
      month: 4,
      notes: 'Now April 2023'
    });
    expect(result).toBe(updatedMonth);
  });
  
  it('throws MonthAlreadyExistsException when changing month/year to an existing one', async () => {
    const existingMonth = new Month({
      id: 1,
      month: 3,
      year: 2023,
      notes: 'March 2023'
    });
    
    mockRepository.show.mockResolvedValue(existingMonth);
    mockRepository.findByMonthAndYear.mockResolvedValue(true);
    
    await expect(updateMonth.execute(1, { month: 4, year: 2023 }))
      .rejects.toThrow(MonthAlreadyExistsException);
    
    expect(mockRepository.show).toHaveBeenCalledWith(1);
    expect(mockRepository.findByMonthAndYear).toHaveBeenCalledWith(4, 2023);
    expect(mockRepository.update).not.toHaveBeenCalled();
  });
  
  it('handles null notes by converting to undefined', async () => {
    const existingMonth = new Month({
      id: 1,
      month: 3,
      year: 2023,
      notes: 'March 2023'
    });
    
    const updatedMonth = new Month({
      id: 1,
      month: 3,
      year: 2023,
      notes: undefined
    });
    
    mockRepository.show.mockResolvedValue(existingMonth);
    mockRepository.update.mockResolvedValue(updatedMonth);
    
    const result = await updateMonth.execute(1, { notes: null });
    
    expect(mockRepository.update).toHaveBeenCalledWith(1, { notes: undefined });
    expect(result).toBe(updatedMonth);
  });
}); 