/*
  # Stripe Integration Schema

  1. New Tables
    - `stripe_customers`: Links Supabase users to Stripe customers
      - Includes `user_id` (references `auth.users`)
      - Stores Stripe `customer_id`
      - Implements soft delete

    - `stripe_subscriptions`: Manages subscription data
      - Tracks subscription status, periods, and payment details
      - Links to `stripe_customers` via `customer_id`
      - Custom enum type for subscription status
      - Implements soft delete

    - `stripe_orders`: Stores order/purchase information
      - Records checkout sessions and payment intents
      - Tracks payment amounts and status
      - Custom enum type for order status
      - Implements soft delete

  2. Views
    - `stripe_user_subscriptions`: Secure view for user subscription data
      - Joins customers and subscriptions
      - Filtered by authenticated user

    - `stripe_user_orders`: Secure view for user order history
      - Joins customers and orders
      - Filtered by authenticated user

  3. Security
    - Enables Row Level Security (RLS) on all tables
    - Implements policies for authenticated users to view their own data
*/

CREATE TABLE IF NOT EXISTS stripe_customers (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users(id) not null unique,
  customer_id text not null unique,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  deleted_at timestamp with time zone default null
);

ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own customer data"
    ON stripe_customers
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() AND deleted_at IS NULL);

CREATE TYPE stripe_subscription_status AS ENUM (
    'not_started',
    'incomplete',
    'incomplete_expired',
    'trialing',
    'active',
    'past_due',
    'canceled',
    'unpaid',
    'paused'
);

CREATE TABLE IF NOT EXISTS stripe_subscriptions (
  id bigint primary key generated always as identity,
  customer_id text unique not null,
  subscription_id text default null,
  price_id text default null,
  current_period_start bigint default null,
  current_period_end bigint default null,
  cancel_at_period_end boolean default false,
  payment_method_brand text default null,
  payment_method_last4 text default null,
  status stripe_subscription_status not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  deleted_at timestamp with time zone default null
);

ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription data"
    ON stripe_subscriptions
    FOR SELECT
    TO authenticated
    USING (
        customer_id IN (
            SELECT customer_id
            FROM stripe_customers
            WHERE user_id = auth.uid() AND deleted_at IS NULL
        )
        AND deleted_at IS NULL
    );

CREATE TYPE stripe_order_status AS ENUM (
    'pending',
    'completed',
    'canceled'
);

CREATE TABLE IF NOT EXISTS stripe_orders (
    id bigint primary key generated always as identity,
    checkout_session_id text not null,
    payment_intent_id text not null,
    customer_id text not null,
    amount_subtotal bigint not null,
    amount_total bigint not null,
    currency text not null,
    payment_status text not null,
    status stripe_order_status not null default 'pending',
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    deleted_at timestamp with time zone default null
);

ALTER TABLE stripe_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own order data"
    ON stripe_orders
    FOR SELECT
    TO authenticated
    USING (
        customer_id IN (
            SELECT customer_id
            FROM stripe_customers
            WHERE user_id = auth.uid() AND deleted_at IS NULL
        )
        AND deleted_at IS NULL
    );

-- View for user subscriptions
CREATE VIEW stripe_user_subscriptions WITH (security_invoker = true) AS
SELECT
    c.customer_id,
    s.subscription_id,
    s.status as subscription_status,
    s.price_id,
    s.current_period_start,
    s.current_period_end,
    s.cancel_at_period_end,
    s.payment_method_brand,
    s.payment_method_last4
FROM stripe_customers c
LEFT JOIN stripe_subscriptions s ON c.customer_id = s.customer_id
WHERE c.user_id = auth.uid()
AND c.deleted_at IS NULL
AND s.deleted_at IS NULL;

GRANT SELECT ON stripe_user_subscriptions TO authenticated;

-- View for user orders
CREATE VIEW stripe_user_orders WITH (security_invoker) AS
SELECT
    c.customer_id,
    o.id as order_id,
    o.checkout_session_id,
    o.payment_intent_id,
    o.amount_subtotal,
    o.amount_total,
    o.currency,
    o.payment_status,
    o.status as order_status,
    o.created_at as order_date
FROM stripe_customers c
LEFT JOIN stripe_orders o ON c.customer_id = o.customer_id
WHERE c.user_id = auth.uid()
AND c.deleted_at IS NULL
AND o.deleted_at IS NULL;

-- Add React games to the database
INSERT INTO games (title, slug, description, thumbnail_url, category_id, is_premium, price, game_data) VALUES
  (
    'Snake Classic',
    'snake',
    'The classic snake game where you eat food and grow longer while avoiding walls and your own tail.',
    'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg',
    (SELECT id FROM categories WHERE slug = 'arcade'),
    false,
    NULL,
    'snake'
  ),
  (
    'Pong Retro',
    'pong',
    'Classic Pong game. Use W/S keys or Up/Down arrows to control your paddle.',
    'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg',
    (SELECT id FROM categories WHERE slug = 'arcade'),
    false,
    NULL,
    'pong'
  ),
  (
    'Tetris Classic',
    'tetris',
    'The legendary puzzle game. Arrange falling blocks to clear lines and score points.',
    'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg',
    (SELECT id FROM categories WHERE slug = 'puzzle'),
    false,
    NULL,
    'tetris'
  ),
  (
    'Breakout Arcade',
    'breakout',
    'Smash through colorful blocks with your paddle and ball. Don\'t let the ball fall!',
    'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg',
    (SELECT id FROM categories WHERE slug = 'arcade'),
    false,
    NULL,
    'breakout'
  ),
  (
    'Memory Match',
    'memory',
    'Test your memory by matching pairs of cards. Find all matches to win!',
    'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg',
    (SELECT id FROM categories WHERE slug = 'puzzle'),
    false,
    NULL,
    'memory'
  ),
  (
    'Pixel Adventure',
    'rpg',
    'A simple RPG adventure game. Explore the world, collect items, and battle monsters.',
    'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg',
    (SELECT id FROM categories WHERE slug = 'action'),
    true,
    4.99,
    'rpg'
  ),
  (
    'Everest Climb',
    'everest',
    'Climb Mount Everest! Navigate through treacherous terrain, manage oxygen levels, and reach the summit.',
    'https://images.pexels.com/photos/1367192/pexels-photo-1367192.jpeg',
    (SELECT id FROM categories WHERE slug = 'adventure'),
    true,
    7.99,
    'everest'
  ),
  (
    'Kathmandu Maze',
    'kathmandu',
    'Navigate through the ancient streets of Kathmandu. Find hidden temples and avoid obstacles.',
    'https://images.pexels.com/photos/1367192/pexels-photo-1367192.jpeg',
    (SELECT id FROM categories WHERE slug = 'puzzle'),
    true,
    5.99,
    'kathmandu'
  ),
  (
    'Nepali Temple Puzzle',
    'temple',
    'Solve ancient puzzles in beautiful Nepali temples. Match patterns, unlock secrets, and discover hidden treasures.',
    'https://images.pexels.com/photos/1367192/pexels-photo-1367192.jpeg',
    (SELECT id FROM categories WHERE slug = 'puzzle'),
    true,
    6.99,
    'temple'
  )
ON CONFLICT (slug) DO NOTHING;