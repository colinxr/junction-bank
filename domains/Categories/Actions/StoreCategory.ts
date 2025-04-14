import { ICategoryRepository } from '../ICategoryRepository';
import { Category } from '../Category';
import { CreateCategoryDTO } from '../CategoryDTO';
import { CategoryAlreadyExistsException } from '../CategoryException';

export class StoreCategory {
  constructor(private categoryRepository: ICategoryRepository) {}
  
  async execute(data: CreateCategoryDTO): Promise<Category> {
    // Check if category already exists
    const exists = await this.categoryRepository.findByName(data.name);
    if (exists) {
      throw new CategoryAlreadyExistsException(data.name);
    }

    // Create the domain entity (validate business rules)
    const category = Category.create({
      name: data.name,
      type: data.type,
      notes: data.notes
    });
    
    // Persist through repository
    return this.categoryRepository.store(category);
  }
} 