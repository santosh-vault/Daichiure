/*
  # Fix referrals table structure

  1. New Tables
    - Update `referrals` table to include proper columns for token-based confirmation
      - `id` (uuid, primary key)
      - `referrer_id` (uuid, foreign key to users)
      - `referred_id` (uuid, foreign key to users)
      - `status` (text, default 'pending')
      - `token` (text, unique)
      - `created_at` (timestamp)
      - `confirmed_at` (timestamp, nullable)

  2. Security
    - Enable RLS on referrals table
    - Add policies for users to view their own referrals

  3. Changes
    - Add missing columns to referrals table
    - Ensure proper constraints and indexes
*/

-- Add missing columns to referrals table if they don't exist
DO $$
BEGIN
  -- Add status column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'referrals' AND column_name = 'status'
  ) THEN
    ALTER TABLE referrals ADD COLUMN status text DEFAULT 'pending';
  END IF;

  -- Add token column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'referrals' AND column_name = 'token'
  ) THEN
    ALTER TABLE referrals ADD COLUMN token text UNIQUE;
  END IF;

  -- Add confirmed_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'referrals' AND column_name = 'confirmed_at'
  ) THEN
    ALTER TABLE referrals ADD COLUMN confirmed_at timestamp with time zone;
  END IF;
END $$;

-- Enable RLS on referrals table
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Add policies for referrals
CREATE POLICY "Users can view their own referrals"
  ON referrals
  FOR SELECT
  TO authenticated
  USING (referrer_id = auth.uid() OR referred_id = auth.uid());

CREATE POLICY "Users can insert referrals"
  ON referrals
  FOR INSERT
  TO authenticated
  WITH CHECK (referrer_id = auth.uid());

CREATE POLICY "System can update referrals"
  ON referrals
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add index on token for faster lookups
CREATE INDEX IF NOT EXISTS idx_referrals_token ON referrals(token);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);