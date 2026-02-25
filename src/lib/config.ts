const envApiBase = import.meta.env.VITE_API_BASE as string | undefined;

function getDefaultApiBase() {
	return '/api';
}

export const API_BASE = (envApiBase && envApiBase.trim()) || getDefaultApiBase();
