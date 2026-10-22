// Gemeinsame Konstanten/Typen für die Dokumente (M6) – von Liste, Upload und
// Bearbeiten genutzt.

import type { SupabaseClient } from '@supabase/supabase-js';
import { safeFileName } from './storagePath';

import type { EventType } from './dates';

export type DocumentCategory =
	| 'protokoll_clubabend'
	| 'protokoll_mv'
	| 'satzung'
	| 'sonstige'
	| 'termin_unterlage';

export const categoryLabel: Record<DocumentCategory, string> = {
	protokoll_clubabend: 'Protokoll Club-Abend',
	protokoll_mv: 'Protokoll Mitgliederversammlung',
	satzung: 'Satzung',
	sonstige: 'Sonstige',
	termin_unterlage: 'Termin-Unterlage'
};

export const categoryOptions = (Object.keys(categoryLabel) as DocumentCategory[]).map((value) => ({
	value,
	label: categoryLabel[value]
}));

/**
 * Termin-Unterlagen (Speisekarte, Reiseplanung …) erscheinen nur am Termin, alle anderen
 * Kategorien immer in der Ablage – auch mit Termin-Verknüpfung (Protokolle).
 */
export const EVENT_ONLY_CATEGORY: DocumentCategory = 'termin_unterlage';

/**
 * PostgREST-Filter für die Ablage (`.or(...)`): alles außer Termin-Unterlagen. Eine
 * Termin-Unterlage ohne Termin (Termin gelöscht → event_id NULL) bleibt sichtbar, sonst
 * wäre sie nirgends mehr zu finden.
 */
export const ARCHIVE_FILTER = `category.neq.${EVENT_ONLY_CATEGORY},event_id.is.null`;

/** Steht das Dokument in der Ablage? (Spiegelt ARCHIVE_FILTER.) */
export const inArchive = (d: Pick<DocumentRow, 'category' | 'event_id'>): boolean =>
	d.category !== EVENT_ONLY_CATEGORY || d.event_id === null;

/** Kategorien für die Filter-Chips der Ablage (ohne Termin-Unterlage). */
export const archiveCategoryOptions = categoryOptions.filter(
	(o) => o.value !== EVENT_ONLY_CATEGORY
);

/** Termin-Typ, zu dem eine Protokoll-Kategorie gehört (für den Termin-Vorschlag). */
const protocolEventType: Partial<Record<DocumentCategory, EventType>> = {
	protokoll_clubabend: 'clubabend',
	protokoll_mv: 'versammlung'
};

export type SuggestableEvent = { id: string; starts_at: string; type: EventType };

const BERLIN_DATE = new Intl.DateTimeFormat('en-CA', {
	timeZone: 'Europe/Berlin',
	year: 'numeric',
	month: '2-digit',
	day: '2-digit'
});

/**
 * Schlägt zu einem Protokoll den passenden Termin vor: den letzten Termin des
 * passenden Typs am oder vor dem Protokolldatum (ohne Datum: vor jetzt). Kalendertag in
 * Europe/Berlin, damit ein Clubabend um 19 Uhr zum gleichen Datum zählt. Andere
 * Kategorien: kein Vorschlag (null).
 */
export function suggestEvent(
	events: SuggestableEvent[],
	category: DocumentCategory,
	docDate: string | null,
	now: Date = new Date()
): string | null {
	const type = protocolEventType[category];
	if (!type) return null;
	const limit = docDate || BERLIN_DATE.format(now);
	let best: SuggestableEvent | null = null;
	for (const ev of events) {
		if (ev.type !== type) continue;
		if (BERLIN_DATE.format(new Date(ev.starts_at)) > limit) continue;
		if (!best || Date.parse(ev.starts_at) > Date.parse(best.starts_at)) best = ev;
	}
	return best?.id ?? null;
}

/** Kategorien, bei denen „Mitglieder benachrichtigen“ sinnvoll vorbelegt ist. */
export const notifyByDefault: DocumentCategory[] = ['protokoll_clubabend', 'protokoll_mv'];

export const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20 MB
export const ACCEPTED_FILE_TYPES = '.pdf,.docx,.xlsx,.png,.jpg,.jpeg';

export type DocumentRow = {
	id: string;
	title: string;
	category: DocumentCategory;
	doc_date: string | null;
	description: string | null;
	event_id: string | null;
	file_path: string | null;
	file_name: string | null;
	created_at: string;
};

export type UploadDocumentOpts = {
	file: File;
	title: string;
	category: DocumentCategory;
	eventId?: string | null;
	docDate?: string | null;
	description?: string | null;
	memberId?: string | null;
};

/**
 * Legt einen Dokument-Datensatz an, lädt die Datei in den `documents`-Bucket
 * ("<id>/<bereinigter-name>"), trägt den Pfad nach und stößt die Volltext-
 * Extraktion best-effort an. Benachrichtigung NICHT enthalten – der Aufrufer
 * entscheidet (Termin-Anhänge benachrichtigen z. B. nie). Gibt die neue ID
 * oder eine Fehlermeldung zurück.
 */
export async function uploadDocument(
	supabase: SupabaseClient,
	opts: UploadDocumentOpts
): Promise<{ id: string } | { error: string }> {
	const { data: created, error: insErr } = await supabase
		.from('document')
		.insert({
			title: opts.title,
			category: opts.category,
			doc_date: opts.docDate || null,
			description: opts.description || null,
			event_id: opts.eventId || null,
			file_name: opts.file.name,
			mime_type: opts.file.type || null,
			size_bytes: opts.file.size,
			uploaded_by: opts.memberId ?? null
		})
		.select('id')
		.single();
	if (insErr || !created) {
		return { error: 'Anlegen fehlgeschlagen: ' + (insErr?.message ?? 'unbekannt') };
	}

	const path = `${created.id}/${safeFileName(opts.file.name)}`;
	const { error: upErr } = await supabase.storage
		.from('documents')
		.upload(path, opts.file, { contentType: opts.file.type || undefined, upsert: true });
	if (upErr) {
		// Verwaisten Datensatz wieder entfernen, damit keine Datei-lose Zeile bleibt.
		await supabase.from('document').delete().eq('id', created.id);
		return { error: 'Upload fehlgeschlagen: ' + upErr.message };
	}
	const { error: pathErr } = await supabase
		.from('document')
		.update({ file_path: path })
		.eq('id', created.id);
	if (pathErr) {
		// Ohne file_path wäre das Dokument nicht abrufbar: Datei und Zeile wieder entfernen.
		await supabase.storage.from('documents').remove([path]);
		await supabase.from('document').delete().eq('id', created.id);
		return { error: 'Speichern fehlgeschlagen: ' + pathErr.message };
	}

	// Volltext serverseitig extrahieren (best-effort, nicht fatal).
	supabase.functions.invoke('extract-document-text', { body: { id: created.id } }).catch(() => {});

	return { id: created.id };
}

/**
 * Öffnet ein Dokument über eine kurzlebige signierte URL in einem neuen Fenster.
 * Das Fenster wird SOFORT (noch im Klick) geöffnet und erst danach auf die URL gelenkt:
 * Ein `window.open` nach dem `await` blockiert iOS Safari (auch die installierte PWA) als
 * Popup, weil es nicht mehr zur Nutzergeste zählt.
 */
export async function openDocument(supabase: SupabaseClient, path: string): Promise<boolean> {
	const win = window.open('', '_blank');
	if (win) win.opener = null;
	const { data } = await supabase.storage.from('documents').createSignedUrl(path, 60);
	if (!data?.signedUrl) {
		win?.close();
		return false;
	}
	if (win) win.location.href = data.signedUrl;
	else window.location.href = data.signedUrl;
	return true;
}
