// Multi-file dropzone (click-to-pick or drag-and-drop) for any [data-file-dropzone] on the page —
// see the FileDropzone component. Also exposes a small registry (registerDropzone/
// getDropzoneFiles/setDropzoneFiles) so a page script can read or restore a dropzone's file list
// by its `id` without reaching into the widget's internals.
import { formatFileSize, validateFiles } from './file-utils.js';

const controllers = new Map();

export function registerDropzone(id, controller) {
	controllers.set(id, controller);
}

/** Replaces a dropzone's current file list — e.g. restoring a previously-saved selection. */
export function setDropzoneFiles(id, files) {
	controllers.get(id)?.setFiles(files);
}

export function getDropzoneFiles(id) {
	return controllers.get(id)?.getFiles() ?? [];
}

function initDropzone(root) {
	if (root.dataset.dropzoneInit === '1') return;
	root.dataset.dropzoneInit = '1';

	const id = root.dataset.fileDropzone || '';
	const acceptPattern = new RegExp('\\.(' + (root.dataset.acceptPattern || '') + ')$', 'i');
	const maxMB = Number(root.dataset.maxMb || '50');

	const dropzone = root.querySelector('[data-dropzone]');
	const fileInput = root.querySelector('[data-file-input]');
	const fileListEl = root.querySelector('[data-file-list]');
	const emptyEl = root.querySelector('[data-file-empty]');
	const template = root.querySelector('[data-file-row-template]');

	let files = [];
	let nextId = 1;

	function emitChange() {
		root.dispatchEvent(new CustomEvent('files-change', { detail: { files: files.map(({ name, bytes }) => ({ name, bytes })) } }));
	}

	function render() {
		if (!fileListEl) return;
		fileListEl.innerHTML = '';
		if (!files.length) {
			fileListEl.classList.add('is-hidden');
			emptyEl?.classList.remove('is-hidden');
			return;
		}
		fileListEl.classList.remove('is-hidden');
		emptyEl?.classList.add('is-hidden');

		files.forEach((file) => {
			const node = template?.content.firstElementChild?.cloneNode(true);
			if (!(node instanceof HTMLElement)) return;
			const nameEl = node.querySelector('[data-row-name]');
			const sizeEl = node.querySelector('[data-row-size]');
			const removeBtn = node.querySelector('[data-row-remove]');
			if (nameEl) nameEl.textContent = file.name;
			if (sizeEl) sizeEl.textContent = formatFileSize(file.bytes);
			removeBtn?.addEventListener('click', () => {
				files = files.filter((x) => x.id !== file.id);
				render();
				emitChange();
			});
			fileListEl.appendChild(node);
		});
	}

	function addFiles(list) {
		const accepted = validateFiles(list, { accept: acceptPattern, maxMB });
		if (!accepted.length) return;
		accepted.forEach((file) => files.push({ id: nextId++, name: file.name, bytes: file.size }));
		render();
		emitChange();
	}

	dropzone?.addEventListener('click', () => fileInput?.click());
	dropzone?.addEventListener('keydown', (e) => {
		if (e.key !== 'Enter' && e.key !== ' ') return;
		e.preventDefault();
		fileInput?.click();
	});
	fileInput?.addEventListener('change', (e) => {
		addFiles(e.target.files);
		if (fileInput) fileInput.value = '';
	});
	dropzone?.addEventListener('dragover', (e) => {
		e.preventDefault();
		dropzone.classList.add('is-dragover');
	});
	dropzone?.addEventListener('dragleave', () => dropzone.classList.remove('is-dragover'));
	dropzone?.addEventListener('drop', (e) => {
		e.preventDefault();
		dropzone.classList.remove('is-dragover');
		addFiles(e.dataTransfer?.files);
	});

	registerDropzone(id, {
		setFiles(next) {
			files = next.map((f) => ({ id: nextId++, name: f.name, bytes: f.bytes }));
			render();
		},
		getFiles() {
			return files.map(({ name, bytes }) => ({ name, bytes }));
		},
	});

	render();
}

document.querySelectorAll('[data-file-dropzone]').forEach(initDropzone);
