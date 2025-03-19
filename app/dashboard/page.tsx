"use client";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-6 shadow">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Current Balance</h3>
          </div>
          <div className="text-2xl font-bold">$12,450.50</div>
          <p className="text-xs text-muted-foreground">
            +2.5% from last month
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Monthly Spending</h3>
          </div>
          <div className="text-2xl font-bold">$3,240.75</div>
          <p className="text-xs text-muted-foreground">
            -4.1% from last month
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Savings Goal</h3>
          </div>
          <div className="text-2xl font-bold">65%</div>
          <p className="text-xs text-muted-foreground">
            $6,500 of $10,000 target
          </p>
        </div>
      </div>
      <div className="rounded-xl border p-6 shadow">
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
        <p className="text-muted-foreground">
          Your recent transactions will appear here. Visit the Transactions page for a complete history.
        </p>
      </div>
    </div>
  );
} 