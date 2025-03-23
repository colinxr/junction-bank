import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { MonthService } from '@/lib/services/month.service';

const monthService = new MonthService(prisma);

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const month = await monthService.getMonth(params.id);
  return NextResponse.json({data: month});
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const monthData = await request.json();
    
    // Authenticate the user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Update the month
    const updatedMonth = await monthService.updateMonth(id, {
      month: monthData.month,
      year: monthData.year,
      notes: monthData.notes
    });
    
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Authenticate the user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete the transaction
    const result = await monthService.deleteMonth(id);
    
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error deleting month:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete month' },
      { status: 500 }
    );
  }
} 