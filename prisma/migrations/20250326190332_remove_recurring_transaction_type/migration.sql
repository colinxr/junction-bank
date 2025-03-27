/*
  Warnings:

  - You are about to drop the column `type` on the `recurring_transactions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "recurring_transactions" DROP COLUMN "type";

-- Drop existing triggers
DROP TRIGGER IF EXISTS transaction_insert_trigger ON transactions;
DROP TRIGGER IF EXISTS transaction_update_trigger ON transactions;
DROP TRIGGER IF EXISTS transaction_delete_trigger ON transactions;

-- Drop existing functions
DROP FUNCTION IF EXISTS update_month_on_transaction_insert();
DROP FUNCTION IF EXISTS update_month_on_transaction_update();
DROP FUNCTION IF EXISTS update_month_on_transaction_delete();

-- Create new trigger function for transaction inserts
CREATE OR REPLACE FUNCTION update_month_on_transaction_insert()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE months
  SET 
    total_expenses = total_expenses + NEW.amount_cad,
    transaction_count = transaction_count + 1
  WHERE id = NEW.month_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create new trigger function for transaction updates
CREATE OR REPLACE FUNCTION update_month_on_transaction_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Update amounts
  UPDATE months
  SET 
    total_expenses = total_expenses - OLD.amount_cad + NEW.amount_cad
  WHERE id = NEW.month_id;
  
  -- If month_id changed, we need to update both months
  IF OLD.month_id != NEW.month_id THEN
    -- Decrement count in old month
    UPDATE months
    SET transaction_count = transaction_count - 1
    WHERE id = OLD.month_id;
    
    -- Increment count in new month
    UPDATE months
    SET transaction_count = transaction_count + 1
    WHERE id = NEW.month_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create new trigger function for transaction deletes
CREATE OR REPLACE FUNCTION update_month_on_transaction_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE months
  SET 
    total_expenses = total_expenses - OLD.amount_cad,
    transaction_count = transaction_count - 1
  WHERE id = OLD.month_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create the triggers
CREATE TRIGGER transaction_insert_trigger
AFTER INSERT ON transactions
FOR EACH ROW EXECUTE FUNCTION update_month_on_transaction_insert();

CREATE TRIGGER transaction_update_trigger
AFTER UPDATE ON transactions
FOR EACH ROW EXECUTE FUNCTION update_month_on_transaction_update();

CREATE TRIGGER transaction_delete_trigger
AFTER DELETE ON transactions
FOR EACH ROW EXECUTE FUNCTION update_month_on_transaction_delete();

-- Initialize the summary values for existing months
UPDATE months m
SET 
  total_expenses = COALESCE((
    SELECT SUM(t.amount_cad)
    FROM transactions t
    WHERE t.month_id = m.id
  ), 0),
  transaction_count = COALESCE((
    SELECT COUNT(*)
    FROM transactions t
    WHERE t.month_id = m.id
  ), 0);
