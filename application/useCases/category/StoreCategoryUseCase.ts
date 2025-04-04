import { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';
import { Category } from '../../../domain/entities/Category';
import { CreateCategoryDTO } from '../../dtos/category/CategoryDTO';
import { CategoryAlreadyExistsException } from '../../../domain/exceptions/CategoryException';

export class StoreCategoryUseCase {
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