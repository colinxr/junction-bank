import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { MonthRepository } from '@/domains/Months/MonthRepository';
import { redis } from '@/lib/redis';
import { DomainException } from '@/domains/Shared/DomainException';

// POST /api/months/recalculate
export async function POST(req: NextRequest) {
  try {
    // Initialize dependencies
    const prisma = new PrismaClient();
    const monthRepository = new MonthRepository(prisma, redis);

    // Get monthId from request, if any
    const body = await req.json().catch(() => ({}));
    const { monthId } = body;

    // Recalculate recurring expenses
    await monthRepository.recalculateRecurringExpenses(monthId || undefined);

    // Return success response
    return NextResponse.json({
      success: true,
      message: `Successfully recalculated recurring expenses for ${monthId ? `month ${monthId}` : 'all months'}`
    });
  } catch (error) {
    console.error('Error in recalculate recurring expenses endpoint:', error);
    
    if (error instanceof DomainException) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to recalculate recurring expenses' },
      { status: 500 }
    );
  } finally {
    // Close the Prisma client to prevent connection leaks
    await (new PrismaClient()).$disconnect();
  }
} 