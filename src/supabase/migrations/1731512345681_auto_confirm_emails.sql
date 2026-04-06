/* 
# Auto-Confirm Auth Emails
1. Purpose
  - Automatically marks new users as "confirmed" in the Supabase Auth schema.
  - Removes the requirement for users to click a link in their email before logging in.
2. Changes
  - Creates a trigger function `handle_new_user_confirmation`.
  - Attaches trigger to `auth.users` table.
*/

-- Function to set confirmed_at on new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the auth.users table for the newly created user
  -- We use a background update to ensure the record is fully committed
  UPDATE auth.users
  SET 
    email_confirmed_at = NOW(),
    confirmed_at = NOW(),
    last_sign_in_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run after a new user is inserted into auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_confirm ON auth.users;
CREATE TRIGGER on_auth_user_created_confirm
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_confirmation();