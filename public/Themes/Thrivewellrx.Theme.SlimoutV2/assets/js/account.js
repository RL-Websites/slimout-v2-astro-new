const gate = document.querySelector('[data-account-gate]');
const content = document.querySelector('[data-account-content]');
const signOutBtn = document.querySelector('[data-sign-out]');

const editToggle = document.querySelector('[data-edit-toggle]');
const editToggleLabel = document.querySelector('[data-edit-toggle-label]');
const viewMode = document.querySelector('[data-view-mode]');
const editMode = document.querySelector('[data-edit-mode]');
const saveBtn = document.querySelector('[data-save]');
const cancelBtn = document.querySelector('[data-cancel]');
const toast = document.querySelector('[data-toast]');

const inputs = Array.from(document.querySelectorAll('[data-field-input]'));
const heroName = document.querySelector('[data-account-name]');
const heroInitials = document.querySelector('[data-account-initials]');

function setEditing(editing) {
	editToggle?.classList.toggle('is-editing', editing);
	if (editToggleLabel) editToggleLabel.textContent = editing ? 'Editing' : 'Edit';
	viewMode?.classList.toggle('is-hidden', editing);
	editMode?.classList.toggle('is-hidden', !editing);
}

editToggle?.addEventListener('click', () => {
	const editing = !editToggle.classList.contains('is-editing');
	if (editing) {
		inputs.forEach((input) => {
			const key = input.dataset.fieldInput;
			const value = document.querySelector(`[data-field-value="${key}"]`)?.textContent?.trim();
			input.value = value && value !== 'Not provided' ? value : '';
		});
	}
	setEditing(editing);
});

cancelBtn?.addEventListener('click', () => setEditing(false));

saveBtn?.addEventListener('click', () => {
	inputs.forEach((input) => {
		const key = input.dataset.fieldInput;
		const valueEl = document.querySelector(`[data-field-value="${key}"]`);
		const value = input.value.trim();
		if (!valueEl) return;
		valueEl.textContent = value || 'Not provided';
		valueEl.classList.toggle('account-field-value--empty', !value);
	});

	const firstName = inputs.find((i) => i.dataset.fieldInput === 'firstName')?.value.trim() ?? '';
	const lastName = inputs.find((i) => i.dataset.fieldInput === 'lastName')?.value.trim() ?? '';
	const fullName = `${firstName} ${lastName}`.trim();
	if (fullName && heroName) heroName.textContent = fullName;
	if (heroInitials) heroInitials.textContent = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase() || heroInitials.textContent;

	setEditing(false);

	toast?.classList.remove('is-hidden');
	toast?.classList.add('is-visible');
	window.setTimeout(() => {
		toast?.classList.remove('is-visible');
		toast?.classList.add('is-hidden');
	}, 2600);
});

signOutBtn?.addEventListener('click', () => {
	content?.classList.add('is-hidden');
	gate?.classList.remove('is-hidden');
	window.scrollTo({ top: 0, behavior: 'smooth' });
});
