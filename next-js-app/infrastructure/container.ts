import { prisma } from '@/infrastructure/prisma';
import { redis } from '@/infrastructure/redis' ; 

// Categories
import { ICategoryRepository } from '@/domains/Categories/ICategoryRepository';
import { CategoryRepository } from '@/domains/Categories/CategoryRepository';
import { IndexCategories } from '@/domains/Categories/Actions/IndexCategories';
import { ShowCategory } from '@/domains/Categories/Actions/ShowCategory';
import { StoreCategory } from '@/domains/Categories/Actions/StoreCategory';
import { DeleteCategory } from '@/domains/Categories/Actions/DeleteCategory';

// Currency Domain
import { IExchangeRateApiService } from '@/domains/Currency/Service/IExchangeRateApiService';
import { CurrencyService } from '@/domains/Currency/Service/CurrencyService';
import { ExchangeRateApiService } from '@/domains/Currency/Service/ExchangeRateApiService';
import { GetUsdToCadRate } from '@/domains/Currency/Actions/GetUsdToCadRate';
import { ConvertUsdToCad } from '@/domains/Currency/Actions/ConvertUsdToCad';

// Months
import { IMonthRepository } from '@/domains/Months/IMonthRepository';
import { MonthRepository } from '@/domains/Months/MonthRepository';
import { IndexMonths } from '@/domains/Months/Actions/IndexMonths';
import { ShowMonth } from '@/domains/Months/Actions/ShowMonth';
import { FindMonthByDate } from '@/domains/Months/Actions/FindMonthByDate';
import { StoreMonth } from '@/domains/Months/Actions/StoreMonth';
import { UpdateMonth } from '@/domains/Months/Actions/UpdateMonth';
import { DestroyMonth } from '@/domains/Months/Actions/DestroyMonth'; 
import { GetMonthlySpendingByCategory } from '@/domains/Months/Actions/GetMonthlySpendingByCategory';
import { ShowLatestMonth } from '@/domains/Months/Actions/ShowLatestMonth';
import { RecalculateRecurringExpenses } from '@/domains/Months/Actions/RecalculateRecurringExpenses';

// Recurring Transactions
import { IRecurringTransactionRepository } from '@/domains/RecurringTransactions/IRecurringTransactionRepository';
import { RecurringTransactionRepository } from '@/domains/RecurringTransactions/RecurringTransactionRepository';
import { IndexRecurringTransactions } from '@/domains/RecurringTransactions/Actions/IndexRecurringTransactions';
import { ShowRecurringTransaction } from '@/domains/RecurringTransactions/Actions/ShowRecurringTransaction';
import { StoreRecurringTransaction } from '@/domains/RecurringTransactions/Actions/StoreRecurringTransaction';
import { UpdateRecurringTransaction } from '@/domains/RecurringTransactions/Actions/UpdateRecurringTransaction';
import { DeleteRecurringTransaction } from '@/domains/RecurringTransactions/Actions/DeleteRecurringTransaction';

// Transactions
import { ITransactionRepository } from '@/domains/Transactions/Repositories/ITransactionRepository';
import { TransactionRepository } from '@/domains/Transactions/Repositories/TransactionRepository';
import { IndexTransactions } from '@/domains/Transactions/Actions/IndexTransactions';
import { StoreTransaction } from '@/domains/Transactions/Actions/StoreTransaction';
import { ShowTransaction } from '@/domains/Transactions/Actions/ShowTransaction';
import { UpdateTransaction } from '@/domains/Transactions/Actions/UpdateTransaction';
import { DeleteTransaction } from '@/domains/Transactions/Actions/DeleteTransaction';

// Transaction Import
import { TransactionImportService } from '@/domains/Transactions/Services/TransactionImportService';
import { ImportTransactions } from '@/domains/Transactions/Actions/ImportTransactions';
import { BatchStoreTransactions } from '@/domains/Transactions/Actions/BatchStoreTransactions';
import { PreviewTransactions } from '@/domains/Transactions/Actions/PreviewTransactions';
import { ProcessTransactionImport } from '@/domains/Transactions/Actions/ProcessTransactionImport';

// Singleton repositories
const categoryRepository: ICategoryRepository = new CategoryRepository(prisma, redis);
const monthRepository: IMonthRepository = new MonthRepository(prisma, redis);
const transactionRepository: ITransactionRepository = new TransactionRepository(prisma, redis);
const recurringTransactionRepository: IRecurringTransactionRepository = new RecurringTransactionRepository(prisma);

// Singleton services
const exchangeRateService: IExchangeRateApiService = new ExchangeRateApiService();

// Factory functions for actions
export const makeCategoryActions = () => {
  return {
    index: new IndexCategories(categoryRepository),
    show: new ShowCategory(categoryRepository),
    store: new StoreCategory(categoryRepository),
    delete: new DeleteCategory(categoryRepository)
  };
};

export const makeCurrencyActions = () => {
  return {
    getUsdToCadRate: new GetUsdToCadRate(exchangeRateService),
    convertUsdToCad: new ConvertUsdToCad(),
  };
};

// Factory functions for month actions
export const makeMonthActions = () => {
  return {
    index: new IndexMonths(monthRepository),
    show: new ShowMonth(monthRepository),
    store: new StoreMonth(monthRepository),
    findByDate: new FindMonthByDate(monthRepository),
    update: new UpdateMonth(monthRepository),
    delete: new DestroyMonth(monthRepository),
    showLatest: new ShowLatestMonth(monthRepository),
    recalculateRecurringExpenses: new RecalculateRecurringExpenses(monthRepository)
  };
}; 

const currencyService: CurrencyService = new CurrencyService();
export const makeRecurringTransactionActions = () => {
  return {
    index: new IndexRecurringTransactions(recurringTransactionRepository),
    show: new ShowRecurringTransaction(recurringTransactionRepository),
    store: new StoreRecurringTransaction(recurringTransactionRepository, currencyService),
    update: new UpdateRecurringTransaction(recurringTransactionRepository, currencyService),
    delete: new DeleteRecurringTransaction(recurringTransactionRepository)
  };
};

export const makeTransactionActions = () => {
  const transactionImportService = new TransactionImportService(monthRepository);
  const importTransactions = new ImportTransactions(transactionImportService, categoryRepository);
  const batchStoreTransactions = new BatchStoreTransactions(transactionRepository);
  
  return {
    index: new IndexTransactions(transactionRepository),
    show: new ShowTransaction(transactionRepository),
    store: new StoreTransaction(transactionRepository),
    update: new UpdateTransaction(transactionRepository),
    destroy: new DeleteTransaction(transactionRepository),
    getSpendingByCategory: new GetMonthlySpendingByCategory(transactionRepository),
    import: importTransactions,
    batchStore: batchStoreTransactions,
    preview: new PreviewTransactions(transactionImportService),
    processImport: new ProcessTransactionImport(importTransactions, batchStoreTransactions)
  };
};


