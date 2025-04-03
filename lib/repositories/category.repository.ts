import apiClient from "@/lib/api-client";

import { Category } from "@/app/types";

export const CategoryRepository = {
  async createCategory(categoryData: Partial<Category>) {
    return apiClient.post("/categories", {
      ...categoryData
    });
  },

  async getCategories() {
    return apiClient.get("/categories");
  },

  async getCategory(id: number) {
    return apiClient.get(`/categories/${id}`);
  },

  async deleteCategory(id: number) {
    return apiClient.delete(`/categories/${id}`);
  }
}; 