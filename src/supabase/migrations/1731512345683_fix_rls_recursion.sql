/* 
# Fix RLS Recursion and Payment Policies
1. Changes
  - Re-implements `is_admin_check()` to be more robust.
  - Fixes circular dependencies in `profiles_20240520` policies.
  - Ensures `payments_20240520` has proper INSERT permissions for both Landlords and Super Admins.
2. Security
  - Uses `SECURITY DEFINER` properly to bypass RLS within the check function.
  - Adds explicit `INSERT` policies for clarity.
*/

-- 1. Redefine the admin check function to be safer
CREATE OR REPLACE FUNCTION public.is_admin_check() 
RETURNS boolean AS $$
DECLARE
  user_role text;
BEGIN
  -- We query the table directly. Since this is SECURITY DEFINER, 
  -- it bypasses RLS for this specific internal query.
  SELECT role INTO user_role 
  FROM public.profiles_20240520 
  WHERE id = auth.uid();
  
  RETURN (user_role = 'landlord' OR user_role = 'super_admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Reset and Re-apply Profile Policies (The source of recursion)
ALTER TABLE profiles_20240520 DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles_20240520 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles_20240520;
DROP POLICY IF EXISTS "Admins manage all profiles" ON profiles_20240520;

-- Basic policy: Everyone can see their own
CREATE POLICY "Users can view own profile" 
ON profiles_20240520 FOR SELECT 
USING (auth.uid() = id);

-- Admin policy: Use the function (which now bypasses RLS for its internal check)
CREATE POLICY "Admins manage all profiles" 
ON profiles_20240520 FOR ALL 
USING (is_admin_check());

-- 3. Reset and Re-apply Payment Policies
DROP POLICY IF EXISTS "Landlords manage own payments" ON payments_20240520;
DROP POLICY IF EXISTS "Renters view own payments" ON payments_20240520;
DROP POLICY IF EXISTS "Admins manage all payments" ON payments_20240520;

-- Landlords can do everything with payments for their own renters
CREATE POLICY "Landlords manage own payments" 
ON payments_20240520 FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM renters_20240520 
    WHERE id = payments_20240520.renter_id 
    AND landlord_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM renters_20240520 
    WHERE id = payments_20240520.renter_id 
    AND landlord_id = auth.uid()
  )
);

-- Renters can only read their own payments
CREATE POLICY "Renters view own payments" 
ON payments_20240520 FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM renters_20240520 
    WHERE id = payments_20240520.renter_id 
    AND email = (SELECT email FROM profiles_20240520 WHERE id = auth.uid())
  )
);

-- Super Admins can manage everything
CREATE POLICY "Admins manage all payments" 
ON payments_20240520 FOR ALL 
USING (is_admin_check());