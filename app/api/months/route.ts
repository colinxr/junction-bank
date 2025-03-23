import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { MonthService } from '@/lib/services/month.service';

const monthService = new MonthService(prisma);

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const year = url.searchParams.get('year') ? parseInt(url.searchParams.get('year') || '') : undefined;

    // Authenticate user via Supabase
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get months with transaction count using MonthService
    const result = await monthService.getMonths({
      page,
      limit,
      year
    });

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate, max-age=0',
      }
    });
  } catch (error: any) {
    console.error('Error fetching months:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const monthData = await request.json();
    
    // Authenticate user via Supabase
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Create month using MonthService
    const newMonth = await monthService.createMonth({
      month: monthData.month,
      year: monthData.year,
      notes: monthData.notes
    });
    
    return NextResponse.json({ data: newMonth });
  } catch (error: any) {
    console.error('Error creating month:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create month' },
      { status: 500 }
    );
  }
} 