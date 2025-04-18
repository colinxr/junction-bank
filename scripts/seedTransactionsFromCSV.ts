// CommonJS imports to avoid module resolution issues
const { PrismaClient, TransactionType } = require('@prisma/client');
const { TransactionFactory } = require('../lib/factories/transaction.factory');
const { CurrencyService } = require('../lib/services/currency.service');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const prisma = new PrismaClient();
const currencyService = new CurrencyService();
const transactionFactory = new TransactionFactory(prisma, currencyService);

// Parse MM/DD/YYYY format to Date object
function parseDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  
  try {
    // Handle format MM/DD/YYYY
    if (dateStr.includes('/')) {
      const [month, day, year] = dateStr.split('/').map(Number);
      return new Date(year, month - 1, day);
    }
    
    // Fallback to standard Date parsing
    return new Date(dateStr);
  } catch (e) {
    console.warn(`Could not parse date "${dateStr}", using current date instead`);
    return new Date();
  }
}

// Function to get default user ID (first user in the system)
async function getDefaultUserId(): Promise<string> {
  const user = await prisma.user.findFirst();
  if (!user) {
    throw new Error('No users found in the database. Please create a user first.');
  }
  return user.id;
}

// Function to get or validate category ID
async function getCategoryId(categoryValue: string): Promise<number> {
  if (!categoryValue) return 1; // Default category ID if none provided
  
  // Try to parse as an integer first
  const categoryId = parseInt(categoryValue, 10);
  
  // If it's a valid number, verify it exists
  if (!isNaN(categoryId)) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });
    
    if (category) {
      return categoryId;
    }
    
    // If category ID doesn't exist, create a generic one
    console.log(`Category ID ${categoryId} not found. Creating a generic category...`);
    const newCategory = await prisma.category.create({
      data: {
        id: categoryId,
        name: `Category ${categoryId}`,
        type: 'expense', // Default to expense, can be overridden later
        notes: 'Auto-generated category from CSV import'
      }
    });
    
    return newCategory.id;
  }
  
  // If not a valid number, treat as a category name
  const category = await prisma.category.findFirst({
    where: { name: categoryValue }
  });
  
  if (category) {
    return category.id;
  }
  
  // Create a new category if name doesn't exist
  console.log(`Category "${categoryValue}" not found. Creating it...`);
  
  // Determine if it's an income or expense category based on naming conventions or explicit type
  const isIncome = categoryValue.toLowerCase().includes('income') || 
                   categoryValue.toLowerCase().includes('salary') ||
                   categoryValue.toLowerCase().includes('revenue') ||
                   categoryValue.includes('💰');
  
  const newCategory = await prisma.category.create({
    data: {
      name: categoryValue,
      type: isIncome ? 'income' : 'expense',
      notes: 'Auto-generated category from CSV import'
    }
  });
  
  return newCategory.id;
}

// Function to determine transaction type from various sources
function determineTransactionType(transaction: any, categoryType: string) {
  // If the transaction has an explicit type field
  if (transaction.Type && transaction.Type.toLowerCase() === 'income') {
    return TransactionType.Income;
  }
  
  if (transaction.Type && transaction.Type.toLowerCase() === 'expense') {
    return TransactionType.Expense;
  }
  
  // If the amount is negative, it's an expense
  const amount = parseFloat(transaction.Amount || transaction['Amount USD'] || '0');
  if (amount < 0) {
    return TransactionType.Expense;
  }
  
  // Otherwise, use the category type
  return categoryType === 'income' ? TransactionType.Income : TransactionType.Expense;
}

// Function to read and parse CSV file
function readCSV(filePath: string) {
  const fileContent = fs.readFileSync(filePath, { encoding: 'utf-8' });
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });
  
  return records;
}

async function seedTransactionsFromCSV(csvFilePath: string) {
  console.log('🌱 Starting transaction seeding from CSV...');
  
  try {
    // Get default user ID
    const userId = await getDefaultUserId();
    console.log(`Using user ID: ${userId}`);
    
    // Read CSV file
    const transactions = readCSV(csvFilePath);
    console.log(`Found ${transactions.length} transactions in CSV file`);
    
    // Process transactions
    let successCount = 0;
    let errorCount = 0;
    
    for (const transaction of transactions) {
      try {
        // Map CSV fields to transaction data - handle different column name formats
        const categoryValue = transaction.Category || transaction.category || 'Uncategorized';
        const categoryId = await getCategoryId(categoryValue);
        
        // Get the category to determine its type
        const category = await prisma.category.findUnique({ where: { id: categoryId } });
        
        // Check if amount field is present in different formats
        const amountRaw = transaction['Amount USD'] || transaction.Amount || transaction.amount || '0';
        const amount = parseFloat(amountRaw);
        
        // Get transaction name from different possible column names
        const name = transaction.Name || transaction.name || transaction.Description || transaction.description || 'Unnamed Transaction';
        
        // Get date from different possible column names
        const dateValue = transaction.Date || transaction.date || null;
        
        // Format the data for transaction factory
        const data = {
          name,
          amountUSD: Math.abs(amount), // Always positive for the factory
          date: dateValue ? parseDate(dateValue) : new Date(),
          categoryId,
          userId,
          notes: transaction.Notes || transaction.notes || `Imported from CSV on ${new Date().toLocaleDateString()}`
        };
        
        // Create the transaction through the factory
        const formattedData = await transactionFactory.create(data);
        
        // Determine transaction type based on various sources
        let type = determineTransactionType(transaction, category?.type || 'expense');
        
        // Create the transaction in the database
        await prisma.transaction.create({
          data: {
            ...formattedData,
            type
          }
        });
        
        successCount++;
        
        if (successCount % 10 === 0) {
          console.log(`Progress: ${successCount}/${transactions.length} transactions created`);
        }
      } catch (error) {
        console.error(`Failed to create transaction:`, error);
        console.error(`Transaction data:`, transaction);
        errorCount++;
      }
    }
    
    console.log(`✅ Seeding completed. Created ${successCount} transactions.`);
    if (errorCount > 0) {
      console.log(`⚠️ ${errorCount} transactions failed to import.`);
    }
    
  } catch (error) {
    console.error('❌ Seeding failed with error:', error);
  } finally {
    // Disconnect from the database
    await prisma.$disconnect();
  }
}

// Check if CSV file path is provided as command line argument
const csvFilePath = process.argv[2];

if (!csvFilePath) {
  console.error('Please provide the path to the CSV file');
  console.log('Usage: ts-node scripts/seedTransactionsFromCSV.ts path/to/your/file.csv');
  process.exit(1);
}

// Run the seeder
seedTransactionsFromCSV(csvFilePath)
  .catch(e => {
    console.error(e);
    process.exit(1);
  }); 