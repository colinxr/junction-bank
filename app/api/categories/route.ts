import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CategoryService } from '@/lib/services/category.service';

const categoryService = new CategoryService(prisma);

export async function GET(request: Request) {
  try {
    // Get categories using CategoryService
    const result = await categoryService.index();

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate, max-age=0',
      }
    });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
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
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create category' },
      { status: 500 }
    );
  }
} 