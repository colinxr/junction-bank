# Resource Drawer System

This document provides a guide for implementing the Resource Drawer system for different resource types in the Junction Bank application.

## Overview

The Resource Drawer system provides a reusable approach to displaying details for various resources (Transactions, Months, Categories, etc.) when clicking on a row in a data table. The system uses a generic drawer that opens from the left side and renders content specific to the resource type.

## Architecture

The system consists of:

1. **ResourceDrawer** - A generic component handling the drawer UI, opening/closing, and actions
2. **Resource-specific drawer content** - Components that render details specific to a resource type
3. **DataTable integration** - Row click handling to open the drawer

## Implementation Steps for a New Resource

### 1. Create a Resource Drawer Content Component

Create a new file in your resource's components directory (e.g., `app/dashboard/[resource]/components/[resource]-drawer-content.tsx`):

```tsx
"use client"

import { ResourceType } from "@/app/types"
import { ResourceDrawerContentProps } from "@/components/layout/resource-drawer"
import { formatters } from "@/lib/utils"

export interface ResourceTypeDrawerContentProps extends ResourceDrawerContentProps<ResourceType> {}

export function ResourceTypeDrawerContent({ 
  resource,
  onEdit,
  onDelete 
}: ResourceTypeDrawerContentProps) {
  return (
    <div className="space-y-6">
      {/* Render your resource-specific details here */}
      <h3 className="text-lg font-semibold">{resource.name}</h3>
      
      {/* Display resource properties */}
      <div>
        <p>Property 1: {resource.property1}</p>
        <p>Property 2: {resource.property2}</p>
      </div>
    </div>
  )
}
```

### 2. Update Your Resource DataTable

Update your data table component to handle row clicks and display the drawer:

```tsx
"use client"

import { useState } from "react"
import { ResourceDrawer } from "@/components/layout/resource-drawer"
import { ResourceTypeDrawerContent } from "./resource-type-drawer-content"
import { ResourceType } from "@/app/types"

export function ResourceTypeDataTable({ 
  data, 
  columns,
  onEdit,
  onDelete
}) {
  const [selectedResource, setSelectedResource] = useState<ResourceType | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const handleRowClick = (resource: ResourceType) => {
    setSelectedResource(resource)
    setIsDrawerOpen(true)
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        onRowClick={handleRowClick}
        resourceType="resourceType"
      />

      {selectedResource && (
        <ResourceDrawer
          resource={selectedResource}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onEdit={onEdit}
          onDelete={onDelete}
          renderContent={(resource) => (
            <ResourceTypeDrawerContent 
              resource={resource} 
              onEdit={onEdit}
              onDelete={onDelete}
            />
          )}
          title="Resource Details"
        />
      )}
    </>
  )
}
```

### 3. Implement Handler Functions in Your Page

Add handler functions in your page component:

```tsx
function ResourcePage() {
  // ...other code

  const handleEdit = (resource: ResourceType) => {
    // Implement edit logic
    toast.success(`Editing resource: ${resource.name}`);
  };

  const handleDelete = async (id: string | number) => {
    try {
      // Implement delete logic
      toast.success(`Deleting resource ID: ${id}`);
      // await refresh();
    } catch (error) {
      toast.error("Failed to delete resource. Please try again.");
    }
  };

  return (
    <div>
      {/* ...other UI elements */}
      <ResourceTypeDataTable 
        columns={columns} 
        data={data} 
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
```

## Examples

The system currently includes implementations for:

1. **Transactions** - See `app/dashboard/transactions/components/transaction-drawer-content.tsx`
2. **Months** - See `app/dashboard/months/components/month-drawer-content.tsx`

## Best Practices

1. Keep drawer content focused on displaying relevant information
2. Use consistent formatting and styling across different resource types
3. Ensure proper type safety with TypeScript interfaces
4. Follow the established pattern for action handlers (edit/delete)
5. Make sure content is responsive and works well on different screen sizes

## Extensions

The system can be extended to support:

- Additional actions specific to a resource
- Forms for editing within the drawer
- Related resource information
- Custom drawer widths or behaviors based on resource type 