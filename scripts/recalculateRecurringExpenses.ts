/**
 * Script to recalculate recurring expenses for all months or a specific month
 * 
 * Usage: 
 *   npm run recalculate-recurring
 *   npm run recalculate-recurring -- --month-id=123
 */

import { PrismaClient } from '@prisma/client';

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
  
  // Initialize Prisma client
  const prisma = new PrismaClient();
  
  try {
    // First, ensure the is_recurring flag is correctly set for relevant categories
    console.log('🔄 Ensuring categories are correctly marked as recurring...');
    await prisma.$executeRaw`
      UPDATE categories 
      SET is_recurring = true 
      WHERE (name ILIKE 'rent' OR name ILIKE 'bills')
      AND is_recurring = false
    `;

    // Output which categories are marked as recurring
    const recurringCategories = await prisma.$queryRaw`
      SELECT id, name, is_recurring 
      FROM categories 
      WHERE is_recurring = true
    `;
    
    console.log('📋 Categories marked as recurring:');
    console.table(recurringCategories);

    // Recalculate recurring expenses
    if (monthId) {
      console.log(`🔄 Recalculating recurring expenses for month ID: ${monthId}...`);
      
      // Update recurring expenses for the specific month
      await prisma.$executeRaw`
        UPDATE months m
        SET recurring_expenses = (
          SELECT COALESCE(SUM(t.amount_cad), 0)
          FROM transactions t
          JOIN categories c ON t.category_id = c.id
          WHERE t.month_id = ${monthId}
          AND c.is_recurring = true
          AND t.type = 'Expense'
        )
        WHERE m.id = ${monthId}
      `;
      
      // Display the updated month details
      const updatedMonth = await prisma.$queryRaw`
        SELECT 
          m.id, 
          m.month, 
          m.year, 
          m.total_expenses, 
          m.recurring_expenses,
          (m.total_expenses - m.recurring_expenses) AS non_recurring_expenses
        FROM months m
        WHERE m.id = ${monthId}
      `;
      
      console.log('📊 Updated month details:');
      console.table(updatedMonth);
    } else {
      console.log('🔄 Recalculating recurring expenses for all months...');
      
      // Update recurring expenses for all months
      await prisma.$executeRaw`
        UPDATE months m
        SET recurring_expenses = (
          SELECT COALESCE(SUM(t.amount_cad), 0)
          FROM transactions t
          JOIN categories c ON t.category_id = c.id
          WHERE t.month_id = m.id
          AND c.is_recurring = true
          AND t.type = 'Expense'
        )
      `;
      
      // Display a summary of updated months
      const updatedMonths = await prisma.$queryRaw`
        SELECT 
          m.id, 
          m.month, 
          m.year, 
          m.total_expenses, 
          m.recurring_expenses,
          (m.total_expenses - m.recurring_expenses) AS non_recurring_expenses
        FROM months m
        ORDER BY m.year DESC, m.month DESC
        LIMIT 10
      `;
      
      console.log('📊 Updated months (showing up to 10 most recent):');
      console.table(updatedMonths);
    }

    // Verify that the trigger exists
    const trigger = await prisma.$queryRaw`
      SELECT 
        trigger_name, 
        event_manipulation, 
        action_statement
      FROM information_schema.triggers
      WHERE event_object_table = 'transactions'
      AND trigger_name = 'update_recurring_expenses_trigger'
    `;
    
    if (Array.isArray(trigger) && trigger.length > 0) {
      console.log('✅ Verified the recurring expenses trigger is active');
    } else {
      console.warn('⚠️ The recurring expenses trigger is not found! Future transactions may not update recurring expenses automatically.');
    }
    
    console.log('✅ Successfully completed recurring expenses recalculation');
  } catch (error) {
    console.error('❌ Error recalculating recurring expenses:', error);
    process.exit(1);
  } finally {
    // Clean up
    await prisma.$disconnect();
  }
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Script failed with error:', error);
    process.exit(1);
  }); 