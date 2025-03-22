"use client"

import { MonthData } from "@/app/types"
import { ResourceDrawerContentProps } from "@/components/layout/resource-drawer"
import { formatCurrency } from "@/lib/utils"
import { 
  Card, 
  CardContent 
} from "@/components/ui/card"
import { CalendarIcon } from "lucide-react"

export interface MonthDrawerContentProps extends ResourceDrawerContentProps<MonthData> {}

export function MonthDrawerContent({ 
  resource: month,
  onEdit,
  onDelete 
}: MonthDrawerContentProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <CalendarIcon className="mr-2 h-5 w-5" />
        <h3 className="text-lg font-semibold">{month.month} {month.year}</h3>
      </div>
      
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Revenue</p>
              <p className="font-medium text-green-600">{formatCurrency(month.revenue)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expenses</p>
              <p className="font-medium text-red-600">{formatCurrency(month.expenses)}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Profit</p>
              <p className={`font-medium ${month.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(month.profit)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Transactions</p>
              <p className="font-medium">{month.transactionCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Additional content specific to the MonthData type could be added here */}
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Monthly Overview</h4>
        <p className="text-sm text-muted-foreground">
          This month had {month.transactionCount} transactions with a total revenue of {formatCurrency(month.revenue)} and expenses of {formatCurrency(month.expenses)}, 
          resulting in a {month.profit >= 0 ? 'profit' : 'loss'} of {formatCurrency(Math.abs(month.profit))}.
        </p>
      </div>
    </div>
  )
} 