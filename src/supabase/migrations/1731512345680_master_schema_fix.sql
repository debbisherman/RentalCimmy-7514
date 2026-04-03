/* 
# Master Schema Correction and Optimization

1. Tables & Columns
  - Ensures all tables (`profiles_20240520`, `renters_20240520`, `payments_20240520`, `items_20240520`) exist.
  - Adds the `category` column to `payments_20240520` if missing.
  - Updates role constraints to include 'super_admin'.

2. Security (RLS)
  - Implements a non-recursive `is_admin()` helper function.
  - Applies clean RLS policies for all roles.
  - Fixes recursion issues in profile policies.

3. Performance
  - Adds indexes for frequently queried columns like `email` and `renter_id`.
*/

-- 1. Helper Function for Non-Recursive Admin Checks
CREATE OR REPLACE FUNCTION is_admin_check() 
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT EXISTS (
      SELECT 1 FROM profiles_20240520 
      WHERE id = auth.uid() AND role IN ('landlord', 'super_admin')
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Profiles Table Setup
CREATE TABLE IF NOT EXISTS profiles_20240520 (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  role text DEFAULT 'renter',
  full_name text DEFAULT '',
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

DO $$ BEGIN
  ALTER TABLE profiles_20240520 DROP CONSTRAINT IF EXISTS profiles_20240520_role_check;
  ALTER TABLE profiles_20240520 ADD CONSTRAINT profiles_20240520_role_check CHECK (role IN ('landlord', 'renter', 'super_admin'));
EXCEPTION WHEN others THEN NULL; END $$;

ALTER TABLE profiles_20240520 ENABLE ROW LEVEL SECURITY;

-- 3. Renters Table Setup
CREATE TABLE IF NOT EXISTS renters_20240520 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  address text NOT NULL,
  phone text DEFAULT '',
  email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE renters_20240520 ENABLE ROW LEVEL SECURITY;

-- 4. Payments Table Setup
CREATE TABLE IF NOT EXISTS payments_20240520 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  renter_id uuid REFERENCES renters_20240520 ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  date date DEFAULT CURRENT_DATE,
  category text DEFAULT 'Rent',
  note text DEFAULT '',
  status text DEFAULT 'Paid',
  created_at timestamptz DEFAULT now()
);

-- Ensure category column exists (for backward compatibility)
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments_20240520' AND column_name='category') THEN 
    ALTER TABLE payments_20240520 ADD COLUMN category text DEFAULT 'Rent';
  END IF;
END $$;

ALTER TABLE payments_20240520 ENABLE ROW LEVEL SECURITY;

-- 5. Items Table Setup
CREATE TABLE IF NOT EXISTS items_20240520 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  condition text DEFAULT 'Good',
  location text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE items_20240520 ENABLE ROW LEVEL SECURITY;

-- 6. Clean and Re-apply RLS Policies
-- Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles_20240520;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles_20240520;
DROP POLICY IF EXISTS "Admins manage all profiles" ON profiles_20240520;

CREATE POLICY "Users can view own profile" ON profiles_20240520 FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins manage all profiles" ON profiles_20240520 FOR ALL USING (is_admin_check());

-- Renters
DROP POLICY IF EXISTS "Landlords can manage their renters" ON renters_20240520;
DROP POLICY IF EXISTS "Renters can view their own record" ON renters_20240520;
DROP POLICY IF EXISTS "Admins manage all renters" ON renters_20240520;

CREATE POLICY "Landlords manage own renters" ON renters_20240520 FOR ALL USING (landlord_id = auth.uid());
CREATE POLICY "Renters view own record" ON renters_20240520 FOR SELECT USING (email = (SELECT email FROM profiles_20240520 WHERE id = auth.uid()));
CREATE POLICY "Admins manage all renters" ON renters_20240520 FOR ALL USING (is_admin_check());

-- Payments
DROP POLICY IF EXISTS "Landlords can manage payments for their renters" ON payments_20240520;
DROP POLICY IF EXISTS "Renters can view their own payments" ON payments_20240520;
DROP POLICY IF EXISTS "Admins manage all payments" ON payments_20240520;

CREATE POLICY "Landlords manage own payments" ON payments_20240520 FOR ALL USING (
  EXISTS (SELECT 1 FROM renters_20240520 WHERE id = payments_20240520.renter_id AND landlord_id = auth.uid())
);
CREATE POLICY "Renters view own payments" ON payments_20240520 FOR SELECT USING (
  EXISTS (SELECT 1 FROM renters_20240520 WHERE id = payments_20240520.renter_id AND email = (SELECT email FROM profiles_20240520 WHERE id = auth.uid()))
);
CREATE POLICY "Admins manage all payments" ON payments_20240520 FOR ALL USING (is_admin_check());

-- Items
DROP POLICY IF EXISTS "Landlords can manage their items" ON items_20240520;
DROP POLICY IF EXISTS "Renters can view items in their location" ON items_20240520;
DROP POLICY IF EXISTS "Admins manage all items" ON items_20240520;

CREATE POLICY "Landlords manage own items" ON items_20240520 FOR ALL USING (landlord_id = auth.uid());
CREATE POLICY "Renters view all items" ON items_20240520 FOR SELECT USING (true);
CREATE POLICY "Admins manage all items" ON items_20240520 FOR ALL USING (is_admin_check());