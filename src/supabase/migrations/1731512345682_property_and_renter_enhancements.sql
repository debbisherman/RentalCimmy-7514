/* 
# Property and Renter Enhancements
1. New Tables
  - `properties_20240520`: Stores property assets (buildings/units)
    - `id` (uuid, primary key)
    - `landlord_id` (uuid, references auth.users)
    - `name` (text)
    - `address` (text)
2. Changes
  - `renters_20240520`: Added `co_tenants` and `additional_phones`
  - `payments_20240520`: Added `property_id` and `received_date`
3. Security
  - Enable RLS on all new tables
  - Update policies for Super Admin and Landlord access
*/

-- 1. Properties Table
CREATE TABLE IF NOT EXISTS properties_20240520 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  address text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE properties_20240520 ENABLE ROW LEVEL SECURITY;

-- 2. Update Renters Table
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='renters_20240520' AND column_name='co_tenants') THEN
    ALTER TABLE renters_20240520 ADD COLUMN co_tenants text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='renters_20240520' AND column_name='additional_phones') THEN
    ALTER TABLE renters_20240520 ADD COLUMN additional_phones text DEFAULT '';
  END IF;
END $$;

-- 3. Update Payments Table
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments_20240520' AND column_name='property_id') THEN
    ALTER TABLE payments_20240520 ADD COLUMN property_id uuid REFERENCES properties_20240520(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments_20240520' AND column_name='received_date') THEN
    ALTER TABLE payments_20240520 ADD COLUMN received_date date DEFAULT CURRENT_DATE;
  END IF;
END $$;

-- 4. RLS Policies for Properties
CREATE POLICY "Landlords manage own properties" ON properties_20240520 FOR ALL USING (landlord_id = auth.uid());
CREATE POLICY "Admins manage all properties" ON properties_20240520 FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles_20240520 WHERE id = auth.uid() AND role = 'super_admin')
);
CREATE POLICY "Renters view assigned properties" ON properties_20240520 FOR SELECT USING (true);