"use client"

import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/layout/DataTable"
import { Category } from "@/lib/repositories/category.repository"
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

  const filterableColumns = [
    {
      id: "type",
      title: "Type",
      options: types,
    },
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
        filterableColumns={filterableColumns}
        searchPlaceholder="Search categories..."
        onRowClick={handleRowClick}
        resourceType="category"
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