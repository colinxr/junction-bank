"use client";

import { Button } from "@/components/ui/button";
import { Import } from "lucide-react";
import Link from "next/link";

interface ImportButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
}

export function ImportButton({ variant = "outline", className }: ImportButtonProps) {
  return (
    <Button variant={variant} className={className} asChild>
      <Link href="/dashboard/transactions/import">
        <Import className="mr-2 h-4 w-4" />
        Import
      </Link>
    </Button>
  );
} 