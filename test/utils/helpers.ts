import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';


export const resetDatabase = async (prisma: PrismaClient) => {
  // Delete in correct order due to foreign key constraints
  await prisma.$executeRaw`DELETE FROM "transactions";`;
  await prisma.$executeRaw`DELETE FROM "recurring_transactions";`;
  await prisma.$executeRaw`DELETE FROM "categories";`;
  await prisma.$executeRaw`DELETE FROM "months";`;
  await prisma.$executeRaw`DELETE FROM "users";`;

   // Create test data
   try {
    // Create two categories - one for income, one for expense
    await prisma.category.createMany({
      data: [
        {
          name: 'Test Income Category',
          type: 'income', // lowercase to match trigger expectations
          notes: 'Test income category for automated testing'
        },
        {
          name: 'Test Expense Category 2',
          type: 'expense', // lowercase to match trigger expectations
          notes: 'Test expense category for automated testing'
        }
      ]
    });
  } catch (error) {
    console.error('Failed to create test categories:', error);
    throw error;
  }

  try {
    await prisma.user.create({
      data: {
        id: uuidv4(),
        email: 'test@test.com',
        passwordHash: 'password'
      }
    });
  } catch (error) {
    console.error('Failed to create test user:', error);
    throw error;
  }

  try {
    await prisma.month.create({
      data: {
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        notes: 'Test month for automated testing'
      }
    });
  } catch (error) {
    console.error('Failed to create test month:', error);
    throw error;
  }
};

export const createUser = async (prisma: PrismaClient) => {
  const user = await prisma.user.findFirst({
    where: {
      email: 'test@test.com'
    }
  });
  if (user) {
    return user;
  }

  return await prisma.user.create({
    data: {
      id: uuidv4(),
      email: 'test@test.com',
      passwordHash: 'password'
    }
  });
};