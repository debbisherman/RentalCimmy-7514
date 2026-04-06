/* 
# Pre-provision Renter: Debbi
1. Purpose
  - Inserts the renter record for 'Debbi' into the management table.
  - This ensures that when the user 'debbi@cimmeronstudios.com' signs up, the application finds her record and displays the dashboard immediately.
2. Changes
  - Inserts into `renters_20240520` assigned to the first available landlord.
*/

DO $$ 
DECLARE
    v_landlord_id uuid;
BEGIN
    -- Find the landlord/admin to own this renter record
    SELECT id INTO v_landlord_id FROM profiles_20240520 WHERE role IN ('landlord', 'super_admin') LIMIT 1;
    
    IF v_landlord_id IS NOT NULL THEN
        -- Check if Debbi already exists to prevent duplicates
        IF NOT EXISTS (SELECT 1 FROM renters_20240520 WHERE email = 'debbi@cimmeronstudios.com') THEN
            INSERT INTO renters_20240520 (landlord_id, name, address, phone, email)
            VALUES (
                v_landlord_id, 
                'Debbi', 
                'Main Street Apartments, Unit 4B', 
                '(555) 012-3456', 
                'debbi@cimmeronstudios.com'
            );
        END IF;
    END IF;
END $$;