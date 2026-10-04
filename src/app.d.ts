// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { SupabaseClient, Session, User } from '@supabase/supabase-js';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			supabase: SupabaseClient;
			/** Validiert Session + User serverseitig (getUser), null wenn nicht eingeloggt. */
			safeGetSession: () => Promise<{ session: Session | null; user: User | null }>;
			session: Session | null;
			user: User | null;
		}
		interface PageData {
			session: Session | null;
			user: User | null;
		}
		// interface PageState {}
		// interface Platform {}
	}

	/** Vom Build gesetzt (`define` in vite.config.ts) – siehe src/lib/version.ts. */
	const __APP_VERSION__: string;
	const __APP_COMMIT__: string;
}

export {};
