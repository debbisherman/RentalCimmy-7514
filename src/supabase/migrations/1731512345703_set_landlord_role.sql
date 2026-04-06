/* 
# UPDATE ROLE TO LANDLORD
1. Changes
   - Updates the existing profile for `info@cimmeronstudios.com` to have the 'landlord' role.
   - Modifies the `handle_new_user_profile` trigger function to default this specific email to 'landlord' instead of 'super_admin'.
2. Security
   - Maintains existing RLS policies as 'landlord' still has administrative privileges.
*/

-- 1. Update the trigger function for future signups
CREATE OR REPLACE FUNCTION public.handle_new_user_profile() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles_20240520 (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    CASE 
      WHEN NEW.email = 'info@cimmeronstudios.com' THEN 'landlord'
      ELSE 'renter' 
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = CASE WHEN EXCLUDED.email = 'info@cimmeronstudios.com' THEN 'landlord' ELSE profiles_20240520.role END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update the existing record immediately
UPDATE public.profiles_20240520 
SET role = 'landlord' 
WHERE email = 'info@cimmeronstudios.com';