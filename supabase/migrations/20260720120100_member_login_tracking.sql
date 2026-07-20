-- Login-Tracking je Mitglied.
--
-- Warum eigene Spalten statt „bei Bedarf aus auth ableiten": `auth.sessions`
-- wird beim Ablauf/Abmelden geleert und `auth.users.last_sign_in_at` kennt nur
-- den LETZTEN Login. Wer sich noch nie angemeldet hat bzw. wann jemand zum
-- ersten Mal drin war, ist daraus dauerhaft nicht verlässlich zu beantworten.

alter table public.member
	add column if not exists first_login_at timestamptz,
	add column if not exists last_login_at timestamptz;

comment on column public.member.first_login_at is
	'Zeitpunkt des ersten Logins (per Trigger aus auth.users gepflegt). NULL = noch nie angemeldet.';
comment on column public.member.last_login_at is
	'Zeitpunkt des letzten Logins (per Trigger aus auth.users gepflegt).';

-- security definer: der Trigger hängt an auth.users, schreibt aber nach
-- public.member — ohne definer würde RLS die Zeile des Mitglieds blockieren.
create or replace function public.sync_member_login()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
	update public.member
	   set first_login_at = coalesce(first_login_at, new.last_sign_in_at),
	       last_login_at = new.last_sign_in_at
	 where user_id = new.id;
	return new;
end;
$$;

-- `of last_sign_in_at` + when-Klausel: andere Updates auf auth.users (z. B. der
-- E-Mail-Login-Sync in /api/mitglieder/[id]/email) dürfen hier nichts auslösen.
drop trigger if exists on_auth_user_login on auth.users;
create trigger on_auth_user_login
	after update of last_sign_in_at on auth.users
	for each row
	when (new.last_sign_in_at is distinct from old.last_sign_in_at)
	execute function public.sync_member_login();

-- Backfill für die bereits angemeldeten Konten.
-- last_login_at kommt aus auth.users; für first_login_at ist die früheste noch
-- vorhandene Session die beste verfügbare Näherung (ältere können bereits
-- abgelaufen sein) — ersatzweise der letzte Login.
update public.member m
   set last_login_at = u.last_sign_in_at,
       first_login_at = coalesce(m.first_login_at, s.first_session, u.last_sign_in_at)
  from auth.users u
  left join (
      select user_id, min(created_at) as first_session
        from auth.sessions
       group by user_id
  ) s on s.user_id = u.id
 where m.user_id = u.id
   and u.last_sign_in_at is not null;
