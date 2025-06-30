/*
  # Add INSERT and UPDATE policies for games and categories

  1. Security Updates
    - Add INSERT policy for categories table (authenticated users)
    - Add UPDATE policy for categories table (authenticated users)
    - Add INSERT policy for games table (authenticated users)
    - Add UPDATE policy for games table (authenticated users)

  2. Changes
    - Allow authenticated users to insert new categories
    - Allow authenticated users to update existing categories
    - Allow authenticated users to insert new games
    - Allow authenticated users to update existing games

  These policies are needed for the addGamesToDatabase function to work properly.
*/

-- Add INSERT policy for categories table
CREATE POLICY "Authenticated users can insert categories"
  ON categories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add UPDATE policy for categories table
CREATE POLICY "Authenticated users can update categories"
  ON categories
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add INSERT policy for games table
CREATE POLICY "Authenticated users can insert games"
  ON games
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add UPDATE policy for games table
CREATE POLICY "Authenticated users can update games"
  ON games
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);