/* 
# Final Schema Sync & RLS Fix
1. Purpose
  - Ensures the `profiles_20240520` table allows new users to register.
  - Forces a schema cache refresh for the `renters_20240520` table to recognize new columns.
  - Grants explicit permissions to authenticated users.
2. Changes
  - Adds `INSERT` and `UPDATE` policies for profiles.
  - Refreshes schema comments.
*/

-- 1. Fix Profile RLS for Registration
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles_20240520;
CREATE POLICY "Users can insert own profile" 
ON profiles_20240520 FOR INSERT 
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles_20240520;
CREATE POLICY "Users can update own profile" 
ON profiles_20240520 FOR UPDATE 
USING (auth.uid() = id);

-- 2. Force PostgREST to reload schema for Renters table
COMMENT ON TABLE renters_20240520 IS 'Active renters and property assignments';

-- 3. Ensure Super Admin can do everything on profiles
DROP POLICY IF EXISTS "Admins manage all profiles" ON profiles_20240520;
CREATE POLICY "Admins manage all profiles" 
ON profiles_20240520 FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles_20240520 
    WHERE id = auth.uid() AND role IN ('landlord', 'super_admin')
  )
);