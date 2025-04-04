import { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';
import { Category } from '../../../domain/entities/Category';
import { CategoryNotFoundException } from '../../../domain/exceptions/CategoryException';

export class ShowCategoryUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}
  
  async execute(id: number): Promise<Category> {
    const category = await this.categoryRepository.findById(id);
    
    if (!category) {
      throw new CategoryNotFoundException(id);
    }
    
    
    return category;
  }
} 