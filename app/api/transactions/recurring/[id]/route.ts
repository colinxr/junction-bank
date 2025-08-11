import { NextResponse, NextRequest } from 'next/server';
import { makeRecurringTransactionActions } from '@/infrastructure/container';
import { RecurringTransactionMapper } from '@/domains/RecurringTransactions/RecurringTransactionMapper';
import { ApiErrorHandler } from '@/infrastructure/api-error-handler';

const recurringTransactionActions = makeRecurringTransactionActions();

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: number }> }
) {
    try {
        const id = (await params).id;
        const recurringTransaction = await recurringTransactionActions.show.execute(id);

        const recurringTransactionDTO = RecurringTransactionMapper.toDTO(recurringTransaction);

        return NextResponse.json(recurringTransactionDTO, {
            headers: {
                'Cache-Control': 'private, max-age=60'
            }
        });
    } catch (error) {
        return ApiErrorHandler.handle(error, 'Failed to fetch recurring transaction');
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: number }> }
) {
    try {
        const userId = request.headers.get('x-user-id');

        if (!userId) {
            return ApiErrorHandler.validationError('User ID is required');
        }

        const id = (await params).id;
        const body = await request.json();
        const recurringTransaction = await recurringTransactionActions.update.execute(id, body);

        const recurringTransactionDTO = RecurringTransactionMapper.toDTO(recurringTransaction);

        return NextResponse.json(recurringTransactionDTO, {
            headers: {
                'Cache-Control': 'private, max-age=60'
            }
        });
    } catch (error) {
        return ApiErrorHandler.handle(error, 'Failed to update recurring transaction');
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: number }> }
) {
    try {
        const userId = request.headers.get('x-user-id');

        if (!userId) {
            return ApiErrorHandler.validationError('User ID is required');
        }

        const id = (await params).id;
        await recurringTransactionActions.delete.execute(id);

        return NextResponse.json({},
            { status: 200 }
        );
    } catch (error) {
        return ApiErrorHandler.handle(error, 'Failed to delete recurring transaction');
    }
}