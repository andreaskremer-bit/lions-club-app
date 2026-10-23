-- Neue Enum-Werte getrennt von ihrer Verwendung (20261023120400): Ein mit ADD VALUE
-- angelegter Wert ist erst nach dem Commit nutzbar.
--
-- amt_cluster 'foerderverein': Vorstand des Lions-Förderverein Bonn-Rheinaue e.V.
-- (eigener Verein, Ämter nur zur Anzeige).
-- notification_kind 'board_missing': Juni-Hinweis an Sekretär/Webmaster, wenn der
-- Vorstand für das kommende Lions-Jahr noch fehlt.
alter type public.amt_cluster add value if not exists 'foerderverein';
alter type public.notification_kind add value if not exists 'board_missing';
