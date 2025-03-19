# Junction Bank Technical Specification

## 1. System Overview

- **Core Purpose:**
  Provide a simple, reliable web application for two specific users to track personal expenses and income, manage recurring transactions, and generate detailed monthly and yearly financial reports with visualizations.
- **Value Proposition:**
  Simplifies personal finance management by combining manual entry with automated recurring transaction processing and real-time currency conversion between CAD and USD.
- **Key Workflows:**
  - **User Authentication:** Secure login for two specific users via Supabase.
  - **Expense & Income Management:** Add, edit, and delete transactions with built-in currency conversion.
  - **Category Management:** Organize transactions using customizable categories.
  - **Monthly Template Processing:** Automate recurring transactions via a monthly template system.
  - **Reporting & Visualization:** Generate detailed reports and interactive charts.
- **System Architecture:**
  - **Frontend:** Next.js with Tailwind CSS and shadcn/ui.
  - **Backend:** API routes in Next.js connecting to a Postgres database hosted on Supabase.
  - **Integrations:** Currency exchange API for real-time conversion, Supabase for authentication and database management, potential Stripe for future payments, and PostHog for analytics.
  - **Deployment:** Vercel.

## 2. Project Structure

- **Folder Organization:**
  - `/pages`: Next.js pages for routing (dashboard, login, management screens).
  - `/components`: Reusable UI components (forms, modals, charts, navigation).
  - `/hooks`: Custom React hooks for state management and data fetching.
  - `/lib`: Utility functions (currency conversion, API integrations).
  - `/styles`: Tailwind CSS configuration and global styles.
  - `/api`: Next.js API routes for backend actions (CRUD operations, exchange rate fetching).
- **Organizational Principles:**
  - Modular code structure to separate concerns.
  - Clear division between client components (UI, state) and server components (data fetching, API endpoints).

## 3. Feature Specification

### 3.1 Authentication

- **User Story & Requirements:**
  - Only two pre-existing users can log in.
  - No public registration allowed.
- **Implementation Steps:**
  - Use Supabase authentication for secure login.
  - Implement login page with email and password fields.
  - Enforce user validation against a static list or Supabase user records.
  - Protect all routes; redirect unauthorized access.
- **Error Handling & Edge Cases:**
  - Display clear error messages for invalid credentials.
  - Handle session expiry and automatic re-login prompts.
  - Log any authentication failures for audit.

### 3.2 Expense & Income Management

- **User Story & Requirements:**
  - Users can add, edit, and delete expense and income transactions.
  - Transactions require a name, amount (mandatory in CAD), optional USD value, category, notes, and date.
  - Automatic conversion from USD to CAD if CAD value is missing.
- **Implementation Steps:**
  - Create forms for transaction input with validation.
  - On submission, if only USD is provided, invoke the shared currency conversion service.
  - Allow CRUD operations via API endpoints.
  - Update UI dynamically to reflect transaction changes.
- **Error Handling & Edge Cases:**
  - Validate mandatory fields.
  - Handle conversion API failures with fallback mechanisms.
  - Manage date parsing errors and edge cases (e.g., future dates).

### 3.3 Category Management

- **User Story & Requirements:**
  - Dedicated UI to create, edit, and delete categories.
  - Ensure categories can be linked to existing transactions.
- **Implementation Steps:**
  - Implement a categories management screen.
  - Provide forms for category creation and editing.
  - For deletion, check for existing transactions and prompt for reassignment or warn the user.
- **Error Handling & Edge Cases:**
  - Prevent deletion of a category if linked transactions exist without confirmation.
  - Validate duplicate category names.

### 3.4 Monthly Template System

- **User Story & Requirements:**
  - Users can use a "New Month" feature to copy recurring transactions.
  - Preview recurring transactions before finalizing.
  - Allow marking transactions as recurring.
- **Implementation Steps:**
  - Create a modal triggered by the "New Month" button.
  - Pre-populate current month and year fields with editable options.
  - Display a preview list of recurring transactions.
  - On confirmation, duplicate selected recurring transactions into the new month.
  - Update monthly template table accordingly.
- **Error Handling & Edge Cases:**
  - Handle conflicts if a month already exists.
  - Allow cancellation without side effects.
  - Validate user inputs on month/year fields.

### 3.5 Reporting & Visualizations

- **User Story & Requirements:**
  - Generate monthly and yearly financial reports.
  - Display visualizations such as pie charts, bar charts, line charts, and dashboards.
- **Implementation Steps:**
  - Build API endpoints to aggregate transaction data.
  - Implement UI components to render charts (using a charting library).
  - Enable filtering by category and date range.
  - Include features like month-over-month comparisons.
- **Error Handling & Edge Cases:**
  - Handle cases with insufficient data gracefully.
  - Provide loading states and error messages for failed data fetches.

## 4. Database Schema

### 4.1 Tables

### `users`

- **Fields:**
  - `id` (UUID, primary key)
  - `email` (varchar, unique, not null)
  - `password_hash` (varchar, not null)
  - `created_at` (timestamp, default current timestamp)
- **Relationships:**
  Used by Supabase authentication.

### `categories`

- **Fields:**
  - `id` (serial, primary key)
  - `name` (varchar, not null, unique)
  - `type` (varchar, enum: 'expense', 'income') to differentiate usage
  - `notes` (text, nullable)
  - `created_at` (timestamp, default current timestamp)
- **Indexes:**
  Index on `name` for faster lookups.

### `months`

- **Fields:**
  - `id` (serial, primary key)
  - `month` (integer, not null, 1-12)
  - `year` (integer, not null)
  - `notes` (text, nullable)
  - `created_at` (timestamp, default current timestamp)
- **Indexes:**
  Composite index on `month` and `year`.

### `transactions`

- **Fields:**
  - `id` (serial, primary key)
  - `user_id` (UUID, foreign key to `users.id`)
  - `month_id` (integer, foreign key to `months.id`)
  - `name` (varchar, not null)
  - `amount_cad` (numeric, not null)
  - `amount_usd` (numeric, nullable)
  - `category_id` (integer, foreign key to `categories.id`)
  - `notes` (text, nullable)
  - `date` (date, not null)
  - `type` (varchar, enum: 'expense', 'income')
  - `created_at` (timestamp, default current timestamp)
- **Indexes:**
  Indexes on `user_id`, `month_id`, and `category_id`.

### `monthly_templates`

- **Fields:**
  - `id` (serial, primary key)
  - `transaction_id` (integer, foreign key to `transactions.id`)
  - `user_id` (UUID, foreign key to `users.id`)
  - `created_at` (timestamp, default current timestamp)
- **Purpose:**
  Maintain a record of recurring transactions for re-creation in new months.

## 5. Server Actions

### 5.1 Database Actions

- **Create Transaction:**
  - **Description:** Insert a new expense or income entry.
  - **Input:** User ID, month ID, name, amounts, category ID, notes, date, type, is_recurring flag.
  - **Operation:** INSERT SQL query with validations.
- **Update Transaction:**
  - **Description:** Modify an existing transaction.
  - **Input:** Transaction ID, updated fields.
  - **Operation:** UPDATE SQL query ensuring user ownership.
- **Delete Transaction:**
  - **Description:** Remove a transaction.
  - **Input:** Transaction ID.
  - **Operation:** DELETE SQL query with integrity checks.
- **Recurring Transactions Creation (New Month Action):**
  - **Description:** Duplicate recurring transactions into a new month.
  - **Input:** Month and year details, list of recurring transaction IDs.
  - **Operation:** SELECT recurring transactions, INSERT copies with new month ID.
- **Category Operations:**
  - CRUD operations with validations against existing transactions.

### 5.2 Other Actions

- **Currency Conversion:**
  - **Description:** Convert USD to CAD when required.
  - **Input:** USD amount.
  - **Integration:** Call external free currency exchange rate API.
  - **Error Handling:** Retry on failure; use a cached rate if available.
- **External API Integrations:**
  - **Currency Exchange API:**
    - Endpoint details, API key management.
    - Data format: JSON response with conversion rate.
- **Analytics:**
  - **PostHog Integration:**
    - Setup event tracking endpoints.
    - Define events for login, transaction CRUD operations, and template processing.

## 6. Design System

### 6.1 Visual Style

- **Color Palette:**
  - Primary: `#1E3A8A` (blue)
  - Secondary: `#F59E0B` (amber)
  - Background: Light mode `#FFFFFF`, Dark mode `#1F2937`
  - Accent: `#10B981` (green)
- **Typography:**
  - Font Family: Inter, sans-serif
  - Sizes: Base 16px, headings scaled accordingly
  - Weights: 400 regular, 600 semibold, 700 bold
- **Component Styling Patterns:**
  - Consistent use of Tailwind utility classes.
  - Responsive spacing and grid layouts.
- **Spacing & Layout Principles:**
  - Use of padding/margin scales based on Tailwind defaults.
  - Clear visual hierarchy with ample whitespace.

### 6.2 Core Components

- **Layout Structure:**
  - Dashboard with sidebar navigation and main content area.
  - Modal components for forms (transaction entry, monthly template preview).
- **Navigation Patterns:**
  - Top-level menu for Dashboard, Transactions, Categories, Reports.
  - Breadcrumbs for nested pages.
- **Shared Components:**
  - Button (props: `variant`, `onClick`, `disabled`)
  - Input Field (props: `type`, `value`, `onChange`, `placeholder`)
  - Modal (props: `isOpen`, `onClose`, `children`)
  - Chart Container (props: `data`, `type`, `options`)
- **Interactive States:**
  - Hover, focus, active, and disabled states clearly defined using Tailwind classes.

## 7. Component Architecture

### 7.1 Server Components

- **Data Fetching Strategy:**
  - Use Next.js server components or API routes for fetching data.
  - Fetch transactions, categories, and reports data server-side.
- **Suspense Boundaries & Error Handling:**
  - Wrap data fetching in suspense boundaries.
  - Display fallback UI (e.g., loading spinner) and error messages if fetching fails.
- **Props Interface (TypeScript):**
  - Define interfaces for transaction data, category objects, month objects, etc.
  - Example:
    ```tsx
    interface Transaction {
      id: number
      userId: string
      monthId: number
      name: string
      amountCad: number
      amountUsd?: number
      categoryId: number
      notes?: string
      date: string
      type: "expense" | "income"
      isRecurring: boolean
    }
    ```

### 7.2 Client Components

- **State Management Approach:**
  - Use React Context or Zustand for global state (e.g., user session, active month).
  - Local component state for form inputs and modal visibility.
- **Event Handlers:**
  - Define clear handlers for form submissions, modal toggling, and API call responses.
- **UI Interactions:**
  - Optimistic UI updates where appropriate (e.g., transaction creation).
- **Props Interface (TypeScript):**
  - Define types for component props to enforce consistency and aid in testing.

## 8. Authentication & Authorization

- **Supabase Authentication Implementation:**
  - Configure Supabase client with project credentials.
  - Use Supabase Auth hooks to manage user session.
  - Validate login credentials against stored user records.
- **Protected Routes Configuration:**
  - Implement higher-order components (HOC) or middleware to protect pages.
  - Redirect unauthenticated users to the login page.
- **Session Management:**
  - Use Supabase’s session management; handle token refresh and logout flows.

## 9. Data Flow

- **Server/Client Data Passing:**
  - Leverage Next.js data fetching methods (getServerSideProps, API routes) for initial page loads.
  - Use client-side fetch requests for interactive operations.
- **State Management Architecture:**
  - Global state for session and user details.
  - Local state for transaction forms and real-time updates.
  - Use SWR or React Query for data synchronization between client and server.

## 10. Stripe Integration

_Note: Stripe integration is planned for future enhancement._

- **Payment Flow Diagram:**
  - User initiates payment → Frontend collects payment details → Calls API to create a Stripe session → Redirect to Stripe checkout → Webhook handling for payment confirmation.
- **Webhook Handling Process:**
  - Set up a secure endpoint to handle Stripe webhooks.
  - Validate incoming events and update user payment status.
- **Product/Price Configuration:**
  - Define Stripe products and prices for potential premium features.

## 11. PostHog Analytics

- **Analytics Strategy:**
  - Track key events such as user login, transaction creation, transaction updates, and monthly template actions.
- **Event Tracking Implementation:**
  - Integrate PostHog SDK on the client side.
  - Fire events with relevant properties (e.g., transaction type, amount).
- **Custom Property Definitions:**
  - Define properties such as `transactionId`, `categoryId`, and `monthYear` for enriched analytics.

## 12. Testing

- **Unit Tests with vitest:**
  - Write unit tests for utility functions (currency conversion, data formatting).
  - Example test cases for validating conversion logic and form validations.
- **End-to-End Tests with Playwright:**
  - Simulate user flows such as logging in, adding a transaction, using the monthly template system, and viewing reports.
  - Verify UI responses, error messages, and data persistence.
- **Testing Strategy:**
  - Ensure coverage for both happy paths and edge cases.
  - Use mocking for external API calls (currency exchange, Supabase authentication) during tests.
