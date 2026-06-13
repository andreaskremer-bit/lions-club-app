import { createServerClient } from '@supabase/ssr';
import { type Handle, redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';

/**
 * Legt pro Request einen Supabase-Server-Client an (Session über Cookies)
 * und stellt `locals.supabase` + `locals.safeGetSession` bereit.
 */
const supabase: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookiesToSet) => {
				cookiesToSet.forEach(({ name, value, options }) => {
					event.cookies.set(name, value, { ...options, path: '/' });
				});
			}
		}
	});

	/**
	 * Session zuerst aus dem Cookie lesen, danach mit getUser() serverseitig
	 * gegen den Auth-Server validieren (getSession allein ist nicht vertrauenswürdig).
	 */
	event.locals.safeGetSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		if (!session) return { session: null, user: null };

		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();
		if (error) return { session: null, user: null };

		return { session, user };
	};

	return resolve(event, {
		filterSerializedResponseHeaders: (name) =>
			name === 'content-range' || name === 'x-supabase-api-version'
	});
};

/** Schützt die App: nicht eingeloggte Nutzer landen auf /login. */
const authGuard: Handle = async ({ event, resolve }) => {
	const { session, user } = await event.locals.safeGetSession();
	event.locals.session = session;
	event.locals.user = user;

	const onAuthRoute = event.url.pathname.startsWith('/login');

	if (!session && !onAuthRoute) {
		redirect(303, '/login');
	}
	if (session && onAuthRoute) {
		redirect(303, '/');
	}

	return resolve(event);
};

export const handle: Handle = sequence(supabase, authGuard);
