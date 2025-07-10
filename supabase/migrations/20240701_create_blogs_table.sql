create table blogs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  content text not null,
  category text,
  image_url text,
  created_at timestamp with time zone default now(),
  author_id uuid references users(id) on delete set null
); 