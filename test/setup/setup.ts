import { PrismaClient } from '@prisma/client';
import { beforeAll, afterAll, beforeEach } from 'vitest';
import { resetDatabase } from '../utils/helpers';
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.test file
const envTestPath = path.resolve(process.cwd(), '.env.test');
dotenv.config({ path: envTestPath });

// Create a single PrismaClient instance to be used across all tests
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

beforeAll(async () => {
  // Log the current database URL to verify we're using the test database
  console.log('\n🔍 Database Connection Check:');
  console.log('DATABASE_URL:', process.env.DATABASE_URL);

  if (!process.env.DATABASE_URL) {
    throw new Error('❌ DATABASE_URL is not defined. Make sure .env.test is being loaded correctly.');
  }

  if (!process.env.DATABASE_URL?.includes('5433')) {
    throw new Error('❌ Tests are not using the test database! Expected port 5433 for test database.');
  }

  console.log('✅ Confirmed using test database');

  try {
    // Test the database connection
    await prisma.$connect();
    console.log('✅ Successfully connected to test database');

    // Enable the UUID extension
    try {
      await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`;
      console.log('✅ UUID extension enabled');
    } catch (error) {
      console.error('❌ Failed to enable UUID extension:', error);
      throw error;
    }

    // Run Prisma migrations
    console.log('📦 Running database migrations...');
    try {
      execSync('npx prisma migrate deploy', {
        env: { ...process.env },
        stdio: 'inherit',
      });
      console.log('✅ Migrations completed successfully\n');
    } catch (error) {
      console.error('❌ Failed to run migrations:', error);
      throw error;
    }
    
    await resetDatabase(prisma);


  } catch (error) {
    console.error('❌ Failed to connect to test database:', error);
    throw error;
  }
});

afterAll(async () => {
  // Disconnect Prisma client after all tests are complete
  await prisma.$disconnect();
}); 