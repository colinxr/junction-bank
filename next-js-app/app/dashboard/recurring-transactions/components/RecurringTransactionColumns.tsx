"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRecurringTransactions } from "@/app/hooks/useRecurringTransactions";
import { toast } from "sonner";
import { RecurringTransactionDrawerContent } from "./RecurringTransactionDrawerContent";
import { RecurringTransaction } from "@/app/types";

export const columns: ColumnDef<RecurringTransaction>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "amountCAD",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Amount (CAD)
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const type = row.original.type;
      const isExpense = type === "Expense";
      const amount = parseFloat(row.getValue("amountCAD"));
      const formatted = new Intl.NumberFormat("en-CA", {
        style: "currency",
        currency: "CAD",
      }).format(amount);

      return (
        <div className={`text-center ${isExpense ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}`}>
          {formatted}
        </div>
      )
    },
  },
  {
    accessorKey: "amountUSD",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Amount (USD)
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      if (!row.original.amountUSD) return '-';
      const type = row.original.type;
      const isExpense = type === "Expense";

      const amount = parseFloat(row.getValue("amountUSD"));
      const formatted = new Intl.NumberFormat("en-CA", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return (
        <div className={`text-center ${isExpense ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}`}>
          {formatted}
        </div>
      )
    },
  },
  {
    accessorKey: "day_of_month",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Day of Month
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const day = row.getValue("day_of_month") as number | null;

      if (!day) {
        return <div className="text-muted-foreground">1st (default)</div>;
      }

      // Format the day with suffix (1st, 2nd, 3rd, etc.)
      const suffix = (day: number) => {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
          case 1: return "st";
          case 2: return "nd";
          case 3: return "rd";
          default: return "th";
        }
      };

      return <div>{day}<sup>{suffix(day)}</sup></div>;
    },
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell transaction={row.original} />,
  },
];

function ActionsCell({ transaction }: { transaction: RecurringTransaction }) {
  const { deleteRecurringTransaction } = useRecurringTransactions();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <RecurringTransactionDrawerContent transaction={transaction}>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            Edit
          </DropdownMenuItem>
        </RecurringTransactionDrawerContent>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={async () => {
            try {
              await deleteRecurringTransaction(transaction.id);
            } catch {
              toast.error("Failed to delete recurring transaction");
            }
          }}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 