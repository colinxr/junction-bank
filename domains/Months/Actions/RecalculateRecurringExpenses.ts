import { IMonthRepository } from '../IMonthRepository';

export interface RecalculateRecurringExpensesDTO {
  monthId?: number;
}

export class RecalculateRecurringExpenses {
  constructor(private monthRepository: IMonthRepository) {}

  async execute(data?: RecalculateRecurringExpensesDTO): Promise<void> {
    const monthId = data?.monthId;
    
    await this.monthRepository.recalculateRecurringExpenses(monthId);
  }
}
