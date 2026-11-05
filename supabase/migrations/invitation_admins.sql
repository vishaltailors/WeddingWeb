-- Adds the project owner as an invitation administrator.
-- Replace the email below (or add more rows) to grant admin access.

insert into private.invitation_admins (email)
values ('vishaltailors22@gmail.com')
on conflict (email) do nothing;
