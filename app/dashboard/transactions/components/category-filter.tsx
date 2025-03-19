"use client"

import { useState} from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const categories = [
  { value: "Housing", label: "Housing" },
  { value: "Transportation", label: "Transportation" },
  { value: "Food & Dining", label: "Food & Dining" },
  { value: "Entertainment", label: "Entertainment" },
  { value: "Shopping", label: "Shopping" },
  { value: "Utilities", label: "Utilities" },
  { value: "Health", label: "Health" },
  { value: "Travel", label: "Travel" },
  { value: "Education", label: "Education" },
  { value: "Salary", label: "Salary" },
  { value: "Investments", label: "Investments" },
  { value: "Gifts", label: "Gifts" },
]

interface CategoryFilterProps {
  onCategoryChange: (category: string | null) => void
}

export function CategoryFilter({ onCategoryChange }: CategoryFilterProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? categories.find((category) => category.value === value)?.label
            : "Filter by category..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search category..." />
          <CommandEmpty>No category found.</CommandEmpty>
          <CommandGroup>
            <CommandItem
              onSelect={() => {
                setValue("")
                onCategoryChange(null)
                setOpen(false)
              }}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  value === "" ? "opacity-100" : "opacity-0"
                )}
              />
              All Categories
            </CommandItem>
            {categories.map((category) => (
              <CommandItem
                key={category.value}
                onSelect={() => {
                  setValue(category.value === value ? "" : category.value)
                  onCategoryChange(category.value === value ? null : category.value)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === category.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {category.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 