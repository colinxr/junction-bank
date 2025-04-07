import { prisma } from '@/lib/prisma';

// Categories
import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import { CategoryRepository } from '../repositories/prisma/CategoryRepository';
import { IndexCategoryUseCase } from '../../application/useCases/category/IndexCategoriesUseCase';
import { ShowCategoryUseCase } from '../../application/useCases/category/ShowCategoryUseCase';
import { StoreCategoryUseCase } from '../../application/useCases/category/StoreCategoryUseCase';
import { DeleteCategoryUseCase } from '../../application/useCases/category/DeleteCategoryUseCase';

// Months
import { IMonthRepository } from '../../domain/repositories/IMonthRepository';
import { MonthRepository } from '../repositories/prisma/MonthRepository';
import { IndexMonthsUseCase } from '../../application/useCases/month/IndexMonthsUseCase';
import { ShowMonthUseCase } from '../../application/useCases/month/ShowMonthUseCase';
import { FindMonthByDateUseCase } from '../../application/useCases/month/FindMonthByDateUseCase';
import { StoreMonthUseCase } from '../../application/useCases/month/StoreMonthUseCase';
import { UpdateMonthUseCase } from '../../application/useCases/month/UpdateMonthUseCase';
import { DestroyMonthUseCase } from '../../application/useCases/month/DestroyMonthUseCase'; 
import { GetMonthlySpendingByCategoryUseCase } from '../../application/useCases/month/GetMonthlySpendingByCategoryUseCase';

// Transactions
import { ITransactionRepository } from '../../domain/repositories/ITransactionRepository';
import { TransactionRepository } from '../repositories/prisma/TransactionRepository';
import { StoreTransactionUseCase } from '../../application/useCases/transaction/StoreTransactionUseCase';

// Currency Conversion
import { ICurrencyConversionService } from '../../domain/services/ICurrencyConversionService';
import { CurrencyConversionService } from '../services/CurrencyConversionService';

// Recurring Transactions
import { IRecurringTransactionRepository } from '../../domain/repositories/IRecurringTransactionRepository';
import { RecurringTransactionRepository } from '../repositories/prisma/RecurringTransactionRepository';
import { IndexRecurringTransactionsUseCase } from '../../application/useCases/recurringTransaction/IndexRecurringTransactionsUseCase';
import { ShowRecurringTransactionUseCase } from '../../application/useCases/recurringTransaction/ShowRecurringTransactionUseCase';
import { StoreRecurringTransactionUseCase } from '../../application/useCases/recurringTransaction/StoreRecurringTransactionUseCase';
import { UpdateRecurringTransactionUseCase } from '../../application/useCases/recurringTransaction/UpdateRecurringTransactionUseCase';
import { DeleteRecurringTransactionUseCase } from '../../application/useCases/recurringTransaction/DeleteRecurringTransactionUseCase';

// Singleton repositories
const categoryRepository: ICategoryRepository = new CategoryRepository(prisma);
const monthRepository: IMonthRepository = new MonthRepository(prisma);
const transactionRepository: ITransactionRepository = new TransactionRepository(prisma);
const recurringTransactionRepository: IRecurringTransactionRepository = new RecurringTransactionRepository(prisma);

// Singleton services
const currencyService: ICurrencyConversionService = new CurrencyConversionService();

// Factory functions for use cases
export const makeCategoryUseCases = () => {
  return {
    index: new IndexCategoryUseCase(categoryRepository),
    show: new ShowCategoryUseCase(categoryRepository),
    store: new StoreCategoryUseCase(categoryRepository),
    delete: new DeleteCategoryUseCase(categoryRepository)
  };
};

// Factory functions for month use cases
export const makeMonthUseCases = () => {
  return {
    index: new IndexMonthsUseCase(monthRepository),
    show: new ShowMonthUseCase(monthRepository),
    findByDate: new FindMonthByDateUseCase(monthRepository),
    store: new StoreMonthUseCase(monthRepository),
    update: new UpdateMonthUseCase(monthRepository),
    delete: new DestroyMonthUseCase(monthRepository),
  };
}; 

export const makeTransactionUseCases = () => {
  return {
    store: new StoreTransactionUseCase(transactionRepository, monthRepository, currencyService),
    getSpendingByCategory: new GetMonthlySpendingByCategoryUseCase(transactionRepository)
  };
};

export const makeRecurringTransactionUseCases = () => {
  return {
    index: new IndexRecurringTransactionsUseCase(recurringTransactionRepository),
    show: new ShowRecurringTransactionUseCase(recurringTransactionRepository),
    store: new StoreRecurringTransactionUseCase(recurringTransactionRepository),
    update: new UpdateRecurringTransactionUseCase(recurringTransactionRepository),
    delete: new DeleteRecurringTransactionUseCase(recurringTransactionRepository)
  };
};