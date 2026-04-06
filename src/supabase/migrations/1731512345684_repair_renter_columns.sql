/* 
# Repair Renter Table Columns
1. Purpose
  - Ensures `additional_phones` and `co_tenants` columns exist in the `renters_20240520` table.
  - This fixes the "schema cache" error by explicitly adding missing fields.
2. Changes
  - Adds `additional_phones` (text)
  - Adds `co_tenants` (text)
  - Adds `property_id` (uuid) if missing
*/

DO $$ 
BEGIN 
  -- Add co_tenants if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'renters_20240520' AND column_name = 'co_tenants'
  ) THEN 
    ALTER TABLE renters_20240520 ADD COLUMN co_tenants text DEFAULT '';
  END IF;

  -- Add additional_phones if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'renters_20240520' AND column_name = 'additional_phones'
  ) THEN 
    ALTER TABLE renters_20240520 ADD COLUMN additional_phones text DEFAULT '';
  END IF;

  -- Add property_id if missing (Self-correction for previous steps)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'renters_20240520' AND column_name = 'property_id'
  ) THEN 
    ALTER TABLE renters_20240520 ADD COLUMN property_id uuid REFERENCES properties_20240520(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Force a cache refresh by performing a dummy comment update
COMMENT ON TABLE renters_20240520 IS 'Table for managing renters and property associations';