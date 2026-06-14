import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
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

	const {
		data: { user }
	} = await supabase.auth.getUser();

	// Eigene Member-ID + Rechte (aus Ämtern) zentral bereitstellen — für rechte-
	// abhängige UI (z. B. Anwesenheit erfassen, Schatzmeister-Auswertung).
	let memberId: string | null = null;
	let permissions: string[] = [];
	if (user) {
		const { data } = await supabase
			.from('member')
			.select('id, member_amt(amt(amt_permission(permission)))')
			.eq('user_id', user.id)
			.maybeSingle();
		const m = data as {
			id: string;
			member_amt: { amt: { amt_permission: { permission: string }[] } | null }[];
		} | null;
		memberId = m?.id ?? null;
		const set = new Set<string>();
		for (const ma of m?.member_amt ?? []) {
			for (const p of ma.amt?.amt_permission ?? []) set.add(p.permission);
		}
		permissions = [...set];
	}

	return { supabase, session, user, memberId, permissions };
};
