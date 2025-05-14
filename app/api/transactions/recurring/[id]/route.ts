import { NextResponse, NextRequest } from 'next/server';
import { makeRecurringTransactionUseCases } from '@/infrastructure/container';
import { DomainException } from '@/domains/Shared/DomainException';
import { RecurringTransactionNotFoundException } from '@/domains/RecurringTransactions/RecurringTransactionException';
import { RecurringTransactionMapper } from '@/domains/RecurringTransactions/RecurringTransactionMapper';

const recurringTransactionUseCases = makeRecurringTransactionUseCases();

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: number }> }
) {
    try {
        const id = (await params).id;
        const recurringTransaction = await recurringTransactionUseCases.show.execute(id);

        const recurringTransactionDTO = RecurringTransactionMapper.toDTO(recurringTransaction);

        return NextResponse.json(recurringTransactionDTO, {
            headers: {
                'Cache-Control': 'private, max-age=60'
            }
        });
    } catch (error) {
        console.error('Error fetching recurring transaction:', error);

        if (error instanceof RecurringTransactionNotFoundException) {
            return NextResponse.json(
                { error: error.message },
                { status: 404 }
            );
        }

        if (error instanceof DomainException) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch recurring transaction' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: number }> }
) {
    try {
        const id = (await params).id;
        const body = await request.json();
        const recurringTransaction = await recurringTransactionUseCases.update.execute(id, body);

        const recurringTransactionDTO = RecurringTransactionMapper.toDTO(recurringTransaction);

        return NextResponse.json(recurringTransactionDTO, {
            headers: {
                'Cache-Control': 'private, max-age=60'
            }
        });
    } catch (error) {
        console.error('Error fetching recurring transaction:', error);

        if (error instanceof RecurringTransactionNotFoundException) {
            return NextResponse.json(
                { error: error.message },
                { status: 404 }
            );
        }

        if (error instanceof DomainException) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch recurring transaction' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: number }> }
) {
    try {
        const id = (await params).id;
        await recurringTransactionUseCases.delete.execute(id);

        return NextResponse.json({},
            { status: 200 }
        );
    } catch (error) {
        console.error('Error deleting recurring transaction:', error);

        return NextResponse.json(
            { error: 'Failed to delete recurring transaction' },
            { status: 500 }
        );
    }
}