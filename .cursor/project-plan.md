## 1. Core Project Setup & Configuration

- [x] Step 1: Initialize Next.js Project with Tailwind CSS and shadcn/ui
  - **Task**: Set up a new Next.js project; install and configure Tailwind CSS and shadcn/ui.
  - **Files**:
    - `package.json`: Add dependencies for Next.js, Tailwind CSS, shadcn/ui, Supabase client.
    - `tailwind.config.js`: Tailwind configuration.
    - `postcss.config.js`: PostCSS configuration.
    - `pages/_app.tsx`: Basic app wrapper integrating global styles.
    - `styles/globals.css`: Global CSS with Tailwind directives.
  - **Step Dependencies**: None.
  - **User Instructions**: Run `npx create-next-app` and install required libraries using `npm install` or `yarn`.
- [x] Step 2: Set Up Project Folder Structure
  - **Task**: Organize folders as per specification: `/pages`, `/components`, `/hooks`, `/lib`, `/styles`, `/api`.
  - **Files**:
    - Create empty directories: `pages/`, `components/`, `hooks/`, `lib/`, `styles/`, `api/`.
  - **Step Dependencies**: Completion of Step 1.
  - **User Instructions**: Ensure folder structure matches the specification.

## 2. Database Schema & Supabase Integration

- [x] Step 3: Define and Deploy Database Schema on Supabase Using Prisma
  - **Task**: Create a Prisma schema file that defines the models for `users`, `categories`, `months`, `transactions`, and `monthly_templates` reflecting the necessary fields, indexes, and relationships. Then, run the Prisma migration to deploy the schema to the Postgres database on Supabase.
  - **Files**:
    - `prisma/schema.prisma`: Prisma schema file with model definitions for users, categories, months, transactions, and monthly_templates.
  - **Step Dependencies**: None.
  - **User Instructions**:
    - Update the `DATABASE_URL` in your environment variables to point to your Supabase Postgres database.
    - Run `npx prisma migrate dev --name init` (or a similar command) to apply the schema to your Supabase database.

## 3. Backend API Routes & Server Actions

- [x] Step 5: Implement Authentication API Route
  - **Task**: Create API route for handling login using Supabase authentication for the two specific users.
  - **Files**:
    - `pages/api/auth/login.ts`: Login endpoint with validation.
  - **Step Dependencies**: Completion of Step 4.
  - **User Instructions**: Update the static user list or integrate with Supabase user records.
- [ ] Step 6: Implement CRUD API Routes for Transactions
  - **Task**: Create endpoints for adding, editing, and deleting transactions (expenses and income) with currency conversion logic.
  - **Files**:
    - `pages/api/transactions/create.ts`
    - `pages/api/transactions/update.ts`
    - `pages/api/transactions/delete.ts`
    - `lib/currencyConversion.ts`: Utility for calling the currency conversion API.
  - **Step Dependencies**: Step 4 and Step 5.
  - **User Instructions**: Set up an API key and URL for the free currency exchange API.
- [ ] Step 7: Implement CRUD API Routes for Categories
  - **Task**: Create endpoints for managing categories (create, edit, delete) with proper validations.
  - **Files**:
    - `pages/api/categories/create.ts`
    - `pages/api/categories/update.ts`
    - `pages/api/categories/delete.ts`
  - **Step Dependencies**: Step 4.
  - **User Instructions**: Ensure validations check for existing transactions when deleting a category.
- [ ] Step 8: Implement API Route for Monthly Template Processing
  - **Task**: Create an endpoint that handles the "New Month" action, duplicating recurring transactions.
  - **Files**:
    - `pages/api/monthly-template/new-month.ts`
  - **Step Dependencies**: Steps 6 and 7.
  - **User Instructions**: Test recurring transaction duplication with sample data.
- [ ] Step 9: Implement API Route for Reporting Data
  - **Task**: Build endpoints that aggregate data for monthly and yearly reports.
  - **Files**:
    - `pages/api/reports/monthly.ts`
    - `pages/api/reports/yearly.ts`
  - **Step Dependencies**: Step 6.
  - **User Instructions**: Ensure endpoints return structured JSON for visualization components.

## 4. Frontend: Shared Components & Layouts

- [ ] Step 10: Create Global Layout & Navigation Components
  - **Task**: Develop a global layout with sidebar navigation, header, and responsive design; include light/dark mode toggle.
  - **Files**:
    - `components/Layout.tsx`: Main layout component.
    - `components/Navigation.tsx`: Sidebar/top navigation component.
  - **Step Dependencies**: Step 1.
  - **User Instructions**: Use Tailwind CSS and shadcn/ui components for styling.
- [ ] Step 11: Build Reusable UI Components
  - **Task**: Create reusable components such as Button, Input Field, Modal, and Chart Container.
  - **Files**:
    - `components/Button.tsx`
    - `components/InputField.tsx`
    - `components/Modal.tsx`
    - `components/ChartContainer.tsx`
  - **Step Dependencies**: Step 10.
  - **User Instructions**: Follow design guidelines for minimal, modern UI.

## 5. Frontend: Pages & Feature-Specific Implementations

- [ ] Step 12: Develop the Login Page with Supabase Authentication
  - **Task**: Create a login page that authenticates the two specific users.
  - **Files**:
    - `pages/login.tsx`: Login page implementation.
  - **Step Dependencies**: Steps 5 and 10.
  - **User Instructions**: Ensure routes are protected post-login.
- [ ] Step 13: Build the Dashboard Page
  - **Task**: Create a dashboard view that displays a quick financial overview with charts and recent transactions.
  - **Files**:
    - `pages/dashboard.tsx`: Dashboard page.
    - Update `components/ChartContainer.tsx` if needed for dashboard visualizations.
  - **Step Dependencies**: Steps 10 and 11.
  - **User Instructions**: Integrate reporting API endpoints for data.
- [ ] Step 14: Implement Expense & Income Management UI
  - **Task**: Create pages or modals for adding, editing, and deleting transactions.
  - **Files**:
    - `pages/transactions.tsx`: Transaction management page.
    - `components/TransactionForm.tsx`: Form component for transaction input.
  - **Step Dependencies**: Steps 6, 10, and 11.
  - **User Instructions**: Validate forms and handle currency conversion.
- [ ] Step 15: Develop Category Management Interface
  - **Task**: Build a dedicated page for creating, editing, and deleting categories.
  - **Files**:
    - `pages/categories.tsx`: Category management page.
    - `components/CategoryForm.tsx`: Category form component.
  - **Step Dependencies**: Step 7 and 10.
  - **User Instructions**: Implement user warnings when deleting linked categories.
- [ ] Step 16: Implement Monthly Template System UI
  - **Task**: Create a modal and page elements to manage recurring transactions and the "New Month" action.
  - **Files**:
    - `components/MonthlyTemplateModal.tsx`: Modal component for recurring transactions.
    - Update `pages/dashboard.tsx` or create `pages/monthly-template.tsx` for template management.
  - **Step Dependencies**: Steps 8 and 11.
  - **User Instructions**: Ensure preview and confirmation functionalities work as expected.
- [ ] Step 17: Build Reporting & Visualization Pages
  - **Task**: Develop pages to display monthly and yearly reports with charts (pie, bar, line charts) and filtering options.
  - **Files**:
    - `pages/reports.tsx`: Main reporting page.
    - Utilize `components/ChartContainer.tsx` for each visualization.
  - **Step Dependencies**: Steps 9, 10, and 11.
  - **User Instructions**: Connect to reporting API endpoints and test with sample data.

## 6. Client-Side State Management & Interactivity

- [ ] Step 18: Implement Global State Management for Authentication & Session
  - **Task**: Use React Context or Zustand to manage user session, active month, and shared state.
  - **Files**:
    - `hooks/useAuth.ts`: Custom hook for authentication state.
    - `hooks/useGlobalState.ts`: Global state hook for session and active month.
  - **Step Dependencies**: Steps 5, 12.
  - **User Instructions**: Ensure session persistence across page reloads.

## 7. Third-Party Integrations & Utility Functions

- [ ] Step 19: Integrate Currency Conversion Service
  - **Task**: Finalize the shared currency conversion service using a free currency exchange API.
  - **Files**:
    - `lib/currencyConversion.ts`: Complete conversion logic with error handling and caching.
  - **Step Dependencies**: Step 6.
  - **User Instructions**: Configure API keys and test conversion with different currencies.
