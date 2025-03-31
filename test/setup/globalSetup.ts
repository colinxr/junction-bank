import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

export async function setup() {
  console.log('\n🕒 Starting global test setup: Applying migrations...');

  const envPath = path.resolve(process.cwd(), '.env.test');

  // Optional: Check if .env.test exists
  if (!fs.existsSync(envPath)) {
    console.warn(`\n⚠️ Warning: '.env.test' file not found at ${envPath}. Proceeding with existing environment variables or defaults.`);
    // You might want to throw an error here if .env.test is critical
    // throw new Error(`.env.test file not found at ${envPath}`);
  } else {
    console.log(`📄 Using environment file: ${envPath}`);
  }


  const command = `dotenv -e .env.test -- npx prisma migrate deploy`;

  try {
    // Execute the command to apply migrations using .env.test
    // stdio: 'inherit' allows migration output (and errors) to be shown in the console
    execSync(command, { stdio: 'inherit' });
    console.log('✅ Prisma migrations applied successfully using .env.test.');

  } catch (error) {
    console.error('\n❌ Failed to apply Prisma migrations for the test database.');
    // It's crucial to re-throw the error to stop the test run if migrations fail
    throw error;
  }

  console.log('🏁 Global test setup finished.');
}

export async function teardown() {
  console.log('🧹 Global test teardown...');
    // e.g., delete the test database file if desired
    try {
      const dbPath = path.resolve(process.cwd(), 'prisma', 'test.db'); // Adjust path as needed
      if (fs.existsSync(dbPath)) {
        fs.unlinkSync(dbPath);
        console.log('🗑️ Test database file deleted.');
      }
    } catch (err) {
      console.error('❌ Failed to delete test database file:', err);
    }
} 