# API Documentation

## Overview

Junction Bank API is a RESTful API built with Laravel, following domain-driven design principles. Authentication uses Laravel Sanctum with Bearer tokens.

## Base URLs

-   Development: `http://localhost:8000/api`
-   Production: `https://api.junctionbank.com/api`

## Authentication

### Bearer Token Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```http
Authorization: Bearer {token}
```

### Obtaining a Token

**Register:**

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePassword123!",
    "password_confirmation": "SecurePassword123!"
  }'
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

**Login:**

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123!"
  }'
```

## Common Patterns

### Pagination

List endpoints support pagination via query parameters:

```bash
GET /api/transactions?page=2&limit=25
```

**Response:**

```json
{
  "data": [...],
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

### Error Responses

All errors follow a consistent format:

```json
{
    "error": {
        "message": "The given data was invalid.",
        "code": "VALIDATION_ERROR",
        "details": {
            "email": ["The email field is required."],
            "password": ["The password must be at least 8 characters."]
        }
    }
}
```

**HTTP Status Codes:**

-   `200` - Success
-   `201` - Created
-   `400` - Bad Request
-   `401` - Unauthorized
-   `403` - Forbidden
-   `404` - Not Found
-   `409` - Conflict
-   `422` - Unprocessable Entity
-   `500` - Internal Server Error

### Rate Limiting

Rate limits are applied per minute:

-   **Authenticated endpoints:** 120 requests/minute
-   **Import endpoints:** 10 requests/minute
-   **Auth endpoints:** 10 requests/minute

**Headers:**

```http
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 119
X-RateLimit-Reset: 1234567890
```

## Domain Examples

### Categories

**Create Category:**

```bash
curl -X POST http://localhost:8000/api/categories \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Groceries",
    "type": "expense",
    "notes": "Food and household items"
  }'
```

**List Categories:**

```bash
curl -X GET http://localhost:8000/api/categories \
  -H "Authorization: Bearer {token}"
```

**Delete Category:**

```bash
curl -X DELETE http://localhost:8000/api/categories/1 \
  -H "Authorization: Bearer {token}"
```

### Transactions

**Create Transaction:**

```bash
curl -X POST http://localhost:8000/api/transactions \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Grocery Store",
    "amountCAD": 125.50,
    "categoryId": 1,
    "date": "2024-01-15",
    "monthId": 1,
    "type": "Expense",
    "notes": "Weekly shopping"
  }'
```

**List Transactions (filtered by month):**

```bash
curl -X GET "http://localhost:8000/api/transactions?monthId=1" \
  -H "Authorization: Bearer {token}"
```

**Update Transaction:**

```bash
curl -X PUT http://localhost:8000/api/transactions/1 \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Grocery Store",
    "amountCAD": 130.00
  }'
```

### CSV Import

**Preview Import:**

```bash
curl -X POST http://localhost:8000/api/transactions/preview \
  -H "Authorization: Bearer {token}" \
  -F "file=@transactions.csv"
```

**CSV Format:**

```csv
Date,Name,AMOUNT CAD,AMOUNT USD,Category Id,Notes,Type
01/15/2024,Grocery Store,125.50,,1,Weekly shopping,Expense
01/16/2024,Salary,5000.00,,2,Monthly income,Income
```

**Supported Date Formats:**

-   MM/DD/YYYY (US)
-   DD/MM/YYYY (European)
-   YYYY-MM-DD (ISO)
-   DD.MM.YYYY

**Process Import:**

```bash
curl -X POST http://localhost:8000/api/transactions/import \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "transactions": [
      {
        "name": "Grocery Store",
        "amountCAD": 125.50,
        "categoryId": 1,
        "date": "2024-01-15",
        "monthId": 1,
        "type": "Expense"
      }
    ]
  }'
```

### Months

**Create Month:**

```bash
curl -X POST http://localhost:8000/api/months \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "month": 1,
    "year": 2024,
    "notes": "January budget"
  }'
```

**Get Latest Month:**

```bash
curl -X GET http://localhost:8000/api/months/latest \
  -H "Authorization: Bearer {token}"
```

**Get Category Spending:**

```bash
curl -X GET http://localhost:8000/api/months/1/spending \
  -H "Authorization: Bearer {token}"
```

**Recalculate Recurring Expenses:**

```bash
# For specific month
curl -X POST http://localhost:8000/api/months/recalculate \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"monthId": 1}'

# For all months
curl -X POST http://localhost:8000/api/months/recalculate \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Recurring Transactions

**Create Recurring Transaction:**

```bash
curl -X POST http://localhost:8000/api/recurring-transactions \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Netflix Subscription",
    "amountCAD": 15.99,
    "categoryId": 5,
    "dayOfMonth": 15,
    "type": "Expense",
    "notes": "Monthly streaming"
  }'
```

**List Recurring Transactions:**

```bash
curl -X GET http://localhost:8000/api/recurring-transactions \
  -H "Authorization: Bearer {token}"
```

## OpenAPI Specification

The complete API specification is available in OpenAPI 3.0 format:

**File:** `docs/openapi.yaml`

### Using the OpenAPI Spec

**Swagger UI:**

```bash
# Install Swagger UI
npm install -g swagger-ui-express

# Serve the spec
swagger-ui-express docs/openapi.yaml
```

**Postman:**

1. Import `docs/openapi.yaml` into Postman
2. Collections and environments will be auto-generated

**Code Generation:**

```bash
# Generate TypeScript client
npx @openapitools/openapi-generator-cli generate \
  -i docs/openapi.yaml \
  -g typescript-fetch \
  -o generated/api-client
```

## Development Tools

### Testing with curl

Export token for convenience:

```bash
export TOKEN="1|abc123def456..."

curl -X GET http://localhost:8000/api/categories \
  -H "Authorization: Bearer $TOKEN"
```

### Using HTTPie

```bash
# Login
http POST localhost:8000/api/auth/login \
  email=john@example.com \
  password=SecurePassword123!

# Set token
TOKEN="1|abc123def456..."

# Make requests
http GET localhost:8000/api/categories \
  "Authorization: Bearer $TOKEN"
```

### Postman Collection

Import `docs/openapi.yaml` into Postman for a complete collection.

**Environment Variables:**

-   `base_url`: `http://localhost:8000/api`
-   `token`: Your Bearer token

## Business Logic

### Category Rules

-   Category names must be unique
-   Cannot delete categories with associated transactions
-   Types: `income` or `expense`

### Transaction Rules

-   Requires valid `categoryId` and `monthId`
-   Date must match the month's year/month
-   Amount must be positive
-   Either `amountCAD` or `amountUSD` required (both allowed)

### Month Rules

-   Month/year combination must be unique
-   Cannot delete months with transactions
-   Creating a month automatically applies recurring transactions
-   Totals auto-calculate based on transactions

### Recurring Transaction Rules

-   Applies to all future months when created
-   Does not retroactively update past transactions
-   Deleting does not remove already-created transactions
-   `dayOfMonth` defaults to 1 if not specified

## Performance

### Caching

The following endpoints use Redis caching:

-   `GET /api/categories` - 1 hour
-   `GET /api/transactions` - 5 minutes
-   `GET /api/months` - 10 minutes

Cache is automatically invalidated on mutations.

### Batch Operations

Use the CSV import endpoints for bulk transaction creation:

```
POST /api/transactions/preview  # Validate
POST /api/transactions/import   # Process
```

Batch import uses database transactions and optimized inserts.

## CORS Configuration

**Development:**

-   Allowed Origin: `http://localhost:3000`
-   Credentials: true

**Production:**

-   Allowed Origin: `https://app.junctionbank.com`
-   Credentials: true

**Methods:** GET, POST, PUT, DELETE, OPTIONS  
**Headers:** Content-Type, Authorization, X-Requested-With

## Webhooks (Future)

Webhook support planned for:

-   Transaction created/updated/deleted
-   Month created/updated
-   Recurring transaction applied

## GraphQL (Future)

GraphQL endpoint planned for more flexible queries.

## Support

-   **Documentation:** [README.md](../README.md)
-   **OpenAPI Spec:** [openapi.yaml](openapi.yaml)
-   **Endpoint Reference:** [.development-context/api-endpoints-reference.md](../.development-context/api-endpoints-reference.md)
