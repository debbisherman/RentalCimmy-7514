/* 
# Repair Payments Schema Cache
1. Purpose
  - Explicitly ensures `property_id` exists on the payments table.
  - Forces PostgREST to refresh its schema cache.
2. Changes
  - Adds `property_id` column if it somehow missed the last migration.
  - Adds a table comment which triggers an immediate API cache reload.
*/

DO $$ 
BEGIN 
  -- 1. Ensure the column exists (just in case the previous migration didn't apply)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payments_20240520' 
    AND column_name = 'property_id'
  ) THEN
    ALTER TABLE payments_20240520 
    ADD COLUMN property_id uuid REFERENCES properties_20240520(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 2. FORCE SCHEMA RELOAD
-- In Supabase/PostgREST, adding or changing a comment on a table 
-- forces the API to clear its cache and re-scan the columns.
COMMENT ON TABLE payments_20240520 IS 'Financial ledger for property payments - Updated to refresh cache';
COMMENT ON TABLE renters_20240520 IS 'Active renters directory - Updated to refresh cache';

-- 3. Ensure Permissions are granted (sometimes cache issues hide permissions)
GRANT ALL ON TABLE payments_20240520 TO authenticated;
GRANT ALL ON TABLE properties_20240520 TO authenticated;
GRANT ALL ON TABLE renters_20240520 TO authenticated;