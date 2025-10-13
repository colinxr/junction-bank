import { NextResponse, NextRequest } from 'next/server';
import { makeCategoryActions } from '@/infrastructure/container';
import { CategoryMapper } from '@/domains/Categories/CategoryMapper';
import { ApiErrorHandler } from '@/infrastructure/api-error-handler';

// Create use cases through the dependency injection container
const categoryActions = makeCategoryActions();

export async function GET() {
  try {
    const categories = await categoryActions.index.execute();
    
    const categoryDTOs = categories.map((category) => CategoryMapper.toDTO(category));
    return NextResponse.json(categoryDTOs, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate, max-age=0',
      }
    });
  } catch (error) {
    return ApiErrorHandler.handle(error, 'Failed to fetch categories');
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return ApiErrorHandler.validationError('User ID is required');
    }

    const data = await request.json();
    
    // Execute use case
    const category = await categoryActions.store.execute({
      name: data.name,
      type: data.type,
      notes: data.notes
    });
    
    // Convert to DTO for response
    const categoryDTO = CategoryMapper.toDTO(category);
    
    return NextResponse.json({ data: categoryDTO }, { status: 201 });
  } catch (error) {
    return ApiErrorHandler.handle(error, 'Failed to create category');
  }
} 