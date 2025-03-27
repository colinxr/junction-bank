"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { NewCategoryModal } from "./components/NewCategoryModal";
import { CategoriesDataTable } from "./components/CategoriesDataTable";
import { columns } from "./components/columns";
import { useCategories } from "@/app/hooks/useCategories";

export default function CategoriesPage() {
  // Use our custom hook
  const {
    categories,
    isLoading,
    error,
  } = useCategories();

  console.log(categories);
  
  if (error) {
    return <div className="p-8 text-center">Failed to load categories. Please try again.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Categories</h1>

        <NewCategoryModal />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : (
        <CategoriesDataTable 
          columns={columns} 
          data={categories} 
        />
      )}
    </div>
  );
} 