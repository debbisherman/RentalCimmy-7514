/* 
# Add Category to Payments Table

1. Changes
  - Adds a `category` column to the `payments_20240520` table if it doesn't exist.
  - Sets a default value for the `category` column as 'Rent'.

2. Description
  - This allows landlords to categorize income (Utilities, Deposit, etc.)
*/

DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payments_20240520' AND column_name = 'category'
  ) THEN 
    ALTER TABLE payments_20240520 ADD COLUMN category text DEFAULT 'Rent';
  END IF;
END $$;