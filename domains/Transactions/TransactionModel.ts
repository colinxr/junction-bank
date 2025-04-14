// Represents the database model (what Prisma returns)
export interface TransactionModel {
  id: number;
  userId: string;
  name: string;
  amountCAD: number | { toString(): string };
  amountUSD: number | { toString(): string } | null;
  categoryId: number;
  category?: { name: string };
  notes: string | null;
  type: string;
  date: Date;
  monthId: number;
  createdAt: Date;
  updatedAt?: Date;
} 