import { ICategoryRepository } from '../ICategoryRepository';
import { Category } from '../Category';

export class IndexCategories {
  constructor(private categoryRepository: ICategoryRepository) {}
  
  async execute(): Promise<Category[]> {
    return this.categoryRepository.index();
  }
} 