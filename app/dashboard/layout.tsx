"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Receipt, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/auth/logout-button";
import { Toaster } from "@/components/ui/sonner"


interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

function SidebarLink({ href, icon, label, isActive }: SidebarLinkProps) {
  return (
    <Link 
      href={href} 
      prefetch={true} 
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-slate-100",
        isActive ? "bg-slate-100 font-medium text-slate-900" : "text-slate-500"
      )}
    >
      {icon}
      {label}
    </Link>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-10 w-64 border-r bg-white">
        <div className="flex h-full flex-col">
          <div className="border-b p-4">
            <h2 className="text-xl font-bold">Junction Bank</h2>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <SidebarLink 
              href="/dashboard" 
              icon={<Home className="h-4 w-4" />} 
              label="Home" 
              isActive={pathname === "/dashboard"} 
            />
            <SidebarLink 
              href="/dashboard/transactions" 
              icon={<Receipt className="h-4 w-4" />} 
              label="Transactions" 
              isActive={pathname.startsWith("/dashboard/transactions")} 
            />
            <SidebarLink 
              href="/dashboard/months" 
              icon={<Calendar className="h-4 w-4" />} 
              label="Months" 
              isActive={pathname.startsWith("/dashboard/months")} 
            />
             <SidebarLink 
              href="/dashboard/recurring-transactions" 
              icon={<Receipt className="h-4 w-4" />} 
              label="Recurring Transactions" 
              isActive={pathname.startsWith("/dashboard/recurring-transactions")} 
            />
            <SidebarLink 
              href="/dashboard/account" 
              icon={<User className="h-4 w-4" />} 
              label="Account" 
              isActive={pathname.startsWith("/dashboard/account")} 
            />
          </nav>
          <div className="border-t p-4">
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 flex-1 p-6">
        {children}
      </main>
      <Toaster />
    </div>
  );
} 