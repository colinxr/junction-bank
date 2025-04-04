import { Category } from '../entities/Category';

export interface ICategoryRepository {
  index(): Promise<Category[]>;
  show(id: number): Promise<Category | null>;
  store(category: Omit<Category, 'id' | 'createdAt'>): Promise<Category>;
  destroy(id: number): Promise<void>;
  findByName(name: string): Promise<boolean>;
  hasTransactions(id: number): Promise<{hasTransactions: boolean, count: number}>;
} 