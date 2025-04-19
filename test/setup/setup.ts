import { newDb } from 'pg-mem';
import { PrismaClient } from '@prisma/client';
import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { resetDatabase } from '../utils/helpers';
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.test file
const envTestPath = path.resolve(process.cwd(), '.env.test');
dotenv.config({ path: envTestPath });

const db = newDb({
  autoCreateForeignKeyIndices: true,
});

// Add PostgreSQL extensions that Prisma requires
db.public.registerFunction({
  name: 'current_database',
  implementation: () => 'test',
});

db.public.registerFunction({
  name: 'version',
  implementation: () => 'PostgreSQL 12.2',
});

// Create a connection string for Prisma
// Get the pg adapter and connection string in two steps
const server = db.adapters.createPg();
// The connection string is accessed from the server instance
const connectionString = server.getConnectionString();

// Override the DATABASE_URL in process.env
process.env.DATABASE_URL = connectionString;

let prisma: PrismaClient;

beforeAll(async () => {
  // Initialize Prisma Client
  prisma = new PrismaClient();
  await prisma.$connect();

  // Log the current database URL to verify we're using the test database
  console.log('\n🔍 Database Connection Check:');
  console.log('DATABASE_URL:', process.env.DATABASE_URL);

  if (!process.env.DATABASE_URL) {
    throw new Error('❌ DATABASE_URL is not defined. Make sure .env.test is being loaded correctly.');
  }

  console.log('✅ Confirmed using in-memory database');

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

beforeEach(async () => {
  // Clear all tables before each test
  const tables = await prisma.$queryRaw`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `;
  
  for (const { tablename } of tables as { tablename: string }[]) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE`);
  }
});

afterAll(async () => {
  // Disconnect Prisma
  await prisma.$disconnect();
});

// Export prisma client for use in tests
export { prisma }; 