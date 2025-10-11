# API Endpoints Reference
## Junction Bank - Complete Endpoint Documentation

**Last Updated:** October 11, 2025  
**Purpose:** Quick reference for Laravel API migration and PRD creation

---

## Authentication

**Current:** Clerk authentication via `x-user-id` header  
**Future:** Laravel Sanctum with Bearer tokens

**Required on all authenticated endpoints:**
- Header: `x-user-id: {clerkId}` (current)
- Header: `Authorization: Bearer {token}` (future)

---

## Categories Domain

### List All Categories
**Endpoint:** `GET /api/categories`  
**Auth:** Required  
**Query Params:** None  
**Response:**
```json
[
  {
    "id": 1,
    "name": "Groceries",
    "type": "expense",
    "notes": "Food and household items",
    "isRecurring": false,
    "createdAt": "2024-01-15T00:00:00Z"
  }
]
```
**Use Case:** IndexCategories  
**Cache:** Yes (Redis)

---

### Show Single Category
**Endpoint:** `GET /api/categories/{id}`  
**Auth:** Required  
**Path Params:**
- `id` (integer): Category ID  

**Response:**
```json
{
  "id": 1,
  "name": "Groceries",
  "type": "expense",
  "notes": "Food and household items",
  "isRecurring": false,
  "createdAt": "2024-01-15T00:00:00Z"
}
```
**Errors:**
- `404`: Category not found  

**Use Case:** ShowCategory

---

### Create Category
**Endpoint:** `POST /api/categories`  
**Auth:** Required  
**Request Body:**
```json
{
  "name": "Groceries",
  "type": "expense",
  "notes": "Food and household items"
}
```
**Validation:**
- `name`: required, string, unique
- `type`: required, enum ('income', 'expense')
- `notes`: optional, string

**Response:**
```json
{
  "data": {
    "id": 1,
    "name": "Groceries",
    "type": "expense",
    "notes": "Food and household items",
    "isRecurring": false,
    "createdAt": "2024-01-15T00:00:00Z"
  }
}
```
**Errors:**
- `400`: Validation error (missing required fields)
- `409`: Category already exists (duplicate name)

**Use Case:** StoreCategory  
**Side Effects:** Cache invalidation

---

### Delete Category
**Endpoint:** `DELETE /api/categories/{id}`  
**Auth:** Required  
**Path Params:**
- `id` (integer): Category ID

**Response:**
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```
**Errors:**
- `404`: Category not found
- `409`: Category has transactions (cannot delete)

**Use Case:** DeleteCategory  
**Business Rules:** Cannot delete category with associated transactions  
**Side Effects:** Cache invalidation

---

## Transactions Domain

### List Transactions
**Endpoint:** `GET /api/transactions`  
**Auth:** Required  
**Query Params:**
- `monthId` (optional, integer): Filter by month

**Response:**
```json
[
  {
    "id": 1,
    "clerkId": "user_123",
    "name": "Grocery Store",
    "amountCAD": 125.50,
    "amountUSD": null,
    "categoryId": 1,
    "categoryName": "Groceries",
    "notes": "Weekly shopping",
    "type": "Expense",
    "date": "2024-01-15",
    "monthId": 1,
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```
**Use Case:** IndexTransactions  
**Cache:** Yes (Redis, key: `transactions:{monthId}`)

---

### Show Single Transaction
**Endpoint:** `GET /api/transactions/{id}`  
**Auth:** Required  
**Path Params:**
- `id` (integer): Transaction ID

**Response:**
```json
{
  "id": 1,
  "clerkId": "user_123",
  "name": "Grocery Store",
  "amountCAD": 125.50,
  "amountUSD": null,
  "categoryId": 1,
  "categoryName": "Groceries",
  "notes": "Weekly shopping",
  "type": "Expense",
  "date": "2024-01-15",
  "monthId": 1,
  "createdAt": "2024-01-15T10:30:00Z"
}
```
**Errors:**
- `404`: Transaction not found

**Use Case:** ShowTransaction  
**Cache:** Yes (Redis, key: `transaction:{id}`)

---

### Create Transaction
**Endpoint:** `POST /api/transactions`  
**Auth:** Required  
**Request Body:**
```json
{
  "name": "Grocery Store",
  "amountCAD": 125.50,
  "amountUSD": null,
  "categoryId": 1,
  "notes": "Weekly shopping",
  "type": "Expense",
  "date": "2024-01-15",
  "monthId": 1
}
```
**Validation:**
- `name`: required, string
- `amountCAD`: required, decimal (10,2)
- `amountUSD`: optional, decimal (10,2)
- `categoryId`: required, integer, exists in categories
- `notes`: optional, string
- `type`: optional, enum ('Income', 'Expense'), defaults to 'Expense'
- `date`: required, date
- `monthId`: required, integer, exists in months

**Response:**
```json
{
  "data": {
    "id": 1,
    "clerkId": "user_123",
    "name": "Grocery Store",
    "amountCAD": 125.50,
    "amountUSD": null,
    "categoryId": 1,
    "categoryName": "Groceries",
    "notes": "Weekly shopping",
    "type": "Expense",
    "date": "2024-01-15",
    "monthId": 1,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```
**Errors:**
- `400`: Validation error
- `404`: Category or Month not found

**Use Case:** StoreTransaction  
**Side Effects:**
- Cache invalidation
- Month totals update (totalIncome/totalExpenses)

---

### Update Transaction
**Endpoint:** `PUT /api/transactions/{id}`  
**Auth:** Required  
**Path Params:**
- `id` (integer): Transaction ID

**Request Body:** (all fields optional for partial update)
```json
{
  "name": "Updated Grocery Store",
  "amountCAD": 130.00,
  "amountUSD": null,
  "categoryId": 1,
  "notes": "Weekly shopping with extras",
  "type": "Expense",
  "date": "2024-01-15",
  "monthId": 1
}
```
**Response:**
```json
{
  "data": {
    "id": 1,
    "clerkId": "user_123",
    "name": "Updated Grocery Store",
    "amountCAD": 130.00,
    "amountUSD": null,
    "categoryId": 1,
    "categoryName": "Groceries",
    "notes": "Weekly shopping with extras",
    "type": "Expense",
    "date": "2024-01-15",
    "monthId": 1,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```
**Errors:**
- `404`: Transaction not found
- `400`: Validation error

**Use Case:** UpdateTransaction  
**Side Effects:**
- Cache invalidation
- Month totals recalculation if amount or type changed

---

### Delete Transaction
**Endpoint:** `DELETE /api/transactions/{id}`  
**Auth:** Required  
**Path Params:**
- `id` (integer): Transaction ID

**Response:**
```json
{
  "success": true,
  "message": "Transaction deleted successfully"
}
```
**Errors:**
- `404`: Transaction not found

**Use Case:** DeleteTransaction  
**Side Effects:**
- Cache invalidation
- Month totals update

---

### Preview Import
**Endpoint:** `POST /api/transactions/preview`  
**Auth:** Required  
**Content-Type:** `multipart/form-data`  
**Request Body:**
- `file`: CSV file upload

**CSV Format:**
```csv
Date,Name,AMOUNT CAD,AMOUNT USD,Category Id,Notes,Type
01/15/2024,Grocery Store,125.50,,1,Weekly shopping,Expense
01/16/2024,Salary,5000.00,,2,Monthly income,Income
```

**Supported Date Formats:**
- MM/DD/YYYY (US format)
- DD/MM/YYYY (European)
- YYYY-MM-DD (ISO)
- DD.MM.YYYY

**Response:**
```json
{
  "validTransactions": [
    {
      "clerkId": "user_123",
      "name": "Grocery Store",
      "amountCAD": 125.50,
      "amountUSD": null,
      "categoryId": 1,
      "notes": "Weekly shopping",
      "type": "Expense",
      "date": "2024-01-15T00:00:00Z",
      "monthId": 1
    }
  ],
  "errors": [
    {
      "row": 5,
      "message": "Invalid date format: 2024/32/01",
      "originalData": { /* original CSV row */ }
    }
  ],
  "summary": {
    "totalRows": 100,
    "validRows": 95,
    "errorRows": 5
  }
}
```
**Use Case:** PreviewTransactions  
**Business Logic:**
- Validates CSV format and content
- Checks category existence
- Creates months if they don't exist
- Returns preview without persisting

---

### Process Import
**Endpoint:** `POST /api/transactions/import`  
**Auth:** Required  
**Request Body:**
```json
{
  "transactions": [
    {
      "clerkId": "user_123",
      "name": "Grocery Store",
      "amountCAD": 125.50,
      "amountUSD": null,
      "categoryId": 1,
      "notes": "Weekly shopping",
      "type": "Expense",
      "date": "2024-01-15T00:00:00Z",
      "monthId": 1
    }
  ]
}
```
**Note:** This receives the validated transactions from the preview step

**Response:**
```json
{
  "success": true,
  "summary": {
    "imported": 95,
    "failed": 0,
    "totalProcessed": 95
  },
  "createdTransactions": [
    {
      "id": 100,
      "name": "Grocery Store",
      /* ... full transaction object */
    }
  ]
}
```
**Errors:**
- `400`: Validation error
- `500`: Database error during import

**Use Case:** ProcessTransactionImport → BatchStoreTransactions  
**Performance:** Uses batch insert for efficiency  
**Side Effects:**
- Cache invalidation
- Month totals recalculation

---

## Months Domain

### List Months
**Endpoint:** `GET /api/months`  
**Auth:** Required  
**Query Params:**
- `year` (optional, integer): Filter by year
- `page` (optional, integer): Page number
- `limit` (optional, integer): Results per page

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "month": 1,
      "year": 2024,
      "notes": "January budget",
      "totalIncome": 5000.00,
      "totalExpenses": 3200.00,
      "recurringExpenses": 1800.00,
      "transactionCount": 45,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 36,
    "perPage": 12
  }
}
```
**Use Case:** IndexMonths  
**Cache:** Yes (Redis)

---

### Show Month
**Endpoint:** `GET /api/months/{id}`  
**Auth:** Required  
**Path Params:**
- `id` (integer): Month ID

**Response:**
```json
{
  "id": 1,
  "month": 1,
  "year": 2024,
  "notes": "January budget",
  "totalIncome": 5000.00,
  "totalExpenses": 3200.00,
  "recurringExpenses": 1800.00,
  "transactionCount": 45,
  "createdAt": "2024-01-01T00:00:00Z",
  "calculated": {
    "cashflow": 1800.00,
    "nonRecurringExpenses": 1400.00,
    "projectedDailyBudget": 103.23,
    "remainingDailyBudget": 90.00,
    "actualDailySpend": 70.00,
    "daysTotal": 31,
    "daysLeft": 20,
    "daysPassed": 11,
    "isCurrentMonth": true
  }
}
```
**Use Case:** ShowMonth  
**Cache:** Yes

---

### Show Latest Month
**Endpoint:** `GET /api/months/latest`  
**Auth:** Required  
**Query Params:** None

**Response:** Same as Show Month

**Use Case:** ShowLatestMonth  
**Business Logic:** Returns the most recently created month

---

### Create Month
**Endpoint:** `POST /api/months`  
**Auth:** Required  
**Request Body:**
```json
{
  "month": 1,
  "year": 2024,
  "notes": "January budget"
}
```
**Validation:**
- `month`: required, integer (1-12)
- `year`: required, integer (1900-2100)
- `notes`: optional, string

**Response:**
```json
{
  "data": {
    "id": 1,
    "month": 1,
    "year": 2024,
    "notes": "January budget",
    "totalIncome": 0.00,
    "totalExpenses": 0.00,
    "recurringExpenses": 0.00,
    "transactionCount": 0,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```
**Errors:**
- `400`: Validation error
- `409`: Month already exists for this month/year combination

**Use Case:** StoreMonth  
**Side Effects:**
- Automatically applies recurring transactions to new month
- Creates transactions from all active recurring patterns
- Updates month totals after recurring transactions applied
- Cache invalidation

---

### Update Month
**Endpoint:** `PUT /api/months/{id}`  
**Auth:** Required  
**Path Params:**
- `id` (integer): Month ID

**Request Body:** (all fields optional for partial update)
```json
{
  "month": 2,
  "year": 2024,
  "notes": "Updated notes"
}
```
**Response:** Same as Show Month

**Errors:**
- `404`: Month not found
- `409`: Month/year combination already exists

**Use Case:** UpdateMonth  
**Side Effects:** Cache invalidation

---

### Delete Month
**Endpoint:** `DELETE /api/months/{id}`  
**Auth:** Required  
**Path Params:**
- `id` (integer): Month ID

**Response:**
```json
{
  "success": true,
  "message": "Month deleted successfully"
}
```
**Errors:**
- `404`: Month not found
- `409`: Month has transactions (cannot delete)

**Use Case:** DestroyMonth  
**Business Rules:** Cannot delete month with transactions  
**Side Effects:** Cache invalidation

---

### Recalculate Recurring Expenses
**Endpoint:** `POST /api/months/recalculate`  
**Auth:** Required  
**Request Body:**
```json
{
  "monthId": 1
}
```
**Note:** If `monthId` is null/omitted, recalculates all months

**Response:**
```json
{
  "success": true,
  "message": "Recurring expenses recalculated",
  "monthsUpdated": 1
}
```
**Use Case:** RecalculateRecurringExpenses  
**Side Effects:**
- Updates `recurringExpenses` field
- Cache invalidation

---

### Get Monthly Spending by Category
**Endpoint:** `GET /api/months/{id}/spending`  
**Auth:** Required  
**Path Params:**
- `id` (integer): Month ID

**Response:**
```json
[
  {
    "categoryId": 1,
    "categoryName": "Groceries",
    "totalAmountCAD": "$1,234.56",
    "totalAmountUSD": "$123.45",
    "total": 1358.01
  },
  {
    "categoryId": 2,
    "categoryName": "Transportation",
    "totalAmountCAD": "$567.89",
    "totalAmountUSD": "$0.00",
    "total": 567.89
  }
]
```
**Note:** Sorted by total amount descending

**Use Case:** GetMonthlySpendingByCategory  
**Business Logic:**
- Aggregates CAD and USD spending separately
- Combines totals for sorting
- Formats currency values for display

---

## Recurring Transactions Domain

### List Recurring Transactions
**Endpoint:** `GET /api/recurring-transactions`  
**Auth:** Required  
**Query Params:** None

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "clerkId": "user_123",
      "name": "Netflix Subscription",
      "amountCAD": 15.99,
      "amountUSD": 12.99,
      "categoryId": 5,
      "categoryName": "Entertainment",
      "notes": "Monthly streaming",
      "dayOfMonth": 15,
      "type": "Expense",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 12
  }
}
```
**Use Case:** IndexRecurringTransactions

---

### Show Recurring Transaction
**Endpoint:** `GET /api/recurring-transactions/{id}`  
**Auth:** Required  
**Path Params:**
- `id` (integer): Recurring transaction ID

**Response:**
```json
{
  "id": 1,
  "clerkId": "user_123",
  "name": "Netflix Subscription",
  "amountCAD": 15.99,
  "amountUSD": 12.99,
  "categoryId": 5,
  "categoryName": "Entertainment",
  "notes": "Monthly streaming",
  "dayOfMonth": 15,
  "type": "Expense",
  "createdAt": "2024-01-01T00:00:00Z"
}
```
**Errors:**
- `404`: Recurring transaction not found

**Use Case:** ShowRecurringTransaction

---

### Create Recurring Transaction
**Endpoint:** `POST /api/recurring-transactions`  
**Auth:** Required  
**Request Body:**
```json
{
  "name": "Netflix Subscription",
  "amountCAD": 15.99,
  "amountUSD": 12.99,
  "categoryId": 5,
  "notes": "Monthly streaming",
  "dayOfMonth": 15,
  "type": "Expense"
}
```
**Validation:**
- `name`: required, string
- `amountCAD`: optional, decimal (10,2)
- `amountUSD`: optional, decimal (10,2)
- At least one amount (CAD or USD) required
- `categoryId`: required, integer, exists in categories
- `notes`: optional, string
- `dayOfMonth`: optional, integer (1-31)
- `type`: optional, enum ('Income', 'Expense'), defaults to 'Expense'

**Response:**
```json
{
  "data": {
    "id": 1,
    "clerkId": "user_123",
    "name": "Netflix Subscription",
    "amountCAD": 15.99,
    "amountUSD": 12.99,
    "categoryId": 5,
    "categoryName": "Entertainment",
    "notes": "Monthly streaming",
    "dayOfMonth": 15,
    "type": "Expense",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```
**Errors:**
- `400`: Validation error
- `404`: Category not found

**Use Case:** StoreRecurringTransaction  
**Side Effects:**
- Currency conversion (USD → CAD) if only USD provided
- All future months will include this recurring transaction

---

### Update Recurring Transaction
**Endpoint:** `PUT /api/recurring-transactions/{id}`  
**Auth:** Required  
**Path Params:**
- `id` (integer): Recurring transaction ID

**Request Body:** (all fields optional for partial update)
```json
{
  "name": "Netflix Premium",
  "amountCAD": 19.99,
  "amountUSD": 15.99,
  "categoryId": 5,
  "notes": "Updated to premium plan",
  "dayOfMonth": 15,
  "type": "Expense"
}
```
**Response:** Same as Show Recurring Transaction

**Errors:**
- `404`: Recurring transaction not found
- `400`: Validation error
- `409`: Name already exists (if name changed)

**Use Case:** UpdateRecurringTransaction  
**Side Effects:**
- Currency conversion if amounts change
- Does NOT retroactively update already created transactions
- Future month applications will use new values

---

### Delete Recurring Transaction
**Endpoint:** `DELETE /api/recurring-transactions/{id}`  
**Auth:** Required  
**Path Params:**
- `id` (integer): Recurring transaction ID

**Response:**
```json
{
  "success": true,
  "message": "Recurring transaction deleted successfully"
}
```
**Errors:**
- `404`: Recurring transaction not found

**Use Case:** DeleteRecurringTransaction  
**Side Effects:**
- Future months will NOT include this recurring transaction
- Already created transactions are NOT deleted

---

## Authentication Endpoints (Future)

### Register
**Endpoint:** `POST /api/auth/register`  
**Auth:** None  
**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "password_confirmation": "SecurePassword123!"
}
```
**Response:**
```json
{
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "created_at": "2024-01-15T00:00:00Z"
    },
    "token": "1|abc123def456..."
  }
}
```

---

### Login
**Endpoint:** `POST /api/auth/login`  
**Auth:** None  
**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```
**Response:**
```json
{
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "1|abc123def456..."
  }
}
```

---

### Logout
**Endpoint:** `POST /api/auth/logout`  
**Auth:** Required (Bearer token)  
**Request Body:** None  
**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Get Current User
**Endpoint:** `GET /api/auth/me`  
**Auth:** Required  
**Request Body:** None  
**Response:**
```json
{
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2024-01-15T00:00:00Z"
  }
}
```

---

## Error Response Format

All errors follow a consistent format:

```json
{
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "details": {
      "field": ["Specific validation error"]
    }
  }
}
```

### Standard HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (not authenticated)
- `403`: Forbidden (not authorized)
- `404`: Not Found
- `409`: Conflict (duplicate, constraint violation)
- `422`: Unprocessable Entity (validation error)
- `500`: Internal Server Error

---

## Rate Limiting (Future)

**Recommended limits:**
- Authenticated: 120 requests/minute
- Import endpoints: 10 requests/minute
- Auth endpoints: 10 requests/minute

**Headers:**
```
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 119
X-RateLimit-Reset: 1234567890
```

---

## Pagination Format

**Request:**
```
GET /api/transactions?page=2&limit=25
```

**Response:**
```json
{
  "data": [ /* ... */ ],
  "pagination": {
    "currentPage": 2,
    "totalPages": 10,
    "totalItems": 250,
    "perPage": 25,
    "hasNext": true,
    "hasPrev": true
  }
}
```

---

## CORS Configuration

**Allowed Origins:**
- Development: `http://localhost:3000`
- Production: `https://app.junctionbank.com`

**Allowed Methods:** GET, POST, PUT, DELETE, OPTIONS  
**Allowed Headers:** Content-Type, Authorization, X-Requested-With  
**Credentials:** true

---

**End of API Reference**

