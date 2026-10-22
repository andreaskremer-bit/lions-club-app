// Ungelesene Benachrichtigungen: Zähler auffrischen, per Link-Fragment als gelesen markieren.

import type { SupabaseClient } from '@supabase/supabase-js';
import { unread } from './unread.svelte';

export { unread };

export async function refreshUnread(supabase: SupabaseClient): Promise<void> {
	const { count, error } = await supabase
		.from('notification')
		.select('id', { count: 'exact', head: true })
		.is('read_at', null);
	if (!error) unread.count = count ?? 0;
}

/** Outbox-ID aus dem Link-Fragment `#n=<uuid>` (Push/E-Mail, siehe linkFor()). */
export function notificationIdFromHash(hash: string): string | null {
	const m = /^#n=([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i.exec(hash);
	return m ? m[1] : null;
}

export async function markRead(supabase: SupabaseClient, id: string): Promise<void> {
	await supabase
		.from('notification')
		.update({ read_at: new Date().toISOString() })
		.eq('id', id)
		.is('read_at', null);
}
