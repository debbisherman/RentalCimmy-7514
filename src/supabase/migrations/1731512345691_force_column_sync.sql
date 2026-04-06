/* 
# Force Schema Cache Sync
1. Purpose
  - Explicitly verifies and adds all missing columns for Payments and Renters.
  - Forces a cache reload of the PostgREST API.
2. New Columns Verified
  - `payments_20240520`: `received_date`, `property_id`, `category`
  - `renters_20240520`: `additional_phones`, `co_tenants`, `property_id`
*/

DO $$ 
BEGIN 
  -- 1. FIX PAYMENTS TABLE COLUMNS
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments_20240520' AND column_name='received_date') THEN
    ALTER TABLE payments_20240520 ADD COLUMN received_date date DEFAULT CURRENT_DATE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments_20240520' AND column_name='property_id') THEN
    ALTER TABLE payments_20240520 ADD COLUMN property_id uuid REFERENCES properties_20240520(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments_20240520' AND column_name='category') THEN
    ALTER TABLE payments_20240520 ADD COLUMN category text DEFAULT 'Rent';
  END IF;

  -- 2. FIX RENTERS TABLE COLUMNS
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='renters_20240520' AND column_name='additional_phones') THEN
    ALTER TABLE renters_20240520 ADD COLUMN additional_phones text DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='renters_20240520' AND column_name='co_tenants') THEN
    ALTER TABLE renters_20240520 ADD COLUMN co_tenants text DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='renters_20240520' AND column_name='property_id') THEN
    ALTER TABLE renters_20240520 ADD COLUMN property_id uuid REFERENCES properties_20240520(id) ON DELETE SET NULL;
  END IF;

END $$;

-- 3. FORCE API CACHE RELOAD
-- Changing the comment on a table is the most reliable way to force Supabase to re-scan columns.
COMMENT ON TABLE payments_20240520 IS 'Financial records - Sync: ' || now();
COMMENT ON TABLE renters_20240520 IS 'Tenant records - Sync: ' || now();
COMMENT ON TABLE properties_20240520 IS 'Property assets - Sync: ' || now();

-- 4. RE-GRANT PERMISSIONS
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;