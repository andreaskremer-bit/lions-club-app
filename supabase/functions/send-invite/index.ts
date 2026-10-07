// Edge Function `send-invite` – verschickt die Einladungs-Mail an ein Mitglied, für das
// ein Login-Konto existiert, und vermerkt den Versand in `member.invite_sent_at`.
//
// Warum eine eigene Function: Das Anlegen des Kontos (`auth.admin.createUser` in
// `/api/mitglieder/[id]/einladen`) verschickt KEINE Mail. Der Club-SMTP lebt nur hier
// in den Supabase-Secrets, nicht in Netlify.
//
// Bewusst NICHT an REMINDERS_ARMED/notifications_enabled gebunden: Die Einladung ist
// eine ausdrückliche Einzelaktion eines Amtsträgers, kein automatischer Versand.
//
// Aufrufschutz: verify_jwt = false (config.toml) -> Bearer-Token muss der
// Service-Role-Key sein. Aufrufer ist nur die Server-Route (nach Rechteprüfung).

import { createClient } from 'npm:@supabase/supabase-js@2';
import { Mailer } from '../_shared/mailer.ts';
import { renderInviteEmail } from '../send-notifications/email.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

function reply(status: number, body: Record<string, unknown>) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json' }
	});
}

Deno.serve(async (req) => {
	const auth = req.headers.get('Authorization') ?? '';
	if (auth !== `Bearer ${SERVICE_ROLE}`) return new Response('Unauthorized', { status: 401 });

	const { member_id } = (await req.json().catch(() => ({}))) as { member_id?: string };
	if (!member_id) return reply(400, { error: 'member_id fehlt' });

	const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
	const { data: member, error } = await supabase
		.from('member')
		.select('first_name, email, user_id')
		.eq('id', member_id)
		.maybeSingle();
	if (error) return reply(500, { error: `DB-Fehler: ${error.message}` });
	if (!member) return reply(404, { error: 'Mitglied nicht gefunden' });
	// Ohne Konto liefe der Code-Login ins Leere (Self-Signup ist aus).
	if (!member.user_id) return reply(409, { error: 'Mitglied hat noch kein Login-Konto' });

	const mailer = new Mailer();
	if (!mailer.configured) return reply(500, { error: 'SMTP nicht konfiguriert' });

	try {
		const mail = renderInviteEmail({ firstName: member.first_name, email: member.email });
		await mailer.send(member.email, mail.subject, mail.text, mail.html);
	} catch (e) {
		console.error(`Einladung an ${member.email} fehlgeschlagen:`, e);
		return reply(502, { error: 'E-Mail-Versand fehlgeschlagen' });
	} finally {
		await mailer.close();
	}

	const sentAt = new Date().toISOString();
	const { error: updErr } = await supabase
		.from('member')
		.update({ invite_sent_at: sentAt })
		.eq('id', member_id);
	// Die Mail ist raus – ein Fehler beim Vermerk darf das nicht als Fehlschlag melden.
	if (updErr) console.error('invite_sent_at nicht gespeichert:', updErr.message);

	return reply(200, { status: 'gesendet', invite_sent_at: sentAt });
});
