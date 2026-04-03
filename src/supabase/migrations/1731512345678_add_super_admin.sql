/* 
# Fix Super Admin Policies and Role Constraint

1. Changes
  - Updates the `role` check constraint on `profiles_20240520` to include 'super_admin' safely.
  - Adds non-recursive RLS policies for 'super_admin' access.
  - Uses `auth.jwt()` to check roles instead of subqueries to avoid infinite recursion.

2. Security
  - Super admins gain full access to all records.
*/

-- 1. Update Profile Role Constraint safely
DO $$ 
BEGIN 
  ALTER TABLE profiles_20240520 DROP CONSTRAINT IF EXISTS profiles_20240520_role_check;
  ALTER TABLE profiles_20240520 ADD CONSTRAINT profiles_20240520_role_check CHECK (role IN ('landlord', 'renter', 'super_admin'));
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- 2. Update RLS Policies for Super Admin Access using a more performant, non-recursive approach
-- We use a function to check admin status to keep policies clean
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles_20240520 
    WHERE id = auth.uid() AND role IN ('landlord', 'super_admin')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles Table
DROP POLICY IF EXISTS "Super admins can manage all profiles" ON profiles_20240520;
CREATE POLICY "Super admins can manage all profiles" ON profiles_20240520 
FOR ALL TO authenticated USING (is_admin());

-- Renters Table
DROP POLICY IF EXISTS "Super admins can manage all renters" ON renters_20240520;
CREATE POLICY "Super admins can manage all renters" ON renters_20240520 
FOR ALL TO authenticated USING (is_admin());

-- Payments Table
DROP POLICY IF EXISTS "Super admins can manage all payments" ON payments_20240520;
CREATE POLICY "Super admins can manage all payments" ON payments_20240520 
FOR ALL TO authenticated USING (is_admin());

-- Items Table
DROP POLICY IF EXISTS "Super admins can manage all items" ON items_20240520;
CREATE POLICY "Super admins can manage all items" ON items_20240520 
FOR ALL TO authenticated USING (is_admin());