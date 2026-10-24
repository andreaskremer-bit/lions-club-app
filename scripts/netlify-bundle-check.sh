#!/usr/bin/env bash
# Netlify-Nachbau nach Abhängigkeits-Änderungen (Regel „Abhängigkeiten – Pflicht-Prüfung“
# in CLAUDE.md). Ein grüner `npm run build` beweist nichts: Geprüft wird das, was
# Netlify wirklich ausliefert – frischer Klon, Node 24 wie in netlify.toml, `npm ci`,
# `netlify build --offline`, dann die GEBÜNDELTE Function (sveltekit-render.zip,
# entpackt, mit ihren eigenen node_modules) direkt mit Requests aufrufen.
#
# Nutzung (immer beide Läufe, dann vergleichen):
#   scripts/netlify-bundle-check.sh <ordner> alt   # HEAD wie committet
#   scripts/netlify-bundle-check.sh <ordner> neu   # HEAD + package.json/-lock.json aus dem Arbeitsstand
#   node scripts/netlify-bundle-invoke.mjs --vergleich <ordner>/alt.json <ordner>/neu.json
#
# Mit LOKAL=1 wird gegen den lokalen Supabase-Stack gebaut (`npm run db:start`) und
# zusätzlich mit einer echten Sitzung von admin@example.com (Seed) aufgerufen – so
# rendern auch die geschützten Seiten. Ohne LOKAL nur Login-Seite und Weiterleitungen.
# <ordner> außerhalb des Repos wählen (z. B. im Scratchpad), sonst landet der Klon im Repo.
set -euo pipefail
REPO="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$(mkdir -p "$1" && cd "$1" && pwd)"
STAND="$2"
[[ "$STAND" == alt || "$STAND" == neu ]] || { echo "Stand muss alt oder neu sein" >&2; exit 1; }
case "$OUT/" in "$REPO"/*) echo "Ordner liegt im Repo – bitte außerhalb wählen" >&2; exit 1 ;; esac

NODE24="$(npx -y node@24 -p process.execPath)"
export PATH="$(dirname "$NODE24"):$PATH"
echo "Node $(node -v)"

rm -rf "$OUT/$STAND" "$OUT/$STAND-fn"
git clone -q "$REPO" "$OUT/$STAND"
if [[ "$STAND" == neu ]]; then cp "$REPO/package.json" "$REPO/package-lock.json" "$OUT/$STAND/"; fi

if [[ "${LOKAL:-}" == 1 ]]; then
	eval "$(cd "$REPO" && SUPABASE_ACCESS_TOKEN=local-dev npx supabase status -o env 2>/dev/null | grep -E '^(API_URL|ANON_KEY|SERVICE_ROLE_KEY)=')"
	printf 'PUBLIC_SUPABASE_URL=%s\nPUBLIC_SUPABASE_ANON_KEY=%s\nPUBLIC_VAPID_KEY=x\nGALLERY_URL=https://example.invalid/galerie\n' \
		"$API_URL" "$ANON_KEY" > "$OUT/$STAND/.env"
else
	cp "$REPO/.env" "$OUT/$STAND/.env"
fi

cd "$OUT/$STAND"
npm ci --no-audit --no-fund > "$OUT/$STAND-ci.log" 2>&1
npx -y netlify-cli@latest build --offline > "$OUT/$STAND-build.log" 2>&1 || { tail -30 "$OUT/$STAND-build.log"; exit 1; }
mkdir "$OUT/$STAND-fn"
(cd "$OUT/$STAND-fn" && unzip -q "$OUT/$STAND/.netlify/functions/sveltekit-render.zip")
echo "Function-Abhängigkeiten im Bundle: $(ls "$OUT/$STAND-fn/node_modules" | tr '\n' ' ')"

COOKIE=""
if [[ "${LOKAL:-}" == 1 ]]; then
	COOKIE="$OUT/cookie.txt"
	API_URL="$API_URL" ANON_KEY="$ANON_KEY" SERVICE_ROLE_KEY="$SERVICE_ROLE_KEY" \
		node "$REPO/scripts/netlify-bundle-invoke.mjs" --sitzung "$REPO" admin@example.com "$COOKIE"
fi
node "$REPO/scripts/netlify-bundle-invoke.mjs" "$OUT/$STAND-fn" "$OUT/$STAND.json" $COOKIE
