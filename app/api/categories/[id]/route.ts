import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CategoryService } from '@/lib/services/category.service';

const categoryService = new CategoryService(prisma);

export async function GET(
  request: Request,
  { params }: { params: { id: number } }
) {
  try {
    const { id } = params;
    const parsedId = Number(id);
    const category = await categoryService.show(parsedId);
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(category, { 
      headers: {
        'Cache-Control': 'private, max-age=60'
      }
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: number } }
) {
  try {
    const { id } = params;
    const parsedId = Number(id);
    const result = await categoryService.destroy(parsedId);
    
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete category' },
      { status: 500 }
    );
  }
} 