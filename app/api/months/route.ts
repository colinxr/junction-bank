import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MonthService } from '@/lib/services/month.service';

const monthService = new MonthService(prisma);

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const year = url.searchParams.get('year') ? parseInt(url.searchParams.get('year') || '') : undefined;

    // Get months with transaction count using MonthService
    const result = await monthService.index({
      page,
      limit,
      year
    });

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate, max-age=0',
      }
    });
  } catch (error: unknown) {
    console.error('Error fetching months:', error);
    const errorMessage = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const {month, year, notes} = await request.json();
  
    const newMonth = await monthService.create({month, year, notes});
    
    return NextResponse.json({ data: newMonth });
  } catch (error: unknown) {
    console.error('Error creating month:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create month';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 