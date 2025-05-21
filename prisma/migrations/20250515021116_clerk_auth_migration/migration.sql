/*
  Warnings:

  - You are about to drop the column `user_id` on the `recurring_transactions` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "recurring_transactions" DROP CONSTRAINT "recurring_transactions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_user_id_fkey";

-- DropIndex
DROP INDEX "recurring_transactions_user_id_idx";

-- DropIndex
DROP INDEX "transactions_user_id_idx";

-- First add the new column as nullable
ALTER TABLE "recurring_transactions" ADD COLUMN "clerk_id" TEXT;
ALTER TABLE "transactions" ADD COLUMN "clerk_id" TEXT;

-- Copy data from user_id to clerk_id
UPDATE "recurring_transactions" SET "clerk_id" = "user_id";
UPDATE "transactions" SET "clerk_id" = "user_id";

-- Make clerk_id not nullable
ALTER TABLE "recurring_transactions" ALTER COLUMN "clerk_id" SET NOT NULL;
ALTER TABLE "transactions" ALTER COLUMN "clerk_id" SET NOT NULL;

-- Now we can drop the old columns
ALTER TABLE "recurring_transactions" DROP COLUMN "user_id";
ALTER TABLE "transactions" DROP COLUMN "user_id";

-- DropTable
DROP TABLE "users";

-- CreateIndex
CREATE INDEX "recurring_transactions_clerk_id_idx" ON "recurring_transactions"("clerk_id");

-- CreateIndex
CREATE INDEX "transactions_clerk_id_idx" ON "transactions"("clerk_id");
