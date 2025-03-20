"use client";
import { Dialog, DialogTitle, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

export function Modal({ children, trigger, title }: { children: React.ReactNode, trigger: React.ReactNode, title: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>{title}</DialogTitle>
        {children}
      </DialogContent>
    </Dialog>
  );
} 