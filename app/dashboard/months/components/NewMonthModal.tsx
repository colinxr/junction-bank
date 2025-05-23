"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NewMonthForm } from "./NewMonthForm";
import { Modal } from "@/components/layout/Modal";

export function NewMonthModal() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      trigger={<Button>Add Month</Button>}
      title="Add Month">
      <NewMonthForm onSubmit={() => setIsOpen(false)} />
    </Modal>
  );
} 