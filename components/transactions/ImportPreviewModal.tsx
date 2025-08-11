"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ImportError, TransactionImportDTO } from "@/domains/Transactions/DTOs/TransactionImportDTO";
import { Checkbox } from "@/components/ui/checkbox";
import { ExternalLink, AlertCircle } from "lucide-react";
import { TransactionType } from "@/domains/Transactions/Entities/Transaction";

interface ImportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: TransactionImportDTO[];
  errors?: ImportError[];
  isLoading?: boolean;
  onConfirmImport: (transactions: TransactionImportDTO[]) => void;
}

// Extended HTMLButtonElement type with indeterminate property
interface IndeterminateCheckboxElement extends HTMLButtonElement {
  indeterminate?: boolean;
}

export function ImportPreviewModal({
  isOpen,
  onClose,
  transactions,
  errors = [],
  isLoading = false,
  onConfirmImport,
}: ImportPreviewModalProps) {
  const [selectedTransactions, setSelectedTransactions] = useState<TransactionImportDTO[]>(transactions);
  const allCheckboxRef = useRef<IndeterminateCheckboxElement>(null);

  // Reset selection when transactions change
  useEffect(() => {
    setSelectedTransactions(transactions);
  }, [transactions]);

  // Handle indeterminate state manually with useEffect
  useEffect(() => {
    if (allCheckboxRef.current) {
      allCheckboxRef.current.indeterminate = 
        selectedTransactions.length > 0 && 
        selectedTransactions.length < transactions.length;
    }
  }, [selectedTransactions, transactions]);

  const toggleTransaction = (transaction: TransactionImportDTO) => {
    setSelectedTransactions(prev => {
      const isSelected = prev.some(t => 
        t.name === transaction.name && 
        new Date(t.date).getTime() === new Date(transaction.date).getTime() && 
        t.amountCAD === transaction.amountCAD
      );

      if (isSelected) {
        return prev.filter(t => 
          !(t.name === transaction.name && 
          new Date(t.date).getTime() === new Date(transaction.date).getTime() && 
          t.amountCAD === transaction.amountCAD)
        );
      } else {
        return [...prev, transaction];
      }
    });
  };

  const toggleAllTransactions = (checked: boolean) => {
    if (checked) {
      setSelectedTransactions(transactions);
    } else {
      setSelectedTransactions([]);
    }
  };

  const isTransactionSelected = (transaction: TransactionImportDTO) => {
    return selectedTransactions.some(t => 
      t.name === transaction.name && 
      new Date(t.date).getTime() === new Date(transaction.date).getTime() && 
      t.amountCAD === transaction.amountCAD
    );
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString();
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const handleConfirmImport = () => {
    onConfirmImport(selectedTransactions);
  };

  const hasValidTransactions = transactions.length > 0;
  const hasErrors = errors.length > 0;
  const allTransactionsSelected = selectedTransactions.length === transactions.length && transactions.length > 0;
  const someTransactionsSelected = selectedTransactions.length > 0 && selectedTransactions.length < transactions.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Import Preview</DialogTitle>
          <DialogDescription>
            Review the transactions that will be imported. Uncheck any transactions you don't want to import.
          </DialogDescription>
        </DialogHeader>

        {hasValidTransactions ? (
          <ScrollArea className="h-[400px] rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox 
                      ref={allCheckboxRef}
                      checked={allTransactionsSelected}
                      onCheckedChange={toggleAllTransactions}
                      aria-label="Select all transactions"
                      disabled={isLoading}
                    />
                  </TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount CAD</TableHead>
                  <TableHead className="text-right">Amount USD</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction, i) => (
                  <TableRow key={`${transaction.name}-${i}`}>
                    <TableCell>
                      <Checkbox 
                        checked={isTransactionSelected(transaction)}
                        onCheckedChange={() => toggleTransaction(transaction)}
                        aria-label={`Select ${transaction.name}`}
                        disabled={isLoading}
                      />
                    </TableCell>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell className="font-medium">{transaction.name}</TableCell>
                    <TableCell>ID: {transaction.categoryId}</TableCell>
                    <TableCell className="text-right">
                      <span className={transaction.type === TransactionType.INCOME ? "text-green-600" : "text-red-600"}>
                        {transaction.amountCAD && formatAmount(transaction.amountCAD, 'CAD') || '-'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={transaction.type === TransactionType.INCOME ? "text-green-600" : "text-red-600"}>
                        {transaction.amountUSD && formatAmount(transaction.amountUSD, 'USD') || '-'}
                      </span>
                    </TableCell>
                    <TableCell>{transaction.type}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        ) : hasErrors ? (
          <div className="p-8 text-center border rounded-md">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
            <h3 className="font-medium text-lg mb-2">No valid transactions found</h3>
            <p className="text-muted-foreground">
              Please check the errors below and upload a valid CSV file.
            </p>
          </div>
        ) : (
          <div className="p-8 text-center border rounded-md">
            <p className="text-muted-foreground">No transactions to preview.</p>
          </div>
        )}

        {hasErrors && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-destructive mb-2">Import Errors</h3>
            <ScrollArea className="h-[100px] rounded-md border">
              <div className="p-4 space-y-2">
                {errors.map((error, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium">Row {error.row}:</span> {error.message}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <div className="text-xs text-muted-foreground flex items-center">
            <span className="mr-1">{selectedTransactions.length} of {transactions.length} transactions selected</span>
          </div>
          <div className="space-x-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmImport} 
              disabled={isLoading || selectedTransactions.length === 0}
              className="min-w-[100px]"
            >
              {isLoading ? "Importing..." : "Import Transactions"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}