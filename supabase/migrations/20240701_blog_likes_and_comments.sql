-- Migration for blog_likes table
create table if not exists blog_likes (
  id uuid primary key default uuid_generate_v4(),
  blog_id uuid references blogs(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique (blog_id, user_id)
);

-- Migration for comments table
create table if not exists comments (
  id uuid primary key default uuid_generate_v4(),
  blog_id uuid references blogs(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
); 