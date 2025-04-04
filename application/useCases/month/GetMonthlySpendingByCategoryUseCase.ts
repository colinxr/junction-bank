import { IMonthRepository } from '../../../domain/repositories/IMonthRepository';
import { Month } from '../../../domain/entities/Month';
import { UpdateMonthDTO } from '../../dtos/month/MonthDTO';
import { MonthNotFoundException, MonthAlreadyExistsException } from '../../../domain/exceptions/MonthException';
import { ITransactionRepository } from '@/domain/repositories/ITransactionRepository';
import { Prisma } from '@prisma/client';
import { formatCurrency } from '@/lib/utils';

interface USDSpending {
    categoryId: number;
    _sum: {
        amountCAD: Prisma.Decimal | null;
    };
}

interface CategorySpending {
    categoryId: number;
    categoryName: string;
    _sum: {
        amountCAD: Prisma.Decimal | null;
    };
    _count: {
        amountUSD: number;
    };
}

interface FormatedCategorySpending extends CategorySpending {
    totalAmountCAD: string;
    totalAmountUSD: string;
    total: number;
}


export class GetMonthlySpendingByCategoryUseCase {
    constructor(private transactionRepository: ITransactionRepository) { }

    async execute(monthId: number): Promise<FormatedCategorySpending[]> {
        const [spendingByCategory, usdSpending] = await Promise.all([
            this.transactionRepository.getTotalSpendingByCategory(monthId),
            this.transactionRepository.getUSDSpendingByCategory(monthId)
        ]);

        const usdTotalsByCategory = this.createUSDTotalsMap(usdSpending);
        const formattedSpending = spendingByCategory.map((spending: CategorySpending) =>
            this.formatCategorySpending(spending, usdTotalsByCategory)
        );

        // Sort by total amount in descending order
        return formattedSpending.sort((a: FormatedCategorySpending, b: FormatedCategorySpending) => b.total - a.total);
    }


    private createUSDTotalsMap(usdSpending: USDSpending[]): Map<number, number> {
        return new Map(
            usdSpending.map(item => [
                item.categoryId,
                item._sum.amountCAD?.toNumber() || 0
            ])
        );
    }

    private formatCategorySpending(
        spendingData: CategorySpending,
        usdTotalsByCategory: Map<number, number>
    ): Omit<FormatedCategorySpending, '_sum' | '_count'> {
        const usdTotal = usdTotalsByCategory.get(spendingData.categoryId) || 0;
        const cadOnlyTotal = (Number(spendingData._sum.amountCAD) || 0) - Number(usdTotal);

        return {
            categoryId: spendingData.categoryId,
            categoryName: spendingData.categoryName,
            totalAmountCAD: formatCurrency(cadOnlyTotal),
            totalAmountUSD: formatCurrency(Number(usdTotal)),
            total: cadOnlyTotal + Number(usdTotal)
        };
    }

} 