const envApiBase = import.meta.env.VITE_API_BASE as string | undefined;
const envAutoLogoutMinutes = import.meta.env.VITE_AUTO_LOGOUT_MINUTES as string | undefined;

function getDefaultApiBase() {
	return '/api';
}

export const API_BASE = (envApiBase && envApiBase.trim()) || getDefaultApiBase();

function getAutoLogoutMinutes() {
	if (!envAutoLogoutMinutes) {
		return 1800;
	}

	const parsed = Number(envAutoLogoutMinutes);
	if (!Number.isFinite(parsed) || parsed <= 0) {
		return 1800;
	}

	return parsed;
}

export const AUTO_LOGOUT_MS = getAutoLogoutMinutes() * 60 * 1000;
