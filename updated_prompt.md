# Detailed Prompt for Implementing Clean Architecture in the Categories Feature

## Goal
Refactor the current categories feature in the Junction Bank application to follow Clean Architecture principles, creating clear separation of concerns, improved testability, and more maintainable code.

## Current Structure Overview
The categories feature currently consists of:
1. A Prisma model definition in `prisma/schema.prisma`
2. A service (`CategoryService`) that directly uses Prisma 
3. A front-end repository (`CategoryRepository`) for API calls
4. React hooks (`useCategories`, `useCategoryDetail`) for UI state management
5. API routes in `/app/api/categories`
6. Shared Prisma instance in `lib/prisma.ts`
7. Type definitions in `app/types/index.ts`

## Target Architecture
Implement a Clean Architecture approach with these layers:

1. **Domain Layer** (innermost)
   - Pure TypeScript entities with business rules
   - Repository interfaces
   - Value objects and domain services
   - Custom domain exceptions

2. **Application Layer**
   - Use cases implementing specific application features
   - DTOs for data transfer between layers
   - No dependencies on external frameworks

3. **Infrastructure Layer**
   - Repository implementations
   - External service adapters
   - Framework-specific code
   - Database mappers for ORM integration

4. **Interface Layer** (outermost)
   - API Controllers
   - UI Components and hooks
   - Authentication integration

## Implementation Steps

### Step 1: Create Domain Layer
1. Create a `domain` directory at the project root
2. Implement the `Category` entity class with validation logic
3. Define repository interfaces for categories
4. Implement domain exception classes

### Step 2: Create Application Layer
1. Create an `application` directory at the project root
2. Implement use cases for categories (create, get, delete, etc.)
3. Create DTOs for input/output data
4. Set up interfaces for services if needed

### Step 3: Create Infrastructure Layer
1. Create an `infrastructure` directory
2. Implement Prisma repository for categories
3. Create database mapper functions to convert between domain entities and database models
4. Set up dependency injection for repositories

### Step 4: Update Interface Layer
1. Refactor API endpoints to use the new use cases
2. Update React hooks to use the new architecture
3. Ensure authentication is properly integrated

### Step 5: Update Tests
1. Create unit tests for domain entities and use cases
2. Create integration tests for repositories
3. Update existing tests to work with the new architecture

## Implementation Order and Strategy

To minimize disruption and ensure continuous functionality:

1. First implement the domain and application layers (as they're independent)
2. Then implement infrastructure layer with Prisma repositories
3. Create a simple dependency injection mechanism
4. Update one API route at a time, testing thoroughly after each change
5. Finally update the frontend components once backend changes are stable
6. Keep the old implementation until the new one is fully tested and working

## Detailed Implementation Instructions

### 1. Domain Layer Files

Create these files in the domain layer:

```
domain/
  entities/
    Category.ts
  repositories/
    ICategoryRepository.ts
  exceptions/
    DomainException.ts
    CategoryException.ts
  README.md (explaining domain layer)
```

#### Create Base Domain Exception

Create `domain/exceptions/DomainException.ts`:
```typescript
export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
```

#### Create Category Exception

Create `domain/exceptions/CategoryException.ts`:
```typescript
import { DomainException } from './DomainException';

export class CategoryNameEmptyException extends DomainException {
  constructor() {
    super('Category name cannot be empty');
  }
}

export class InvalidCategoryTypeException extends DomainException {
  constructor(type: string) {
    super(`Category type must be either 'Income' or 'Expense', got: ${type}`);
  }
}

export class CategoryAlreadyExistsException extends DomainException {
  constructor(name: string) {
    super(`Category with name '${name}' already exists`);
  }
}

export class CategoryNotFoundException extends DomainException {
  constructor(id: number) {
    super(`Category with ID ${id} not found`);
  }
}

export class CategoryHasTransactionsException extends DomainException {
  constructor(id: number, count: number) {
    super(`Cannot delete category with ID ${id} because it has ${count} associated transactions`);
  }
}
```

#### Create Category Entity

Create `domain/entities/Category.ts`:
```typescript
import { InvalidCategoryTypeException, CategoryNameEmptyException } from '../exceptions/CategoryException';

export class Category {
  readonly id?: number;
  readonly name: string;
  readonly type: string;
  readonly notes?: string;
  readonly createdAt?: Date;

  constructor(props: {
    id?: number;
    name: string;
    type: string;
    notes?: string;
    createdAt?: Date;
  }) {
    this.id = props.id;
    this.name = props.name;
    this.type = props.type;
    this.notes = props.notes;
    this.createdAt = props.createdAt;
    
    this.validate();
  }

  private validate(): void {
    if (!this.name || this.name.trim() === '') {
      throw new CategoryNameEmptyException();
    }
    
    if (!['Income', 'Expense'].includes(this.type)) {
      throw new InvalidCategoryTypeException(this.type);
    }
  }

  public static create(props: {
    id?: number;
    name: string;
    type: string;
    notes?: string;
    createdAt?: Date;
  }): Category {
    return new Category(props);
  }
}
```

#### Create Repository Interface

Create `domain/repositories/ICategoryRepository.ts`:
```typescript
import { Category } from '../entities/Category';

export interface ICategoryRepository {
  index(): Promise<Category[]>;
  show(id: number): Promise<Category | null>;
  store(category: Omit<Category, 'id' | 'createdAt'>): Promise<Category>;
  destroy(id: number): Promise<void>;
  findByName(name: string): Promise<boolean>;
  hasTransactions(id: number): Promise<{hasTransactions: boolean, count: number}>;
}
```

### 2. Application Layer Files

Create these files in the application layer:

```
application/
  dtos/
    category/
      CategoryDTO.ts
      CreateCategoryDTO.ts
  useCases/
    category/
      GetCategoriesUseCase.ts
      GetCategoryUseCase.ts
      CreateCategoryUseCase.ts
      DeleteCategoryUseCase.ts
  README.md (explaining application layer)
```

#### Create DTOs

Create `application/dtos/category/CategoryDTO.ts`:
```typescript
export interface CategoryDTO {
  id: number;
  name: string;
  type: string;
  notes?: string;
  createdAt?: string;
}

export interface CreateCategoryDTO {
  name: string;
  type: string;
  notes?: string;
}
```

#### Create Use Cases

Create `application/useCases/category/GetCategoriesUseCase.ts`:
```typescript
import { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';
import { Category } from '../../../domain/entities/Category';

export class GetCategoriesUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}
  
  async execute(): Promise<Category[]> {
    return this.categoryRepository.findAll();
  }
}
```

Create `application/useCases/category/GetCategoryUseCase.ts`:
```typescript
import { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';
import { Category } from '../../../domain/entities/Category';
import { CategoryNotFoundException } from '../../../domain/exceptions/CategoryException';

export class GetCategoryUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}
  
  async execute(id: number): Promise<Category> {
    const category = await this.categoryRepository.findById(id);
    
    if (!category) {
      throw new CategoryNotFoundException(id);
    }
    
    return category;
  }
}
```

Create `application/useCases/category/CreateCategoryUseCase.ts`:
```typescript
import { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';
import { Category } from '../../../domain/entities/Category';
import { CreateCategoryDTO } from '../../dtos/category/CategoryDTO';
import { CategoryAlreadyExistsException } from '../../../domain/exceptions/CategoryException';

export class CreateCategoryUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}
  
  async execute(data: CreateCategoryDTO): Promise<Category> {
    // Check if category already exists
    const exists = await this.categoryRepository.existsByName(data.name);
    if (exists) {
      throw new CategoryAlreadyExistsException(data.name);
    }

    // Create the domain entity (validate business rules)
    const category = Category.create({
      name: data.name,
      type: data.type,
      notes: data.notes
    });
    
    // Persist through repository
    return this.categoryRepository.create(category);
  }
}
```

Create `application/useCases/category/DeleteCategoryUseCase.ts`:
```typescript
import { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';
import { CategoryNotFoundException, CategoryHasTransactionsException } from '../../../domain/exceptions/CategoryException';

export class DeleteCategoryUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}
  
  async execute(id: number): Promise<void> {
    // Check if category exists
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new CategoryNotFoundException(id);
    }
    
    // Check if category has transactions
    const { hasTransactions, count } = await this.categoryRepository.hasTransactions(id);
    if (hasTransactions) {
      throw new CategoryHasTransactionsException(id, count);
    }
    
    // Delete the category
    await this.categoryRepository.delete(id);
  }
}
```

### 3. Infrastructure Layer Files

Create these files in the infrastructure layer:

```
infrastructure/
  repositories/
    prisma/
      PrismaCategoryRepository.ts
  mappers/
    CategoryMapper.ts
  di/
    container.ts
  README.md (explaining infrastructure layer)
```

#### Create Dependency Injection Container

Create `infrastructure/di/container.ts`:
```typescript
import { PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import { PrismaCategoryRepository } from '../repositories/prisma/PrismaCategoryRepository';
import { GetCategoriesUseCase } from '../../application/useCases/category/GetCategoriesUseCase';
import { GetCategoryUseCase } from '../../application/useCases/category/GetCategoryUseCase';
import { CreateCategoryUseCase } from '../../application/useCases/category/CreateCategoryUseCase';
import { DeleteCategoryUseCase } from '../../application/useCases/category/DeleteCategoryUseCase';

// Singleton repositories
const categoryRepository: ICategoryRepository = new PrismaCategoryRepository(prisma);

// Factory functions for use cases
export const makeCategoryUseCases = () => {
  return {
    getCategories: new GetCategoriesUseCase(categoryRepository),
    getCategory: new GetCategoryUseCase(categoryRepository),
    createCategory: new CreateCategoryUseCase(categoryRepository),
    deleteCategory: new DeleteCategoryUseCase(categoryRepository)
  };
};
```

#### Create Mapper

Create `infrastructure/mappers/CategoryMapper.ts`:
```typescript
import { Category as PrismaCategory } from '@prisma/client';
import { Category } from '../../domain/entities/Category';

export class CategoryMapper {
  static toDomain(raw: PrismaCategory): Category {
    return new Category({
      id: raw.id,
      name: raw.name,
      type: raw.type,
      notes: raw.notes || undefined,
      createdAt: raw.createdAt
    });
  }
  
  static toPersistence(category: Omit<Category, 'id' | 'createdAt'>): Omit<PrismaCategory, 'id' | 'createdAt'> {
    return {
      name: category.name,
      type: category.type,
      notes: category.notes || null
    };
  }
  
  static toDTO(domain: Category): any {
    return {
      id: domain.id,
      name: domain.name,
      type: domain.type,
      notes: domain.notes,
      createdAt: domain.createdAt?.toISOString()
    };
  }
}
```

#### Create Repository Implementation

Create `infrastructure/repositories/prisma/PrismaCategoryRepository.ts`:
```typescript
import { PrismaClient } from '@prisma/client';
import { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';
import { Category } from '../../../domain/entities/Category';
import { CategoryMapper } from '../../mappers/CategoryMapper';

export class PrismaCategoryRepository implements ICategoryRepository {
  constructor(private prisma: PrismaClient) {}
  
  async findAll(): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    
    return categories.map(CategoryMapper.toDomain);
  }
  
  async findById(id: number): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({
      where: { id }
    });
    
    if (!category) return null;
    return CategoryMapper.toDomain(category);
  }
  
  async create(categoryData: Omit<Category, 'id' | 'createdAt'>): Promise<Category> {
    const prismaData = CategoryMapper.toPersistence(categoryData);
    
    const created = await this.prisma.category.create({
      data: prismaData
    });
    
    return CategoryMapper.toDomain(created);
  }
  
  async delete(id: number): Promise<void> {
    await this.prisma.category.delete({
      where: { id }
    });
  }
  
  async existsByName(name: string): Promise<boolean> {
    const count = await this.prisma.category.count({
      where: { name }
    });
    return count > 0;
  }
  
  async hasTransactions(id: number): Promise<{hasTransactions: boolean, count: number}> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        transactions: {
          select: { id: true }
        },
        recurringTransactions: {
          select: { id: true }
        }
      }
    });

    if (!category) {
      return { hasTransactions: false, count: 0 };
    }

    const transactionCount = 
      category.transactions.length + 
      category.recurringTransactions.length;
      
    return { 
      hasTransactions: transactionCount > 0,
      count: transactionCount
    };
  }
}
```

### 4. Update API Routes

Update `app/api/categories/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { makeCategoryUseCases } from '@/infrastructure/di/container';
import { CategoryMapper } from '@/infrastructure/mappers/CategoryMapper';
import { DomainException } from '@/domain/exceptions/DomainException';

// Create use cases through the dependency injection container
const categoryUseCases = makeCategoryUseCases();

export async function GET() {
  try {
    const categories = await categoryUseCases.getCategories.execute();
    const categoryDTOs = categories.map(CategoryMapper.toDTO);
    
    return NextResponse.json({ data: categoryDTOs }, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate, max-age=0',
      }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    
    if (error instanceof DomainException) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Execute use case
    const category = await categoryUseCases.createCategory.execute({
      name: data.name,
      type: data.type,
      notes: data.notes
    });
    
    // Convert to DTO for response
    const categoryDTO = CategoryMapper.toDTO(category);
    
    return NextResponse.json({ data: categoryDTO }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    
    if (error instanceof DomainException) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
```

Update `app/api/categories/[id]/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { makeCategoryUseCases } from '@/infrastructure/di/container';
import { CategoryMapper } from '@/infrastructure/mappers/CategoryMapper';
import { DomainException } from '@/domain/exceptions/DomainException';
import { CategoryNotFoundException } from '@/domain/exceptions/CategoryException';

// Create use cases through the dependency injection container
const categoryUseCases = makeCategoryUseCases();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const category = await categoryUseCases.getCategory.execute(id);
    const categoryDTO = CategoryMapper.toDTO(category);
    
    return NextResponse.json(categoryDTO, { 
      headers: {
        'Cache-Control': 'private, max-age=60'
      }
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    
    if (error instanceof CategoryNotFoundException) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    
    if (error instanceof DomainException) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    await categoryUseCases.deleteCategory.execute(id);
    
    return NextResponse.json(
      { success: true, message: 'Category deleted successfully' }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting category:', error);
    
    if (error instanceof CategoryNotFoundException) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    
    if (error instanceof DomainException) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
```

### 5. Update Frontend Repository

Update `lib/repositories/category.repository.ts`:
```typescript
import apiClient from "@/lib/api-client";
import { CategoryDTO, CreateCategoryDTO } from "@/application/dtos/category/CategoryDTO";

export const CategoryRepository = {
  async createCategory(categoryData: CreateCategoryDTO) {
    return apiClient.post<{data: CategoryDTO}>("/categories", categoryData);
  },

  async getCategories() {
    return apiClient.get<{data: CategoryDTO[]}>("/categories");
  },

  async getCategory(id: number) {
    return apiClient.get<CategoryDTO>(`/categories/${id}`);
  },

  async deleteCategory(id: number) {
    return apiClient.delete(`/categories/${id}`);
  }
};
```

## Testing Guidelines

Include tests for each layer:

1. **Domain Layer Tests**: Test entity validation rules and domain logic
   ```
   __tests__/domain/entities/Category.test.ts
   ```

2. **Application Layer Tests**: Test use cases with mocked repositories
   ```
   __tests__/application/useCases/category/CreateCategoryUseCase.test.ts
   ```

3. **Infrastructure Layer Tests**: Test repositories with a test database
   ```
   __tests__/infrastructure/repositories/PrismaCategoryRepository.test.ts
   ```

4. **Interface Layer Tests**: Test API routes with mocked use cases
   ```
   __tests__/app/api/categories/route.test.ts
   ```

## Implementation Strategy

To minimize disruption and ensure continuous functionality:

1. **Create New Files First**: Build the new architecture in parallel with the existing code
2. **Incremental Migration**: Refactor one endpoint at a time
   - Start with GET /categories
   - Then GET /categories/[id]
   - Then POST /categories
   - Finally DELETE /categories/[id]
3. **Validation Steps**:
   - After each API change, verify the endpoint works
   - Run tests for that endpoint
   - Update frontend to use the new API if needed
4. **Cleanup**: Once everything is working with the new architecture, remove the old code

## Error Handling Strategy

1. **Domain Exceptions**: Use specific domain exceptions for business rule violations
2. **Application Exceptions**: Handle application-specific errors
3. **Infrastructure Exceptions**: Convert database/external errors to domain exceptions
4. **Interface Layer**: Map exceptions to appropriate HTTP status codes

## Documentation

Add README.md files to each layer with:
- Purpose of the layer
- Responsibilities
- How it connects to other layers
- Design decisions and patterns used

## Expected Outcome

After implementing these changes, you should have:

1. A domain layer with pure business logic
2. Application use cases for each feature
3. Infrastructure implementations decoupled from business logic
4. Clear APIs between layers
5. Consistent error handling
6. Improved testability of each component
7. More maintainable and extensible code
8. Clear documentation of the architecture 