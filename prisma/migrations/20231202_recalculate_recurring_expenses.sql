-- Recalculate recurring expenses for all months
-- This migration will update the recurring_expenses field for all months based on their transactions
-- that belong to categories marked as recurring (is_recurring = true)

-- First, ensure the is_recurring flag is set correctly for relevant categories
UPDATE categories 
SET is_recurring = true 
WHERE name ILIKE 'rent' OR name ILIKE 'bills'
AND is_recurring = false;

-- Output which categories are marked as recurring (for verification)
SELECT id, name, is_recurring 
FROM categories 
WHERE is_recurring = true;

-- Recalculate recurring expenses for all months
UPDATE months m
SET recurring_expenses = (
    SELECT COALESCE(SUM(t.amount_cad), 0)
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE t.month_id = m.id
    AND c.is_recurring = true
    AND t.type = 'Expense'
);

-- Output a summary of months with their updated recurring expenses (for verification)
SELECT 
    m.id, 
    m.month, 
    m.year, 
    m.total_expenses, 
    m.recurring_expenses,
    (m.total_expenses - m.recurring_expenses) AS non_recurring_expenses
FROM months m
ORDER BY m.year DESC, m.month DESC;

-- Verify that the trigger exists
SELECT 
    trigger_name, 
    event_manipulation, 
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'transactions'
AND trigger_name = 'update_recurring_expenses_trigger'; 