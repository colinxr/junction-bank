"use client"

import { MonthData } from "@/app/types"
import { ResourceDrawerContentProps } from "@/components/layout/resource-drawer"
import { formatCurrency, getMonthName } from "@/lib/utils"
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
        <h3 className="text-lg font-semibold">{getMonthName(month.month)} {month.year}</h3>
      </div>
      
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Transactions</p>
              <p className="font-medium">{month.transactionCount}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">notes</p>
              <p className="font-medium text-red-600">{month.notes}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 