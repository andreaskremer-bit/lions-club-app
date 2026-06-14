-- M1 — Helper-Funktionen für RLS + auth.users↔member-Verknüpfung.
-- Alle Helper sind SECURITY DEFINER mit fixem search_path: so umgehen sie RLS
-- bei der eigenen Auswertung (keine Rekursion in den member-Policies).

-- member-id des aktuell eingeloggten Users (oder NULL)
create or replace function public.current_member_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.member where user_id = auth.uid();
$$;

-- Hat der eingeloggte User ein Amt mit dem gegebenen Recht?
create or replace function public.has_permission(perm public.app_permission)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.member m
    join public.member_amt ma on ma.member_id = m.id
    join public.amt_permission ap on ap.amt_id = ma.amt_id
    where m.user_id = auth.uid()
      and ap.permission = perm
  );
$$;

revoke all on function public.current_member_id() from public;
revoke all on function public.has_permission(public.app_permission) from public;
grant execute on function public.current_member_id() to authenticated;
grant execute on function public.has_permission(public.app_permission) to authenticated;

-- Beim Anlegen eines auth.users die passende (noch unverknüpfte) member-Zeile
-- per E-Mail verbinden. Kein Self-Signup: ohne passende member-Zeile passiert nichts.
create or replace function public.link_member_to_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.member
     set user_id = new.id
   where user_id is null
     and lower(email) = lower(new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.link_member_to_auth_user();
