import { prisma } from '@/lib/prisma';
import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import { CategoryRepository } from '../repositories/prisma/CategoryRepository';
import { IndexCategoryUseCase } from '../../application/useCases/category/IndexCategoriesUseCase';
import { ShowCategoryUseCase } from '../../application/useCases/category/ShowCategoryUseCase';
import { StoreCategoryUseCase } from '../../application/useCases/category/StoreCategoryUseCase';
import { DeleteCategoryUseCase } from '../../application/useCases/category/DeleteCategoryUseCase';
import { ITransactionRepository } from '../../domain/repositories/ITransactionRepository';
import { TransactionRepository } from '../repositories/prisma/TransactionRepository';
import { IMonthRepository } from '../../domain/repositories/IMonthRepository';
import { MonthRepository } from '../repositories/prisma/MonthRepository';
import { IndexMonthsUseCase } from '../../application/useCases/month/IndexMonthsUseCase';
import { ShowMonthUseCase } from '../../application/useCases/month/ShowMonthUseCase';
import { FindMonthByDateUseCase } from '../../application/useCases/month/FindMonthByDateUseCase';
import { StoreMonthUseCase } from '../../application/useCases/month/StoreMonthUseCase';
import { UpdateMonthUseCase } from '../../application/useCases/month/UpdateMonthUseCase';
import { DestroyMonthUseCase } from '../../application/useCases/month/DestroyMonthUseCase'; 
import { GetMonthlySpendingByCategoryUseCase } from '../../application/useCases/month/GetMonthlySpendingByCategoryUseCase';
// Singleton repositories
const categoryRepository: ICategoryRepository = new CategoryRepository(prisma);
const monthRepository: IMonthRepository = new MonthRepository(prisma);
const transactionRepository: ITransactionRepository = new TransactionRepository(prisma);

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
    getSpendingByCategory: new GetMonthlySpendingByCategoryUseCase(transactionRepository)
  };
};