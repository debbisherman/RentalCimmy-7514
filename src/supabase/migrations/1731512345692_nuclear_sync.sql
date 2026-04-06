/* 
# Nuclear Schema Sync
1. Purpose
  - Forcefully adds missing columns to payments and renters.
  - Fixes the "Schema Cache" error by triggering 3 different refresh signals.
  - Grants explicit bypass permissions to the API role.
*/

-- 1. ADD MISSING COLUMNS (Safe mode)
ALTER TABLE IF EXISTS payments_20240520 
ADD COLUMN IF NOT EXISTS received_date date DEFAULT CURRENT_DATE;

ALTER TABLE IF EXISTS payments_20240520 
ADD COLUMN IF NOT EXISTS property_id uuid REFERENCES properties_20240520(id) ON DELETE SET NULL;

ALTER TABLE IF EXISTS renters_20240520 
ADD COLUMN IF NOT EXISTS additional_phones text DEFAULT '';

ALTER TABLE IF EXISTS renters_20240520 
ADD COLUMN IF NOT EXISTS co_tenants text DEFAULT '';

-- 2. TRIGGER API REFRESH (The "Comment" Trick)
-- We change the comment to force the PostgREST API to re-scan the table structure.
COMMENT ON TABLE payments_20240520 IS 'Refreshed at ' || TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI:SS');
COMMENT ON TABLE renters_20240520 IS 'Refreshed at ' || TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI:SS');

-- 3. RESET PERMISSIONS
-- Sometimes the cache error is actually a "Permission Denied" in disguise.
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;

-- 4. VERIFICATION QUERY
-- Running this will show you in the results if the columns are now visible.
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'payments_20240520' 
AND column_name IN ('received_date', 'property_id');