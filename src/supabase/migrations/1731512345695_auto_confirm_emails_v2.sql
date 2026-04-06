/* 
# Auto-Confirm Email Verification
1. Purpose
   - Automatically marks all new users as "confirmed" in the Supabase Auth schema.
   - Ensures users can log in immediately without having to click a link in a verification email.
   - Updates any existing unconfirmed users to "confirmed" status.

2. Changes
   - Creates a `BEFORE INSERT` trigger on `auth.users` to set confirmation timestamps.
   - Updates all existing users to ensure no one is locked out.
*/

-- 1. Create a function that modifies the user record before it hits the database
CREATE OR REPLACE FUNCTION public.auto_confirm_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Set confirmation timestamps to now
  NEW.email_confirmed_at := NOW();
  NEW.confirmed_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Attach the trigger to the auth.users table
-- This ensures that any method of user creation (Sign Up or Admin Create) results in a confirmed user
DROP TRIGGER IF EXISTS tr_auto_confirm_new_user ON auth.users;
CREATE TRIGGER tr_auto_confirm_new_user
BEFORE INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.auto_confirm_new_user();

-- 3. Retroactively confirm any existing users who might be stuck in "unconfirmed" status
DO $$ 
BEGIN
  UPDATE auth.users 
  SET email_confirmed_at = NOW(), 
      confirmed_at = NOW() 
  WHERE email_confirmed_at IS NULL;
EXCEPTION WHEN OTHERS THEN
  -- Ignore if auth schema is not accessible in this context
  NULL;
END $$;