/* 
# ADMIN TENANT CREATION SYSTEM
1. Purpose
   - Allows Landlords to create Auth accounts for tenants while remaining logged in.
   - Automatically handles password encryption and confirmation.
   - Creates the Profile record with 'renter' role.
2. Logic
   - Checks if user exists in auth.users.
   - Inserts into auth.users and auth.identities.
   - Inserts into public.profiles_20240520.
*/

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.admin_create_tenant_account(
  target_email text, 
  target_password text,
  target_name text
)
RETURNS jsonb AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- 1. Security Check (Only Landlords/Admins)
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles_20240520 
    WHERE id = auth.uid() AND role IN ('landlord', 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only landlords can create tenant accounts.';
  END IF;

  -- 2. Check if user already exists
  SELECT id INTO new_user_id FROM auth.users WHERE LOWER(email) = LOWER(target_email);
  
  IF new_user_id IS NOT NULL THEN
    -- If user exists in Auth but not in Profiles, fix it
    INSERT INTO public.profiles_20240520 (id, email, full_name, role)
    VALUES (new_user_id, target_email, target_name, 'renter')
    ON CONFLICT (id) DO NOTHING;
    
    RETURN jsonb_build_object('status', 'exists', 'user_id', new_user_id, 'message', 'Account already exists. Linking profile.');
  END IF;

  -- 3. Create the Auth User
  new_user_id := gen_random_uuid();
  
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    is_super_admin
  )
  VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    target_email,
    crypt(target_password, gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"], "email_confirmed": true}'::jsonb,
    jsonb_build_object('full_name', target_name),
    'authenticated',
    'authenticated',
    NOW(),
    NOW(),
    '',
    '',
    '',
    FALSE
  );

  -- 4. Create Identity (Essential for login recognition)
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  )
  VALUES (
    gen_random_uuid(),
    new_user_id,
    jsonb_build_object('sub', new_user_id, 'email', target_email),
    'email',
    NOW(),
    NOW(),
    NOW()
  );

  -- 5. Create Profile
  INSERT INTO public.profiles_20240520 (id, email, full_name, role)
  VALUES (new_user_id, target_email, target_name, 'renter');

  RETURN jsonb_build_object('status', 'success', 'user_id', new_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

GRANT EXECUTE ON FUNCTION public.admin_create_tenant_account(text, text, text) TO authenticated;