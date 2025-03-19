"use client";

export default function MonthsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Monthly Overview</h1>
      </div>
      <div className="rounded-xl border p-6 shadow">
        <h2 className="text-xl font-semibold mb-4">Monthly Spending Analysis</h2>
        <p className="text-muted-foreground">
          Your monthly spending analysis will be displayed here.
        </p>
      </div>
    </div>
  );
} 