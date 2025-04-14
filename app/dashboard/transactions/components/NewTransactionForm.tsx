"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { Transaction } from "@/app/types";
import { useState } from "react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CategoryComboBox } from "@/app/components/CategoryComboBox";

import { useTransactions } from "@/app/hooks/useTransactions";

// Define Zod schema based on transaction structure
const transactionSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  amountCAD: z.number().optional(),
  amountUSD: z.number().optional(),
  date: z.date(),
  notes: z.string().optional(),
  categoryId: z.number({
    required_error: "Please select a category",
  }),
});

type FormData = z.infer<typeof transactionSchema>;

export function NewTransactionForm({ 
  onSubmit, 
  defaultValues,
  isEditing = false 
}: { 
  onSubmit: () => void;
  defaultValues?: Partial<Transaction>;
  isEditing?: boolean;
}) {
  const router = useRouter();
  const { createTransaction, editTransaction } = useTransactions();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      amountCAD: defaultValues?.amountCAD, 
      amountUSD: defaultValues?.amountUSD || undefined,
      date: defaultValues?.date ? new Date(defaultValues.date) : new Date(),
      notes: defaultValues?.notes || "",
      categoryId: defaultValues?.categoryId,
    },
  });

  async function handleSubmit(data: FormData) {
    setIsSubmitting(true);
    try {
      if (isEditing && defaultValues?.id) {
        const formData = {
          ...data,
          id: defaultValues.id,
        }
        
        await editTransaction(formData);
        toast.success('Transaction updated successfully');
      } else {
        await createTransaction(data);
        toast.success('Transaction created successfully');
      }

      onSubmit();
      form.reset();
      router.refresh();
    } catch (error) {
      console.error("Failed to process transaction:", error);
      toast.error("An error occurred while processing the transaction");
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 p-2x">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-row gap-4">
          <FormField
            control={form.control}
            name="amountCAD"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amountUSD"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Amount (USD)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-row gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant={"outline"}>
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-2 h-4 w-4" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <CategoryComboBox
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Input {...field} required={false} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="ml-auto" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
} 