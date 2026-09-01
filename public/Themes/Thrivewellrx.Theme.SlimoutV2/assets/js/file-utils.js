// Shared file-picker helpers used by dropzone.js and file-slot.js, and by any page script that
// needs to format a byte count the same way.

export function formatFileSize(bytes) {
	if (bytes > 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB';
	return Math.max(1, Math.round((bytes || 0) / 1024)) + ' KB';
}

/** Filters a FileList/File[] down to the files that pass both the extension and size checks. */
export function validateFiles(list, { accept, maxMB }) {
	if (!list) return [];
	return Array.from(list).filter((file) => accept.test(file.name) && file.size <= maxMB * 1024 * 1024);
}
