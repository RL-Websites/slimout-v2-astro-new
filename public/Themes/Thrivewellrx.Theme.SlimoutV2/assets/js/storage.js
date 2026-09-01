// Shared localStorage helpers — every read/write is wrapped once here instead of a per-call-site
// try/catch, since localStorage can throw (privacy mode, storage disabled).

export function readJSON(key, fallback) {
	try {
		const raw = window.localStorage.getItem(key);
		if (raw === null) return fallback;
		return JSON.parse(raw);
	} catch (e) {
		return fallback;
	}
}

export function writeJSON(key, value) {
	try {
		window.localStorage.setItem(key, JSON.stringify(value));
	} catch (e) {
		// storage unavailable — ignore
	}
}

export function readString(key) {
	try {
		return window.localStorage.getItem(key);
	} catch (e) {
		return null;
	}
}

export function writeString(key, value) {
	try {
		window.localStorage.setItem(key, value);
	} catch (e) {
		// storage unavailable — ignore
	}
}

export function remove(key) {
	try {
		window.localStorage.removeItem(key);
	} catch (e) {
		// storage unavailable — ignore
	}
}
