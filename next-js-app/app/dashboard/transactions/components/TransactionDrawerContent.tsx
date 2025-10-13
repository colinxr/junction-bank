"use client"

import { Transaction } from "@/app/types"
import { ResourceDrawerContentProps } from "@/components/layout/ResourceDrawer"
import { formatCurrency, formatDate } from "@/infrastructure/utils"

import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle
} from "@/components/ui/card"

export function TransactionDrawerContent({ 
  resource: transaction
}: ResourceDrawerContentProps<Transaction>) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{transaction.name}</CardTitle>
        </CardHeader>
        
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Category</p>
              <p className="font-medium">{transaction.categoryName || "Uncategorized"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">{formatDate(transaction.date.toString())}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Amount (CAD)</p>
              <p className={`font-medium`}>
                {formatCurrency(Number(transaction.amountCAD))}
              </p>
            </div>
            {transaction.amountUSD !== null && (
              <div>
                <p className="text-sm text-muted-foreground">Amount (USD)</p>
                <p className={`font-medium`}>
                  {formatCurrency(Number(transaction.amountUSD))}
                </p>
              </div>
            )}
          </div>
          
          {transaction.notes && (
            <div>
              <p className="text-sm text-muted-foreground">Notes</p>
              <p className="font-medium">{transaction.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 