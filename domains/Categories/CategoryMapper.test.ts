import { describe, it, expect } from 'vitest';
import { CategoryMapper } from './CategoryMapper';
import { Category } from './Category';

describe('CategoryMapper', () => {
  const testDate = new Date('2023-01-01');
  
  const prismaCategoryData = {
    id: 1,
    name: 'Food',
    type: 'expense',
    notes: 'Grocery shopping',
    createdAt: testDate,
    isRecurring: false
  };
  
  it('converts Prisma entity to domain entity', () => {
    const domain = CategoryMapper.toDomain(prismaCategoryData);
    
    expect(domain).toBeInstanceOf(Category);
    expect(domain.id).toBe(1);
    expect(domain.name).toBe('Food');
    expect(domain.type).toBe('expense');
    expect(domain.notes).toBe('Grocery shopping');
    expect(domain.createdAt).toEqual(testDate);
    expect(domain.isRecurring).toBe(false);
  });
  
  it('converts domain entity to persistence data', () => {
    const domain = new Category({
      name: 'Food',
      type: 'expense',
      notes: 'Grocery shopping',
      isRecurring: false
    });
    
    const persistence = CategoryMapper.toPersistence(domain);
    
    expect(persistence).toEqual({
      name: 'Food',
      type: 'expense',
      notes: 'Grocery shopping',
      isRecurring: false
    });
  });
  
  it('handles null notes in prisma entity', () => {
    const prismaCategoryWithNullNotes = {
      ...prismaCategoryData,
      notes: null
    };
    
    const domain = CategoryMapper.toDomain(prismaCategoryWithNullNotes);
    expect(domain.notes).toBeUndefined();
  });
  
  it('converts domain entity to DTO', () => {
    const domain = new Category({
      id: 1,
      name: 'Food',
      type: 'expense',
      notes: 'Grocery shopping',
      createdAt: testDate,
      isRecurring: false
    });
    
    const dto = CategoryMapper.toDTO(domain);
    
    expect(dto).toEqual({
      id: 1,
      name: 'Food',
      type: 'expense',
      notes: 'Grocery shopping',
      createdAt: testDate,
      isRecurring: false
    });
  });
});
