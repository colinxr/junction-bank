import { NextResponse } from 'next/server';
import { makeCategoryUseCases } from '@/infrastructure/di/container';
import { CategoryMapper } from '@/infrastructure/mappers/CategoryMapper';
import { DomainException } from '@/domain/exceptions/DomainException';

// Create use cases through the dependency injection container
const categoryUseCases = makeCategoryUseCases();

export async function GET() {
  try {
    const categories = await categoryUseCases.index.execute();
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
    const category = await categoryUseCases.store.execute({
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