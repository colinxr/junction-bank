# Transactions Domain

The Transactions domain handles all financial transaction operations including creation, updates, imports, and management of transaction data.

## Architecture Overview

This domain follows Clean Architecture principles with clear separation of concerns:

- **Entities**: Core business objects with validation logic
- **Actions**: Application use cases and business logic
- **Repositories**: Data access interfaces and implementations
- **DTOs**: Data transfer objects for API communication
- **Adapters**: Data transformation and mapping utilities
- **Validators**: Business rule validation and type checking

## Components

### Entities
- **`Transaction.ts`**: Core transaction entity with business rules and validation
  - Handles transaction types (Income/Expense)
  - Manages currency amounts (CAD/USD)
  - Enforces business constraints

### Actions (Use Cases)
- **`StoreTransaction.ts`**: Creates new transactions
- **`UpdateTransaction.ts`**: Updates existing transactions
- **`DeleteTransaction.ts`**: Removes transactions
- **`ShowTransaction.ts`**: Retrieves single transaction
- **`IndexTransactions.ts`**: Lists transactions with pagination
- **`ImportTransactions.ts`**: Handles bulk transaction imports
- **`PreviewTransactions.ts`**: Shows import previews
- **`ProcessTransactionImport.ts`**: Executes import operations

### Repositories
- **`ITransactionRepository.ts`**: Interface defining transaction data operations
- **`TransactionRepository.ts`**: Prisma-based implementation with Redis caching
  - Implements CRUD operations
  - Provides category spending analytics
  - Handles cache invalidation

### DTOs (Data Transfer Objects)
- **`TransactionDTO.ts`**: API response format for transactions
- **`TransactionCreateDTO.ts`**: Input format for creating transactions
- **`UpdateTransactionDTO.ts`**: Input format for updating transactions
- **`TransactionImportDTO.ts`**: Format for bulk import operations

### Adapters
- **`TransactionMapper.ts`**: Converts between domain entities and DTOs
- **`TransactionAdapters.ts`**: Handles data transformation and validation
  - `toCoreTransaction()`: Converts DTOs to domain entities
  - `updateCoreTransaction()`: Updates entities with new data

### Validators
- **`transactionValidators.ts`**: Business rule validation functions
- **`types.ts`**: TypeScript type definitions and interfaces

### Services
- **`TransactionImportService.ts`**: Handles CSV parsing and import logic

## Key Features

### Transaction Management
- Full CRUD operations for transactions
- Support for both CAD and USD currencies
- Category-based organization
- Notes and metadata support

### Import System
- CSV file parsing and validation
- Preview functionality before import
- Bulk transaction creation
- Error handling and reporting

### Caching Strategy
- Redis-based caching for performance
- Automatic cache invalidation on updates
- Fallback to database on cache misses

### Analytics
- Category-based spending analysis
- Monthly spending summaries
- Transaction count tracking

## Recent Refactoring

### Before (Repetitive Pattern)
```typescript
const updateData: Prisma.TransactionUpdateInput = {};

if (data.name !== undefined) updateData.name = data.name;
if (data.amountCAD !== undefined && data.amountCAD !== null) updateData.amountCAD = data.amountCAD;
if (data.amountUSD !== undefined) updateData.amountUSD = data.amountUSD === null ? null : data.amountUSD;
if (data.notes !== undefined) updateData.notes = data.notes;
if (data.type !== undefined) updateData.type = data.type as TransactionType;
if (data.categoryId !== undefined) updateData.category = { connect: { id: data.categoryId } };
```

### After (Clean Utility)
```typescript
const updateData = cleanUpdateData(data, {
  type: (value) => value as TransactionType,
  categoryId: (value) => ({ connect: { id: value } })
}) as Prisma.TransactionUpdateInput;
```

**Benefits:**
- Eliminated repetitive `if (data.field !== undefined)` checks
- Centralized update logic in reusable utility
- Improved code maintainability and readability
- Maintained type safety and functionality

## Usage Examples

### Creating a Transaction
```typescript
const transactionData: TransactionCreateDTO = {
  clerkId: 'user123',
  name: 'Grocery Shopping',
  amountCAD: 125.50,
  categoryId: 1,
  type: 'Expense',
  date: '2023-07-15',
  monthId: 1
};

const transaction = await storeTransaction.execute(transactionData);
```

### Updating a Transaction
```typescript
const updateData: UpdateTransactionDTO = {
  name: 'Updated Grocery Shopping',
  amountCAD: 130.00,
  notes: 'Including organic items'
};

const updated = await updateTransaction.execute(transactionId, updateData);
```

### Importing Transactions
```typescript
const csvContent = 'name,amountCAD,categoryId,type,date\nGrocery,50.00,1,Expense,2023-07-15';
const result = await importTransactions.execute(csvContent);
```

## Testing

The domain includes comprehensive test coverage:
- **47 tests** covering all major functionality
- Unit tests for entities, actions, and adapters
- Integration tests for repository operations
- Validation and error handling tests

Run tests with:
```bash
npm test -- domains/Transactions
```

## Dependencies

- **Prisma**: Database ORM and client
- **Redis**: Caching layer
- **Domain Types**: Shared type definitions
- **Validation**: Business rule enforcement

## Future Enhancements

- Transaction categorization suggestions
- Recurring transaction detection
- Advanced filtering and search
- Export functionality
- Transaction templates
