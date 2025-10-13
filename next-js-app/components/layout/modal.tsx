"use client";
import { Dialog, DialogTitle, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export function Modal({ children, trigger, title, isOpen = false, setIsOpen }: { children: React.ReactNode, trigger: React.ReactNode, title: string, isOpen?: boolean, setIsOpen?: (isOpen: boolean) => void }) {
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