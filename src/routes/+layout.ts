import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { lionsStartYear } from '$lib/dates';
import type { LayoutLoad } from './$types';

/**
 * Erstellt den Supabase-Client für Client- und Serverkontext.
 * `depends('supabase:auth')` erlaubt gezieltes Invalidieren bei Auth-Wechseln.
 */
export const load: LayoutLoad = async ({ data, depends, fetch }) => {
	depends('supabase:auth');

	const supabase = isBrowser()
		? createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
				global: { fetch }
			})
		: createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
				global: { fetch },
				cookies: { getAll: () => data.cookies }
			});

	const {
		data: { session }
	} = await supabase.auth.getSession();

	// User wurde bereits serverseitig in hooks.server.ts via getUser() gegen den
	// Auth-Server validiert und über +layout.server.ts als data.user durchgereicht.
	// Kein zweiter getUser()-Netzwerk-Roundtrip im Client (spart Latenz beim Start).
	const user = data.user;

	// Eigene Member-ID + Rechte (aus Ämtern) und ungelesene Benachrichtigungen
	// zentral bereitstellen — beide Queries hängen nicht voneinander ab und laufen
	// daher parallel (ein Roundtrip statt zwei).
	let memberId: string | null = null;
	let permissions: string[] = [];
	let unread = 0;
	if (user) {
		const [memberRes, unreadRes] = await Promise.all([
			supabase
				.from('member')
				.select('id, member_amt(amt(amt_permission(permission)))')
				.eq('user_id', user.id)
				.eq('member_amt.lions_year', lionsStartYear(new Date())) // nur Rechte des aktuellen LJ
				.maybeSingle(),
			supabase.from('notification').select('id', { count: 'exact', head: true }).is('read_at', null)
		]);

		const m = memberRes.data as {
			id: string;
			member_amt: { amt: { amt_permission: { permission: string }[] } | null }[];
		} | null;
		memberId = m?.id ?? null;
		const set = new Set<string>();
		for (const ma of m?.member_amt ?? []) {
			for (const p of ma.amt?.amt_permission ?? []) set.add(p.permission);
		}
		permissions = [...set];

		unread = unreadRes.count ?? 0;
	}

	return { supabase, session, user, memberId, permissions, unread };
};
