/* 
# Fix Profile RLS for Registration
1. Purpose
  - Adds missing `INSERT` and `UPDATE` policies to the `profiles_20240520` table.
  - This allows new users to create their profile record immediately after signing up.
2. Changes
  - Adds policy: "Users can insert own profile"
  - Adds policy: "Users can update own profile"
*/

-- Allow users to create their own profile record during registration
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles_20240520;
CREATE POLICY "Users can insert own profile" 
ON profiles_20240520 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile (e.g., changing their name)
DROP POLICY IF EXISTS "Users can update own profile" ON profiles_20240520;
CREATE POLICY "Users can update own profile" 
ON profiles_20240520 
FOR UPDATE 
USING (auth.uid() = id);

-- Ensure Select is still available for own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles_20240520;
CREATE POLICY "Users can view own profile" 
ON profiles_20240520 
FOR SELECT 
USING (auth.uid() = id);