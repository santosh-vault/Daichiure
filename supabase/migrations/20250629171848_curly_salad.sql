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