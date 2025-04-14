import { Category as PrismaCategory } from '@prisma/client';
import { Category } from './Category';

export class CategoryMapper {
  static toDomain(raw: PrismaCategory): Category {
    return new Category({
      id: raw.id,
      name: raw.name,
      type: raw.type,
      notes: raw.notes || undefined,
      createdAt: raw.createdAt
    });
  }
  
  static toPersistence(category: Omit<Category, 'id' | 'createdAt'>): Omit<PrismaCategory, 'id' | 'createdAt'> {
    return {
      name: category.name,
      type: category.type,
      notes: category.notes || null
    };
  }
  
  static toDTO(domain: Category): any {
    return {
      id: domain.id,
      name: domain.name,
      type: domain.type,
      notes: domain.notes,
      createdAt: domain.createdAt
    };
  }
} 