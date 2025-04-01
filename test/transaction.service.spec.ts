import { describe, it, beforeEach, expect, afterEach, beforeAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { TransactionService } from '../lib/services/transaction.service';
import { createUser, resetDatabase } from './utils/helpers'; // Import the reset function

const prisma = new PrismaClient();

describe('TransactionService', () => {
  let transactionService: TransactionService;
  let userId: string;
  let expenseCategoryId: number;
  let incomeCategoryId: number;
  let monthId: number;

  beforeEach(async () => {
    await resetDatabase(prisma);
    // Initialize the service
    transactionService = new TransactionService(prisma);

    // Get the test categories
    const expenseCategory = await prisma.category.findFirstOrThrow({
      where: { type: 'expense' }
    });
    expenseCategoryId = expenseCategory.id;

    const incomeCategory = await prisma.category.findFirstOrThrow({
      where: { type: 'income' }
    });
    incomeCategoryId = incomeCategory.id;

    // Get the test month
    const month = await prisma.month.findFirstOrThrow();
    monthId = month.id;

    const users = await prisma.user.findMany();
    userId = users[0].id;
  });

  afterEach(async () => {
    await resetDatabase(prisma);
  });

  it('should create a transaction for the authenticated user', async () => {
    const transactionData = {
      name: 'Test Transaction',
      amountCAD: 100,
      amountUSD: 75,
      userId: userId,
      categoryId: expenseCategoryId,
      date: new Date(),
      notes: 'Test notes',
    };
    
    const transaction = await transactionService.create(transactionData);
    expect(transaction).toHaveProperty('id');
    expect(transaction.name).toBe(transactionData.name);
    expect(transaction.userId).toBe(userId);
  });

  it('should create an expense transaction', async () => {
    const data = {
      name: 'Test Expense',
      amountCAD: 100,
      date: new Date(),
      notes: 'Test expense transaction',
      userId,
      categoryId: expenseCategoryId,
      monthId
    };

    console.log('Creating transaction with data:', data);
    const transaction = await transactionService.create(data);
    console.log('Created transaction:', transaction);

    expect(transaction).toHaveProperty('id');
    expect(transaction.name).toBe(data.name);
    expect(transaction.type).toBe('Expense');
  });

  it('should create an income transaction', async () => {
    const data = {
      name: 'Test Income',
      amountCAD: 100,
      date: new Date(),
      notes: 'Test income transaction',
      userId,
      categoryId: incomeCategoryId,
      monthId
    };

    const transaction = await transactionService.create(data);

    expect(transaction).toHaveProperty('id');
    expect(transaction.name).toBe(data.name);
    expect(transaction.type).toBe('Income');
  });

  // Additional tests...
}); 