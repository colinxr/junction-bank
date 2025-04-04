import { ITransactionRepository } from "@/domain/repositories/ITransactionRepository";
import { PrismaClient } from "@prisma/client";

export class TransactionRepository implements ITransactionRepository {
  constructor(private prisma: PrismaClient) {}

  async getTotalSpendingByCategory(monthId: number): Promise<any> {
    const spending = await this.prisma.transaction.groupBy({
        by: ['categoryId'],
        where: { monthId, },
        _sum: { amountCAD: true },
        _count: { amountUSD: true }
      });
  
      // Get category names in a separate query
      const categories = await this.prisma.category.findMany({
        where: {
          id: { in: spending.map(s => s.categoryId) }
        },
        select: { id: true, name: true }
      });
  
      // Merge category names with spending data
      return spending.map(s => ({
        ...s,
        categoryName: categories.find(c => c.id === s.categoryId)?.name || ''
      }));
  }

  async getUSDSpendingByCategory(monthId: number): Promise<any> {
    const spending = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        monthId,
        amountUSD: { not: null }
      },
      _sum: { amountCAD: true }
    });

    return spending;
  }
}

