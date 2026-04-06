/* 
# Fix RLS Recursion on Profiles Table
1. Purpose
  - Fixes the "infinite recursion detected in policy" error.
  - Replaces direct table subqueries with a `SECURITY DEFINER` function.
2. Changes
  - Creates `check_is_admin()` function which bypasses RLS.
  - Replaces the recursive "Admins manage all profiles" policy.
  - Simplifies profile access logic.
*/

-- 1. Create a "Security Definer" function to break recursion
-- This function runs with the privileges of the creator (postgres), bypassing RLS
CREATE OR REPLACE FUNCTION public.check_is_admin() 
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles_20240520 
    WHERE id = auth.uid() 
    AND role IN ('landlord', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Clean up old offending policies
DROP POLICY IF EXISTS "Admins manage all profiles" ON profiles_20240520;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles_20240520;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles_20240520;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles_20240520;

-- 3. Re-apply non-recursive policies for Profiles
-- A: Users can always see and manage their own profile (Direct check, no recursion)
CREATE POLICY "Users manage own profile" 
ON profiles_20240520 
FOR ALL 
USING (auth.uid() = id);

-- B: Admins can manage EVERYTHING else
-- We use the function here. Since the function is SECURITY DEFINER, 
-- its internal SELECT doesn't trigger this policy again.
CREATE POLICY "Admins manage all profiles" 
ON profiles_20240520 
FOR ALL 
USING (check_is_admin());

-- 4. Update other tables to use this safer check for consistency
DROP POLICY IF EXISTS "Admins manage all renters" ON renters_20240520;
CREATE POLICY "Admins manage all renters" 
ON renters_20240520 FOR ALL 
USING (check_is_admin());

DROP POLICY IF EXISTS "Admins manage all payments" ON payments_20240520;
CREATE POLICY "Admins manage all payments" 
ON payments_20240520 FOR ALL 
USING (check_is_admin());

DROP POLICY IF EXISTS "Admins manage all properties" ON properties_20240520;
CREATE POLICY "Admins manage all properties" 
ON properties_20240520 FOR ALL 
USING (check_is_admin());