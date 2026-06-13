import type { LayoutServerLoad } from './$types';

/** Reicht Session + Cookies an den universellen Layout-Load weiter. */
export const load: LayoutServerLoad = async ({ locals: { session, user }, cookies }) => {
	return {
		session,
		user,
		cookies: cookies.getAll()
	};
};
