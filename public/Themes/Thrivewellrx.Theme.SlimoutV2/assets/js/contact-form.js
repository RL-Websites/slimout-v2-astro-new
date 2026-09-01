// Contact page form — char count, submit gating, and the form/success view swap. No-op on any
// other page.
const root = document.querySelector('[data-contact-form]');

if (root) {
	const formView = root.querySelector('[data-form-view]');
	const successView = root.querySelector('[data-success-view]');
	const topicField = root.querySelector('[data-field="topic"]');
	const orderField = root.querySelector('[data-field="order"]');
	const messageField = root.querySelector('[data-field="message"]');
	const charCount = root.querySelector('[data-char-count]');
	const submitBtn = root.querySelector('[data-submit]');
	const cancelBtn = root.querySelector('[data-cancel]');
	const againBtn = root.querySelector('[data-again]');

	function updateCharCount() {
		const length = messageField?.value.length ?? 0;
		if (charCount) charCount.textContent = `${length}/1000 characters`;
	}

	function updateSubmitState() {
		const ready = (messageField?.value.trim().length ?? 0) > 4;
		submitBtn?.classList.toggle('is-enabled', ready);
	}

	function resetForm() {
		if (topicField) topicField.selectedIndex = 0;
		if (orderField) orderField.value = '';
		if (messageField) messageField.value = '';
		updateCharCount();
		updateSubmitState();
	}

	messageField?.addEventListener('input', () => {
		updateCharCount();
		updateSubmitState();
	});

	cancelBtn?.addEventListener('click', resetForm);

	submitBtn?.addEventListener('click', () => {
		if (!submitBtn.classList.contains('is-enabled')) return;
		formView?.classList.add('is-hidden');
		successView?.classList.remove('is-hidden');
	});

	againBtn?.addEventListener('click', () => {
		resetForm();
		successView?.classList.add('is-hidden');
		formView?.classList.remove('is-hidden');
	});

	updateCharCount();
	updateSubmitState();
}
