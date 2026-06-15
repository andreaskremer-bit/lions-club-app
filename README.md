# PWA for Lions Club Bonn-Rheinaue – open source club app

[![Deployed on Netlify](https://img.shields.io/badge/deployed%20on-Netlify-00C7B7?logo=netlify)](https://www.netlify.com)

A mobile-first **Progressive Web App** for managing the activities of the Lions Club
Bonn-Rheinaue (≈ 34 members, ~90 % mobile usage). It replaces a commercial club app
with a privacy-respecting, self-owned solution. The user interface is in German; it is
an internal members-only tool (no public sign-up).

## Features

- **Members** – directory, self-service profile/partner data, admin (create, invite,
  roles, photo upload)
- **Events** – list & calendar, RSVP with companions, attendance, yearly/series planning
- **Surveys** – flexible per-event questions, participant export (CSV)
- **Documents** – central archive with German full-text search (server-side text
  extraction from PDF/Word)
- **News** – club news feed
- **Notifications** – reminder engine with in-app, Web Push and e-mail-fallback delivery
- Birthdays, treasurer evaluation (CSV)

## Stack

- [SvelteKit](https://svelte.dev/) + TypeScript, Svelte 5 Runes
- [Supabase](https://supabase.com/) (EU/Ireland) – Postgres, Auth (e-mail OTP), Row Level
  Security, Storage, Edge Functions
- PWA via [`@vite-pwa/sveltekit`](https://vite-pwa-org.netlify.app/)
- Hosting on [Netlify](https://www.netlify.com/) (`adapter-netlify`)

Configuration (adapter, PWA, Vitest) lives in `vite.config.ts` — there is intentionally
no `svelte.config.js`.

### Privacy by design

Data is stored in the Supabase EU region; RLS is the technical access control. Fonts are
self-hosted (no Google Fonts CDN); no personal data in URLs.

## Local development

Prerequisites: Node, npm, and Docker (for the local Supabase stack).

```sh
npm install
cp .env.example .env        # fill in PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY
npm run db:start            # start the local Supabase stack (Docker)
npm run db:reset            # apply migrations + seed
npm run dev                 # http://localhost:5173
```

Local login codes are delivered to **Mailpit** at `http://127.0.0.1:54324`.

## Useful commands

| Command                                              | Purpose                                 |
| ---------------------------------------------------- | --------------------------------------- |
| `npm run dev` / `build` / `preview`                  | dev server / production build / preview |
| `npm run check` / `lint` / `format`                  | type-check / lint / format              |
| `npm run db:start \| db:stop \| db:reset \| db:test` | local Supabase stack & pgTAP RLS tests  |
| `npm run test:unit` / `test:e2e`                     | Vitest unit tests / Playwright e2e      |

## Deployment

Pushed to `main` → Netlify builds and deploys automatically. Database migrations are
applied to the remote Supabase project with `supabase db push`.

## Contributing

Please read the [Code of Conduct](CODE_OF_CONDUCT.md) before participating.

## License

[MIT](LICENSE) © 2026 Andreas Kremer / Lions Club Bonn-Rheinaue
