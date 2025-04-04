import { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';
import { Category } from '../../../domain/entities/Category';

export class IndexCategoryUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}
  
  async execute(): Promise<Category[]> {
    return this.categoryRepository.index();
  }
} 