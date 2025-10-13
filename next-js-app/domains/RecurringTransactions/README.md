# RecurringTransactions Domain

The RecurringTransactions domain manages recurring financial transactions that are automatically applied to months, such as subscriptions, bills, and regular income sources.

## Architecture Overview

This domain follows Clean Architecture principles and integrates with the Transactions domain to automatically create regular transactions based on recurring patterns.

- **Entities**: Core business objects for recurring transactions
- **Actions**: Application use cases and business logic
- **Repositories**: Data access interfaces and implementations
- **DTOs**: Data transfer objects for API communication
- **Mappers**: Data transformation utilities

## Components

### Entities
- **`RecurringTransaction.ts`**: Core recurring transaction entity
  - Defines transaction patterns (daily, monthly, etc.)
  - Manages currency amounts (CAD/USD)
  - Handles day-of-month scheduling
  - Enforces business constraints

### Actions (Use Cases)
- **`StoreRecurringTransaction.ts`**: Creates new recurring transactions
- **`UpdateRecurringTransaction.ts`**: Updates existing recurring transactions
- **`DeleteRecurringTransaction.ts`**: Removes recurring transactions
- **`ShowRecurringTransaction.ts`**: Retrieves single recurring transaction
- **`IndexRecurringTransactions.ts`**: Lists all recurring transactions

### Repositories
- **`IRecurringTransactionRepository.ts`**: Interface defining recurring transaction operations
- **`RecurringTransactionRepository.ts`**: Prisma-based implementation
  - Implements CRUD operations
  - Handles month application logic
  - Manages transaction creation from recurring patterns

### DTOs (Data Transfer Objects)
- **`RecurringTransactionDTO.ts`**: Data structure for recurring transaction operations

### Mappers
- **`RecurringTransactionMapper.ts`**: Converts between domain entities and persistence models
  - `toDomain()`: Converts database models to domain entities
  - `toPersistence()`: Converts domain entities to database models

### Exceptions
- **`RecurringTransactionException.ts`**: Domain-specific exception handling

## Key Features

### Recurring Transaction Management
- Full CRUD operations for recurring transactions
- Support for both CAD and USD currencies
- Day-of-month scheduling (e.g., bills due on 15th of each month)
- Category-based organization
- Notes and metadata support

### Month Application System
- Automatic transaction creation from recurring patterns
- Bulk application to specific months
- Transaction count tracking
- Month total updates (income/expenses)

### Integration with Transactions
- Seamless creation of regular transactions
- Maintains currency conversion consistency
- Preserves category and metadata relationships

## Recent Refactoring

### Before (Repetitive Pattern)
```typescript
const updateData: Prisma.RecurringTransactionUpdateInput = {};

if (data.name !== undefined) updateData.name = data.name;
if (data.amountCAD !== undefined) updateData.amountCAD = data.amountCAD;
if (data.amountUSD !== undefined) updateData.amountUSD = data.amountUSD;
if (data.categoryId !== undefined) updateData.category = { connect: { id: data.categoryId } };
if (data.notes !== undefined) updateData.notes = data.notes;
if (data.dayOfMonth !== undefined) updateData.dayOfMonth = data.dayOfMonth;
if (data.type !== undefined) updateData.type = data.type as TransactionType;
```

### After (Clean Utility)
```typescript
const updateData = cleanUpdateData(data, {
  type: (value: any) => value as TransactionType,
  categoryId: (value: any) => ({ connect: { id: value } })
}) as Prisma.RecurringTransactionUpdateInput;
```

**Benefits:**
- Eliminated repetitive `if (data.field !== undefined)` checks
- Centralized update logic in reusable utility
- Improved code maintainability and readability
- Maintained type safety and functionality

## Usage Examples

### Creating a Recurring Transaction
```typescript
const recurringData = {
  clerkId: 'user123',
  name: 'Netflix Subscription',
  amountCAD: 15.99,
  amountUSD: 12.99,
  categoryId: 5, // Entertainment
  notes: 'Monthly streaming service',
  type: 'Expense',
  dayOfMonth: 15
};

const recurring = await storeRecurringTransaction.execute(recurringData);
```

### Updating a Recurring Transaction
```typescript
const updateData = {
  amountCAD: 16.99,
  notes: 'Updated pricing'
};

const updated = await updateRecurringTransaction.execute(recurringId, updateData);
```

### Applying to a Month
```typescript
// This happens automatically when recurring transactions are processed
const transactionsCreated = await recurringTransactionRepository.applyToMonth(
  monthId, 
  month, 
  year
);
```

## Month Application Process

### 1. Transaction Creation
When `applyToMonth()` is called:
- Retrieves all active recurring transactions
- Creates regular transactions for the specified month
- Sets the date based on `dayOfMonth` and month/year
- Preserves all metadata and currency values

### 2. Month Totals Update
After creating transactions:
- Calculates new income/expense totals
- Updates month record with new totals
- Increments transaction count

### 3. Cache Management
- Invalidates related caches
- Ensures data consistency across the system

## Testing

The domain includes comprehensive test coverage:
- **37 tests** covering all major functionality
- Unit tests for entities and actions
- Integration tests for repository operations
- Validation and error handling tests

Run tests with:
```bash
npm test -- domains/RecurringTransactions
```

## Dependencies

- **Prisma**: Database ORM and client
- **TransactionType**: Shared transaction type definitions
- **Category**: Category entity for organization
- **Month**: Month entity for scheduling

## Integration Points

### With Transactions Domain
- Creates regular transactions from recurring patterns
- Shares transaction types and validation
- Maintains consistent data structures

### With Months Domain
- Updates month totals and counts
- Integrates with month calculation triggers
- Supports month-specific operations

## Future Enhancements

- Flexible recurrence patterns (weekly, yearly, custom)
- Conditional recurring transactions
- Recurring transaction templates
- Advanced scheduling options
- Integration with calendar systems
- Recurring transaction analytics
