import { formatCurrency } from '@/infrastructure/utils';
import { ITransactionRepository } from '@/domains/Transactions/Repositories/ITransactionRepository';
import { CategorySpendingDTO } from '@/domains/Transactions/DTOs/TransactionDTO';

import { FormatedCategorySpending, USDSpending } from '@/app/types';

export class GetMonthlySpendingByCategory {
    constructor(private transactionRepository: ITransactionRepository) { }

    async execute(monthId: number): Promise<FormatedCategorySpending[]> {
        const [spendingByCategory, usdSpending] = await Promise.all([
            this.transactionRepository.getTotalSpendingByCategory(monthId),
            this.transactionRepository.getUSDSpendingByCategory(monthId)
        ]);

        const usdTotalsByCategory = this.createUSDTotalsMap(usdSpending);
        const formattedSpending = spendingByCategory.map((spending: CategorySpendingDTO) =>
            this.formatCategorySpending(spending, usdTotalsByCategory)
        );

        // Sort by total amount in descending order
        return formattedSpending.sort((a: FormatedCategorySpending, b: FormatedCategorySpending) => b.total - a.total);
    }


    private createUSDTotalsMap(usdSpending: USDSpending[]): Map<number, number> {
        return new Map(
            usdSpending.map(item => [
                item.categoryId,
                Number(item._sum.amountCAD) || 0
            ])
        );
    }

    private formatCategorySpending(
        spendingData: CategorySpendingDTO,
        usdTotalsByCategory: Map<number, number>
    ): Omit<FormatedCategorySpending, '_sum' | '_count'> {
        const usdTotal = usdTotalsByCategory.get(spendingData.categoryId) || 0;
        const cadOnlyTotal = (Number(spendingData.totalSpent) || 0) - Number(usdTotal);

        return {
            categoryId: spendingData.categoryId,
            categoryName: spendingData.categoryName,
            totalAmountCAD: formatCurrency(cadOnlyTotal),
            totalAmountUSD: formatCurrency(Number(usdTotal)),
            total: cadOnlyTotal + Number(usdTotal)
        };
    }

} 