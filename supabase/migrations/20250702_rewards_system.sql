-- Add new columns to users table
ALTER TABLE users
ADD COLUMN coins integer NOT NULL DEFAULT 0,
ADD COLUMN fair_play_coins integer NOT NULL DEFAULT 0,
ADD COLUMN last_visit_date date,
ADD COLUMN daily_coin_earnings integer NOT NULL DEFAULT 0,
ADD COLUMN weekly_fair_play_awarded date;

-- Create coin_transactions table
CREATE TABLE coin_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    type text NOT NULL, -- e.g., 'visit', 'game', 'share', 'referral', 'redeem'
    amount integer NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now()
);

-- Create referrals table
CREATE TABLE referrals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id uuid REFERENCES users(id) ON DELETE CASCADE,
    referred_id uuid REFERENCES users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now()
); 