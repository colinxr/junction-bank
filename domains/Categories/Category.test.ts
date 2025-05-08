import { describe, it, expect } from 'vitest';
import { Category } from './Category';
import { CategoryNameEmptyException, InvalidCategoryTypeException } from './CategoryException';

describe('Category', () => {
  it('creates a valid category with minimum fields', () => {
    const category = Category.create({
      name: 'Food',
      type: 'expense'
    });
    
    expect(category.name).toBe('Food');
    expect(category.type).toBe('expense');
    expect(category.isRecurring).toBe(false);
    expect(category.notes).toBeUndefined();
  });
  
  it('creates a valid income category', () => {
    const category = Category.create({
      name: 'Salary',
      type: 'income',
      notes: 'Monthly income'
    });
    
    expect(category.name).toBe('Salary');
    expect(category.type).toBe('income');
    expect(category.notes).toBe('Monthly income');
  });
  
  it('creates a recurring category', () => {
    const category = Category.create({
      name: 'Rent',
      type: 'expense',
      isRecurring: true
    });
    
    expect(category.isRecurring).toBe(true);
  });
  
  it('throws CategoryNameEmptyException when name is empty', () => {
    expect(() => Category.create({
      name: '',
      type: 'expense'
    })).toThrow(CategoryNameEmptyException);
    
    expect(() => Category.create({
      name: '   ',
      type: 'expense'
    })).toThrow(CategoryNameEmptyException);
  });
  
  it('throws InvalidCategoryTypeException for invalid type', () => {
    expect(() => Category.create({
      name: 'Test',
      type: 'invalid'
    })).toThrow(InvalidCategoryTypeException);
  });
});
