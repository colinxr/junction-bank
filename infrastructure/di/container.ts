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

// Recurring Transactions
import { IRecurringTransactionRepository } from '@/domains/RecurringTransactions/IRecurringTransactionRepository';
import { RecurringTransactionRepository } from '@/domains/RecurringTransactions/RecurringTransactionRepository';
import { IndexRecurringTransactions } from '@/domains/RecurringTransactions/Actions/IndexRecurringTransactions';
import { ShowRecurringTransaction } from '@/domains/RecurringTransactions/Actions/ShowRecurringTransaction';
import { StoreRecurringTransaction } from '@/domains/RecurringTransactions/Actions/StoreRecurringTransaction';
import { UpdateRecurringTransaction } from '@/domains/RecurringTransactions/Actions/UpdateRecurringTransaction';
import { DeleteRecurringTransaction } from '@/domains/RecurringTransactions/Actions/DeleteRecurringTransaction';

// Transactions
import { ITransactionRepository } from '@/domains/Transactions/ITransactionRepository';
import { TransactionRepository } from '@/domains/Transactions/TransactionRepository';
import { IndexTransactions } from '@/domains/Transactions/Actions/IndexTransactions';
import { StoreTransaction } from '@/domains/Transactions/Actions/StoreTransaction';
import { ShowTransaction } from '@/domains/Transactions/Actions/ShowTransaction';
import { UpdateTransaction } from '@/domains/Transactions/Actions/UpdateTransaction';
import { DeleteTransaction } from '@/domains/Transactions/Actions/DeleteTransaction';

// Singleton repositories
const categoryRepository: ICategoryRepository = new CategoryRepository(prisma, redis);
const monthRepository: IMonthRepository = new MonthRepository(prisma, redis);
const transactionRepository: ITransactionRepository = new TransactionRepository(prisma, redis);
const recurringTransactionRepository: IRecurringTransactionRepository = new RecurringTransactionRepository(prisma);

// Singleton services
const exchangeRateService: IExchangeRateApiService = new ExchangeRateApiService();

// Factory functions for use cases
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

// Factory functions for month use cases
export const makeMonthUseCases = () => {
  return {
    index: new IndexMonths(monthRepository),
    show: new ShowMonth(monthRepository),
    store: new StoreMonth(monthRepository),
    findByDate: new FindMonthByDate(monthRepository),
    update: new UpdateMonth(monthRepository),
    delete: new DestroyMonth(monthRepository),
  };
}; 

const currencyService: CurrencyService = new CurrencyService(exchangeRateService);
export const makeRecurringTransactionUseCases = () => {
  return {
    index: new IndexRecurringTransactions(recurringTransactionRepository),
    show: new ShowRecurringTransaction(recurringTransactionRepository),
    store: new StoreRecurringTransaction(recurringTransactionRepository, currencyService),
    update: new UpdateRecurringTransaction(recurringTransactionRepository, currencyService),
    delete: new DeleteRecurringTransaction(recurringTransactionRepository)
  };
};

export const makeTransactionUseCases = () => {
  return {
    index: new IndexTransactions(transactionRepository),
    show: new ShowTransaction(transactionRepository),
    store: new StoreTransaction(transactionRepository, monthRepository, currencyService),
    update: new UpdateTransaction(transactionRepository, currencyService),
    destroy: new DeleteTransaction(transactionRepository),
    getSpendingByCategory: new GetMonthlySpendingByCategory(transactionRepository)
  };
};


