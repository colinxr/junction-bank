"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DrawerClose, Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Textarea } from "@/components/ui/textarea";
import { useRecurringTransactions } from "@/app/hooks/useRecurringTransactions";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Interface for the drawer component props
interface RecurringTransactionDrawerContentProps {
  children: React.ReactNode;
  transaction: {
    id: number;
    name: string;
    amount_cad: number;
    amount_usd?: number;
    day_of_month?: number;
    notes?: string;
    categoryId?: number;
  };
}

// Interface for categories from the API
interface Category {
  id: number;
  name: string;
  type: string;
}

// Define form schema
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  amount_cad: z.coerce.number().min(0.01, {
    message: "Amount must be greater than 0.",
  }),
  day_of_month: z.coerce.number().int().min(1).max(31).optional(),
  notes: z.string().optional(),
  categoryId: z.coerce.number().int().positive(),
});

export function RecurringTransactionDrawerContent({
  children,
  transaction,
}: RecurringTransactionDrawerContentProps) {
  const { editRecurringTransaction } = useRecurringTransactions();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Initialize form with transaction data
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: transaction.name,
      amount_cad: transaction.amount_cad,
      day_of_month: transaction.day_of_month,
      notes: transaction.notes || "",
      categoryId: transaction.categoryId || 0,
    },
  });

  // Fetch categories on component mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("/api/categories");
        const data = await response.json();
        setCategories(data.data || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    }

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  // Form submission handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await editRecurringTransaction({
        ...transaction,
        ...values,
        createdAt: new Date(),
      });
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to update recurring transaction:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm p-4">
          <h3 className="text-lg font-medium">Edit Recurring Transaction</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Make changes to the recurring transaction template.
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount_cad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (CAD)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="day_of_month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day of Month</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        max="31"
                        placeholder="Optional (defaults to 1st)"
                        {...field} 
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Day of the month the transaction occurs (1-31)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value?.toString()}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem
                              key={category.id}
                              value={category.id.toString()}
                            >
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional details here"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <DrawerClose asChild>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </DrawerClose>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  );
} 