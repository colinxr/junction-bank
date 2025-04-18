/**
 * Script to recalculate recurring expenses for all months or a specific month
 * 
 * Usage: 
 *   npm run recalculate-recurring
 *   npm run recalculate-recurring -- --month-id=123
 */

import { PrismaClient } from '@prisma/client';
import { MonthRepository } from '../domains/Months/MonthRepository';
import { redis, closeRedisConnection } from '../lib/redis';

async function main() {
  console.log('⏳ Starting recurring expenses recalculation...');
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  let monthId: number | undefined;
  
  for (const arg of args) {
    if (arg.startsWith('--month-id=')) {
      const value = arg.split('=')[1];
      monthId = value ? parseInt(value, 10) : undefined;
      
      if (isNaN(monthId as number)) {
        console.error('❌ Invalid month ID provided. Must be a number.');
        process.exit(1);
      }
    }
  }
  
  // Initialize Prisma and repository
  const prisma = new PrismaClient();
  const monthRepository = new MonthRepository(prisma, redis);
  
  try {
    // Recalculate recurring expenses
    await monthRepository.recalculateRecurringExpenses(monthId);
    
    console.log(`✅ Successfully recalculated recurring expenses for ${monthId ? `month ${monthId}` : 'all months'}`);
    
    // If a specific month ID was provided, show the updated values
    if (monthId) {
      const month = await monthRepository.show(monthId);
      if (month) {
        console.log('📊 Updated month details:');
        console.log(`- Month: ${month.month}/${month.year}`);
        console.log(`- Total Expenses: ${month.totalExpenses}`);
        console.log(`- Recurring Expenses: ${month.recurringExpenses}`);
        console.log(`- Non-Recurring Expenses: ${month.getNonRecurringExpenses()}`);
      }
    }
  } catch (error) {
    console.error('❌ Error recalculating recurring expenses:', error);
    process.exit(1);
  } finally {
    // Clean up
    await prisma.$disconnect();
    await closeRedisConnection();
  }
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Script failed with error:', error);
    process.exit(1);
  }); 