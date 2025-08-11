import { NextRequest, NextResponse } from 'next/server';
import { makeMonthActions } from '@/infrastructure/container';
import { ApiErrorHandler } from '@/infrastructure/api-error-handler';

// Create use cases through the dependency injection container
const monthActions = makeMonthActions();

// POST /api/months/recalculate
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');

    if (!userId) {
      return ApiErrorHandler.validationError('User ID is required');
    }

    // Get monthId from request, if any
    const body = await req.json().catch(() => ({}));
    const { monthId } = body;

    // Execute the recalculate action
    await monthActions.recalculateRecurringExpenses.execute({ monthId });

    // Return success response
    return NextResponse.json({
      success: true,
      message: `Successfully recalculated recurring expenses for ${monthId ? `month ${monthId}` : 'all months'}`
    });
  } catch (error) {
    return ApiErrorHandler.handle(error, 'Failed to recalculate recurring expenses');
  }
} 