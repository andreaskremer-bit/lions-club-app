// Gemeinsame Konstanten/Typen für die Dokumente (M6) — von Liste, Upload und
// Bearbeiten genutzt.

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

/** Kategorien, bei denen „Mitglieder benachrichtigen" sinnvoll vorbelegt ist. */
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
