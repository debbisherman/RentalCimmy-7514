/* 
# Add Delete Policies for Renters
1. Security Changes
  - Adds a DELETE policy to `renters_20240520` table.
  - Allows Super Admins to delete any renter.
  - Allows Landlords to delete their own renters.
2. Integrity
  - Note: Payments table already has ON DELETE CASCADE on the renter_id foreign key.
*/

-- Update Renters Table Policies to allow deletion
DROP POLICY IF EXISTS "Admins and Landlords can delete renters" ON renters_20240520;

CREATE POLICY "Admins and Landlords can delete renters" ON renters_20240520
FOR DELETE TO authenticated
USING (
  landlord_id = auth.uid() 
  OR 
  EXISTS (
    SELECT 1 FROM profiles_20240520 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);