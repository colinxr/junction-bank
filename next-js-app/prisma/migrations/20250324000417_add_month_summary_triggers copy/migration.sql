-- AlterTable
ALTER TABLE "months" ADD COLUMN     "total_expenses" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "total_income" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "transaction_count" INTEGER NOT NULL DEFAULT 0;

-- Create trigger function for transaction inserts
CREATE OR REPLACE FUNCTION update_month_on_transaction_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'income' THEN
    UPDATE months
    SET 
      total_income = total_income + NEW.amount_cad,
      transaction_count = transaction_count + 1
    WHERE id = NEW.month_id;
  ELSIF NEW.type = 'expense' THEN
    UPDATE months
    SET 
      total_expenses = total_expenses + NEW.amount_cad,
      transaction_count = transaction_count + 1
    WHERE id = NEW.month_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function for transaction updates
CREATE OR REPLACE FUNCTION update_month_on_transaction_update()
RETURNS TRIGGER AS $$
BEGIN
  -- If the type changed
  IF OLD.type != NEW.type THEN
    IF OLD.type = 'income' AND NEW.type = 'expense' THEN
      -- Was income, now expense
      UPDATE months
      SET 
        total_income = total_income - OLD.amount_cad,
        total_expenses = total_expenses + NEW.amount_cad
      WHERE id = NEW.month_id;
    ELSIF OLD.type = 'expense' AND NEW.type = 'income' THEN
      -- Was expense, now income
      UPDATE months
      SET 
        total_expenses = total_expenses - OLD.amount_cad,
        total_income = total_income + NEW.amount_cad
      WHERE id = NEW.month_id;
    END IF;
  ELSE
    -- Type didn't change, but amount might have
    IF NEW.type = 'income' THEN
      UPDATE months
      SET total_income = total_income - OLD.amount_cad + NEW.amount_cad
      WHERE id = NEW.month_id;
    ELSIF NEW.type = 'expense' THEN
      UPDATE months
      SET total_expenses = total_expenses - OLD.amount_cad + NEW.amount_cad
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

-- Create trigger function for transaction deletes
CREATE OR REPLACE FUNCTION update_month_on_transaction_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.type = 'income' THEN
    UPDATE months
    SET 
      total_income = total_income - OLD.amount_cad,
      transaction_count = transaction_count - 1
    WHERE id = OLD.month_id;
  ELSIF OLD.type = 'expense' THEN
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

-- Initialize the summary values for existing months
UPDATE months m
SET 
  total_income = COALESCE((
    SELECT SUM(t.amount_cad)
    FROM transactions t
    WHERE t.month_id = m.id AND t.type = 'income'
  ), 0),
  total_expenses = COALESCE((
    SELECT SUM(t.amount_cad)
    FROM transactions t
    WHERE t.month_id = m.id AND t.type = 'expense'
  ), 0),
  transaction_count = COALESCE((
    SELECT COUNT(*)
    FROM transactions t
    WHERE t.month_id = m.id
  ), 0);
