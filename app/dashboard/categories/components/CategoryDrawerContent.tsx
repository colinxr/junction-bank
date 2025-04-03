"use client";

import { Category } from "@/app/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CategoryDrawerContentProps {
  resource: Category;
}

export function CategoryDrawerContent({ resource }: CategoryDrawerContentProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Category Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
              <p className="text-sm">{resource.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
              <p className="text-sm capitalize">{resource.type}</p>
            </div>
            {resource.notes && (
              <div className="col-span-2">
                <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                <p className="text-sm">{resource.notes}</p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
              <p className="text-sm">
                {new Date(resource.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 