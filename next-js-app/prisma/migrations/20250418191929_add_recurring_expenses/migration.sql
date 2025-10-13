-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "is_recurring" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "months" ADD COLUMN     "recurring_expenses" DECIMAL(10,2) NOT NULL DEFAULT 0;
