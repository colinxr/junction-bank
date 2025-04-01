import { PrismaClient } from '@prisma/client';
import { TransactionFactory } from '../lib/factories/transaction.factory';
import { CurrencyService } from '../lib/services/currency.service';

const prisma = new PrismaClient();
const currencyService = new CurrencyService();
const transactionFactory = new TransactionFactory(prisma, currencyService);

// Parse MM/DD/YYYY format to Date object
function parseDate(dateStr: string): Date {
  const [month, day, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
}

// Function to get default user ID (first user in the system)
async function getDefaultUserId(): Promise<string> {
  const user = await prisma.user.findFirst();
  if (!user) {
    throw new Error('No users found in the database. Please create a user first.');
  }
  return user.id;
}

async function seedTransactions() {
  console.log('🌱 Starting transaction seeding...');
  
  try {
    // Get default user ID
    const userId = await getDefaultUserId();
    console.log(`Using user ID: ${userId}`);
    
    // CSV data from the provided input (converted to structured format)
    const transactionData = [
      { date: '03/24/2025', name: 'UBER TRIP 8005928996 CA', amount: 28.87, categoryId: 28 },
      { date: '03/24/2025', name: 'SQ KISO LOS ANGELES CA', amount: 31.2, categoryId: 33 },
      { date: '03/24/2025', name: 'UBER TRIP 8005928996 CA', amount: 1, categoryId: 28 },
      { date: '03/24/2025', name: 'TRADER JO TRADER JOES TOLUCA LAKE CA', amount: 40.88, categoryId: 24 },
      { date: '03/24/2025', name: 'SUPER KING MKT LOS ANGELES CA', amount: 29.75, categoryId: 24 },
      { date: '03/24/2025', name: 'CVS PHARM 09669 2530 LOS ANGELES CA', amount: 2.18, categoryId: 29 },
      { date: '03/24/2025', name: 'CVS PHARM 09669 2530 LOS ANGELES CA', amount: 14.54, categoryId: 29 },
      { date: '03/24/2025', name: 'SQ BRU COFFEEBAR LOS FELIZ CA', amount: 4.75, categoryId: 23 },
      { date: '03/24/2025', name: 'CALIFORNIA SUPERMARKET LOS ANGELES CA', amount: 30.98, categoryId: 24 },
      { date: '03/24/2025', name: 'TOUS LES JOURS LOS ANGELES CA', amount: 6.7, categoryId: 33 },
      { date: '03/24/2025', name: 'ISLAND PACIFIC SUPER LOS ANGELES CA', amount: 37.05, categoryId: 24 },
      { date: '03/24/2025', name: 'AMAZON COM VI6HH6XO3 SEATTLE WA', amount: 52.55, categoryId: 33 },
      { date: '03/24/2025', name: 'AMAZON COM UI1RU3M43 SEATTLE WA', amount: 63.25, categoryId: 33 },
      { date: '03/24/2025', name: 'UCB COMEDY LOS ANGELES CA', amount: 17.25, categoryId: 31 },
      { date: '03/24/2025', name: 'COPYCAT LA LOS ANGELES CA', amount: 2, categoryId: 33 },
      { date: '03/24/2025', name: 'SQ LOS FELIZ LOS ANGELES CA', amount: 16.1, categoryId: 23 },
      { date: '03/24/2025', name: 'LA METRO TAP WEB SAL LOS ANGELES CA', amount: 5, categoryId: 28 },
      { date: '03/21/2025', name: 'TRADER JO TRADER JOES LOS ANGELES CA', amount: 32.78, categoryId: 24 },
      { date: '03/21/2025', name: 'AMAZON COM BF0AM8LB3 SEATTLE WA', amount: 29.02, categoryId: 33 },
      { date: '03/21/2025', name: 'UBER TRIP 8005928996 CA', amount: 10.88, categoryId: 28 },
      { date: '03/21/2025', name: 'UBER TRIP 8005928996 CA', amount: 1, categoryId: 28 },
      { date: '03/21/2025', name: 'UBER TRIP 8005928996 CA', amount: 12.91, categoryId: 28 },
      { date: '03/20/2025', name: 'WEB VENMO PAYMENT', amount: 35.34, categoryId: 33 },
      { date: '03/20/2025', name: 'USPS PO 0 1825 N VERMO LOS ANGELES CA', amount: 49.8, categoryId: 33 },
      { date: '03/20/2025', name: 'UBER TRIP 8005928996 CA', amount: 19.91, categoryId: 28 },
      { date: '03/20/2025', name: 'UBER TRIP 8005928996 CA', amount: 1, categoryId: 28 },
      { date: '03/20/2025', name: 'LYFT RIDE TUE 4PM SAN FRANCISC CA', amount: 36.66, categoryId: 28 },
      { date: '03/20/2025', name: 'UBER TRIP 8005928996 CA', amount: 10.6, categoryId: 28 },
      { date: '03/20/2025', name: 'ALBERTSONS 0387 LOS ANGELES CA', amount: 15.58, categoryId: 24 },
      { date: '03/19/2025', name: 'WEB The Academy of M PAYMENT', amount: 75, categoryId: 22 },
      { date: '03/19/2025', name: 'AMAZON COM LC7621313 SEATTLE WA', amount: 25.17, categoryId: 33 },
      { date: '03/19/2025', name: 'UBER TRIP 8005928996 CA', amount: 1, categoryId: 28 },
      { date: '03/19/2025', name: 'UBER TRIP 8005928996 CA', amount: 10.97, categoryId: 28 },
      { date: '03/19/2025', name: 'ALBERTSONS 0387 LOS ANGELES CA', amount: 38.86, categoryId: 24 },
      { date: '03/19/2025', name: 'ZELLE TO HALEY HERKERT', amount: 35, categoryId: 33 },
      { date: '03/18/2025', name: 'ZELLE FROM NORBLACK NORWHITE INC.', amount: 150, categoryId: 34 }, // Income
      { date: '03/17/2025', name: 'MASABI LAXFLYAWAY 323 310 5292 CA', amount: 9.75, categoryId: 28 },
      { date: '03/17/2025', name: 'AMAZON COM ED4015RF3 SEATTLE WA', amount: 7.65, categoryId: 33 },
      { date: '03/17/2025', name: 'FOOD FOR HEALTH LOS ANGELES CA', amount: 14.76, categoryId: 33 },
      { date: '03/17/2025', name: 'SQ BRU COFFEEBAR LOS FELIZ CA', amount: 16, categoryId: 23 },
      { date: '03/17/2025', name: 'CASH APP KRYS T OAKLAND CA', amount: 20, categoryId: 33 },
      { date: '03/17/2025', name: 'SQ NOW INSTANT LOS ANGELES CA', amount: 5, categoryId: 33 },
      { date: '03/17/2025', name: 'TST PHO 87 LOS ANGELES CA', amount: 23.31, categoryId: 30 },
      { date: '03/17/2025', name: 'TST ALCOVE CAFE LOS ANGELES CA', amount: 15.54, categoryId: 30 },
      { date: '03/14/2025', name: 'DISNEY PLUS RECURRING BURBANK CA', amount: 12, categoryId: 22 },
      { date: '03/14/2025', name: 'LADOT METER PARKING LOS ANGELES CA', amount: 2, categoryId: 28 },
      { date: '03/13/2025', name: 'WEB VENMO PAYMENT', amount: 40, categoryId: 33 },
      { date: '03/13/2025', name: 'HULU SANTA MONICA CA', amount: 18.99, categoryId: 22 },
      { date: '03/13/2025', name: 'SQ SOMISOMI LOS ANGELES CA', amount: 7.95, categoryId: 33 },
      { date: '03/13/2025', name: 'SQ KORAKU GROUP INC LOS ANGELES CA', amount: 41.28, categoryId: 30 },
      { date: '03/13/2025', name: 'UBER TRIP 8005928996 CA', amount: 41.23, categoryId: 28 },
      { date: '03/13/2025', name: 'UBER TRIP 8005928996 CA', amount: 1, categoryId: 28 },
      { date: '03/13/2025', name: 'SQ DONUT FRIEND DTLA LOS ANGELES CA', amount: 13.8, categoryId: 30 },
      { date: '03/13/2025', name: 'LA METRO TAP WEB SAL LOS ANGELES CA', amount: 15, categoryId: 28 },
      { date: '03/12/2025', name: 'GOFNDME IN LOVING MEM JACKSONS POI ON CAN', amount: 0.49, categoryId: 33 },
      { date: '03/12/2025', name: 'WEB VENMO PAYMENT', amount: 22, categoryId: 33 },
      { date: '03/12/2025', name: 'AMAZON COM Q297F9HC3 SEATTLE WA', amount: 10.5, categoryId: 33 },
      { date: '03/12/2025', name: 'TST JENI S SPLENDID I LOS ANGELES CA', amount: 18.36, categoryId: 30 },
      { date: '03/12/2025', name: 'WWW CSCSW COM MELVILLE NY', amount:-5, categoryId: 22 },
      { date: '03/12/2025', name: 'GOFNDME IN LOVING MEM JACKSONS POI ON CAN', amount: 17.4, categoryId: 33 },
      { date: '03/12/2025', name: 'UBER TRIP 8005928996 CA', amount: 10.93, categoryId: 28 },
      { date: '03/11/2025', name: 'IDEEGEO GROUP LTD NAPIER NZL', amount: 1.05, categoryId: 33 },
      { date: '03/11/2025', name: 'UBER TRIP 8005928996 CA', amount: 11.09, categoryId: 28 },
      { date: '03/11/2025', name: 'UBER TRIP 8005928996 CA', amount: 1, categoryId: 28 },
      { date: '03/11/2025', name: 'IDEEGEO GROUP LTD NAPIER NZL', amount: 37.49, categoryId: 33 },
      { date: '03/11/2025', name: 'UBER TRIP 8005928996 CA', amount: 11.94, categoryId: 28 },
      { date: '03/10/2025', name: 'WEB VENMO PAYMENT', amount: 20, categoryId: 33 },
      { date: '03/10/2025', name: 'WHOLEFDS 2520 GLENDAL LOS ANGELES CA', amount: 21.36, categoryId: 24 },
      { date: '03/10/2025', name: 'AMAZON COM BS4UA1MS3 SEATTLE WA', amount: 22.2, categoryId: 33 },
      { date: '03/10/2025', name: 'APPLE COM BILL 866 712 7753 CA', amount: 2.99, categoryId: 22 },
      { date: '03/10/2025', name: 'UBER TRIP 8005928996 CA', amount: 11.59, categoryId: 28 },
      { date: '03/10/2025', name: 'UBER TRIP 8005928996 CA', amount: 1, categoryId: 33 },
      { date: '03/10/2025', name: 'EB WHAT IS A WOMAN A 8014137200 CA', amount: 46.36, categoryId: 31 },
      { date: '03/10/2025', name: 'LA METRO TAP WEB SAL LOS ANGELES CA', amount: 10, categoryId: 28 },
      { date: '03/10/2025', name: 'UBER TRIP 8005928996 CA', amount: 11.96, categoryId: 28 },
      { date: '03/07/2025', name: 'AMAZON COM CF55B56U3 SEATTLE WA', amount: 48.29, categoryId: 33 },
      { date: '03/07/2025', name: 'AMAZON COM 9I5W22UH3 SEATTLE WA', amount: 43.79, categoryId: 33 },
      { date: '03/07/2025', name: 'AMAZON COM Q57QZ3VM3 SEATTLE WA', amount: 8.75, categoryId: 33 },
      { date: '03/07/2025', name: 'AMAZON PRIME VF4MS2YT3 AMZN COM BIL WA', amount: 2.99, categoryId: 33 },
      { date: '03/06/2025', name: 'WEB T-MOBILE PCS SVC', amount: 187.3, categoryId: 22 },
      { date: '03/06/2025', name: 'WEB VENMO PAYMENT', amount: 138.91, categoryId: 33 },
      { date: '03/06/2025', name: 'AMAZON COM EV2PW1NU3 SEATTLE WA', amount: 8.72, categoryId: 33 },
      { date: '03/06/2025', name: 'AMAZON COM 9842F2803 SEATTLE WA', amount: 16.41, categoryId: 33 },
      { date: '03/06/2025', name: 'AMAZON COM JH1OC6853 SEATTLE WA', amount: 37.18, categoryId: 33 },
      { date: '03/06/2025', name: 'AMAZON COM 4O3UE2FW3 SEATTLE WA', amount: 19.7, categoryId: 33 },
      { date: '03/06/2025', name: 'HOUSE OF PIES LOS ANGELES CA', amount: 11.71, categoryId: 20 },
      { date: '03/05/2025', name: 'EB FORREST GUMP A ONE 8014137200 CA', amount: 46.36, categoryId: 31 },
      { date: '03/05/2025', name: 'ALBERTSONS 0387 LOS ANGELES CA', amount: 8.74, categoryId: 24 },
      { date: '03/05/2025', name: 'ISLAND PACIFIC SUPER LOS ANGELES CA', amount: 71.65, categoryId: 24 },
      { date: '03/04/2025', name: 'USPS KIOSK 0545409557 LOS ANGELES CA', amount: 7.3, categoryId: 33 },
      { date: '03/04/2025', name: 'AMAZON COM AK2FA5BG3 SEATTLE WA', amount: 17.51, categoryId: 33 },
      { date: '03/04/2025', name: 'AMAZON COM YA4X671X3 SEATTLE WA', amount: 9.71, categoryId: 33 },
      { date: '03/04/2025', name: 'PRIME VIDEO NN4OO4JZ3 888 802 3080 WA', amount: 3.59, categoryId: 22 },
      { date: '03/04/2025', name: 'ETSY COM BYKKOSEPATTER BROOKLYN NY', amount: 8.36, categoryId: 33 },
      { date: '03/04/2025', name: 'WWW CSCSW COM MELVILLE NY', amount: 5, categoryId: 22 },
      { date: '03/04/2025', name: 'WWW CSCSW COM MELVILLE NY', amount: 10, categoryId: 22 },
      { date: '03/03/2025', name: 'WEB Property Managem WEB PMTS', amount: 2239.9, categoryId: 21 },
      { date: '03/03/2025', name: 'GELSON S MARKET LOS ANGELES CA', amount: 12.02, categoryId: 24 },
      { date: '03/03/2025', name: 'TRADER JO TRADER JOES LOS ANGELES CA', amount: 1.29, categoryId: 24 },
      { date: '03/03/2025', name: 'TRADER JO TRADER JOES LOS ANGELES CA', amount: 31.54, categoryId: 24 },
      { date: '03/03/2025', name: 'UBER TRIP 8005928996 CA', amount: 1, categoryId: 28 },
      { date: '03/03/2025', name: 'CHARGEPOINT INC CAMPBELL CA', amount: 19.95, categoryId: 28 },
      { date: '03/03/2025', name: 'UBER TRIP 8005928996 CA', amount: 18.91, categoryId: 28 },
      { date: '03/03/2025', name: 'UBER TRIP 8005928996 CA', amount: 11.96, categoryId: 28 },
      { date: '03/03/2025', name: 'CONSTELLATION COFFEE LOS ANGELES CA', amount: 8.28, categoryId: 23 },
      { date: '03/03/2025', name: 'UBER TRIP 8005928996 CA', amount: 11.98, categoryId: 28 },
      { date: '03/03/2025', name: 'UBER TRIP 8005928996 CA', amount: 10.84, categoryId: 28 },
      { date: '03/03/2025', name: 'FOR PETS ONLY LOS ANGELES CA', amount: 10.93, categoryId: 33 },
      { date: '03/03/2025', name: 'ZELLE TO DANTE BOONE', amount: 28, categoryId: 33 }
    ];
    
    console.log(`Found ${transactionData.length} transactions to seed`);
    
    // Verify categories exist
    const categoryIds = [...new Set(transactionData.map(t => t.categoryId))];
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } }
    });
    
    const foundCategoryIds = categories.map(c => c.id);
    const missingCategoryIds = categoryIds.filter(id => !foundCategoryIds.includes(id));
    
    if (missingCategoryIds.length > 0) {
      console.warn(`⚠️ Warning: Some categories are missing from the database: ${missingCategoryIds.join(', ')}`);
      console.log('Please create these categories first or update the transaction data.');
      
      // Create missing categories with generic names for testing purposes
      console.log('Creating missing categories with generic names for testing purposes...');
      
      for (const categoryId of missingCategoryIds) {
        await prisma.category.upsert({
          where: { id: categoryId },
          update: {},
          create: {
            id: categoryId,
            name: `Category ${categoryId}`,
            type: categoryId === 34 || categoryId === 1 ? 'income' : 'expense',
            notes: 'Auto-generated category for test data'
          }
        });
      }
      
      console.log('✅ Created missing categories');
    }
    
    // Process transactions
    let successCount = 0;
    let errorCount = 0;
    
    for (const transaction of transactionData) {
      try {
        // Format the data for transaction factory
        const data = {
          name: transaction.name,
          amountUSD: Math.abs(transaction.amount), // Always positive for the factory
          date: parseDate(transaction.date),
          categoryId: transaction.categoryId,
          userId: userId,
          notes: `Imported transaction for ${transaction.date}`
        };
        
        // Create the transaction through the factory
        const formattedData = await transactionFactory.create(data);
        
        // Create the transaction in the database
        await prisma.transaction.create({
          data: formattedData
        });
        
        successCount++;
        
        if (successCount % 10 === 0) {
          console.log(`Progress: ${successCount}/${transactionData.length} transactions created`);
        }
      } catch (error) {
        console.error(`Failed to create transaction: ${transaction.name} (${transaction.date})`, error);
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

// Run the seeder
seedTransactions()
  .catch(e => {
    console.error(e);
    process.exit(1);
  }); 