-- Add isRecurring column to categories if it doesn't exist
ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false;

-- Add recurringExpenses column to months if it doesn't exist
ALTER TABLE months ADD COLUMN IF NOT EXISTS recurring_expenses DECIMAL(10, 2) DEFAULT 0;

-- Update existing categories for 'Rent' and 'Bills' to be recurring
UPDATE categories SET is_recurring = true WHERE name ILIKE 'rent' OR name ILIKE 'bills';

-- Function to calculate recurring expenses for a month
CREATE OR REPLACE FUNCTION calculate_recurring_expenses() 
RETURNS TRIGGER AS $$
BEGIN
    -- Update the month's recurring expenses when a transaction is inserted, updated, or deleted
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- Calculate the sum of all recurring transactions for the month
        UPDATE months m
        SET recurring_expenses = (
            SELECT COALESCE(SUM(t.amount_cad), 0)
            FROM transactions t
            JOIN categories c ON t.category_id = c.id
            WHERE t.month_id = m.id
            AND c.is_recurring = true
            AND t.type = 'Expense'
        )
        WHERE m.id = COALESCE(NEW.month_id, OLD.month_id);
    END IF;

    IF TG_OP = 'DELETE' THEN
        -- Recalculate for the month when a transaction is deleted
        UPDATE months m
        SET recurring_expenses = (
            SELECT COALESCE(SUM(t.amount_cad), 0)
            FROM transactions t
            JOIN categories c ON t.category_id = c.id
            WHERE t.month_id = m.id
            AND c.is_recurring = true
            AND t.type = 'Expense'
        )
        WHERE m.id = OLD.month_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_recurring_expenses_trigger ON transactions;

-- Create trigger for transactions
CREATE TRIGGER update_recurring_expenses_trigger
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW
EXECUTE FUNCTION calculate_recurring_expenses();

-- Initial update for all months
UPDATE months m
SET recurring_expenses = (
    SELECT COALESCE(SUM(t.amount_cad), 0)
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE t.month_id = m.id
    AND c.is_recurring = true
    AND t.type = 'Expense'
); 