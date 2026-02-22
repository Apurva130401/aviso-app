create table public.payments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  razorpay_order_id text not null,
  razorpay_payment_id text not null,
  amount numeric not null,
  status text not null default 'paid',
  credits_added integer not null,
  package_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- set up row level security (RLS) so users can only view their own payments
alter table public.payments enable row level security;

create policy "Users can view their own payments"
  on public.payments for select
  using ( auth.uid() = user_id );
