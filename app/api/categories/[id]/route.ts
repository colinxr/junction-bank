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
    const category = await categoryUseCases.show.execute(id);
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
    await categoryUseCases.delete.execute(id);
    
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