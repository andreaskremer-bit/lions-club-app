-- Teilnehmerliste als eigenes Recht (view_participants), Spec §3.
--
-- Bisher hing die Teilnehmerliste eines Termins (Zusagen + Begleitpersonen +
-- Antworten auf Zusatzfragen, inkl. CSV-Export) ausschließlich an
-- manage_events. Das Recht hat der Sekretär nicht — laut Spec §3 stehen ihm
-- „Teilnehmer-/Anwesenheitslisten" aber zu (z. B. für die Übernahme ins
-- Protokoll); die Anwesenheit erfasst er ohnehin bereits. Statt manage_events
-- aufzuweichen bekommt die Liste ein eigenes Recht.
--
-- Bekommen es: alle bisherigen manage_events-Ämter (Präsident, Vize,
-- Clubmaster, Webmaster) plus Sekretär. Der Webmaster hat per Definition
-- alle Rechte (Migration 20260621120700), muss hier aber explizit nachgezogen
-- werden, weil der damalige enum_range-Cross-Join den neuen Wert nicht kennt.

insert into public.amt_permission (amt_id, permission)
select a.id, 'view_participants'::public.app_permission
from public.amt a
where a.key in ('praesident', 'vize', 'sekretaer', 'clubmaster', 'webmaster')
on conflict (amt_id, permission) do nothing;

-- answer: eigene Antworten + view_participants (Teilnehmerliste/Export) lesen.
-- manage_events entfällt hier bewusst — alle manage_events-Ämter tragen jetzt
-- view_participants; ein Recht = eine Quelle für UI-Gate, Load-Guard und RLS.
alter policy answer_select on public.answer
  using (member_id = public.current_member_id()
         or public.has_permission('view_participants'));
