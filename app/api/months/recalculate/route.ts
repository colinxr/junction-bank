import { NextRequest, NextResponse } from 'next/server';
import { makeMonthUseCases } from '@/infrastructure/container';
import { DomainException } from '@/domains/Shared/DomainException';

// Create use cases through the dependency injection container
const monthUseCases = makeMonthUseCases();

// POST /api/months/recalculate
export async function POST(req: NextRequest) {
  try {
    // Get monthId from request, if any
    const body = await req.json().catch(() => ({}));
    const { monthId } = body;

    // Execute the recalculate action
    await monthUseCases.recalculateRecurringExpenses.execute({ monthId });

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
  }
} 