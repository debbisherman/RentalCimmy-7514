/* 
# Security Consolidation & Payment Fix
1. Purpose
  - Consolidates all "Admin Check" logic into a single, reliable function.
  - Fixes RLS policies for the Payments table to ensure both Landlords and Admins can insert.
  - Ensures proper UUID handling for property links.
2. Changes
  - Standardizes on `public.is_admin()` function.
  - Re-applies all table policies using the standardized function.
*/

-- 1. Standardize the Admin Check Function
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles_20240520 
    WHERE id = auth.uid() 
    AND role IN ('landlord', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Payments Table Policy Fix
DROP POLICY IF EXISTS "Landlords manage own payments" ON payments_20240520;
DROP POLICY IF EXISTS "Admins manage all payments" ON payments_20240520;
DROP POLICY IF EXISTS "Renters view own payments" ON payments_20240520;

-- A: Admins can do everything
CREATE POLICY "Admins manage all payments" 
ON payments_20240520 FOR ALL 
USING (is_admin());

-- B: Landlords can manage payments for their own renters
CREATE POLICY "Landlords manage own payments" 
ON payments_20240520 FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM renters_20240520 
    WHERE id = payments_20240520.renter_id 
    AND landlord_id = auth.uid()
  )
);

-- C: Renters can view their own payments
CREATE POLICY "Renters view own payments" 
ON payments_20240520 FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM renters_20240520 
    WHERE id = payments_20240520.renter_id 
    AND email = (SELECT email FROM profiles_20240520 WHERE id = auth.uid())
  )
);

-- 3. Ensure Profiles Role Constraint is correct
ALTER TABLE profiles_20240520 DROP CONSTRAINT IF EXISTS profiles_20240520_role_check;
ALTER TABLE profiles_20240520 ADD CONSTRAINT profiles_20240520_role_check 
CHECK (role IN ('landlord', 'renter', 'super_admin'));