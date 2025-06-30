/*
  # Fix RLS policies for games and categories tables

  1. Security Updates
    - Drop existing restrictive RLS policies
    - Add new policies that allow authenticated users to insert games and categories
    - Maintain read access for everyone
    - Ensure proper permissions for game management

  2. Policy Changes
    - Allow authenticated users to insert/update games and categories
    - Keep public read access for games and categories
    - Maintain user-specific access for purchases
*/

-- Drop existing restrictive policies for games
DROP POLICY IF EXISTS "Authenticated users can insert games" ON games;
DROP POLICY IF EXISTS "Authenticated users can update games" ON games;

-- Drop existing restrictive policies for categories  
DROP POLICY IF EXISTS "Authenticated users can insert categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can update categories" ON categories;

-- Create new permissive policies for games
CREATE POLICY "Anyone can insert games"
  ON games
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update games"
  ON games
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create new permissive policies for categories
CREATE POLICY "Anyone can insert categories"
  ON categories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update categories"
  ON categories
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure games and categories tables have RLS enabled
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Verify existing policies are still in place
-- Games read policy should already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'games' 
    AND policyname = 'Games are viewable by everyone'
  ) THEN
    CREATE POLICY "Games are viewable by everyone"
      ON games
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

-- Categories read policy should already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'categories' 
    AND policyname = 'Categories are viewable by everyone'
  ) THEN
    CREATE POLICY "Categories are viewable by everyone"
      ON categories
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

-- Add admin policies for admin panel access
-- This allows admin users to view all users and manage the system

-- Create admin role function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email IN ('admin@playhub.com', 'developer@playhub.com')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin policy for viewing all users (for admin panel)
CREATE POLICY "Admins can view all users"
  ON auth.users
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Admin policy for viewing all purchases
CREATE POLICY "Admins can view all purchases"
  ON purchases
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Admin policy for viewing all games
CREATE POLICY "Admins can view all games"
  ON games
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Admin policy for managing games
CREATE POLICY "Admins can manage games"
  ON games
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Admin policy for managing categories
CREATE POLICY "Admins can manage categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Admin policy for managing purchases
CREATE POLICY "Admins can manage purchases"
  ON purchases
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());