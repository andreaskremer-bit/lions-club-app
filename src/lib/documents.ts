// Gemeinsame Konstanten/Typen für die Dokumente (M6) – von Liste, Upload und
// Bearbeiten genutzt.

import type { SupabaseClient } from '@supabase/supabase-js';
import { safeFileName } from './storagePath';

export type DocumentCategory = 'protokoll_clubabend' | 'protokoll_mv' | 'satzung' | 'sonstige';

export const categoryLabel: Record<DocumentCategory, string> = {
	protokoll_clubabend: 'Protokoll Club-Abend',
	protokoll_mv: 'Protokoll Mitgliederversammlung',
	satzung: 'Satzung',
	sonstige: 'Sonstige'
};

export const categoryOptions = (Object.keys(categoryLabel) as DocumentCategory[]).map((value) => ({
	value,
	label: categoryLabel[value]
}));

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
