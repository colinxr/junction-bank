import { PrismaClient, TransactionType } from '@prisma/client';
import { CurrencyService } from '../domains/Currency/Service/CurrencyService';

import { Month } from '../domains/Months/Month';
import { MonthRepository } from '../domains/Months/MonthRepository';
import { redis } from '../infrastructure/redis';


const prisma = new PrismaClient();
const currencyService = new CurrencyService();
const monthRepository = new MonthRepository(prisma, redis);

// Sample clerk_id - replace with actual ID when using
const CLERK_ID = 'user_2x6O9NO6VMkEyu2Sm36A2Irz8eC';

async function main() {
  console.log('Starting transaction seeding...');
  
  const transactions = [
    { date: '05/13/2025', name: 'UBER TRIP 8005928996 CA', amountUSD: 10.90, categoryId: 28, type: TransactionType.Expense },
    { date: '05/13/2025', name: 'HULU SANTA MONICA CA', amountUSD: 18.99, categoryId: 22, type: TransactionType.Expense },
    { date: '05/13/2025', name: 'UBER TRIP 8005928996 CA', amountUSD: 1.00, categoryId: 28, type: TransactionType.Expense },
    { date: '05/12/2025', name: 'WEB VENMO PAYMENT', amountUSD: 60.00, categoryId: 33, type: TransactionType.Expense },
    { date: '05/12/2025', name: 'WEB VENMO PAYMENT', amountUSD: 30.00, categoryId: 33, type: TransactionType.Expense },
    { date: '05/12/2025', name: 'UBER TRIP 8005928996 CA', amountUSD: 14.79, categoryId: 28, type: TransactionType.Expense },
    { date: '05/12/2025', name: 'UBER TRIP 8005928996 CA', amountUSD: 11.91, categoryId: 28, type: TransactionType.Expense },
    { date: '05/12/2025', name: 'ALBERTSONS 0387 LOS ANGELES CA', amountUSD: 42.15, categoryId: 24, type: TransactionType.Expense },
    { date: '05/12/2025', name: 'LASSENS NATURAL LOS ANGELES CA', amountUSD: 44.38, categoryId: 24, type: TransactionType.Expense },
    { date: '05/12/2025', name: 'UBER PENDING SAN FRANCISCO CA', amountUSD: 23.31, categoryId: 28, type: TransactionType.Expense },
    { date: '05/12/2025', name: 'UBER TRIP HELP UBER SAN FRANCISCO CA', amountUSD: 15.91, categoryId: 28, type: TransactionType.Expense },
    { date: '05/12/2025', name: 'TST MAGPIES SOFTSERVE LOS ANGELES CA', amountUSD: 19.00, categoryId: 30, type: TransactionType.Expense },
    { date: '05/12/2025', name: 'TST MAGPIES SOFTSERVE LOS ANGELES CA', amountUSD: 9.50, categoryId: 30, type: TransactionType.Expense },
    { date: '05/12/2025', name: 'SQ LOS FELIZ LOS ANGELES CA', amountUSD: 7.50, categoryId: 23, type: TransactionType.Expense },
    { date: '05/12/2025', name: 'WWW CSCSW COM MELVILLE NY', amountUSD: 20.00, categoryId: 22, type: TransactionType.Expense },
    { date: '05/12/2025', name: 'AVALON HOLLYWOOD HOLLYWOOD CA', amountUSD: 21.00, categoryId: 31, type: TransactionType.Expense },
    { date: '05/09/2025', name: 'APPLE COM BILL 866 712 7753 CA', amountUSD: 2.99, categoryId: 22, type: TransactionType.Expense },
    { date: '05/09/2025', name: 'SQ BRU COFFEEBAR LOS FELIZ CA', amountUSD: 9.50, categoryId: 23, type: TransactionType.Expense },
    { date: '05/09/2025', name: 'SQ BRU COFFEEBAR LOS FELIZ CA', amountUSD: 8.15, categoryId: 23, type: TransactionType.Expense },
    { date: '05/08/2025', name: 'WEB VENMO PAYMENT', amountUSD: 106.00, categoryId: 33, type: TransactionType.Expense },
    { date: '05/08/2025', name: 'AMAZON COM NI13V9FF0 SEATTLE WA', amountUSD: 3.39, categoryId: 36, type: TransactionType.Expense },
    { date: '05/08/2025', name: 'UBER TRIP 8005928996 CA', amountUSD: 12.95, categoryId: 28, type: TransactionType.Expense },
    { date: '05/08/2025', name: 'SQ CAFE 1802 BY 1802 LOS ANGELES CA', amountUSD: 13.55, categoryId: 23, type: TransactionType.Expense },
    { date: '05/08/2025', name: 'TST TSUBAKI LOS ANGELES CA', amountUSD: 188.69, categoryId: 27, type: TransactionType.Expense },
    { date: '05/08/2025', name: 'ZELLE FROM NORBLACK NORWHITE INC.', amountUSD: 97.50, categoryId: 34, type: TransactionType.Income },
    { date: '05/08/2025', name: 'TIKTOK SHOP 8888888888 CA', amountUSD: 3.09, categoryId: 40, type: TransactionType.Income },
    { date: '05/07/2025', name: 'UBER TRIP 8005928996 CA', amountUSD: 1.00, categoryId: 28, type: TransactionType.Expense },
    { date: '05/07/2025', name: 'UBER TRIP 8005928996 CA', amountUSD: 18.78, categoryId: 28, type: TransactionType.Expense },
    { date: '05/07/2025', name: 'UBER TRIP 8005928996 CA', amountUSD: 21.96, categoryId: 28, type: TransactionType.Expense },
    { date: '05/07/2025', name: 'UBER TRIP 8005928996 CA', amountUSD: 1.00, categoryId: 28, type: TransactionType.Expense },
    { date: '05/07/2025', name: 'AMAZON PRIME NI3533SR2 AMZN COM BIL WA', amountUSD: 2.99, categoryId: 22, type: TransactionType.Expense },
    { date: '05/07/2025', name: 'AXS COMSOUTHERN CAL 8889297849 CA', amountUSD: 69.14, categoryId: 33, type: TransactionType.Expense },
    { date: '05/07/2025', name: 'SQ STANDING EGG LOS ANGELES CA', amountUSD: 9.07, categoryId: 33, type: TransactionType.Expense },
    { date: '05/07/2025', name: 'CCD STRIPE TRANSFER', amountUSD: .55, categoryId: 34, type: TransactionType.Income },
    { date: '05/06/2025', name: 'WEB T-MOBILE PCS SVC', amountUSD: 187.16, categoryId: 22, type: TransactionType.Expense },
    { date: '05/06/2025', name: 'WEB VENMO PAYMENT', amountUSD: 35.00, categoryId: 33, type: TransactionType.Expense },
    { date: '05/06/2025', name: 'UBER TRIP 8005928996 CA', amountUSD: 10.93, categoryId: 28, type: TransactionType.Expense },
    { date: '05/06/2025', name: 'SQ STANDING EGG LOS ANGELES CA', amountUSD: 8.78, categoryId: 33, type: TransactionType.Expense },
    { date: '05/06/2025', name: 'UBER TRIP 8005928996 CA', amountUSD: 1.00, categoryId: 28, type: TransactionType.Expense },
    { date: '05/05/2025', name: 'NON-BMO ATM FEE', amountUSD: 3.00, categoryId: 33, type: TransactionType.Expense },
    { date: '05/05/2025', name: 'WEB Property Managem WEB PMTS', amountUSD: 2236.62, categoryId: 21, type: TransactionType.Expense },
    { date: '05/05/2025', name: 'WEB VENMO PAYMENT', amountUSD: 133.20, categoryId: 33, type: TransactionType.Expense },
    { date: '05/05/2025', name: 'TRADER JO TRADER JOES LOS ANGELES CA', amountUSD: 56.07, categoryId: 24, type: TransactionType.Expense },
    { date: '05/05/2025', name: 'SQ BRU COFFEEBAR LOS FELIZ CA', amountUSD: 4.50, categoryId: 23, type: TransactionType.Expense },
    { date: '05/05/2025', name: 'UBER TRIP 8005928996 CA', amountUSD: 28.74, categoryId: 28, type: TransactionType.Expense },
    { date: '05/05/2025', name: 'AMAZON COM NB2JU6300 SEATTLE WA', amountUSD: 35.11, categoryId: 37, type: TransactionType.Expense },
    { date: '05/05/2025', name: 'ROJI SUSHI LOS ANGELES CA', amountUSD: 176.46, categoryId: 27, type: TransactionType.Expense },
    { date: '05/05/2025', name: 'AMAZON COM NB0PX5FS0 SEATTLE WA', amountUSD: 16.45, categoryId: 36, type: TransactionType.Expense },
    { date: '05/05/2025', name: 'RITE AID 05435 LOS ANGELES CA', amountUSD: 11.51, categoryId: 29, type: TransactionType.Expense },
    { date: '05/05/2025', name: 'COVELL LOS ANGELES CA', amountUSD: 33.54, categoryId: 31, type: TransactionType.Expense },
    { date: '05/05/2025', name: 'TST HOMESTATE HOLLYWOO LOS ANGELES CA', amountUSD: 23.00, categoryId: 30, type: TransactionType.Expense },
    { date: '05/05/2025', name: 'SQ VISTA THEATER INC LOS ANGELES CA', amountUSD: 45.00, categoryId: 31, type: TransactionType.Expense },
    { date: '05/05/2025', name: 'ALBERTSONS 0387 LOS ANGELES CA', amountUSD: 7.49, categoryId: 24, type: TransactionType.Expense },
    { date: '05/05/2025', name: 'SQ LOS FELIZ LOS ANGELES CA', amountUSD: 24.30, categoryId: 23, type: TransactionType.Expense },
    { date: '05/05/2025', name: 'EVERYBODY LOS ANGELES CA', amountUSD: 4.35, categoryId: 30, type: TransactionType.Expense },
    { date: '05/05/2025', name: 'CHARGEPOINT INC CAMPBELL CA', amountUSD: 19.95, categoryId: 22, type: TransactionType.Expense },
    { date: '05/05/2025', name: '4650 FRANKLIN AVE LOS ANGELES CA', amountUSD: 103.50, categoryId: 13, type: TransactionType.Expense },
    { date: '05/02/2025', name: '99 RANCH 1013 VAN NUYS CA', amountUSD: 78.74, categoryId: 24, type: TransactionType.Expense },
    { date: '05/02/2025', name: '99 RANCH 1013 VAN NUYS CA', amountUSD: 7.29, categoryId: 24, type: TransactionType.Expense },
    { date: '05/02/2025', name: 'EVERYBODY LOS ANGELES CA', amountUSD: 4.35, categoryId: 30, type: TransactionType.Expense },
    { date: '05/01/2025', name: 'LOS FELIZ SHOE REPAIR LOSANGELES CA', amountUSD: 64.90, categoryId: 40, type: TransactionType.Expense },
    { date: '05/01/2025', name: 'EB YOUNGMI MAYER HAIR 8014137200 CA', amountUSD: 42.34, categoryId: 31, type: TransactionType.Expense },
    { date: '05/01/2025', name: 'LA METRO TAP WEB SAL LOS ANGELES CA', amountUSD: 10.00, categoryId: 28, type: TransactionType.Expense },
    { date: '05/01/2025', name: 'PY BOB BAKER MARIONE LOS ANGELES CA', amountUSD: 25.00, categoryId: 31, type: TransactionType.Expense },
    { date: '05/01/2025', name: 'ZELLE TO JORGE CASTRO', amountUSD: 120.00, categoryId: 37, type: TransactionType.Expense },
  ];

  // Get or create months for the transactions
  const uniqueMonths = new Set(transactions.map(t => {
    const [month, day, year] = t.date.split('/');
    return `${month}-${year}`;
  }));

  const monthMap = new Map();

  for (const monthYear of uniqueMonths) {
    const [month, year] = monthYear.split('-').map(Number);
    
    // Check if month exists using the unique compound key
    let dbMonth = await prisma.month.findFirst({
      where: {
        month,
        year
      }
    });

    // Create month if it doesn't exist
    if (!dbMonth) {
      dbMonth = await prisma.month.create({
        data: {
          month,
          year,
        }
      });
    }

    monthMap.set(monthYear, dbMonth.id);
  }

  // Insert transactions
  for (const transaction of transactions) {
    const [month, day, year] = transaction.date.split('/').map(Number);

    // Format date for database
    const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const monthId = await getMonthId(new Date(formattedDate));
    // Process currency amounts using CurrencyService
    const money = await currencyService.processCurrencyAmounts(
      undefined,
      transaction.amountUSD // Use the same value for USD since we don't have separate USD values
    );
    
    await prisma.transaction.create({
      data: {
        clerkId: CLERK_ID,
        monthId: monthId,
        name: transaction.name,
        amountCAD: money.amountCAD ?? 0,
        amountUSD: money.amountUSD ?? 0,
        categoryId: transaction.categoryId,
        notes: '',
        date: new Date(formattedDate),
        type: transaction.type,
      }
    });
  }

  console.log(`Seeded ${transactions.length} transactions successfully`);
}

async function getMonthId(transactionDate: Date): Promise<number> {
    const monthNumber = transactionDate.getMonth() + 1;
    const year = transactionDate.getFullYear();
    
    // Check if month exists
    const monthExists = await monthRepository.findByMonthAndYear(monthNumber, year);
    
    if (monthExists) {
       // Find the month to get its ID
       const monthEntity = await monthRepository.findByDate(monthNumber, year);
       return monthEntity!.id!;
    }

    // Create the month with required properties
    const month = Month.create({
      month: monthNumber,
      year,
      notes: undefined,
      totalIncome: 0,
      totalExpenses: 0
    });
    
    const monthEntity = await monthRepository.store(month);
    return monthEntity.id!;
  }

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 