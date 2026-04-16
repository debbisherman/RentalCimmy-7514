/* 
# Add Expenses Management
1. New Tables
  - `expenses_20240520`
    - `id` (uuid, primary key)
    - `landlord_id` (uuid, references auth.users)
    - `vendor_name` (text)
    - `category` (text)
    - `amount` (numeric)
    - `expense_date` (date)
    - `created_at` (timestamptz)
2. Security
  - Enable RLS on `expenses_20240520`
  - Landlords can manage their own expenses
  - Super admins can manage all expenses
*/

CREATE TABLE IF NOT EXISTS expenses_20240520 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id uuid REFERENCES auth.users NOT NULL,
  vendor_name text NOT NULL,
  category text NOT NULL DEFAULT 'Maintenance',
  amount numeric NOT NULL DEFAULT 0,
  expense_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE expenses_20240520 ENABLE ROW LEVEL SECURITY;

-- 1. Landlords manage own expenses
CREATE POLICY "Landlords manage own expenses" 
ON expenses_20240520 FOR ALL 
USING (landlord_id = auth.uid());

-- 2. Super Admins manage all expenses
CREATE POLICY "Admins manage all expenses" 
ON expenses_20240520 FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles_20240520 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses_20240520(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_landlord ON expenses_20240520(landlord_id);