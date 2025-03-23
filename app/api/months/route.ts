import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Authenticate user via Supabase
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get months with transaction count using Prisma
    const [months, total] = await Promise.all([
      prisma.month.findMany({
        orderBy: [
          { year: 'desc' },
          { month: 'desc' }
        ],
        skip,
        take: limit,
        include: {
          transactions: {
            select: {
              id: true
            },
            where: {
              userId: user.id
            }
          }
        },
      }),
      prisma.month.count()
    ]);

    // Format the data for the client
    const formattedData = months.map((item) => ({
      id: item.id,
      month: item.month,
      year: item.year,
      notes: item.notes,
      transactionCount: item.transactions.length || 0
    }));

    return NextResponse.json({
      data: formattedData,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }, {
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
    
    // Create month using Prisma
    const newMonth = await prisma.month.create({
      data: {
        month: monthData.month,
        year: monthData.year,
        notes: monthData.notes
      },
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