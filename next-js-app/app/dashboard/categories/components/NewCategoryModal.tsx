"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NewCategoryForm } from "./NewCategoryForm";
import { Modal } from "@/components/layout/Modal";

export function NewCategoryModal() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      trigger={<Button>Add Category</Button>}
      title="Add Category">
      <NewCategoryForm onSubmit={() => setIsOpen(false)} />
    </Modal>
  );
} 