import { Category } from '../Category';
import { ICategoryRepository } from '../ICategoryRepository';
import { CategoryNotFoundException } from '../CategoryException';

export class ShowCategory {
  constructor(private categoryRepository: ICategoryRepository) {}
  
  async execute(id: number): Promise<Category> {
    const category = await this.categoryRepository.show(id);
    
    if (!category) {
      throw new CategoryNotFoundException(id);
    }
    
    
    return category;
  }
} 