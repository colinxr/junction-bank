"use client"

import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/layout/DataTable"
import { Category } from "@/app/types"
import { ResourceDrawer } from "@/components/layout/ResourceDrawer"
import { CategoryDrawerContent } from "./CategoryDrawerContent"
import { useCategories } from "@/app/hooks/useCategories"

interface CategoriesDataTableProps {
  data: Category[]
  columns: ColumnDef<Category>[]
}

export function CategoriesDataTable({ data, columns }: CategoriesDataTableProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const { deleteCategory } = useCategories()

  const handleRowClick = (category: Category) => {
    setSelectedCategory(category)
    setIsDrawerOpen(true)
  }

  const handleDrawerClose = () => {
    setIsDrawerOpen(false)
  }

  console.log(data);
  

  // Get unique types for filtering
  const types = [
    {
      label: "Expense",
      value: "expense",
    },
    {
      label: "Income",
      value: "income",
    }
  ]

  // Wrapper for delete function to handle both string and number IDs
  const handleDelete = (id: string | number) => {
    deleteCategory(Number(id));
  };

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Search categories..."
        onRowClick={handleRowClick}
      />
      
      {selectedCategory && (
        <ResourceDrawer
          resource={selectedCategory}
          isOpen={isDrawerOpen}
          onClose={handleDrawerClose}
          onDelete={handleDelete}
          renderContent={(category) => <CategoryDrawerContent resource={category} />}
          title="Category Details"
          className="!w-[500px]"
        />
      )}
    </>
  )
} 