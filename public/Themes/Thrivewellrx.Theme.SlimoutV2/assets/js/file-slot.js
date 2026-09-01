// Single named file slot (one file, replace-on-reupload) for any [data-file-slot] on the page —
// see the FileSlot component. Same spirit as dropzone.js's registry, but for a single slot rather
// than a growing list: registerFileSlot/getFileSlot/setFileSlot let a page script read or restore
// a slot's file by its `id`.
import { formatFileSize, validateFiles } from './file-utils.js';

const controllers = new Map();

export function registerFileSlot(id, controller) {
	controllers.set(id, controller);
}

export function setFileSlot(id, file) {
	controllers.get(id)?.setFile(file);
}

export function getFileSlot(id) {
	return controllers.get(id)?.getFile() ?? null;
}

function initFileSlot(root) {
	if (root.dataset.slotInit === '1') return;
	root.dataset.slotInit = '1';

	const id = root.dataset.fileSlot || '';
	const acceptPattern = new RegExp('\\.(' + (root.dataset.acceptPattern || '') + ')$', 'i');
	const maxMB = Number(root.dataset.maxMb || '50');
	const requiredLabel = root.dataset.requiredLabel || 'Required';
	const uploadedLabel = root.dataset.uploadedLabel || 'Uploaded';

	const emptyEl = root.querySelector('[data-empty]');
	const filledEl = root.querySelector('[data-filled]');
	const stateEl = root.querySelector('[data-state]');
	const previewImageEl = root.querySelector('[data-preview-image]');
	const previewDocEl = root.querySelector('[data-preview-doc]');
	const previewExtEl = root.querySelector('[data-preview-ext]');
	const nameEl = root.querySelector('[data-name]');
	const sizeEl = root.querySelector('[data-size]');
	const fileInput = root.querySelector('[data-file-input]');
	const reuploadBtn = root.querySelector('[data-reupload-btn]');
	const reuploadOverlay = root.querySelector('[data-reupload-overlay]');
	const deleteBtn = root.querySelector('[data-delete-btn]');

	let current = null;

	function emitChange() {
		root.dispatchEvent(new CustomEvent('file-change', { detail: { file: toMeta() } }));
	}

	function toMeta() {
		if (!current) return null;
		const { name, bytes, url, isImage, ext } = current;
		return { name, bytes, url, isImage, ext };
	}

	function render() {
		const has = !!current;
		emptyEl?.classList.toggle('is-hidden', has);
		filledEl?.classList.toggle('is-hidden', !has);
		if (stateEl) {
			stateEl.textContent = has ? uploadedLabel : requiredLabel;
			stateEl.classList.toggle('file-slot-state--done', has);
		}
		if (!current) return;
		if (nameEl) nameEl.textContent = current.name;
		if (sizeEl) sizeEl.textContent = formatFileSize(current.bytes);
		previewImageEl?.classList.toggle('is-hidden', !current.isImage);
		previewDocEl?.classList.toggle('is-hidden', current.isImage);
		if (previewImageEl) previewImageEl.style.backgroundImage = current.isImage && current.url ? `url("${current.url}")` : '';
		if (previewExtEl) previewExtEl.textContent = current.ext;
	}

	// Replacing the slot revokes the previous object URL so no stale preview survives.
	function applyFile(file) {
		if (current?.url) {
			try {
				URL.revokeObjectURL(current.url);
			} catch (e) {}
		}
		if (!file) {
			current = null;
		} else {
			const isImage = /^image\//.test(file.type) || /\.(jpe?g|png)$/i.test(file.name);
			current = {
				name: file.name,
				bytes: file.size,
				url: isImage ? URL.createObjectURL(file) : undefined,
				isImage,
				ext: (file.name.split('.').pop() || 'file').toUpperCase(),
			};
		}
		render();
		emitChange();
	}

	function accept1(file) {
		return validateFiles([file], { accept: acceptPattern, maxMB })[0] ?? null;
	}

	function pick() {
		fileInput?.click();
	}

	emptyEl?.addEventListener('click', pick);
	emptyEl?.addEventListener('keydown', (e) => {
		if (e.key !== 'Enter' && e.key !== ' ') return;
		e.preventDefault();
		pick();
	});
	reuploadBtn?.addEventListener('click', (e) => {
		e.stopPropagation();
		pick();
	});
	reuploadOverlay?.addEventListener('click', pick);
	deleteBtn?.addEventListener('click', (e) => {
		e.stopPropagation();
		applyFile(null);
	});

	fileInput?.addEventListener('change', (e) => {
		const file = e.target.files?.[0] ?? null;
		if (fileInput) fileInput.value = '';
		if (!file) return;
		const accepted = accept1(file);
		if (accepted) applyFile(accepted);
	});

	root.addEventListener('dragover', (e) => {
		e.preventDefault();
		root.classList.add('is-dragover');
	});
	root.addEventListener('dragleave', () => root.classList.remove('is-dragover'));
	root.addEventListener('drop', (e) => {
		e.preventDefault();
		root.classList.remove('is-dragover');
		const file = e.dataTransfer?.files?.[0] ?? null;
		if (!file) return;
		const accepted = accept1(file);
		if (accepted) applyFile(accepted);
	});

	registerFileSlot(id, {
		setFile(meta) {
			if (current?.url && current.url !== meta?.url) {
				try {
					URL.revokeObjectURL(current.url);
				} catch (e) {}
			}
			current = meta;
			render();
		},
		getFile: toMeta,
	});

	render();
}

document.querySelectorAll('[data-file-slot]').forEach(initFileSlot);
