-- Add reward-related columns to users table
DO $$
BEGIN
  -- Add coins column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'coins'
  ) THEN
    ALTER TABLE users ADD COLUMN coins integer NOT NULL DEFAULT 0;
  END IF;

  -- Add fair_coins column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'fair_coins'
  ) THEN
    ALTER TABLE users ADD COLUMN fair_coins integer NOT NULL DEFAULT 0;
  END IF;

  -- Add daily_coin_earnings column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'daily_coin_earnings'
  ) THEN
    ALTER TABLE users ADD COLUMN daily_coin_earnings integer NOT NULL DEFAULT 0;
  END IF;

  -- Add last_login_date column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'last_login_date'
  ) THEN
    ALTER TABLE users ADD COLUMN last_login_date date;
  END IF;

  -- Add login_streak column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'login_streak'
  ) THEN
    ALTER TABLE users ADD COLUMN login_streak integer NOT NULL DEFAULT 0;
  END IF;

  -- Add last_fair_coin_awarded column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'last_fair_coin_awarded'
  ) THEN
    ALTER TABLE users ADD COLUMN last_fair_coin_awarded date;
  END IF;

  -- Add referral_code column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'referral_code'
  ) THEN
    ALTER TABLE users ADD COLUMN referral_code text UNIQUE;
  END IF;

  -- Add referred_by column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'referred_by'
  ) THEN
    ALTER TABLE users ADD COLUMN referred_by uuid REFERENCES users(id);
  END IF;
END $$;

-- Create coin_transactions table
CREATE TABLE IF NOT EXISTS coin_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    type text NOT NULL, -- 'login', 'game', 'comment', 'share', 'referral', 'fair_coin_redeem'
    amount integer NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now()
);

-- Create user_visits table for tracking daily logins
CREATE TABLE IF NOT EXISTS user_visits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    visit_date date NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (user_id, visit_date)
);

-- Create comments table for tracking user comments
CREATE TABLE IF NOT EXISTS comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    blog_id uuid REFERENCES blogs(id) ON DELETE CASCADE,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Create blog_shares table for tracking blog shares
CREATE TABLE IF NOT EXISTS blog_shares (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    blog_id uuid REFERENCES blogs(id) ON DELETE CASCADE,
    platform text NOT NULL, -- 'facebook', 'twitter', 'whatsapp', etc.
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (user_id, blog_id, platform) -- Prevent duplicate shares on same platform
);

-- Create game_plays table for tracking game plays
CREATE TABLE IF NOT EXISTS game_plays (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    game_id text NOT NULL, -- Game identifier
    score integer,
    duration integer, -- in seconds
    created_at timestamp with time zone DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_coin_transactions_user_id ON coin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_created_at ON coin_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_visits_user_date ON user_visits(user_id, visit_date);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_shares_user_id ON blog_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_game_plays_user_id ON game_plays(user_id);

-- Function to generate unique referral codes
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS text AS $$
DECLARE
    code text;
    exists boolean;
BEGIN
    LOOP
        -- Generate a 6-character alphanumeric code
        code := upper(substring(md5(random()::text) from 1 for 6));
        
        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM users WHERE referral_code = code) INTO exists;
        
        -- If code doesn't exist, return it
        IF NOT exists THEN
            RETURN code;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to reset daily coin earnings
CREATE OR REPLACE FUNCTION reset_daily_coin_earnings()
RETURNS void AS $$
BEGIN
    UPDATE users 
    SET daily_coin_earnings = 0 
    WHERE last_login_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Function to award fair coins for 7-day streaks
CREATE OR REPLACE FUNCTION award_fair_coins_for_streak()
RETURNS void AS $$
BEGIN
    UPDATE users 
    SET 
        fair_coins = fair_coins + 1,
        last_fair_coin_awarded = CURRENT_DATE
    WHERE 
        login_streak >= 7 
        AND (last_fair_coin_awarded IS NULL OR last_fair_coin_awarded < CURRENT_DATE - INTERVAL '7 days');
END;
$$ LANGUAGE plpgsql; 