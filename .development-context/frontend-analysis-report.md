# Frontend Analysis Report - Junction Bank

**Document Version:** 1.0  
**Date:** October 11, 2025  
**Project:** Junction Bank - Personal Financial Management Application  
**Framework:** Next.js 15.4.6 (App Router)  

---

## Executive Summary

Junction Bank is a modern personal financial management application built with Next.js, utilizing the App Router architecture, React Server Components, and a domain-driven design approach. The frontend implements a clean separation of concerns with custom hooks for data management, reusable component patterns, and TypeScript throughout.

### Technology Stack Overview

- **Framework:** Next.js 15.4.6 with App Router
- **Runtime:** React 18 with Server and Client Components
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS 4.0
- **UI Components:** Shadcn/ui (New York style)
- **Icons:** Lucide React
- **Authentication:** Clerk
- **State Management:** SWR (stale-while-revalidate)
- **HTTP Client:** Axios
- **Forms:** React Hook Form
- **Validation:** Zod
- **Data Tables:** TanStack Table v8
- **Date Handling:** date-fns
- **Notifications:** Sonner (toast)
- **Modals/Drawers:** Vaul, Radix UI

---

## 1. Application Architecture

### 1.1 Directory Structure

```
/app
├── api/                    # Next.js API routes (Route Handlers)
├── auth/                   # Authentication pages
├── dashboard/              # Main application pages
├── components/             # Feature-specific components
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript type definitions
├── layout.tsx              # Root layout
├── page.tsx                # Root page (redirect logic)
└── globals.css             # Global styles

/components
├── auth/                   # Authentication components
├── forms/                  # Form components
├── layout/                 # Layout components (DataTable, Modal, ResourceDrawer)
├── transactions/           # Transaction-specific components
└── ui/                     # Shadcn/ui components

/domains                    # Domain-driven design business logic
├── Categories/
├── Currency/
├── Months/
├── RecurringTransactions/
├── Transactions/
└── Shared/

/infrastructure            # Cross-cutting concerns
├── api-client.ts
├── auth-cookies.ts
├── container.ts           # Dependency injection
├── middleware/
├── prisma.ts
├── redis.ts
└── utils.ts
```

### 1.2 Architectural Patterns

#### **1.2.1 Layered Architecture**

The application follows a clean layered architecture:

```
┌─────────────────────────────────┐
│    Presentation Layer           │
│  (Pages, Components, Hooks)     │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│    API Layer (Route Handlers)   │
│  (app/api/*)                     │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│    Domain Layer                  │
│  (Actions, Entities, Services)   │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│    Infrastructure Layer          │
│  (Repositories, Prisma, Redis)   │
└──────────────────────────────────┘
```

#### **1.2.2 Domain-Driven Design (DDD)**

The application implements DDD principles with clear domain boundaries:

- **Entities:** Core business objects (Transaction, Month, Category)
- **Value Objects:** Money, Date ranges
- **Repositories:** Data access interfaces
- **Actions (Use Cases):** Business operations
- **DTOs:** Data Transfer Objects
- **Mappers:** Entity ↔ DTO conversion

**Example Domain Structure:**
```
domains/Transactions/
├── Actions/
│   ├── IndexTransactions.ts
│   ├── StoreTransaction.ts
│   ├── UpdateTransaction.ts
│   ├── DeleteTransaction.ts
│   ├── ImportTransactions.ts
│   └── BatchStoreTransactions.ts
├── Adapters/
│   └── TransactionMapper.ts
├── DTOs/
│   └── TransactionDTO.ts
├── Entities/
│   └── Transaction.ts
├── Repositories/
│   ├── ITransactionRepository.ts
│   └── TransactionRepository.ts
└── Services/
    └── TransactionImportService.ts
```

#### **1.2.3 Dependency Injection**

The application uses a container pattern for dependency injection:

**File:** `infrastructure/container.ts`

```typescript
// Singleton repositories
const categoryRepository = new CategoryRepository(prisma, redis);
const monthRepository = new MonthRepository(prisma, redis);
const transactionRepository = new TransactionRepository(prisma, redis);

// Factory functions for actions
export const makeTransactionActions = () => ({
  index: new IndexTransactions(transactionRepository),
  store: new StoreTransaction(transactionRepository),
  update: new UpdateTransaction(transactionRepository),
  destroy: new DeleteTransaction(transactionRepository),
  // ... more actions
});
```

**Benefits:**
- Centralized dependency management
- Easy testing (can inject mock repositories)
- Consistent object lifecycle management
- Clear separation of concerns

---

## 2. Routing Architecture

### 2.1 App Router Structure

Junction Bank uses Next.js App Router with file-based routing:

```
/app
├── page.tsx                          # / (redirect to /dashboard or /auth/login)
├── layout.tsx                        # Root layout with ClerkProvider
│
├── auth/
│   ├── page.tsx                      # /auth
│   ├── login/page.tsx                # /auth/login
│   └── register/page.tsx             # /auth/register
│
├── dashboard/
│   ├── layout.tsx                    # Dashboard layout with sidebar
│   ├── page.tsx                      # /dashboard (home/overview)
│   │
│   ├── transactions/
│   │   ├── page.tsx                  # /dashboard/transactions
│   │   └── import/page.tsx           # /dashboard/transactions/import
│   │
│   ├── months/
│   │   └── page.tsx                  # /dashboard/months
│   │
│   ├── recurring-transactions/
│   │   └── page.tsx                  # /dashboard/recurring-transactions
│   │
│   ├── categories/
│   │   └── page.tsx                  # /dashboard/categories
│   │
│   └── account/
│       └── page.tsx                  # /dashboard/account
│
└── api/                              # API Route Handlers
    ├── auth/route.ts                 # POST /api/auth
    ├── accounts/route.ts             # GET/POST /api/accounts
    │
    ├── transactions/
    │   ├── route.ts                  # GET /api/transactions, POST /api/transactions
    │   ├── [id]/route.ts             # GET/PUT/DELETE /api/transactions/:id
    │   ├── import/
    │   │   ├── route.ts              # POST /api/transactions/import
    │   │   └── preview/route.ts      # POST /api/transactions/import/preview
    │   └── recurring/
    │       ├── route.ts              # GET/POST /api/transactions/recurring
    │       └── [id]/route.ts         # GET/PUT/DELETE /api/transactions/recurring/:id
    │
    ├── months/
    │   ├── route.ts                  # GET /api/months, POST /api/months
    │   ├── [id]/
    │   │   ├── route.ts              # GET/PUT/DELETE /api/months/:id
    │   │   └── categories/route.ts   # GET /api/months/:id/categories
    │   ├── latest/route.ts           # GET /api/months/latest
    │   └── recalculate/route.ts      # POST /api/months/recalculate
    │
    └── categories/
        ├── route.ts                  # GET /api/categories, POST /api/categories
        └── [id]/route.ts             # GET/DELETE /api/categories/:id
```

### 2.2 Route Patterns

#### **2.2.1 Server Components (Default)**

Most pages are Server Components by default:

```typescript
// app/page.tsx
export default async function HomePage() {
  const { userId } = await auth();
  
  if (userId) {
    redirect("/dashboard");
  } else {
    redirect("/auth/login");
  }
}
```

#### **2.2.2 Client Components**

Pages requiring interactivity use `"use client"` directive:

```typescript
// app/dashboard/transactions/page.tsx
'use client';

import { TransactionsContent } from "./components/TransactionContent";

export default function TransactionsPage() {
  return <TransactionsContent />;
}
```

#### **2.2.3 API Route Handlers**

RESTful API endpoints using Next.js Route Handlers:

```typescript
// app/api/transactions/route.ts
import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // Handle GET requests
}

export async function POST(request: NextRequest) {
  // Handle POST requests
}
```

### 2.3 Navigation Patterns

#### **2.3.1 Sidebar Navigation**

**File:** `app/dashboard/layout.tsx`

```typescript
const navigationItems = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/dashboard/transactions", icon: Receipt, label: "Transactions" },
  { href: "/dashboard/months", icon: Calendar, label: "Months" },
  { href: "/dashboard/recurring-transactions", icon: CalendarClock, label: "Recurring Transactions" },
  { href: "/dashboard/categories", icon: LayoutGrid, label: "Categories" },
  { href: "/dashboard/account", icon: User, label: "Account" },
];
```

**Features:**
- Active state highlighting using `usePathname()`
- Prefetching with `Link` component
- Fixed sidebar with scroll
- Logout button at bottom

---

## 3. Component Architecture

### 3.1 Component Organization

#### **3.1.1 Feature-Based Organization**

Components are organized by feature domain:

```
components/
├── auth/
│   ├── logout-button.tsx
│   └── protected-route.tsx
├── layout/
│   ├── DataTable.tsx            # Reusable table with sorting/filtering
│   ├── Modal.tsx                 # Generic modal wrapper
│   └── ResourceDrawer.tsx        # Generic drawer for resource details
├── transactions/
│   ├── CSVUploader.tsx
│   ├── ImportButton.tsx
│   ├── ImportErrorDisplay.tsx
│   ├── ImportPreviewModal.tsx
│   └── ImportSuccessSummary.tsx
└── ui/                           # Shadcn/ui components
    ├── button.tsx
    ├── card.tsx
    ├── dialog.tsx
    └── ... (25+ components)
```

#### **3.1.2 Page-Specific Components**

Feature pages have their own component directories:

```
app/dashboard/transactions/components/
├── CategoryFilter.tsx
├── EditTransactionModal.tsx
├── NewTransactionForm.tsx
├── NewTransactionModal.tsx
├── TransactionContent.tsx
├── TransactionDrawerContent.tsx
├── TransactionsColumns.tsx
└── TransactionsDataTable.tsx
```

### 3.2 Component Patterns

#### **3.2.1 Generic Resource Drawer Pattern**

**File:** `components/layout/ResourceDrawer.tsx`

A reusable pattern for displaying resource details in a side drawer:

```typescript
export interface ResourceDrawerProps<T extends { id: number | string }> {
  resource: T
  isOpen: boolean
  onClose: () => void
  onEdit?: (resource: T) => void
  onDelete?: (id: number) => Promise<boolean> | void
  renderContent: (resource: T) => React.ReactNode
  title?: string
  className?: string
  EditModal?: React.ComponentType<{resource: T, onClose: () => void}>
}
```

**Features:**
- Generic typing for any resource type
- Built-in edit and delete actions
- Confirmation dialog for destructive actions
- Composable content via render props
- Optional custom edit modal

**Usage Example:**
```typescript
<ResourceDrawer
  resource={transaction}
  isOpen={isOpen}
  onClose={onClose}
  onEdit={handleEdit}
  onDelete={handleDelete}
  renderContent={(t) => <TransactionDrawerContent resource={t} />}
  title="Transaction Details"
  EditModal={EditTransactionModal}
/>
```

#### **3.2.2 Data Table Pattern**

**File:** `components/layout/DataTable.tsx`

A reusable table component using TanStack Table:

```typescript
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchPlaceholder?: string
  filterableColumns?: {
    id: string
    title: string
    options: any[]
  }[]
  onRowClick?: (row: TData) => void
  initialSorting?: SortingState
}
```

**Features:**
- Client-side sorting and filtering
- Global search
- Column-specific filters
- Pagination (10, 20, 30, 40, 50 items)
- Row click handlers
- Responsive design

**Column Definition Pattern:**
```typescript
// app/dashboard/transactions/components/TransactionsColumns.tsx
export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => format(row.getValue("date"), "MMM dd, yyyy"),
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "amountCAD",
    header: "Amount",
    cell: ({ row }) => formatCurrency(row.getValue("amountCAD")),
  },
  // ... more columns
];
```

#### **3.2.3 Modal Pattern**

**File:** `components/layout/Modal.tsx`

Simple modal wrapper using Radix UI:

```typescript
export function Modal({ 
  children, 
  trigger, 
  title, 
  isOpen = false, 
  setIsOpen 
}: { 
  children: React.ReactNode
  trigger: React.ReactNode
  title: string
  isOpen?: boolean
  setIsOpen?: (isOpen: boolean) => void 
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogTitle>{title}</DialogTitle>
        {children}
      </DialogContent>
    </Dialog>
  );
}
```

#### **3.2.4 Form Modal Pattern**

Most forms follow this pattern:

```typescript
// NewTransactionModal.tsx
export function NewTransactionModal() {
  const [open, setOpen] = useState(false);
  const { createTransaction } = useTransactions();
  
  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
  });

  const onSubmit = async (data: TransactionFormData) => {
    await createTransaction(data);
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New Transaction</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Transaction</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Form fields */}
            <DialogFooter>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

### 3.3 UI Component Library (Shadcn/ui)

Junction Bank uses Shadcn/ui components with customization:

**Configuration:** `components.json`
```json
{
  "style": "new-york",
  "rsc": true,
  "tailwind": {
    "baseColor": "slate",
    "cssVariables": true
  },
  "iconLibrary": "lucide"
}
```

**Available Components (26 total):**
- alert, badge, button, calendar, card
- checkbox, combobox, command, dialog, drawer
- dropdown-menu, form, input, label, pagination
- popover, scroll-area, select, skeleton, sonner
- table, textarea

**Customization Example:**
```typescript
// components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-slate-900 text-slate-50 hover:bg-slate-900/90",
        destructive: "bg-red-500 text-slate-50 hover:bg-red-500/90",
        outline: "border border-slate-200 bg-white hover:bg-slate-100",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-100/80",
        ghost: "hover:bg-slate-100 hover:text-slate-900",
        link: "text-slate-900 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
  }
);
```

---

## 4. State Management

### 4.1 Custom Hooks Pattern

Junction Bank implements a consistent custom hooks pattern for data management:

#### **4.1.1 Hook Structure**

**File:** `app/hooks/useTransactions.ts`

```typescript
export function useTransactions(initialParams: TransactionQueryParams = {}) {
  // 1. State management
  const [queryParams] = useState<TransactionQueryParams>({
    monthId: initialParams.monthId,
  });
  
  // 2. Build query string
  const queryString = new URLSearchParams();
  if (queryParams.monthId) {
    queryString.append('monthId', queryParams.monthId.toString());
  }

  // 3. SWR hook for data fetching
  const { data, error, isLoading, mutate } = useSWR(
    `${API_URL}?${queryString.toString()}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1 minute
    }
  );
  
  // 4. CRUD operations
  const createTransaction = async (transactionData: Partial<Transaction>) => {
    try {
      // Optimistic update
      const optimisticData = { ...data, data: [newItem, ...data.data] };
      mutate(optimisticData, false);
      
      // API call
      const response = await apiClient.post("/api/transactions", transactionData);
      
      // Revalidate
      mutate();
      
      toast.success('Transaction created successfully');
      return response.data;
    } catch (error) {
      mutate(); // Rollback on error
      toast.error("Failed to create transaction");
      throw error;
    }
  };
  
  // 5. Return interface
  return {
    transactions: data || [],
    isLoading,
    error,
    createTransaction,
    editTransaction,
    deleteTransaction,
    refresh: () => mutate(),
  };
}
```

#### **4.1.2 Available Hooks**

1. **useTransactions** - Transaction data management
2. **useMonths** - Month data management
3. **useMonthDetail** - Single month with financial details
4. **useCategories** - Category data management
5. **useCategoryDetail** - Single category details
6. **useRecurringTransactions** - Recurring transaction management
7. **useTransactionImport** - Multi-step import workflow

#### **4.1.3 SWR Configuration**

**Global SWR Settings:**
```typescript
const { data, error, isLoading, mutate } = useSWR(
  key,
  fetcher,
  {
    revalidateOnFocus: false,      // Don't refetch on window focus
    revalidateOnReconnect: false,  // Don't refetch on reconnect
    dedupingInterval: 60000,       // Dedupe requests within 1 minute
    keepPreviousData: true,        // Show old data while loading new
  }
);
```

**Benefits:**
- Automatic caching
- Optimistic updates
- Error handling
- Deduplication of requests
- Focus revalidation control

### 4.2 Optimistic Updates Pattern

All mutations follow an optimistic update pattern:

```typescript
const editTransaction = async (transaction: Partial<Transaction>) => {
  try {
    // 1. Create optimistic data
    const optimisticData = {
      ...data,
      data: data?.data?.map((item: Transaction) => 
        item.id === transaction.id ? { ...item, ...transaction } : item
      ) || [],
    };
    
    // 2. Update cache immediately (optimistic)
    mutate(optimisticData, false);
    
    // 3. Make API call
    await apiClient.put(`/api/transactions/${transaction.id}`, transaction);
    
    // 4. Revalidate to get server data
    mutate();
    
    toast.success('Transaction updated successfully');
  } catch (error) {
    // 5. Rollback on error
    mutate();
    toast.error("Failed to edit transaction");
    throw error;
  }
};
```

**Flow:**
1. Immediate UI update (optimistic)
2. API call in background
3. Revalidate with server data
4. Rollback if error occurs

### 4.3 Form State Management

Forms use React Hook Form with Zod validation:

```typescript
const transactionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amountCAD: z.number().positive("Amount must be positive"),
  categoryId: z.number(),
  date: z.date(),
  notes: z.string().optional(),
});

const form = useForm<TransactionFormData>({
  resolver: zodResolver(transactionSchema),
  defaultValues: {
    name: "",
    amountCAD: 0,
    categoryId: 0,
    date: new Date(),
  },
});
```

### 4.4 Authentication State

Authentication managed by Clerk:

```typescript
// Server-side
import { auth } from '@clerk/nextjs/server';
const { userId } = await auth();

// Client-side
import { useUser } from '@clerk/nextjs';
const { user, isLoaded } = useUser();
```

---

## 5. Data Flow

### 5.1 Request Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                          User Action                             │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                  Client Component Event                          │
│              (Button click, form submit, etc.)                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                     Custom Hook Method                           │
│        (e.g., createTransaction, editMonth)                      │
│                                                                   │
│  1. Optimistic update (mutate cache)                            │
│  2. API call via apiClient (axios)                              │
│  3. Revalidate SWR cache                                        │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                   Middleware (middleware.ts)                     │
│                                                                   │
│  1. Clerk authentication check                                  │
│  2. Add x-user-id header for API routes                         │
│  3. Redirect if not authenticated                               │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│              API Route Handler (app/api/*/route.ts)              │
│                                                                   │
│  1. Extract x-user-id from headers                              │
│  2. Parse request body                                          │
│  3. Validate input                                              │
│  4. Call domain action                                          │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                     Domain Action (Use Case)                     │
│           (e.g., StoreTransaction.execute())                     │
│                                                                   │
│  1. Business logic validation                                   │
│  2. Create domain entity                                        │
│  3. Call repository method                                      │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                        Repository                                │
│              (e.g., TransactionRepository)                       │
│                                                                   │
│  1. Check Redis cache                                           │
│  2. Query/Mutate via Prisma                                     │
│  3. Update Redis cache                                          │
│  4. Return domain entity                                        │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                      Mapper (toDTO)                              │
│              Convert entity to DTO for response                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                      API Response                                │
│              NextResponse.json(dto)                              │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                    SWR Cache Update                              │
│            UI automatically re-renders                           │
└──────────────────────────────────────────────────────────────────┘
```

### 5.2 Data Fetching Patterns

#### **5.2.1 Server Components (Async/Await)**

```typescript
// app/page.tsx
export default async function HomePage() {
  const { userId } = await auth();
  
  if (userId) {
    redirect("/dashboard");
  }
}
```

#### **5.2.2 Client Components (SWR)**

```typescript
// app/dashboard/transactions/components/TransactionContent.tsx
export function TransactionsContent({ month }: { month?: Month }) {
  const { transactions, isLoading, error } = useTransactions({ 
    monthId: Number(month?.id) 
  });

  if (error) return <div>Failed to load</div>;
  if (isLoading) return <Skeleton />;

  return <TransactionsDataTable data={transactions} />;
}
```

#### **5.2.3 Manual Fetching**

```typescript
// For one-off requests not managed by SWR
useEffect(() => {
  async function fetchLatestMonth() {
    try {
      setLoading(true);
      const response = await fetch("/api/months/latest");
      const data = await response.json();
      setMonth(data);
    } catch (err) {
      toast.error("Failed to load month");
    } finally {
      setLoading(false);
    }
  }
  
  fetchLatestMonth();
}, []);
```

### 5.3 API Client Configuration

**File:** `infrastructure/api-client.ts`

```typescript
const apiClient = axios.create({
  baseURL: typeof window === "undefined" 
    ? process.env.NEXT_PUBLIC_API_BASE_URL 
    : "/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        "An unexpected error occurred";

    if (typeof window !== 'undefined') {
      toast.error("Something went wrong", {
        description: errorMessage,
        duration: 3000,
      });
    }

    return Promise.reject(error.response?.data || error.message);
  }
);
```

**Features:**
- Environment-aware base URL
- Automatic error notifications
- Unwraps response data
- Type-safe with TypeScript generics

---

## 6. Authentication & Authorization

### 6.1 Authentication Provider (Clerk)

**Root Layout:** `app/layout.tsx`
```typescript
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

### 6.2 Middleware Authentication

**File:** `middleware.ts`

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const ROUTES = {
  publicApi: ["/api/auth/login", "/api/auth/register", "/api/auth/logout"],
  protected: ["/dashboard", "/transactions", "/categories"],
};

const isPublicRoute = createRouteMatcher([
  "/auth/login",
  "/auth/register",
  ...ROUTES.publicApi
]);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Protect non-public routes
  try {
    await auth.protect();
    
    // Add user ID to headers for API routes
    if (pathname.startsWith("/api")) {
      const { sessionClaims } = await auth();
      
      if (sessionClaims?.sub) {
        const requestHeaders = new Headers(req.headers);
        requestHeaders.set('x-user-id', sessionClaims.sub);
        return NextResponse.next({
          request: { headers: requestHeaders }
        });
      }
    }
    
    return NextResponse.next();
  } catch {
    // Redirect to login
    return redirectTo(req, "/auth/login");
  }
});
```

**Key Features:**
- Protects all routes by default
- Public route whitelist
- Adds `x-user-id` header to API requests
- Redirects unauthenticated users

### 6.3 Login Page

**File:** `app/auth/login/page.tsx`
```typescript
import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="container flex h-screen items-center justify-center">
      <SignIn />
    </div>
  );
}
```

### 6.4 Protected Component Pattern

```typescript
// components/auth/protected-route.tsx
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoaded, userId } = useAuth();
  
  if (!isLoaded) return <Skeleton />;
  
  if (!userId) {
    redirect("/auth/login");
  }
  
  return <>{children}</>;
}
```

### 6.5 API Route Protection

```typescript
// app/api/transactions/route.ts
export async function POST(request: NextRequest) {
  // User ID injected by middleware
  const userId = request.headers.get('x-user-id');

  if (!userId) {
    return ApiErrorHandler.unauthorized();
  }

  // Proceed with authenticated request
  const transaction = await transactionActions.store.execute({
    userId,
    ...data
  });
}
```

---

## 7. API Routes (Route Handlers)

### 7.1 API Structure

```
/api
├── auth/route.ts                         # Authentication
├── accounts/route.ts                     # User accounts
│
├── transactions/
│   ├── route.ts                          # GET, POST
│   ├── [id]/route.ts                     # GET, PUT, DELETE
│   ├── import/
│   │   ├── route.ts                      # POST (import)
│   │   └── preview/route.ts              # POST (preview)
│   └── recurring/
│       ├── route.ts                      # GET, POST
│       └── [id]/route.ts                 # GET, PUT, DELETE
│
├── months/
│   ├── route.ts                          # GET, POST
│   ├── [id]/
│   │   ├── route.ts                      # GET, PUT, DELETE
│   │   └── categories/route.ts           # GET (spending by category)
│   ├── latest/route.ts                   # GET (current month)
│   └── recalculate/route.ts              # POST (recalc expenses)
│
└── categories/
    ├── route.ts                          # GET, POST
    └── [id]/route.ts                     # GET, DELETE
```

### 7.2 Route Handler Pattern

**Standard CRUD Pattern:**

```typescript
// app/api/transactions/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { makeTransactionActions } from '@/infrastructure/container';
import { TransactionMapper } from '@/domains/Transactions/Adapters/TransactionMapper';
import { ApiErrorHandler } from '@/infrastructure/api-error-handler';

const transactionActions = makeTransactionActions();

// GET /api/transactions?monthId=123
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const monthId = url.searchParams.get('monthId') 
      ? parseInt(url.searchParams.get('monthId')!) 
      : undefined;

    const results = await transactionActions.index.execute(monthId);
    const transactions = results.map(TransactionMapper.toDTOFromRaw);

    return NextResponse.json(transactions, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate, max-age=0',
      }
    });
  } catch (error) {
    return ApiErrorHandler.handle(error, 'Failed to fetch transactions');
  }
}

// POST /api/transactions
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return ApiErrorHandler.validationError('User ID is required');
    }

    const data = await request.json();

    if (!data.name || !data.amountCAD || !data.categoryId) {
      return ApiErrorHandler.validationError(
        'Name, amountCAD, and categoryId are required'
      );
    }

    const transaction = await transactionActions.store.execute({
      userId,
      ...data
    });

    const transactionDTO = TransactionMapper.toDTOFromRaw(transaction);

    return NextResponse.json({ data: transactionDTO }, { status: 201 });
  } catch (error) {
    return ApiErrorHandler.handle(error, 'Failed to create transaction');
  }
}
```

**Dynamic Route Pattern:**

```typescript
// app/api/transactions/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transaction = await transactionActions.show.execute(
      parseInt(params.id)
    );
    
    const dto = TransactionMapper.toDTOFromRaw(transaction);
    return NextResponse.json(dto);
  } catch (error) {
    return ApiErrorHandler.handle(error, 'Transaction not found');
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const transaction = await transactionActions.update.execute(
      parseInt(params.id),
      data
    );
    
    const dto = TransactionMapper.toDTOFromRaw(transaction);
    return NextResponse.json({ data: dto });
  } catch (error) {
    return ApiErrorHandler.handle(error, 'Failed to update transaction');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await transactionActions.destroy.execute(parseInt(params.id));
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return ApiErrorHandler.handle(error, 'Failed to delete transaction');
  }
}
```

### 7.3 Error Handling

**File:** `infrastructure/api-error-handler.ts`

```typescript
export class ApiErrorHandler {
  static handle(error: unknown, message: string): NextResponse {
    console.error(message, error);
    
    if (error instanceof DomainException) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }

  static validationError(message: string): NextResponse {
    return NextResponse.json(
      { error: message },
      { status: 422 }
    );
  }

  static unauthorized(): NextResponse {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}
```

### 7.4 API Response Patterns

**Success Response:**
```json
{
  "data": {
    "id": 123,
    "name": "Groceries",
    "amountCAD": 45.67,
    "categoryId": 5
  }
}
```

**List Response:**
```json
[
  { "id": 1, "name": "Item 1" },
  { "id": 2, "name": "Item 2" }
]
```

**Error Response:**
```json
{
  "error": "Transaction not found"
}
```

**Cache Headers:**
```typescript
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 'no-store, must-revalidate, max-age=0',
  }
});
```

---

## 8. Type System

### 8.1 TypeScript Configuration

**File:** `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

**Key Settings:**
- `strict: true` - Full TypeScript strict mode
- Path alias `@/*` for clean imports
- JSX preserve for Next.js
- Bundler module resolution

### 8.2 Type Definitions

**File:** `app/types/index.ts`

```typescript
import { TransactionType } from '@/domains/Transactions/Entities/Transaction';

export interface Transaction {
  id: number
  clerkId: string
  monthId: number
  name: string
  amountCAD: number
  amountUSD?: number
  categoryId: number
  categoryName: string
  category?: Category
  notes?: string
  date: Date
  type: TransactionType
}

export interface RecurringTransaction {
  id: number
  name: string
  type?: "Income" | "Expense"
  amountCAD?: number
  amountUSD?: number
  dayOfMonth?: number
  notes?: string
  categoryId: number
  categoryName: string
  createdAt: Date
}

export interface Month {
  id: number
  month: number
  year: number
  notes: string | null
  transactionCount?: number
  cashflow?: number
  totalIncome?: number
  totalExpenses?: number
  recurringExpenses?: number
  nonRecurringExpenses?: number
  projectedDailyBudget?: number
  remainingDailyBudget?: number
  actualDailySpend?: number
  totalDaysInMonth?: number
  daysLeft?: number
  daysPassed?: number
  isCurrentMonth?: boolean
  isInPast?: boolean
  isInFuture?: boolean
  spendingByCategory?: SpendingByCategory
}

export interface Category {
  id: number
  name: string
  type: string
  notes?: string | null
  createdAt: string
}

export interface CategorySpending {
  categoryId: number
  categoryName: string
  totalAmountCAD: string
  totalAmountUSD: string
  total: number
}

export type SpendingByCategory = CategorySpending[];
```

### 8.3 Domain Types

**Domain entities have their own type definitions:**

```typescript
// domains/Transactions/Entities/Transaction.ts
export enum TransactionType {
  Income = 'Income',
  Expense = 'Expense',
}

export class Transaction {
  constructor(
    public id: number,
    public clerkId: string,
    public monthId: number,
    public name: string,
    public amountCAD: Decimal,
    public categoryId: number,
    public date: Date,
    public type: TransactionType,
    public amountUSD?: Decimal,
    public notes?: string,
    public createdAt?: Date
  ) {}
}
```

### 8.4 DTO Types

**Data Transfer Objects for API communication:**

```typescript
// domains/Transactions/DTOs/TransactionDTO.ts
export interface TransactionDTO {
  id: number;
  clerkId: string;
  monthId: number;
  name: string;
  amountCAD: string;      // Decimal as string
  amountUSD?: string;     // Decimal as string
  categoryId: number;
  categoryName?: string;
  notes?: string;
  date: string;           // Date as ISO string
  type: 'Income' | 'Expense';
  createdAt: string;      // Date as ISO string
}
```

### 8.5 Form Types (Zod Schemas)

```typescript
import { z } from 'zod';

const transactionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amountCAD: z.number().positive("Amount must be positive"),
  amountUSD: z.number().positive().optional(),
  categoryId: z.number().int().positive(),
  monthId: z.number().int().positive(),
  date: z.date(),
  type: z.enum(['Income', 'Expense']),
  notes: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;
```

### 8.6 Generic Types

**Used in reusable components:**

```typescript
// ResourceDrawer
export interface ResourceDrawerProps<T extends { id: number | string }> {
  resource: T
  isOpen: boolean
  onClose: () => void
  onEdit?: (resource: T) => void
  onDelete?: (id: number) => Promise<boolean> | void
  renderContent: (resource: T) => React.ReactNode
}

// DataTable
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onRowClick?: (row: TData) => void
}
```

---

## 9. Styling System

### 9.1 Tailwind CSS Configuration

**File:** `tailwind.config.js`
```javascript
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  plugins: [],
};
```

### 9.2 Global Styles

**File:** `app/globals.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    
    /* ... more CSS variables */
  }
}
```

### 9.3 Utility Functions

**File:** `infrastructure/utils.ts`
```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Merge Tailwind classes safely
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(num);
}
```

### 9.4 Component Styling Patterns

#### **9.4.1 Conditional Classes with cn()**

```typescript
<Link 
  href={href} 
  className={cn(
    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-slate-100",
    isActive ? "bg-slate-100 font-medium text-slate-900" : "text-slate-500"
  )}
>
```

#### **9.4.2 CVA (Class Variance Authority)**

```typescript
import { cva } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-slate-900 text-slate-50 hover:bg-slate-900/90",
        destructive: "bg-red-500 text-slate-50 hover:bg-red-500/90",
        outline: "border border-slate-200 bg-white hover:bg-slate-100",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = ({ variant, size, className, ...props }: ButtonProps) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
};
```

### 9.5 Design Tokens

**Color Palette:**
- Primary: Slate (900)
- Secondary: Slate (100)
- Destructive: Red (500)
- Muted: Slate (500)
- Accent: Slate (100)
- Border: Slate (200)

**Typography:**
- Font Family: Inter (sans), JetBrains Mono (mono)
- Font Sizes: text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl
- Font Weights: font-normal, font-medium, font-semibold, font-bold

**Spacing:**
- Standard: 4px (0.25rem) increments
- Layout: p-4, p-6, gap-2, gap-4, space-y-4, space-y-6

**Border Radius:**
- Default: rounded-md (6px)
- Small: rounded-sm (2px)
- Large: rounded-lg (8px)

### 9.6 Responsive Design

```typescript
// Sidebar layout
<aside className="fixed inset-y-0 left-0 z-10 w-64 border-r bg-white">
  {/* Sidebar content */}
</aside>

<main className="ml-64 flex-1 p-6">
  {/* Main content */}
</main>
```

**Responsive Patterns:**
- Fixed sidebar (desktop)
- Mobile-first approach
- Breakpoint-based utilities (sm:, md:, lg:, xl:)
- Flex and Grid layouts

---

## 10. Feature Deep Dives

### 10.1 Transaction Import System

#### **10.1.1 Import Flow**

```
┌─────────────────────────────────────────────────────────────────┐
│  1. File Selection (CSV)                                         │
│     /dashboard/transactions/import                               │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│  2. Upload for Preview                                           │
│     POST /api/transactions/import/preview                        │
│     - Parse CSV                                                  │
│     - Validate rows                                              │
│     - Match categories (fuzzy matching)                          │
│     - Return preview data                                        │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│  3. Preview Modal                                                │
│     - Show parsed transactions                                   │
│     - Display errors/warnings                                    │
│     - Allow selection of transactions to import                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│  4. Confirm Import                                               │
│     POST /api/transactions/import                                │
│     - Batch insert selected transactions                         │
│     - Update month aggregates                                    │
│     - Invalidate caches                                          │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│  5. Success Summary                                              │
│     - Show import results                                        │
│     - Display success/failure counts                             │
│     - Link to transactions                                       │
└──────────────────────────────────────────────────────────────────┘
```

#### **10.1.2 Import Components**

**Main Import Page:**
```typescript
// app/dashboard/transactions/import/page.tsx
export default function TransactionImportPage() {
  const { state, handleFileSelect, uploadForPreview, confirmImport, reset } = 
    useTransactionImport();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Import Transactions</h1>
      
      {state.step === 'idle' && (
        <CSVUploader 
          onFileSelect={handleFileSelect}
          onUpload={uploadForPreview}
          file={state.file}
        />
      )}
      
      {state.step === 'preview' && (
        <ImportPreviewModal
          transactions={state.transactions}
          errors={state.errors}
          onConfirm={confirmImport}
          onCancel={reset}
        />
      )}
      
      {state.step === 'success' && (
        <ImportSuccessSummary result={state.result} />
      )}
    </div>
  );
}
```

**Import Hook:**
```typescript
// app/hooks/useTransactionImport.ts
export function useTransactionImport() {
  const [state, setState] = useState<ImportState>({
    step: 'idle',
    file: null,
    transactions: [],
    errors: [],
    result: null,
  });

  const uploadForPreview = async () => {
    const formData = new FormData();
    formData.append('file', state.file);
    formData.append('preview', 'true');

    const response = await fetch('/api/transactions/import/preview', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    
    setState(prev => ({
      ...prev,
      step: 'preview',
      transactions: data.data?.transactions || [],
      errors: data.data?.errors || [],
    }));
  };

  const confirmImport = async (selectedTransactions) => {
    // Import logic
  };

  return { state, handleFileSelect, uploadForPreview, confirmImport, reset };
}
```

#### **10.1.3 CSV Processing**

**Backend Service:**
```typescript
// domains/Transactions/Services/TransactionImportService.ts
export class TransactionImportService {
  async parseCSV(fileBuffer: Buffer): Promise<TransactionImportDTO[]> {
    // Parse CSV with Papa Parse
    // Validate rows
    // Return parsed data
  }

  async matchCategory(transactionName: string): Promise<number> {
    // Fuzzy matching logic
    // Return best category match
  }
}
```

### 10.2 Month Financial Calculations

#### **10.2.1 Month Aggregates**

**Calculated Fields:**
```typescript
interface Month {
  // Stored in DB
  id: number;
  month: number;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  recurringExpenses: number;
  transactionCount: number;
  
  // Calculated on read
  cashflow: number;                    // totalIncome - totalExpenses
  nonRecurringExpenses: number;        // totalExpenses - recurringExpenses
  projectedDailyBudget: number;        // (totalIncome - recurringExpenses) / daysInMonth
  remainingDailyBudget: number;        // remainingBudget / daysLeft
  actualDailySpend: number;            // totalExpenses / daysPassed
  totalDaysInMonth: number;
  daysLeft: number;
  daysPassed: number;
  isCurrentMonth: boolean;
  isInPast: boolean;
  isInFuture: boolean;
  spendingByCategory: CategorySpending[];
}
```

#### **10.2.2 Calculation Flow**

```typescript
// domains/Months/Actions/ShowMonth.ts
export class ShowMonth {
  async execute(id: number): Promise<MonthDTO> {
    // 1. Fetch month from repository
    const month = await this.repository.findById(id);
    
    // 2. Calculate financial metrics
    const metrics = this.calculateMetrics(month);
    
    // 3. Get spending by category
    const spendingByCategory = await this.getSpendingByCategory(id);
    
    // 4. Return enhanced DTO
    return {
      ...MonthMapper.toDTO(month),
      ...metrics,
      spendingByCategory,
    };
  }
}
```

### 10.3 Recurring Transactions

#### **10.3.1 Recurring Transaction Management**

**Features:**
- Define recurring income/expenses
- Specify day of month
- Link to categories
- Support CAD and USD amounts

**Data Model:**
```typescript
interface RecurringTransaction {
  id: number;
  clerkId: string;
  name: string;
  amountCAD: Decimal;
  amountUSD?: Decimal;
  categoryId: number;
  dayOfMonth?: number;
  type: 'Income' | 'Expense';
  notes?: string;
}
```

#### **10.3.2 Month Recalculation**

**Trigger:** When recurring transactions change

```typescript
// POST /api/months/recalculate
export async function POST() {
  await monthActions.recalculateRecurringExpenses.execute();
  return NextResponse.json({ success: true });
}
```

**Process:**
1. Fetch all recurring transactions
2. Sum by month
3. Update month.recurringExpenses
4. Recalculate derived metrics

### 10.4 Category Management

#### **10.4.1 Category System**

**Features:**
- Income vs Expense categories
- Category-based filtering
- Spending analytics by category
- Category notes

**Usage:**
- Transaction categorization
- Budget tracking by category
- Spending analysis
- Recurring expense planning

#### **10.4.2 Category Spending Analytics**

```typescript
// GET /api/months/:id/categories
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const spending = await transactionActions.getSpendingByCategory.execute(
    parseInt(params.id)
  );
  
  return NextResponse.json(spending);
}
```

**Response:**
```json
[
  {
    "categoryId": 1,
    "categoryName": "Groceries",
    "totalAmountCAD": "456.78",
    "totalAmountUSD": "0.00",
    "total": 456.78
  },
  {
    "categoryId": 2,
    "categoryName": "Restaurants",
    "totalAmountCAD": "234.56",
    "totalAmountUSD": "45.67",
    "total": 295.30
  }
]
```

---

## 11. Performance Optimizations

### 11.1 Caching Strategy

#### **11.1.1 SWR Client-Side Caching**

```typescript
const { data, error, isLoading, mutate } = useSWR(
  key,
  fetcher,
  {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
    keepPreviousData: true,
  }
);
```

**Benefits:**
- Automatic request deduplication
- Stale-while-revalidate pattern
- Optimistic updates
- Focus revalidation control

#### **11.1.2 Redis Caching (Backend)**

```typescript
// domains/Transactions/Repositories/TransactionRepository.ts
export class TransactionRepository {
  async findAll(monthId?: number): Promise<Transaction[]> {
    const cacheKey = `transactions:${monthId || 'all'}`;
    
    // Try cache first
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
    
    // Fetch from database
    const transactions = await this.prisma.transaction.findMany({
      where: monthId ? { monthId } : undefined,
    });
    
    // Cache for 5 minutes
    await this.redis.setex(cacheKey, 300, JSON.stringify(transactions));
    
    return transactions;
  }
}
```

#### **11.1.3 API Response Caching**

```typescript
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 'no-store, must-revalidate, max-age=0',
  }
});
```

### 11.2 Code Splitting

#### **11.2.1 Dynamic Imports**

```typescript
// Lazy load heavy components
const ImportPreviewModal = dynamic(
  () => import('@/components/transactions/ImportPreviewModal'),
  { loading: () => <Skeleton /> }
);
```

#### **11.2.2 Route-Based Splitting**

Next.js automatically code splits by route:
- Each page is a separate chunk
- Shared components bundled separately
- On-demand loading

### 11.3 Loading States

#### **11.3.1 Suspense Boundaries**

```typescript
<Suspense fallback={<Skeleton className="h-96 w-full" />}>
  <TransactionsContent />
</Suspense>
```

#### **11.3.2 Skeleton Loaders**

```typescript
{isLoading ? (
  <div className="space-y-4">
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-96 w-full" />
  </div>
) : (
  <DataTable data={transactions} />
)}
```

### 11.4 Optimistic Updates

See [Section 4.2](#42-optimistic-updates-pattern) for details.

**Benefits:**
- Instant UI feedback
- Better perceived performance
- Automatic rollback on errors

### 11.5 Database Optimizations

#### **11.5.1 Prisma Indexes**

```prisma
model Transaction {
  // ... fields

  @@index([clerkId])
  @@index([monthId])
  @@index([categoryId])
  @@map("transactions")
}
```

#### **11.5.2 Efficient Queries**

```typescript
// Fetch with relations in single query
const transactions = await prisma.transaction.findMany({
  where: { monthId },
  include: {
    category: true,  // Join category data
  },
});
```

---

## 12. Testing Strategy

### 12.1 Test Infrastructure

**Configuration:** `vitest.config.ts`
```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./test/setup/globalSetup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
```

### 12.2 Test Structure

```
test/
└── setup/
    └── globalSetup.ts

domains/
├── Categories/
│   ├── Category.test.ts
│   ├── CategoryMapper.test.ts
│   └── CategoryRepository.test.ts
├── Transactions/
│   └── ...test files
└── Months/
    └── ...test files
```

### 12.3 Testing Patterns

#### **12.3.1 Unit Tests (Domain Layer)**

```typescript
// domains/Categories/Category.test.ts
import { describe, it, expect } from 'vitest';
import { Category } from './Category';

describe('Category', () => {
  it('should create a category with valid data', () => {
    const category = new Category(1, 'Groceries', 'Expense');
    
    expect(category.id).toBe(1);
    expect(category.name).toBe('Groceries');
    expect(category.type).toBe('Expense');
  });

  it('should throw error for invalid type', () => {
    expect(() => {
      new Category(1, 'Test', 'Invalid');
    }).toThrow();
  });
});
```

#### **12.3.2 Repository Tests (with pg-mem)**

```typescript
// domains/Categories/CategoryRepository.test.ts
import { beforeEach, describe, it, expect } from 'vitest';
import { newDb } from 'pg-mem';

describe('CategoryRepository', () => {
  let repository: CategoryRepository;
  let db: any;

  beforeEach(() => {
    db = newDb();
    // Setup test database
    repository = new CategoryRepository(prisma, redis);
  });

  it('should find all categories', async () => {
    const categories = await repository.findAll();
    expect(categories).toBeInstanceOf(Array);
  });
});
```

### 12.4 Test Coverage

**Run Tests:**
```bash
npm run test                 # Run all tests
npm run test:coverage        # Run with coverage report
```

**Coverage Report Location:**
```
coverage/
├── index.html              # HTML coverage report
├── coverage-final.json     # Raw coverage data
└── junction-bank/         # Per-file coverage
```

### 12.5 E2E Testing (Playwright)

```
playwright-report/          # Playwright test reports
test-results/               # Test execution results
```

---

## 13. Build & Deployment

### 13.1 Build Configuration

**Next.js Config:** `next.config.js`
```javascript
const nextConfig = {
  output: "standalone",  // For Docker deployment
};
```

**Build Commands:**
```bash
npm run build           # Production build
npm run start           # Start production server
npm run dev             # Development server
```

### 13.2 Docker Configuration

**File:** `Dockerfile`
```dockerfile
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### 13.3 Environment Variables

**Required:**
```env
# Database
NEXT_PUBLIC_DATABASE_URL=postgresql://...
NEXT_PUBLIC_DIRECT_URL=postgresql://...

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...

# API
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

# Redis
REDIS_URL=redis://localhost:6379
```

### 13.4 Database Migrations

**Prisma Commands:**
```bash
npx prisma generate           # Generate Prisma Client
npx prisma migrate dev        # Run migrations (dev)
npx prisma migrate deploy     # Run migrations (prod)
npx prisma db seed            # Seed database
```

---

## 14. Development Workflow

### 14.1 Development Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:coverage": "vitest run --coverage",
    "prisma:seed": "ts-node prisma/seed.ts",
    "redis:clear": "docker exec junction-bank-valkey-1 redis-cli FLUSHALL"
  }
}
```

### 14.2 Git Workflow

**Current State:**
- 6 commits ahead of origin/main
- Unstaged changes in TransactionMapper
- Untracked files in .development-context/

**Branch Strategy:**
- Main branch: `main`
- Feature branches (recommended)
- Commit before major changes

### 14.3 Code Organization Guidelines

#### **14.3.1 File Naming**

- **React Components:** PascalCase (e.g., `TransactionCard.tsx`)
- **Hooks:** camelCase with `use` prefix (e.g., `useTransactions.ts`)
- **API Routes:** lowercase (e.g., `route.ts`)
- **Types:** PascalCase (e.g., `Transaction.ts`)
- **Utils:** camelCase (e.g., `formatCurrency.ts`)

#### **14.3.2 Import Organization**

```typescript
// 1. External dependencies
import { useState, useEffect } from 'react';
import { format } from 'date-fns';

// 2. Internal dependencies (@ imports)
import { useTransactions } from '@/app/hooks/useTransactions';
import { Transaction } from '@/app/types';

// 3. Components
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/layout/DataTable';

// 4. Relative imports
import { TransactionCard } from './TransactionCard';
```

#### **14.3.3 Component Structure**

```typescript
// 1. Imports
import { ... } from '...';

// 2. Types/Interfaces
interface ComponentProps {
  // ...
}

// 3. Component
export function Component({ prop }: ComponentProps) {
  // 3a. Hooks
  const [state, setState] = useState();
  const { data } = useCustomHook();
  
  // 3b. Handlers
  const handleClick = () => {
    // ...
  };
  
  // 3c. Effects
  useEffect(() => {
    // ...
  }, []);
  
  // 3d. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

---

## 15. Strengths & Opportunities

### 15.1 Strengths

#### **15.1.1 Architecture**
- ✅ Clean domain-driven design
- ✅ Clear separation of concerns
- ✅ Dependency injection pattern
- ✅ Type-safe throughout
- ✅ Reusable component patterns

#### **15.1.2 Developer Experience**
- ✅ TypeScript strict mode
- ✅ Consistent coding patterns
- ✅ Custom hooks for data management
- ✅ Clear file organization
- ✅ Path aliases (@/*)

#### **15.1.3 User Experience**
- ✅ Optimistic updates
- ✅ Loading states
- ✅ Error handling
- ✅ Toast notifications
- ✅ Responsive design

#### **15.1.4 Performance**
- ✅ SWR caching
- ✅ Redis caching
- ✅ Code splitting
- ✅ Optimized queries
- ✅ Standalone build

#### **15.1.5 Modern Stack**
- ✅ Next.js 15 App Router
- ✅ React 18 features
- ✅ Shadcn/ui components
- ✅ Tailwind CSS 4.0
- ✅ Clerk authentication

### 15.2 Opportunities for Improvement

#### **15.2.1 Testing**
- ⚠️ Limited frontend testing
- ⚠️ No component tests
- ⚠️ No integration tests for hooks
- **Recommendation:** Add React Testing Library, add hook tests

#### **15.2.2 Error Boundaries**
- ⚠️ No React Error Boundaries
- ⚠️ Limited error recovery
- **Recommendation:** Add error boundaries at route level

#### **15.2.3 Accessibility**
- ⚠️ Limited ARIA labels
- ⚠️ Keyboard navigation not documented
- **Recommendation:** Audit and enhance a11y

#### **15.2.4 Performance Monitoring**
- ⚠️ No performance metrics
- ⚠️ No error tracking
- **Recommendation:** Add Sentry or similar

#### **15.2.5 Documentation**
- ⚠️ No component documentation
- ⚠️ Limited inline comments
- **Recommendation:** Add JSDoc comments, Storybook

#### **15.2.6 Mobile Responsiveness**
- ⚠️ Fixed sidebar not mobile-optimized
- ⚠️ Tables may not be responsive
- **Recommendation:** Add mobile menu, responsive tables

#### **15.2.7 State Management Complexity**
- ⚠️ Multiple sources of truth (SWR, local state)
- ⚠️ Cache invalidation could be simpler
- **Recommendation:** Consider centralized state if complexity grows

---

## 16. Migration Considerations (Next.js → Laravel)

### 16.1 Frontend Architecture

**Current (Next.js):**
- Server + Client Components
- App Router
- API Route Handlers
- Built-in API

**Future (Laravel Backend):**
- Pure Client Components (React SPA)
- React Router
- Axios to Laravel API
- Separate backend

### 16.2 Authentication Migration

**Current (Clerk):**
```typescript
import { auth } from '@clerk/nextjs/server';
const { userId } = await auth();
```

**Future (Laravel Sanctum):**
```typescript
// Login
const response = await apiClient.post('/api/login', credentials);
localStorage.setItem('token', response.data.token);

// Authenticated requests
apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

### 16.3 API Changes

**Current (Next.js Route Handlers):**
```typescript
// app/api/transactions/route.ts
export async function GET(request: NextRequest) {
  // ...
}
```

**Future (Laravel API):**
```php
// routes/api.php
Route::get('/api/transactions', [TransactionController::class, 'index']);

// app/Http/Controllers/TransactionController.php
public function index(Request $request) {
    $transactions = $this->transactionService->getAll();
    return response()->json($transactions);
}
```

### 16.4 File Structure Mapping

**Keep (Frontend):**
- `/components` - All UI components
- `/app/hooks` - Custom React hooks
- `/app/types` - TypeScript types
- Styling system (Tailwind)

**Remove:**
- `/app/api` - API Route Handlers → Laravel Controllers
- `/infrastructure/prisma.ts` - → Laravel Eloquent
- `/middleware.ts` - → Laravel Middleware

**Move to Laravel:**
- `/domains` - Business logic → Laravel Services/Actions
- Database schema → Laravel Migrations
- Validation → Laravel Form Requests

### 16.5 Component Portability

**Easily Portable (No Changes):**
- All UI components (`/components/ui`)
- Layout components (DataTable, Modal, ResourceDrawer)
- Feature components (transaction cards, forms)
- Utility functions (formatCurrency, cn)

**Needs Updates:**
- Hooks (update API URLs)
- Auth components (Clerk → Sanctum)
- Middleware logic → Laravel

**Example Hook Migration:**
```typescript
// BEFORE (Next.js)
const fetcher = async (url: string) => {
  const res = await fetch(url);
  return res.json();
};

// AFTER (Laravel API)
const fetcher = async (url: string) => {
  const res = await apiClient.get(url);  // Axios with auth token
  return res.data;
};
```

### 16.6 Domain Logic Preservation

The domain-driven design structure is backend-agnostic and can be directly ported to Laravel:

**Current Structure:**
```
domains/Transactions/
├── Actions/          → Laravel Actions (Spatie)
├── Entities/         → Laravel Models
├── Repositories/     → Laravel Repositories
├── Services/         → Laravel Services
├── DTOs/             → Laravel Data Objects
└── Mappers/          → Laravel Transformers/Resources
```

**Laravel Equivalent:**
```
app/Domains/Transactions/
├── Actions/          (Spatie Laravel Actions)
├── Models/           (Eloquent Models)
├── Repositories/     (Repository Pattern)
├── Services/         (Business Logic Services)
├── DataObjects/      (Spatie Data)
└── Resources/        (API Resources)
```

---

## 17. Recommendations for Laravel Migration

### 17.1 Phase 1: Backend Migration

1. **Setup Laravel API**
   - Install Laravel with API support
   - Setup Sanctum authentication
   - Configure CORS
   - Setup PostgreSQL connection

2. **Migrate Domain Logic**
   - Port domain entities to Laravel Models
   - Migrate Actions to Laravel Actions
   - Implement Repositories
   - Setup Services

3. **Create API Endpoints**
   - RESTful routes
   - API Resources for responses
   - Form Requests for validation
   - Middleware for auth

4. **Database Migration**
   - Convert Prisma schema to Laravel migrations
   - Maintain exact same structure
   - Test data integrity

### 17.2 Phase 2: Frontend Adaptation

1. **Update API Client**
   - Configure base URL
   - Add token management
   - Update interceptors

2. **Update Authentication**
   - Remove Clerk
   - Implement Sanctum auth flow
   - Add login/register pages
   - Token refresh logic

3. **Update Hooks**
   - Change API endpoints
   - Update error handling
   - Test SWR integration

4. **Environment Configuration**
   - Update .env variables
   - Configure API URLs
   - Setup CORS

### 17.3 Phase 3: Testing & Deployment

1. **Testing**
   - API endpoint testing
   - Frontend integration tests
   - E2E testing

2. **Docker Setup**
   - Laravel Docker container
   - React build process
   - Nginx configuration
   - Database container

3. **Deployment**
   - CI/CD pipeline
   - Environment management
   - Monitoring setup

### 17.4 Parallel Development Strategy

**Option A: Big Bang Migration**
- Migrate entire backend at once
- Update frontend in parallel
- Switch over completely

**Option B: Incremental Migration**
- Run Next.js and Laravel side-by-side
- Migrate routes one by one
- Use API gateway for routing
- Gradual cutover

**Recommended:** Option B for lower risk

---

## 18. Conclusion

### 18.1 Summary

Junction Bank's frontend is a well-architected Next.js application that demonstrates:

- **Modern React Patterns:** App Router, Server/Client Components, Suspense
- **Strong Type Safety:** TypeScript strict mode throughout
- **Clean Architecture:** DDD principles, layered architecture
- **Developer Experience:** Consistent patterns, reusable components
- **Performance:** Optimistic updates, caching, code splitting
- **Maintainability:** Clear file organization, separation of concerns

### 18.2 Frontend Technology Assessment

**Strengths:**
- Next.js provides excellent DX and performance
- React ecosystem is mature and well-supported
- Shadcn/ui offers high-quality, customizable components
- TypeScript prevents runtime errors
- SWR simplifies data management

**For Laravel Migration:**
- Frontend components are **highly portable**
- Business logic in `/domains` maps well to Laravel
- API changes are straightforward
- Authentication is the biggest change point
- Keep React frontend, swap backend

### 18.3 Final Recommendations

1. **Keep the Frontend Stack**
   - React components are excellent quality
   - Don't need to rebuild UI
   - Focus on backend migration

2. **Preserve Domain Logic**
   - Port `/domains` structure to Laravel
   - Maintain DDD approach
   - Keep the same business rules

3. **Plan Authentication Carefully**
   - Clerk → Sanctum transition
   - Session management
   - Token refresh strategy

4. **Incremental Migration**
   - Start with one domain (e.g., Categories)
   - Test thoroughly
   - Migrate remaining domains

5. **Enhance Before Launch**
   - Add missing tests
   - Improve mobile responsiveness
   - Add error boundaries
   - Setup monitoring

---

## Appendix A: Component Inventory

### A.1 Layout Components
- DataTable (generic table with sorting/filtering)
- Modal (dialog wrapper)
- ResourceDrawer (side drawer for resources)

### A.2 Feature Components

**Transactions:**
- TransactionContent
- TransactionDrawerContent
- TransactionsDataTable
- TransactionsColumns
- NewTransactionModal
- EditTransactionModal
- ImportButton
- CSVUploader
- ImportPreviewModal
- ImportSuccessSummary

**Months:**
- MonthDrawerContent
- MonthsDataTable
- MonthSummaryCard
- CategoryCard
- MetricDisplay
- NewMonthModal

**Categories:**
- CategoryComboBox

**Auth:**
- LogoutButton
- ProtectedRoute

### A.3 UI Components (Shadcn/ui)
- alert, badge, button, calendar, card
- checkbox, combobox, command, dialog, drawer
- dropdown-menu, form, input, label, pagination
- popover, scroll-area, select, skeleton, sonner
- table, textarea

---

## Appendix B: API Endpoint Reference

### B.1 Authentication
- `POST /api/auth` - Authenticate user

### B.2 Transactions
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/:id` - Get transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `POST /api/transactions/import` - Import transactions
- `POST /api/transactions/import/preview` - Preview import

### B.3 Recurring Transactions
- `GET /api/transactions/recurring` - List recurring
- `POST /api/transactions/recurring` - Create recurring
- `GET /api/transactions/recurring/:id` - Get recurring
- `PUT /api/transactions/recurring/:id` - Update recurring
- `DELETE /api/transactions/recurring/:id` - Delete recurring

### B.4 Months
- `GET /api/months` - List months
- `POST /api/months` - Create month
- `GET /api/months/:id` - Get month details
- `PUT /api/months/:id` - Update month
- `DELETE /api/months/:id` - Delete month
- `GET /api/months/latest` - Get current month
- `GET /api/months/:id/categories` - Get spending by category
- `POST /api/months/recalculate` - Recalculate expenses

### B.5 Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `GET /api/categories/:id` - Get category
- `DELETE /api/categories/:id` - Delete category

### B.6 Accounts
- `GET /api/accounts` - Get user account
- `POST /api/accounts` - Update account

---

## Appendix C: Type Definitions Reference

See [Section 8.2](#82-type-definitions) for complete type definitions.

---

## Document Control

**Version History:**
- v1.0 (2025-10-11): Initial frontend analysis report

**Author:** AI Analysis  
**Reviewer:** [To be assigned]  
**Next Review:** [To be scheduled]

---

*End of Frontend Analysis Report*

