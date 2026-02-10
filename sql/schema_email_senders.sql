-- Create a table to store approved sender email addresses
create table user_email_senders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  email_address text not null,
  is_verified boolean default false, -- For now we'll auto-verify on addition since it's personal
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Ensure unique email per user (or globally if we want strict mapping)
  -- Strict mapping is better: one sender email = one user account
  unique(email_address)
);

-- Enable RLS
alter table user_email_senders enable row level security;

-- Policies
create policy "Users can view their own senders"
  on user_email_senders for select
  using (auth.uid() = user_id);

create policy "Users can insert their own senders"
  on user_email_senders for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own senders"
  on user_email_senders for delete
  using (auth.uid() = user_id);
