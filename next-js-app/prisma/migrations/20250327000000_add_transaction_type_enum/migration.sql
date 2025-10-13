-- Create transaction_type enum
CREATE TYPE "transaction_type" AS ENUM ('Income', 'Expense');

-- Add type column to transactions table
ALTER TABLE "transactions" 
ADD COLUMN "type" "transaction_type" NOT NULL DEFAULT 'Expense';

-- Add type column to recurring_transactions table
ALTER TABLE "recurring_transactions" 
ADD COLUMN "type" "transaction_type" NOT NULL DEFAULT 'Expense';

-- Initialize type values based on category type
UPDATE "transactions" t
SET "type" = CASE 
    WHEN c.type = 'income' THEN 'Income'::"transaction_type"
    ELSE 'Expense'::"transaction_type"
  END
FROM "categories" c
WHERE t.category_id = c.id;

UPDATE "recurring_transactions" rt
SET "type" = CASE 
    WHEN c.type = 'income' THEN 'Income'::"transaction_type"
    ELSE 'Expense'::"transaction_type"
  END
FROM "categories" c
WHERE rt.category_id = c.id;

-- Drop existing triggers
DROP TRIGGER IF EXISTS transaction_insert_trigger ON transactions;
DROP TRIGGER IF EXISTS transaction_update_trigger ON transactions;
DROP TRIGGER IF EXISTS transaction_delete_trigger ON transactions;

-- Drop existing functions
DROP FUNCTION IF EXISTS update_month_on_transaction_insert();
DROP FUNCTION IF EXISTS update_month_on_transaction_update();
DROP FUNCTION IF EXISTS update_month_on_transaction_delete();

-- Create a function to automatically set transaction type based on category
CREATE OR REPLACE FUNCTION set_transaction_type()
RETURNS TRIGGER AS $$
BEGIN
  SELECT 
    CASE 
      WHEN c.type = 'income' THEN 'Income'::"transaction_type"
      ELSE 'Expense'::"transaction_type"
    END
  INTO NEW.type
  FROM "categories" c
  WHERE c.id = NEW.category_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a function to validate transaction type based on category
CREATE OR REPLACE FUNCTION validate_transaction_type()
RETURNS TRIGGER AS $$
DECLARE
  category_type TEXT;
BEGIN
  -- Get the category type
  SELECT type INTO category_type
  FROM "categories"
  WHERE id = NEW.category_id;
  
  -- Validate type consistency
  IF (category_type = 'income' AND NEW.type != 'Income') OR
     (category_type != 'income' AND NEW.type != 'Expense') THEN
    RAISE EXCEPTION 'Transaction type must match category type';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create transaction type setting triggers
CREATE TRIGGER transaction_type_insert_trigger
BEFORE INSERT ON transactions
FOR EACH ROW EXECUTE FUNCTION set_transaction_type();

CREATE TRIGGER transaction_type_update_trigger
BEFORE UPDATE OF category_id ON transactions
FOR EACH ROW EXECUTE FUNCTION set_transaction_type();

CREATE TRIGGER recurring_transaction_type_insert_trigger
BEFORE INSERT ON recurring_transactions
FOR EACH ROW EXECUTE FUNCTION set_transaction_type();

CREATE TRIGGER recurring_transaction_type_update_trigger
BEFORE UPDATE OF category_id ON recurring_transactions
FOR EACH ROW EXECUTE FUNCTION set_transaction_type();

-- Create validation triggers
CREATE TRIGGER transaction_type_validate_trigger
BEFORE UPDATE OF type ON transactions
FOR EACH ROW EXECUTE FUNCTION validate_transaction_type();

CREATE TRIGGER recurring_transaction_type_validate_trigger
BEFORE UPDATE OF type ON recurring_transactions
FOR EACH ROW EXECUTE FUNCTION validate_transaction_type();

-- Create new trigger function for transaction inserts
CREATE OR REPLACE FUNCTION update_month_on_transaction_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'Income' THEN
    UPDATE months
    SET 
      total_income = total_income + NEW.amount_cad,
      transaction_count = transaction_count + 1
    WHERE id = NEW.month_id;
  ELSE
    UPDATE months
    SET 
      total_expenses = total_expenses + NEW.amount_cad,
      transaction_count = transaction_count + 1
    WHERE id = NEW.month_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create new trigger function for transaction updates
CREATE OR REPLACE FUNCTION update_month_on_transaction_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle type changes (Income <-> Expense)
  IF OLD.type != NEW.type THEN
    IF OLD.type = 'Income' THEN
      -- Changed from Income to Expense
      UPDATE months
      SET 
        total_income = total_income - OLD.amount_cad,
        total_expenses = total_expenses + NEW.amount_cad
      WHERE id = NEW.month_id;
    ELSE
      -- Changed from Expense to Income
      UPDATE months
      SET 
        total_expenses = total_expenses - OLD.amount_cad,
        total_income = total_income + NEW.amount_cad
      WHERE id = NEW.month_id;
    END IF;
  ELSE
    -- No type change, just amount change
    IF NEW.type = 'Income' THEN
      UPDATE months
      SET 
        total_income = total_income - OLD.amount_cad + NEW.amount_cad
      WHERE id = NEW.month_id;
    ELSE
      UPDATE months
      SET 
        total_expenses = total_expenses - OLD.amount_cad + NEW.amount_cad
      WHERE id = NEW.month_id;
    END IF;
  END IF;
  
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
  IF OLD.type = 'Income' THEN
    UPDATE months
    SET 
      total_income = total_income - OLD.amount_cad,
      transaction_count = transaction_count - 1
    WHERE id = OLD.month_id;
  ELSE
    UPDATE months
    SET 
      total_expenses = total_expenses - OLD.amount_cad,
      transaction_count = transaction_count - 1
    WHERE id = OLD.month_id;
  END IF;
  
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

-- Recalculate month totals based on transaction types
UPDATE months m
SET 
  total_expenses = COALESCE((
    SELECT SUM(t.amount_cad)
    FROM transactions t
    WHERE t.month_id = m.id AND t.type = 'Expense'
  ), 0),
  total_income = COALESCE((
    SELECT SUM(t.amount_cad)
    FROM transactions t
    WHERE t.month_id = m.id AND t.type = 'Income'
  ), 0),
  transaction_count = COALESCE((
    SELECT COUNT(*)
    FROM transactions t
    WHERE t.month_id = m.id
  ), 0); 