import useSWR, { mutate } from 'swr';
import { useState } from 'react';
import { toast } from 'sonner';
import { Category } from '@/lib/repositories/category.repository';
import { CategoryRepository } from '@/lib/repositories/category.repository';

const API_URL = '/api/categories';

// Fetcher function
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('Failed to fetch categories');
    error.message = await res.text();
    throw error;
  }
  return res.json();
};

// Hook for fetching a single category
export function useCategoryDetail(id: number) {
  const { data, error, isLoading } = useSWR(`${API_URL}/${id}`, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000, // 30 seconds
  });

  return {
    categoryDetail: data,
    error,
    isLoading,
  };
}

export function useCategories() {
  // SWR hook for data fetching
  const { data, error, isLoading, mutate } = useSWR(
    API_URL,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1 minute
    }
  );
  
  // Method to create a new category
  const createCategory = async (categoryData: Partial<Category>) => {
    try {
      // Optimistically update the local data first
      const optimisticData = {
        ...data,
        data: [
          // Add optimistic category to the start of the array
          {
            id: 'temp-id-' + Date.now(),
            ...categoryData,
            // Add any default fields needed for rendering
          },
          ...(data?.data || []),
        ],
      };
      
      // Update the cache optimistically and revalidate
      mutate(optimisticData, false);
      
      // Use the repository to create the category
      const response = await CategoryRepository.createCategory(categoryData);
      
      // Revalidate the data to get the actual server response
      mutate();
      
      toast.success('Category created successfully');
      return response.data;
    } catch (error) {
      // If there was an error, revalidate to restore the correct data
      mutate();
      console.error("Error creating category:", error);
      toast.error("Failed to create category. Please try again.");
      throw error;
    }
  };
  
  // Method to delete a category
  const deleteCategory = async (id: number) => {
    try {
      toast.success(`Deleting category ID: ${id}`);
      
      // Optimistically update UI before the API call
      const optimisticData = {
        ...data,
        data: data?.data?.filter((item: Category) => item.id !== id) || [],
      };
      
      // Update the cache optimistically
      mutate(optimisticData, false);
      
      // Use the repository to delete the category
      await CategoryRepository.deleteCategory(id);
      
      // Revalidate to get the server data
      mutate((key: string) => key.startsWith(API_URL));

      toast.success('Category deleted successfully');
      return true;
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category. Please try again.");
      // Revalidate to restore the correct data
      mutate();
      return false;
    }
  };

  const getCategory = async (id: number) => {
    const response = await CategoryRepository.getCategory(id);
    return response.data;
  };
  
  return {
    categories: data?.data || [],
    isLoading,
    error,
    getCategory,
    createCategory,
    deleteCategory,
    refresh: () => mutate(),
  };
} 