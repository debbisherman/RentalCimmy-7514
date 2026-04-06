/* 
# Link Renters to Properties
1. New Columns
  - `property_id` (uuid) added to `renters_20240520` as a foreign key to `properties_20240520`.
2. Changes
  - This allows a formal relationship between a tenant and a specific property asset.
  - Enables multiple renters to be assigned to the same property.
3. Security
  - Inherits existing RLS policies.
*/

DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'renters_20240520' AND column_name = 'property_id'
  ) THEN 
    ALTER TABLE renters_20240520 ADD COLUMN property_id uuid REFERENCES properties_20240520(id) ON DELETE SET NULL;
  END IF;
END $$;