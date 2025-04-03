import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CategoryService } from '@/lib/services/category.service';

const categoryService = new CategoryService(prisma);

export async function GET() {
  try {
    // Get categories using CategoryService
    const { data } = await categoryService.index();

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate, max-age=0',
      }
    });
  } catch (error: unknown) {
    console.error('Error fetching categories:', error);
    const errorMessage = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, type, notes } = await request.json();
    
    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }
    
    const newCategory = await categoryService.create({ name, type, notes });
    
    return NextResponse.json({ data: newCategory }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating category:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create category';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 