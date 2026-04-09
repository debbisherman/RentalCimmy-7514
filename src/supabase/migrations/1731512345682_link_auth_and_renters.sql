/* 
# Link Renter Records and Auth Accounts
1. Changes
  - Adds `user_id` column to `renters_20240520` to create a direct link to `auth.users`.
  - Creates a trigger to automatically link Renter records to Auth IDs on signup.
  - Creates a "Security Definer" function to allow deleting Auth users from the public schema.
  - Creates a trigger to delete the Auth user when a Renter record is deleted.
2. Security
  - Uses `SECURITY DEFINER` to bypass schema restrictions for Auth deletion.
*/

-- 1. Add user_id column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='renters_20240520' AND column_name='user_id') THEN
    ALTER TABLE renters_20240520 ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 2. Function to link Renter record to Auth User on Profile creation
-- This ensures that when a tenant registers, their business record is linked to their login
CREATE OR REPLACE FUNCTION public.link_renter_to_auth()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.renters_20240520
  SET user_id = NEW.id
  WHERE email = NEW.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_link_renter_on_profile ON public.profiles_20240520;
CREATE TRIGGER tr_link_renter_on_profile
  AFTER INSERT ON public.profiles_20240520
  FOR EACH ROW EXECUTE FUNCTION public.link_renter_to_auth();

-- 3. Function to delete Auth User when Renter record is deleted
-- This is the "Magic Link" that cleans up the authentication account
CREATE OR REPLACE FUNCTION public.delete_auth_user_with_renter()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.user_id IS NOT NULL THEN
    -- Delete from auth.users (Requires Security Definer)
    DELETE FROM auth.users WHERE id = OLD.user_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Apply the deletion trigger
DROP TRIGGER IF EXISTS tr_delete_auth_on_renter_delete ON public.renters_20240520;
CREATE TRIGGER tr_delete_auth_on_renter_delete
  AFTER DELETE ON public.renters_20240520
  FOR EACH ROW EXECUTE FUNCTION public.delete_auth_user_with_renter();