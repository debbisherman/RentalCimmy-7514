/* 
# Update User Name for Specific Email
1. Changes
  - Updates the `full_name` in `profiles_20240520` for 'eecunnington@gmail.com'.
  - Updates the `name` in `renters_20240520` for 'eecunnington@gmail.com'.
2. Description
  - Synchronizes the display name to "Emily & Cora" for this specific account.
*/

DO $$ 
BEGIN 
  -- 1. Update the profile name
  UPDATE public.profiles_20240520 
  SET full_name = 'Emily & Cora' 
  WHERE email = 'eecunnington@gmail.com';

  -- 2. Update the renter record name
  UPDATE public.renters_20240520 
  SET name = 'Emily & Cora' 
  WHERE email = 'eecunnington@gmail.com';
END $$;