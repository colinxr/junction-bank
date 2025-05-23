-- Drop the triggers
DROP TRIGGER IF EXISTS transaction_insert_trigger ON transactions;
DROP TRIGGER IF EXISTS transaction_update_trigger ON transactions;
DROP TRIGGER IF EXISTS transaction_delete_trigger ON transactions;
DROP TRIGGER IF EXISTS transaction_type_insert_trigger ON transactions;
DROP TRIGGER IF EXISTS transaction_type_update_trigger ON transactions;
DROP TRIGGER IF EXISTS transaction_type_validate_trigger ON transactions;
DROP TRIGGER IF EXISTS recurring_transaction_type_insert_trigger ON recurring_transactions;
DROP TRIGGER IF EXISTS recurring_transaction_type_update_trigger ON recurring_transactions;
DROP TRIGGER IF EXISTS recurring_transaction_type_validate_trigger ON recurring_transactions;

-- Drop the functions
DROP FUNCTION IF EXISTS update_month_on_transaction_insert();
DROP FUNCTION IF EXISTS update_month_on_transaction_update();
DROP FUNCTION IF EXISTS update_month_on_transaction_delete();
DROP FUNCTION IF EXISTS set_transaction_type();
DROP FUNCTION IF EXISTS validate_transaction_type();

-- Drop the check constraints
ALTER TABLE "transactions" DROP CONSTRAINT IF EXISTS check_transaction_type_match;
ALTER TABLE "recurring_transactions" DROP CONSTRAINT IF EXISTS check_recurring_transaction_type_match;

-- Drop the type columns
ALTER TABLE "transactions" DROP COLUMN "type";
ALTER TABLE "recurring_transactions" DROP COLUMN "type";

-- Drop the enum type
DROP TYPE "transaction_type";

-- Recreate the original triggers
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

-- Recreate the triggers
CREATE TRIGGER transaction_insert_trigger
AFTER INSERT ON transactions
FOR EACH ROW EXECUTE FUNCTION update_month_on_transaction_insert();

CREATE TRIGGER transaction_update_trigger
AFTER UPDATE ON transactions
FOR EACH ROW EXECUTE FUNCTION update_month_on_transaction_update();

CREATE TRIGGER transaction_delete_trigger
AFTER DELETE ON transactions
FOR EACH ROW EXECUTE FUNCTION update_month_on_transaction_delete();

-- Reset month totals to original calculation
UPDATE months m
SET 
  total_expenses = COALESCE((
    SELECT SUM(t.amount_cad)
    FROM transactions t
    WHERE t.month_id = m.id
  ), 0),
  total_income = 0,
  transaction_count = COALESCE((
    SELECT COUNT(*)
    FROM transactions t
    WHERE t.month_id = m.id
  ), 0); 