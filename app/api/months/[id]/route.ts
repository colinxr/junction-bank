import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MonthService } from '@/lib/services/month.service';

const monthService = new MonthService(prisma);

export async function GET(
  request: Request,
  { params }: { params: { id: number } }
) {
  try {
    const { id } = await params;
    const month = await monthService.show(id);
    
    if (!month) {
      return NextResponse.json(
        { error: 'Month not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(month, { 
      headers: {
        'Cache-Control': 'private, max-age=60'
      }
    });
  } catch (error) {
    console.error('Error fetching month:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch month' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: number } }
) {
  try {
    const {month, year, notes} = await request.json();
    const { id } = await params;
    const updatedMonth = await monthService.edit(id, { month, year, notes });
    
    return NextResponse.json({ data: updatedMonth }, { status: 200 });
  } catch (error) {
    console.error('Error updating month:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update month' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: number } }
) {
  try {
    const { id } = await params;
    const result = await monthService.destroy(id);
    
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error deleting month:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete month' },
      { status: 500 }
    );
  }
} 