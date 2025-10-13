"use client";
import { useState } from "react";
import { NewTransactionForm } from "./NewTransactionForm";
import { Modal } from "@/components/layout/Modal";
import { Transaction } from "@/app/types";

export function EditTransactionModal({ resource, onClose }: { resource: Transaction, onClose: () => void }) {
  const [isOpen, setIsOpen] = useState(true);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      onClose();
    }
  };

  console.log(resource);
  
  return (
    <Modal 
      isOpen={isOpen} 
      setIsOpen={handleOpenChange} 
      trigger={null} 
      title="Edit Transaction"
    >
      <NewTransactionForm 
        onSubmit={() => {
          handleOpenChange(false);
        }}
        defaultValues={resource}
        isEditing={true}
      />
    </Modal>
  );
} 