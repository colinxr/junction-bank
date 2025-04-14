import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis' ; 

// Categories
import { ICategoryRepository } from '@/domains/Categories/ICategoryRepository';
import { CategoryRepository } from '@/domains/Categories/CategoryRepository';
import { IndexCategories } from '@/domains/Categories/Actions/IndexCategories';
import { ShowCategory } from '@/domains/Categories/Actions/ShowCategory';
import { StoreCategory } from '@/domains/Categories/Actions/StoreCategory';
import { DeleteCategory } from '@/domains/Categories/Actions/DeleteCategory';

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

// Transactions
import { ITransactionRepository } from '@/domains/Transactions/ITransactionRepository';
import { TransactionRepository } from '@/domains/Transactions/TransactionRepository';
import { IndexTransactions } from '@/domains/Transactions/Actions/IndexTransactions';
import { StoreTransaction } from '@/domains/Transactions/Actions/StoreTransaction';
import { ShowTransaction } from '@/domains/Transactions/Actions/ShowTransaction';
import { UpdateTransaction } from '@/domains/Transactions/Actions/UpdateTransaction';
import { DeleteTransaction } from '@/domains/Transactions/Actions/DeleteTransaction';

// Currency Conversion
import { ICurrencyConversionService } from '@/domains/Shared/ICurrencyConversionService';
import { CurrencyConversionService } from '@/domains/Shared/CurrencyConversionService';

// Recurring Transactions
import { IRecurringTransactionRepository } from '@/domains/RecurringTransactions/IRecurringTransactionRepository';
import { RecurringTransactionRepository } from '@/domains/RecurringTransactions/RecurringTransactionRepository';
import { IndexRecurringTransactions } from '@/domains/RecurringTransactions/Actions/IndexRecurringTransactions';
import { ShowRecurringTransaction } from '@/domains/RecurringTransactions/Actions/ShowRecurringTransaction';
import { StoreRecurringTransaction } from '@/domains/RecurringTransactions/Actions/StoreRecurringTransaction';
import { UpdateRecurringTransaction } from '@/domains/RecurringTransactions/Actions/UpdateRecurringTransaction';
import { DeleteRecurringTransaction } from '@/domains/RecurringTransactions/Actions/DeleteRecurringTransaction';

// Singleton repositories
const categoryRepository: ICategoryRepository = new CategoryRepository(prisma);
const monthRepository: IMonthRepository = new MonthRepository(prisma);
const transactionRepository: ITransactionRepository = new TransactionRepository(prisma, redis);
const recurringTransactionRepository: IRecurringTransactionRepository = new RecurringTransactionRepository(prisma);

// Singleton services
const currencyService: ICurrencyConversionService = new CurrencyConversionService();

// Factory functions for use cases
export const makeCategoryUseCases = () => {
  return {
    index: new IndexCategories(categoryRepository),
    show: new ShowCategory(categoryRepository),
    store: new StoreCategory(categoryRepository),
    delete: new DeleteCategory(categoryRepository)
  };
};

// Factory functions for month use cases
export const makeMonthUseCases = () => {
  return {
    index: new IndexMonths(monthRepository),
    show: new ShowMonth(monthRepository),
    findByDate: new FindMonthByDate(monthRepository),
    store: new StoreMonth(monthRepository),
    update: new UpdateMonth(monthRepository),
    delete: new DestroyMonth(monthRepository),
  };
}; 

export const makeTransactionUseCases = () => {
  return {
    index: new IndexTransactions(transactionRepository),
    store: new StoreTransaction(transactionRepository, monthRepository, currencyService),
    show: new ShowTransaction(transactionRepository),
    update: new UpdateTransaction(transactionRepository),
    destroy: new DeleteTransaction(transactionRepository),
    getSpendingByCategory: new GetMonthlySpendingByCategory(transactionRepository)
  };
};

export const makeRecurringTransactionUseCases = () => {
  return {
    index: new IndexRecurringTransactions(recurringTransactionRepository),
    show: new ShowRecurringTransaction(recurringTransactionRepository),
    store: new StoreRecurringTransaction(recurringTransactionRepository),
    update: new UpdateRecurringTransaction(recurringTransactionRepository),
    delete: new DeleteRecurringTransaction(recurringTransactionRepository)
  };
};