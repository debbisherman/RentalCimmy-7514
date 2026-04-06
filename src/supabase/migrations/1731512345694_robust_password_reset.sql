/* 
# Robust Password Reset Fix
1. Purpose
  - Ensures pgcrypto extension is enabled.
  - Updates the password reset function to be more resilient.
  - Adds explicit logging of the result for better debugging.
2. Changes
  - Enables `pgcrypto` extension.
  - Updates `admin_set_user_password` to handle case-insensitive emails.
*/

-- 1. Enable pgcrypto (Required for password hashing)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Improved Password Reset Function
CREATE OR REPLACE FUNCTION public.admin_set_user_password(target_email text, new_password text)
RETURNS text AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Security check: Only Admins/Landlords
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Access Denied.';
  END IF;

  -- Find user (case-insensitive lookup)
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE LOWER(email) = LOWER(target_email);

  -- If user doesn't exist in Auth yet
  IF target_user_id IS NULL THEN
    RETURN 'ERROR: No account found for ' || target_email || '. The tenant must register/sign-up first.';
  END IF;

  -- Update the password directly in the auth schema
  UPDATE auth.users 
  SET encrypted_password = crypt(new_password, gen_salt('bf')),
      updated_at = NOW(),
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()) -- Auto-confirm if not already
  WHERE id = target_user_id;

  RETURN 'SUCCESS: Password updated for ' || target_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- Ensure permissions are set
GRANT EXECUTE ON FUNCTION public.admin_set_user_password(text, text) TO authenticated;