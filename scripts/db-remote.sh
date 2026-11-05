#!/usr/bin/env bash
# Nativer psql gegen die Remote-Supabase-DB (Pooler) – ersetzt den frueheren
# docker-psql-Umweg (Host hat jetzt psql via Homebrew/libpq).
#
# DB-Passwort kommt aus .env.local (git-ignoriert, NIE committen). Den Projekt-Ref
# lesen wir aus .env (Produktions-URL) – .env.local zeigt PUBLIC_SUPABASE_URL i. d. R.
# auf den lokalen Stack (127.0.0.1) und taugt dafuer nicht.
# Region-Pooler ist eu-west-1 (Irland), siehe CLAUDE.md.
#
# Nutzung:
#   npm run db:remote                      # interaktive psql-Konsole gegen Remote
#   npm run db:remote -- -c "select now()" # Einzelbefehl
#   npm run db:remote -- -f migration.sql  # SQL-Datei einspielen
#
#   npm run db:remote:read -- -c "select …" # dasselbe, aber NUR LESEND: die Sitzung
#                                          # startet read-only (scripts/psqlrc-readonly),
#                                          # Schreibversuche brechen ab. Für Diagnose-
#                                          # Abfragen gedacht.
set -euo pipefail
cd "$(dirname "$0")/.."

# libpq ist keg-only; falls die Login-Shell-PATH-Zeile nicht greift (z. B. npm aus
# einer GUI-/Nicht-Login-Shell), psql trotzdem auffindbar machen.
[ -d /opt/homebrew/opt/libpq/bin ] && PATH="/opt/homebrew/opt/libpq/bin:$PATH"

[ -f .env.local ] || { echo "Fehler: .env.local nicht gefunden (DB-Passwort fehlt)." >&2; exit 1; }
[ -f .env ] || { echo "Fehler: .env nicht gefunden (Produktions-URL fehlt)." >&2; exit 1; }

PGPASSWORD=$(grep -E '^SUPABASE_DB_PASSWORD=' .env.local | cut -d= -f2- | tr -d '"'"'"'')
REF=$(grep -E '^PUBLIC_SUPABASE_URL=' .env | sed -E 's#.*://([^.]+)\..*#\1#')

[ -n "$PGPASSWORD" ] || { echo "Fehler: SUPABASE_DB_PASSWORD fehlt in .env.local." >&2; exit 1; }
[ -n "$REF" ] || { echo "Fehler: PUBLIC_SUPABASE_URL fehlt/ungueltig in .env." >&2; exit 1; }

export PGPASSWORD

# Nur-Lesen-Modus: eigene Startdatei statt ~/.psqlrc (greift interaktiv, bei -c und -f).
if [ "${DB_REMOTE_READONLY:-}" = "1" ]; then
  export PSQLRC="$PWD/scripts/psqlrc-readonly"
fi

exec psql \
  "host=aws-0-eu-west-1.pooler.supabase.com port=5432 user=postgres.$REF dbname=postgres sslmode=require" \
  "$@"
