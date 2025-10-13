"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { NewRecurringTransactionForm } from "./NewRecurringTransactionForm";

export function NewRecurringTransactionModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Recurring
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Recurring Transaction</DialogTitle>
          <DialogDescription>
            This will create a template that applies to new months.
          </DialogDescription>
        </DialogHeader>
        <NewRecurringTransactionForm />
      </DialogContent>
    </Dialog>
  );
} 