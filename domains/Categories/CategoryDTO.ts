export interface CategoryDTO {
  id: number;
  name: string;
  type: string;
  notes?: string;
  createdAt?: string;
}

export interface CreateCategoryDTO {
  name: string;
  type: string;
  notes?: string;
  isRecurring?: boolean;
} 