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

export interface ResourceDrawerProps<T> {
  resource: T
  isOpen: boolean
  onClose: () => void
  onEdit?: (resource: T) => void
  onDelete?: (id: string | number) => Promise<boolean> | void
  renderContent: (resource: T) => React.ReactNode
  title?: string
  className?: string
  EditModal?: React.ComponentType<{resource: T, onClose: () => void}>
}

export interface ResourceDrawerContentProps<T> {
  resource: T
  onEdit?: (resource: T) => void
  onDelete?: (id: number | string) => void
}

export function ResourceDrawer<T>({
  resource,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  renderContent,
  title = "Details",
  className,
  EditModal,
}: ResourceDrawerProps<T>) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  
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
        <DrawerContent className={`max-w-md data-[vaul-drawer-direction=right]:sm:max-w-sm ${className || ""}`}>
          <DrawerHeader className="flex items-center justify-between">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </DrawerHeader>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {renderContent(resource)}
          </div>
          
          <DrawerFooter className="flex flex-row justify-between">
            {onEdit && (
              <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
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

      {/* Edit Modal */}
      {EditModal && isEditModalOpen && (
        <EditModal 
          resource={resource} 
          onClose={() => setIsEditModalOpen(false)} 
        />
      )}
    </>
  )
} 