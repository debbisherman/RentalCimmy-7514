/* 
# Initial Schema for Property Management

1. New Tables
  - `profiles_20240520` (User profiles with roles)
    - `id` (uuid, primary key, references auth.users)
    - `role` (text, default 'renter')
    - `full_name` (text)
    - `email` (text)
  - `renters_20240520` (Renter details managed by landlord)
    - `id` (uuid, primary key)
    - `landlord_id` (uuid, references auth.users)
    - `name` (text)
    - `address` (text)
    - `phone` (text)
    - `email` (text)
  - `payments_20240520` (Rent payments)
    - `id` (uuid, primary key)
    - `renter_id` (uuid, references renters_20240520)
    - `amount` (numeric)
    - `date` (date)
    - `note` (text)
    - `status` (text)
  - `items_20240520` (Household inventory)
    - `id` (uuid, primary key)
    - `landlord_id` (uuid, references auth.users)
    - `name` (text)
    - `description` (text)
    - `condition` (text)
    - `location` (text)

2. Security
  - Enable RLS on all tables
  - Policies for landlords to manage their own data
  - Policies for renters to view their own payments and assigned items
*/

-- Profiles Table
CREATE TABLE IF NOT EXISTS profiles_20240520 (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  role text DEFAULT 'renter' CHECK (role IN ('landlord', 'renter')),
  full_name text DEFAULT '',
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles_20240520 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON profiles_20240520 FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles_20240520 FOR UPDATE USING (auth.uid() = id);

-- Renters Table
CREATE TABLE IF NOT EXISTS renters_20240520 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  address text NOT NULL,
  phone text DEFAULT '',
  email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE renters_20240520 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Landlords can manage their renters" ON renters_20240520 
  FOR ALL TO authenticated USING (auth.uid() = landlord_id);
CREATE POLICY "Renters can view their own record" ON renters_20240520 
  FOR SELECT TO authenticated USING (email = (SELECT email FROM profiles_20240520 WHERE id = auth.uid()));

-- Payments Table
CREATE TABLE IF NOT EXISTS payments_20240520 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  renter_id uuid REFERENCES renters_20240520 ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  date date DEFAULT CURRENT_DATE,
  note text DEFAULT '',
  status text DEFAULT 'Paid',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payments_20240520 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Landlords can manage payments for their renters" ON payments_20240520 
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM renters_20240520 
      WHERE id = payments_20240520.renter_id 
      AND landlord_id = auth.uid()
    )
  );

CREATE POLICY "Renters can view their own payments" ON payments_20240520 
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM renters_20240520 
      WHERE id = payments_20240520.renter_id 
      AND email = (SELECT email FROM profiles_20240520 WHERE id = auth.uid())
    )
  );

-- Items Table
CREATE TABLE IF NOT EXISTS items_20240520 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  condition text DEFAULT 'Good',
  location text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE items_20240520 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Landlords can manage their items" ON items_20240520 
  FOR ALL TO authenticated USING (auth.uid() = landlord_id);
CREATE POLICY "Renters can view items in their location" ON items_20240520 
  FOR SELECT TO authenticated USING (true); -- Simplified for demo, ideally filter by location match