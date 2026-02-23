-- Enable inserts for authenticated users
create policy "Users can insert their own payments"
  on public.payments for insert
  with check ( auth.uid() = user_id );
