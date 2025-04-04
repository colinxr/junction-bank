import { prisma } from '@/lib/prisma';
import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import { CategoryRepository } from '../repositories/prisma/CategoryRepository';
import { IndexCategoryUseCase } from '../../application/useCases/category/IndexCategoriesUseCase';
import { ShowCategoryUseCase } from '../../application/useCases/category/ShowCategoryUseCase';
import { StoreCategoryUseCase } from '../../application/useCases/category/StoreCategoryUseCase';
import { DeleteCategoryUseCase } from '../../application/useCases/category/DeleteCategoryUseCase';

// Singleton repositories
const categoryRepository: ICategoryRepository = new CategoryRepository(prisma);

// Factory functions for use cases
export const makeCategoryUseCases = () => {
  return {
    index: new IndexCategoryUseCase(categoryRepository),
    show: new ShowCategoryUseCase(categoryRepository),
    store: new StoreCategoryUseCase(categoryRepository),
    delete: new DeleteCategoryUseCase(categoryRepository)
  };
}; 