import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { EventType } from '$lib/dates';

export type EditEvent = {
	id: string;
	title: string;
	type: EventType;
	speaker: string | null;
	location: string | null;
	starts_at: string;
	ends_at: string | null;
	description: string | null;
	reminder_days_before: number;
};

export const load: PageLoad = async ({ parent, params }) => {
	const { supabase } = await parent();
	const [evRes, attRes, compRes] = await Promise.all([
		supabase
			.from('event')
			.select(
				'id, title, type, speaker, location, starts_at, ends_at, description, reminder_days_before'
			)
			.eq('id', params.id)
			.maybeSingle(),
		// Anzahl erfasster Anwesenheiten (nur die Zahl – attendance selbst ist Spendengrundlage).
		supabase.rpc('event_attendance_count', { p_event: params.id }),
		supabase
			.from('companion')
			.select('id, event_response!inner(event_id)', { count: 'exact', head: true })
			.eq('event_response.event_id', params.id)
	]);
	if (!evRes.data) throw error(404, 'Termin nicht gefunden');
	return {
		event: evRes.data as EditEvent,
		attendanceCount: (attRes.data as number | null) ?? 0,
		companionCount: compRes.count ?? 0
	};
};
