"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NewTransactionForm } from "./new-transaction-form";
import { Modal } from "@/components/layout/modal";

export function NewTransactionModal() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen} trigger={<Button>Add Transaction</Button>} title="Add Transaction">
      <NewTransactionForm onSubmit={() => setIsOpen(false)}/>
    </Modal>
  );
} 