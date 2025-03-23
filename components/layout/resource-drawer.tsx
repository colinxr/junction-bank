"use client"

import React, { useState } from "react"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { X, Pencil, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export interface ResourceDrawerProps<T> {
  resource: T
  isOpen: boolean
  onClose: () => void
  onEdit?: (resource: T) => void
  onDelete?: (id: string | number) => void
  renderContent: (resource: T) => React.ReactNode
  title?: string
}

export interface ResourceDrawerContentProps<T> {
  resource: T
  onEdit?: (resource: T) => void
  onDelete?: (id: string | number) => void
}

export function ResourceDrawer<T>({
  resource,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  renderContent,
  title = "Details",
}: ResourceDrawerProps<T>) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  // Cast id to string or number, assuming T has an 'id' property
  const handleDelete = () => {
    setIsDeleteDialogOpen(true)
  }
  
  const confirmDelete = () => {
    const resourceWithId = resource as unknown as { id: string | number }
    if (onDelete && resourceWithId.id) {
      onDelete(resourceWithId.id)
      setIsDeleteDialogOpen(false)
      onClose() // Close the drawer after deletion
    }
  }

  const cancelDelete = () => {
    setIsDeleteDialogOpen(false)
  }

  return (
    <>
      <Drawer open={isOpen} onOpenChange={onClose} direction="right">
        <DrawerContent className={"max-w-md"}>
          <DrawerHeader className="flex items-center justify-between">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </DrawerHeader>
          
          <div className="p-4 space-y-4">
            {renderContent(resource)}
          </div>
          
          <DrawerFooter className="flex flex-row justify-between">
            {onEdit && (
              <Button variant="outline" onClick={() => onEdit(resource)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {title.toLowerCase()}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelDelete}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 