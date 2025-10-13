"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { MetricDisplay } from "./MetricDisplay"
import { CategoryCard } from "./CategoryCard"
import { Month } from "@/app/types"

interface MonthSummaryProps {
  monthId?: number,
  month: Month,
  className?: string
}

interface CategoryData {
  categoryId: number
  categoryName: string
  totalAmountCAD: string
  totalAmountUSD: string
}

export function MonthSummaryCard({ month, className }: MonthSummaryProps) {
  const [categories, setCategories] = useState<CategoryData[]>(month.spendingByCategory || []);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(false);

  useEffect(() => {
    // If the month doesn't have category data, fetch it
    if (!month.spendingByCategory && month.id) {
      const fetchCategories = async () => {
        try {
          setLoadingCategories(true);
          const response = await fetch(`/api/months/${month.id}/categories`);
          if (response.ok) {
            const data = await response.json();
            setCategories(data.spendingByCategory || []);
          }
        } catch (error) {
          console.error("Error fetching categories:", error);
        } finally {
          setLoadingCategories(false);
        }
      };
      
      fetchCategories();
    } else if (month.spendingByCategory) {
      // Update categories if they're provided in the month prop
      setCategories(month.spendingByCategory);
    }
  }, [month.id, month.spendingByCategory]);
  
  return (
    <>
      <Card className={className}>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricDisplay 
              label="Total Income"
              isLoading={false}
              value={month.totalIncome}
              valueClassName="font-medium text-green-600"
            />
            
            <MetricDisplay 
              label="Total Expenses"
              isLoading={false}
              value={month.totalExpenses}
              valueClassName="font-medium text-red-600"
            />

            <MetricDisplay 
              label="Cashflow"
              isLoading={false}
              value={month.cashflow}
              valueClassName={`font-medium ${month?.cashflow && month.cashflow >= 0 ? 'text-green-600' : 'text-red-600'}`}
            />

            <MetricDisplay 
              label="Transactions"
              isLoading={false}
              value={month.transactionCount}
            />

            <MetricDisplay 
              label="Projected Daily Budget"
              isLoading={false}
              value={month.projectedDailyBudget}
            />

            <MetricDisplay 
              label="Remaining Daily Budget"
              isLoading={false}
              value={month.remainingDailyBudget}
            />

            <MetricDisplay 
              label="Actual Daily Spend"
              isLoading={false}
              value={month.actualDailySpend}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <MetricDisplay 
              label="Notes"
              isLoading={false}
              value={month.notes || "No notes"}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <p className="text-md text-xl font-semibold">Spending by Category</p>
          <div className="grid grid-cols-4 gap-4 mt-4">
            {loadingCategories ? (
              <p>Loading categories...</p>
            ) : categories.length > 0 ? (
              categories.map((category: CategoryData) => (
                <CategoryCard
                  key={category.categoryId}
                  categoryId={category.categoryId}
                  categoryName={category.categoryName}
                  totalAmountCAD={category.totalAmountCAD}
                  totalAmountUSD={category.totalAmountUSD}
                />
              ))
            ) : (
              <p>No spending categories found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
} 