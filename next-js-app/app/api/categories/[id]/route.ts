import { NextRequest, NextResponse } from 'next/server';
import { makeCategoryActions } from '@/infrastructure/container';
import { CategoryMapper } from '@/domains/Categories/CategoryMapper';
import { ApiErrorHandler } from '@/infrastructure/api-error-handler';

// Create use cases through the dependency injection container
const categoryActions = makeCategoryActions();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: number }> }
) {
  try {
    const { id } = await params;
    const category = await categoryActions.show.execute(Number(id));
    
    const categoryDTO = CategoryMapper.toDTO(category);
    return NextResponse.json(categoryDTO, { 
      headers: {
        'Cache-Control': 'private, max-age=60'
      }
    });
  } catch (error) {
    return ApiErrorHandler.handle(error, 'Failed to fetch category');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: number }> }
) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return ApiErrorHandler.validationError('User ID is required');
    }

    const { id } = (await params);
    await categoryActions.delete.execute(Number(id));
    
    return NextResponse.json({},
      { status: 200 }
    );
  } catch (error) {
    return ApiErrorHandler.handle(error, 'Failed to delete category');
  }
} 