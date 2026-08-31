-- Defense in depth: even though the Express server already refuses to set
-- users.role to anything but 'user' or 'manager', nothing at the database
-- level enforced that. Since RLS is disabled (the Express server is the
-- only intended caller, using the anon key server-side only), a direct
-- write to Supabase — a leaked key, a dashboard mistake — could otherwise
-- set a guest account's role to 'admin', which the app's own auth
-- middleware would then trust the next time that guest's session refreshes.
-- This constraint makes that impossible regardless of how the row is written.

alter table users
  add constraint users_role_check check (role in ('user', 'manager'));
