// Verify Identity page — no-ops on any page without the Verify Identity markup.
import { openQrModal } from './qr-modal.js';
import { getFileSlot } from './file-slot.js';
import { getDropzoneFiles, setDropzoneFiles } from './dropzone.js';
import { readJSON, readString, writeJSON } from './storage.js';

const step1El = document.querySelector('[data-step="1"]');

if (step1El) {
	// Must match the id props passed to <QrUploadModal>/<FileDropzone> in VerifyIdentity.astro.
	const QR_MODAL_ID = 'verify-qr-modal';
	const LAB_DROPZONE_ID = 'verify-lab-report';
	const LAB_REQUIRED_KEY = 'slimout_lab_required';
	const LAB_FILES_KEY = 'slimout_lab_files';
	const FRONT_ID = 'license-front';
	const BACK_ID = 'license-back';

	const labFlow = readString(LAB_REQUIRED_KEY) === '1';

	const step2El = document.querySelector('[data-step="2"]');
	const statusEl = document.querySelector('[data-status]');
	const backBtn = document.querySelector('[data-back-btn]');
	const backLabel = document.querySelector('[data-back-label]');
	const nextBtn = document.querySelector('[data-next]');
	const nextLabel = document.querySelector('[data-next-label]');

	let step = 1;

	function licenseCount() {
		return (getFileSlot(FRONT_ID) ? 1 : 0) + (getFileSlot(BACK_ID) ? 1 : 0);
	}

	function onStep2() {
		return labFlow && step === 2;
	}

	function render() {
		const showingStep2 = onStep2();
		step1El.classList.toggle('is-hidden', showingStep2);
		step2El?.classList.toggle('is-hidden', !showingStep2);

		const count = licenseCount();
		const ready = showingStep2 ? true : count === 2;

		if (backLabel) backLabel.textContent = showingStep2 ? 'Skip for now' : 'Back';
		if (nextLabel) nextLabel.textContent = showingStep2 ? 'Submit' : 'Next';
		nextBtn?.classList.toggle('is-enabled', ready);

		if (!statusEl) return;
		if (showingStep2) {
			const count2 = getDropzoneFiles(LAB_DROPZONE_ID).length;
			statusEl.textContent = count2 ? `${count2} ${count2 === 1 ? 'report' : 'reports'} ready` : 'Upload your lab report, or skip and add it later.';
		} else if (labFlow) {
			statusEl.textContent = count === 2 ? 'Upload your lab report to continue' : 'Upload both sides of your license to continue';
		} else {
			statusEl.textContent = count === 2 ? 'Front and back uploaded.' : 'Upload both sides of your license to continue';
		}
	}

	document.querySelectorAll('[data-file-slot]').forEach((el) => el.addEventListener('file-change', render));
	document.querySelector(`[data-file-dropzone="${LAB_DROPZONE_ID}"]`)?.addEventListener('files-change', render);

	backBtn?.addEventListener('click', () => {
		if (onStep2()) {
			window.location.href = 'intake.html';
			return;
		}
		window.location.href = 'order-confirmation.html';
	});

	nextBtn?.addEventListener('click', () => {
		const showingStep2 = onStep2();
		const ready = showingStep2 ? true : licenseCount() === 2;
		if (!ready) return;

		if (labFlow && step === 1) {
			step = 2;
			window.scrollTo({ top: 0 });
			render();
			return;
		}

		if (showingStep2) {
			writeJSON(LAB_FILES_KEY, getDropzoneFiles(LAB_DROPZONE_ID));
		}
		window.location.href = 'intake.html';
	});

	document.querySelectorAll('[data-qr-trigger]').forEach((btn) => {
		btn.addEventListener('click', () => {
			const label = btn.dataset.qrLabel || 'document';
			openQrModal(QR_MODAL_ID, { badge: label, value: label });
		});
	});

	// A lab report already uploaded via the standalone Lab Results flow (same slimout_lab_files
	// key) is carried over here instead of asking the patient twice.
	const savedLabFiles = readJSON(LAB_FILES_KEY, []);
	if (savedLabFiles.length) setDropzoneFiles(LAB_DROPZONE_ID, savedLabFiles);

	render();
}
