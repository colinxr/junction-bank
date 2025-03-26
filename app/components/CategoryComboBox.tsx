"use client";

import * as React from "react";
import { useCategories, Category } from "@/lib/hooks/useCategories";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";

interface CategoryComboBoxProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function CategoryComboBox({
  value,
  onChange,
  placeholder = "Select category...",
  className,
}: CategoryComboBoxProps) {
  const { categories, isLoading, error } = useCategories();

  // Filter categories based on transaction type and convert to ComboboxOption format
  const categoryOptions: ComboboxOption[] = React.useMemo(() => {
    if (!categories) return [];
    
    return categories
      .map((category: Category) => ({
        value: category.id,
        label: category.name
      }));
  }, [categories]);

  // Handle value change and ensure we only pass numbers to the parent component
  const handleChange = React.useCallback((value: string | number | undefined) => {
    if (typeof value === 'number') {
      onChange(value);
    } else if (value === undefined) {
      onChange(undefined);
    }
    // Ignore string values as we don't expect them for category IDs
  }, [onChange]);

  if (error) {
    return <div className="text-red-500 text-sm">Failed to load categories</div>;
  }

  return (
    <Combobox
      options={categoryOptions}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      isLoading={isLoading}
      loadingMessage="Loading categories..."
      emptyMessage="No categories found."
      searchPlaceholder="Search category..."
    />
  );
} 