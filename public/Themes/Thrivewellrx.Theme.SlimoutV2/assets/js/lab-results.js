// Lab Results page — business logic only. The modal shell, the "pick one of these cards"
// selection, the file dropzone UI, and localStorage access are all shared (see common.js,
// dropzone.js, storage.js). This just wires that generic machinery to Lab Results' own data (the
// three lab options) and gating rules (Next requires a report unless the chosen option is
// "prepaid"). No-ops on any page without the Lab Results markup.
import { openModal, closeModal } from './common.js';
import { readString, writeString, readJSON, writeJSON, remove } from './storage.js';
import { getDropzoneFiles, setDropzoneFiles } from './dropzone.js';
import { formatFileSize } from './file-utils.js';

const emptyBlock = document.querySelector('[data-lab-empty]');

if (emptyBlock) {
	const OPTION_KEY = 'slimout_lab_option';
	const OPTION_LABEL_KEY = 'slimout_lab_option_label';
	const FILES_KEY = 'slimout_lab_files';
	const DROPZONE_ID = 'lab-report';
	const FILE_ICON = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"></path><path d="M14 3v5h5"></path></svg>';

	const LAB_OPTIONS = [
		{
			key: 'requisition',
			label: "Patient's Preferred Lab (Requisition Provided)",
			followUp: 'Lab requisition download and report upload will be available after the order is created.',
		},
		{
			key: 'upload',
			label: 'Upload Existing Lab Results',
			followUp: 'Lab requisition download and report upload will be available after the order is created.',
		},
		{
			key: 'prepaid',
			label: 'Prepaid Lab Setup by SlimOut',
			followUp: 'Lab requisition download and report upload will be available after the order is created.',
		},
	];

	// Main card
	const filledBlock = document.querySelector('[data-lab-filled]');
	const chosenLabelEl = document.querySelector('[data-lab-chosen-label]');
	const followUpEl = document.querySelector('[data-lab-followup]');
	const filesBlock = document.querySelector('[data-lab-files-block]');
	const mainFilesListEl = document.querySelector('[data-lab-files-list]');
	const uploadBtn = document.querySelector('[data-lab-upload-btn]');
	const uploadBtnLabel = document.querySelector('[data-lab-upload-btn-label]');
	const changeBtn = document.querySelector('[data-lab-change-btn]');

	// Bottom nav
	const statusEl = document.querySelector('[data-lab-status]');
	const nextBtn = document.querySelector('[data-lab-next]');

	// Option modal (cards + native radios rendered by LabOptionModal/SelectableCard)
	const optionSaveBtn = document.querySelector('[data-lab-option-save]');
	const optionInputs = () => Array.from(document.querySelectorAll('input[name="lab-option"]'));

	// Warn modal
	const warnLabelEl = document.querySelector('[data-lab-warn-label]');

	let selectedOption = null;

	function loadState() {
		const saved = readString(OPTION_KEY);
		if (saved && LAB_OPTIONS.some((o) => o.key === saved)) selectedOption = saved;

		const savedFiles = readJSON(FILES_KEY, []);
		if (savedFiles.length) setDropzoneFiles(DROPZONE_ID, savedFiles);
	}

	function renderMainFiles(files) {
		if (!mainFilesListEl) return;
		mainFilesListEl.innerHTML = '';
		files.forEach((file) => {
			const row = document.createElement('div');
			row.className = 'lab-results-file-row';
			const icon = document.createElement('span');
			icon.className = 'lab-results-file-icon';
			icon.innerHTML = FILE_ICON;
			const name = document.createElement('span');
			name.className = 'lab-results-file-name';
			name.textContent = file.name;
			const size = document.createElement('span');
			size.className = 'lab-results-file-size';
			size.textContent = formatFileSize(file.bytes);
			row.append(icon, name, size);
			mainFilesListEl.appendChild(row);
		});
	}

	function renderMain() {
		const chosen = LAB_OPTIONS.find((o) => o.key === selectedOption) || null;
		const files = getDropzoneFiles(DROPZONE_ID);

		emptyBlock?.classList.toggle('is-hidden', !!chosen);
		filledBlock?.classList.toggle('is-hidden', !chosen);

		if (chosen) {
			if (chosenLabelEl) chosenLabelEl.textContent = chosen.label;
			if (followUpEl) followUpEl.textContent = chosen.followUp;

			const showActions = chosen.key !== 'prepaid';
			uploadBtn?.classList.toggle('is-hidden', !showActions);
			if (uploadBtnLabel) uploadBtnLabel.textContent = files.length ? 'Manage Report' : 'Upload Report';

			const showFiles = showActions && files.length > 0;
			filesBlock?.classList.toggle('is-hidden', !showFiles);
			if (showFiles) renderMainFiles(files);
		}

		if (statusEl) statusEl.textContent = chosen ? 'Lab option selected.' : 'Choose how you want to complete your lab work.';
		nextBtn?.classList.toggle('is-enabled', !!chosen);
	}

	// Option modal — selection itself is native radio input + :has(), so all this does is seed the
	// group to the current choice on open and read it back on Save.
	function openOptionModal() {
		optionInputs().forEach((input) => {
			input.checked = input.value === selectedOption;
		});
		optionSaveBtn?.classList.toggle('is-enabled', !!selectedOption);
		openModal('lab-option-modal');
	}

	optionInputs().forEach((input) => {
		input.addEventListener('change', () => optionSaveBtn?.classList.add('is-enabled'));
	});

	optionSaveBtn?.addEventListener('click', () => {
		const draft = optionInputs().find((input) => input.checked)?.value ?? null;
		if (!draft) return;

		// Switching option invalidates any report uploaded for the previous one.
		if (selectedOption && selectedOption !== draft) {
			setDropzoneFiles(DROPZONE_ID, []);
			remove(FILES_KEY);
		}

		selectedOption = draft;
		writeString(OPTION_KEY, selectedOption);
		const hit = LAB_OPTIONS.find((o) => o.key === selectedOption);
		if (hit) writeString(OPTION_LABEL_KEY, hit.label);

		closeModal('lab-option-modal');
		renderMain();
	});

	emptyBlock.addEventListener('click', openOptionModal);
	changeBtn?.addEventListener('click', openOptionModal);

	// Upload modal — opening it is a plain `data-modal-open` in markup (no seeding needed);
	// dropzone.js owns the picker UI; this just persists the result on Save.
	document.querySelector('[data-lab-upload-save]')?.addEventListener('click', () => {
		writeJSON(FILES_KEY, getDropzoneFiles(DROPZONE_ID));
		closeModal('lab-upload-modal');
		renderMain();
	});

	// Warn modal
	function openWarnModal() {
		const chosen = LAB_OPTIONS.find((o) => o.key === selectedOption);
		if (warnLabelEl) warnLabelEl.textContent = chosen ? chosen.label : '';
		openModal('lab-warn-modal');
	}

	document.querySelector('[data-lab-warn-upload]')?.addEventListener('click', () => {
		closeModal('lab-warn-modal');
		openModal('lab-upload-modal');
	});
	document.querySelector('[data-lab-warn-continue]')?.addEventListener('click', () => {
		window.location.href = 'checkout.html';
	});

	// Bottom nav
	nextBtn?.addEventListener('click', () => {
		if (!selectedOption) return;
		if (selectedOption !== 'prepaid' && getDropzoneFiles(DROPZONE_ID).length === 0) {
			openWarnModal();
			return;
		}
		window.location.href = 'checkout.html';
	});

	loadState();
	renderMain();
}
