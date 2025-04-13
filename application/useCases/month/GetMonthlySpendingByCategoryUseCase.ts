import { ITransactionRepository } from '@/domain/repositories/ITransactionRepository';
import { formatCurrency } from '@/lib/utils';
import { FormatedCategorySpending, USDSpending } from '@/app/types';
import { CategorySpendingDTO } from '@/application/dtos/transaction/TransactionDTO';


export class GetMonthlySpendingByCategoryUseCase {
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
                item._sum.amountCAD?.toNumber() || 0
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