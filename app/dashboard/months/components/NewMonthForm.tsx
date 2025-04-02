"use client";

import {useState} from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { MonthRepository } from "@/lib/repositories/month.repository";
import { getMonthName } from "@/lib/utils";
import { useMonths } from "@/app/hooks/useMonths";

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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Define Zod schema based on month structure
const monthSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2020, "Year must be at least 2020"),
  notes: z.string().optional(),
});

export function NewMonthForm({ onSubmit }: { onSubmit: () => void }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);    
  const { createMonth } = useMonths();
  // Get current date for default values
  const today = new Date();

  const form = useForm<z.infer<typeof monthSchema>>({
    resolver: zodResolver(monthSchema),
    defaultValues: {
      month: today.getMonth() + 1, // JavaScript months are 0-based
      year: today.getFullYear(),
      notes: ""
    },
  });

  async function handleSubmit(data: z.infer<typeof monthSchema>) {
    setIsLoading(true);
    
    try {
      await createMonth(data);
      onSubmit();
      toast.success('Month created successfully');
      form.reset();
      router.refresh();
    } catch (error) {
      console.error("Failed to create month:", error);
      toast.error("An error occurred while creating the month");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 p-2x">
        <div className="flex flex-row gap-4">
          <FormField
            control={form.control}
            name="month"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Month</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant={"outline"}>
                        {field.value ? (
                          getMonthName(field.value)
                        ) : (
                          <span>Select month</span>
                        )}
                        <CalendarIcon className="ml-2 h-4 w-4" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2">
                    <div className="grid grid-cols-3 gap-2">
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                        <Button
                          key={month}
                          variant={month === field.value ? "default" : "outline"}
                          onClick={() => {
                            field.onChange(month);
                            form.setValue("month", month);
                          }}
                          className="w-full"
                        >
                          {getMonthName(month)}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="year"
            render={({ field: { onChange, value, ...rest } }) => (
              <FormItem className="flex-1">
                <FormLabel>Year</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value))}
                    min={2020}
                    max={2100}
                    {...rest}
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

        <Button className="ml-auto" type="submit" disabled={isLoading}>
          {isLoading ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
} 