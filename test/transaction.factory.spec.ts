import { describe, it, expect, beforeEach, afterEach, beforeAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { TransactionFactory } from '../lib/factories/transaction.factory';
import { CurrencyService } from '../lib/services/currency.service';
import { resetDatabase } from './utils/helpers';

// Create real instances for testing
const prisma = new PrismaClient();
const currencyService = new CurrencyService();

describe('TransactionFactory', () => {
  let transactionFactory: TransactionFactory;
  let userId: string;
  let categoryId: number;
  
  beforeAll(async () => {
    // Initialize the factory with real dependencies
    transactionFactory = new TransactionFactory(prisma, currencyService);
  });
  
  beforeEach(async () => {
    // Reset database to known state and get references to test data
    await resetDatabase(prisma);
    
    // Get user ID
    const user = await prisma.user.findFirst();
    if (!user) throw new Error('Test user not found');
    userId = user.id;
    
    // Get category ID
    const category = await prisma.category.findFirst({
      where: { type: 'expense' }
    });
    if (!category) throw new Error('Test category not found');
    categoryId = category.id;
  });
  
  afterEach(async () => {
    // Clean up any test data created during tests
    await resetDatabase(prisma);
  });
  
  describe('create method', () => {
    it('should create transaction data with CAD amount', async () => {
      const testDate = new Date();
      const transactionData = {
        name: 'Test Transaction',
        amountCAD: 100,
        date: testDate,
        categoryId: categoryId,
        userId: userId,
        notes: 'Test notes'
      };
      
      const result = await transactionFactory.create(transactionData);
      
      // Verify the result
      expect(result).toHaveProperty('monthId');
      expect(result.name).toBe(transactionData.name);
      expect(result.amountCAD).toBe(100);
      expect(result.amountUSD).toBeNull();
      
      // Verify month was created
      const month = await prisma.month.findUnique({
        where: { id: result.monthId }
      });
      expect(month).not.toBeNull();
      expect(month?.month).toBe(testDate.getMonth() + 1);
      expect(month?.year).toBe(testDate.getFullYear());
    });
    
    it('should create transaction data with USD amount and convert to CAD', async () => {
      const testDate = new Date();
      const transactionData = {
        name: 'Test USD Transaction',
        amountUSD: 100,
        date: testDate,
        categoryId: categoryId,
        userId: userId
      };
      
      const result = await transactionFactory.create(transactionData);
      
      // Verify the result
      expect(result).toHaveProperty('monthId');
      expect(result.name).toBe(transactionData.name);
      expect(result.amountCAD).toBeGreaterThan(0); // CAD amount should be converted
      expect(result.amountUSD).toBe(100);
      
      // Verify the month matches
      const month = await prisma.month.findUnique({
        where: { id: result.monthId }
      });
      expect(month).not.toBeNull();
    });
    
    it('should reuse existing month record', async () => {
      // First, create a transaction to ensure a month exists
      const testDate = new Date();
      await transactionFactory.create({
        name: 'First Transaction',
        amountCAD: 50,
        date: testDate,
        categoryId: categoryId,
        userId: userId
      });
      
      // Count initial months
      const initialMonthCount = await prisma.month.count();
      
      // Create a second transaction with the same month/year
      const result = await transactionFactory.create({
        name: 'Second Transaction',
        amountCAD: 75,
        date: testDate,
        categoryId: categoryId,
        userId: userId
      });
      
      // Count final months - should be the same
      const finalMonthCount = await prisma.month.count();
      expect(finalMonthCount).toBe(initialMonthCount);
      
      // Verify month was reused
      const month = await prisma.month.findUnique({
        where: { id: result.monthId }
      });
      expect(month).not.toBeNull();
      expect(month?.month).toBe(testDate.getMonth() + 1);
      expect(month?.year).toBe(testDate.getFullYear());
    });
    
    it('should create a new month record when needed', async () => {
      // Create a transaction with a different date (next month)
      const currentDate = new Date();
      const nextMonthDate = new Date();
      nextMonthDate.setMonth(currentDate.getMonth() + 1);
      
      // Count initial months
      const initialMonthCount = await prisma.month.count();
      
      // Create a transaction with a new month
      const result = await transactionFactory.create({
        name: 'Next Month Transaction',
        amountCAD: 100,
        date: nextMonthDate,
        categoryId: categoryId,
        userId: userId
      });
      
      // Count final months - should be increased
      const finalMonthCount = await prisma.month.count();
      expect(finalMonthCount).toBeGreaterThan(initialMonthCount);
      
      // Verify the month has correct data
      const month = await prisma.month.findUnique({
        where: { id: result.monthId }
      });
      expect(month).not.toBeNull();
      expect(month?.month).toBe(nextMonthDate.getMonth() + 1);
      expect(month?.year).toBe(nextMonthDate.getFullYear());
    });
    
    it('should handle errors gracefully', async () => {
      // Create a transaction with an invalid date to cause an error
      const invalidTransaction = {
        name: 'Invalid Transaction',
        amountCAD: 100,
        date: null as unknown as Date, // Force a type error to cause DB failure
        categoryId: categoryId,
        userId: userId
      };
      
      // Expect the creation to throw an error
      await expect(transactionFactory.create(invalidTransaction))
        .rejects.toThrow();
    });
  });
}); 