/* 
# AUTH & PROFILE ARCHITECTURE UPDATE
1. New Trigger: `on_auth_user_created_profile`
   - Automatically creates a public profile record for ANY new signup.
   - Defaults the role to 'renter' for public registrations.
   - Assigns 'super_admin' if the email matches the primary admin.
2. Updated RPC: `admin_create_tenant_account`
   - Allows Landlords to manually provision accounts.
   - Handles auth insertion and profile creation in one atomic step.
   - Uses SECURITY DEFINER to bypass RLS during creation.
*/

-- 1. Function to handle profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_profile() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles_20240520 (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Renter'),
    CASE 
      WHEN NEW.email = 'info@cimmeronstudios.com' THEN 'super_admin'
      ELSE 'renter' 
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles_20240520.full_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger for profile creation
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

-- 3. Robust Admin creation function
CREATE OR REPLACE FUNCTION public.admin_create_tenant_account(
  target_email text, 
  target_password text,
  target_name text
)
RETURNS jsonb AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Security: Only Landlords/Admins
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles_20240520 
    WHERE id = auth.uid() AND role IN ('landlord', 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only landlords can create tenant accounts.';
  END IF;

  -- Check existence
  SELECT id INTO new_user_id FROM auth.users WHERE LOWER(email) = LOWER(target_email);
  
  IF new_user_id IS NOT NULL THEN
    RETURN jsonb_build_object('status', 'exists', 'user_id', new_user_id, 'message', 'This email already has an account.');
  END IF;

  -- Create Auth User
  new_user_id := gen_random_uuid();
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, aud, role, confirmed_at
  )
  VALUES (
    new_user_id, '00000000-0000-0000-0000-000000000000', target_email, 
    crypt(target_password, gen_salt('bf')), NOW(),
    '{"provider": "email", "providers": ["email"], "email_confirmed": true}'::jsonb,
    jsonb_build_object('full_name', target_name),
    'authenticated', 'authenticated', NOW()
  );

  -- Create Identity
  INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at)
  VALUES (gen_random_uuid(), new_user_id, jsonb_build_object('sub', new_user_id, 'email', target_email), 'email', NOW());

  -- Profile is handled by the trigger automatically
  
  RETURN jsonb_build_object('status', 'success', 'user_id', new_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

GRANT EXECUTE ON FUNCTION public.admin_create_tenant_account(text, text, text) TO authenticated;