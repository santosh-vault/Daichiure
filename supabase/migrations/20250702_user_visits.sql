-- Create user_visits table to log daily visits
CREATE TABLE user_visits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    visit_date date NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (user_id, visit_date)
); 