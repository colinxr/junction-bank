import { NextRequest, NextResponse } from 'next/server';
import { makeCategoryActions } from '@/infrastructure/container';
import { DomainException } from '@/domains/Shared/DomainException';
import { CategoryMapper } from '@/domains/Categories/CategoryMapper';
import { CategoryNotFoundException } from '@/domains/Categories/CategoryException';

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
  { params }: { params: Promise<{ id: number }> }
) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { id } = (await params);
    await categoryActions.delete.execute(Number(id));
    
    return NextResponse.json({},
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