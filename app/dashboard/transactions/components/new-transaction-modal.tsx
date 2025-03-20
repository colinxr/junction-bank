"use client";
import { Button } from "@/components/ui/button";
import { NewTransactionForm } from "./new-transaction-form";
import { Modal } from "@/components/layout/modal";

export function NewTransactionModal() {
  return (
    <Modal trigger={<Button>Add Transaction</Button>} title="Add Transaction">
      <NewTransactionForm />
    </Modal>
  );
} 