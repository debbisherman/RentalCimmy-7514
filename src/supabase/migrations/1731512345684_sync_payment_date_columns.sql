/* 
# Sync Payment Date Columns
1. Changes
  - Ensures `received_date` exists in `payments_20240520`.
  - Sets a default value for `received_date` to prevent null pointer errors.
  - Ensures `date` (the previous column name) is kept for backward compatibility or synced.
2. Security
  - No changes to RLS.
*/

DO $$ 
BEGIN 
  -- 1. If received_date doesn't exist, create it
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments_20240520' AND column_name='received_date') THEN
    ALTER TABLE payments_20240520 ADD COLUMN received_date date DEFAULT CURRENT_DATE;
  END IF;

  -- 2. Ensure received_date has a default value (fixing the NOT NULL violation)
  ALTER TABLE payments_20240520 ALTER COLUMN received_date SET DEFAULT CURRENT_DATE;
  
  -- 3. If the column is NOT NULL, make sure it stays that way but with our new default
  -- (This line is just for safety)
  UPDATE payments_20240520 SET received_date = COALESCE(received_date, date, CURRENT_DATE);
END $$;