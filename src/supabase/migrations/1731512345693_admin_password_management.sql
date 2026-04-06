/* 
# Admin Password Management
1. Purpose
  - Creates a secure function to allow Landlords and Super Admins to set renter passwords.
  - Handles the encryption and update of the internal Supabase Auth table.
2. New Functions
  - `admin_set_user_password`: Takes an email and new password, verifies admin status, and updates the user.
*/

-- Create the function to set a user's password
CREATE OR REPLACE FUNCTION public.admin_set_user_password(target_email text, new_password text)
RETURNS text AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- 1. Security Check: Only Landlords or Super Admins can use this
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Only administrators can reset passwords.';
  END IF;

  -- 2. Find the user ID from the auth.users table
  SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;

  IF target_user_id IS NULL THEN
    RETURN 'User account not found in Auth system.';
  END IF;

  -- 3. Update the password
  -- We use the crypt function from pgcrypto (standard in Supabase)
  UPDATE auth.users 
  SET encrypted_password = crypt(new_password, gen_salt('bf')),
      updated_at = NOW()
  WHERE id = target_user_id;

  RETURN 'Password updated successfully.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- Grant execution permission to authenticated users (the function itself checks for admin role)
GRANT EXECUTE ON FUNCTION public.admin_set_user_password(text, text) TO authenticated;