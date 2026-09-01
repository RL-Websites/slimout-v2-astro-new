// Change Password page — validation state and submit gating. No-op on any other page.
const currentInput = document.querySelector('[data-field="current"]');

if (currentInput) {
	const nextInput = document.querySelector('[data-field="next"]');
	const confirmInput = document.querySelector('[data-field="confirm"]');
	const ruleEls = {
		long: document.querySelector('[data-rule="long"]'),
		mixed: document.querySelector('[data-rule="mixed"]'),
		match: document.querySelector('[data-rule="match"]'),
	};
	const errorEl = document.querySelector('[data-error]');
	const submitBtn = document.querySelector('[data-submit]');
	const toast = document.querySelector('[data-toast]');

	const checks = () => {
		const next = nextInput?.value ?? '';
		const confirm = confirmInput?.value ?? '';
		const long = next.length >= 8;
		const mixed = /[0-9]/.test(next) && /[A-Za-z]/.test(next);
		const match = !!next && next === confirm;
		return { next, confirm, long, mixed, match };
	};

	function clearError() {
		if (!errorEl) return;
		errorEl.classList.add('is-hidden');
		errorEl.textContent = '';
	}

	function showError(message) {
		if (!errorEl) return;
		errorEl.textContent = message;
		errorEl.classList.remove('is-hidden');
	}

	function updateState() {
		const { long, mixed, match, confirm } = checks();
		ruleEls.long?.classList.toggle('change-password-rule--met', long);
		ruleEls.mixed?.classList.toggle('change-password-rule--met', mixed);
		ruleEls.match?.classList.toggle('change-password-rule--met', match);
		confirmInput?.classList.toggle('change-password-input--error', !!confirm && !match);

		const ready = !!currentInput.value && long && mixed && match;
		submitBtn?.classList.toggle('is-enabled', ready);
	}

	[currentInput, nextInput, confirmInput].forEach((input) => {
		input?.addEventListener('input', () => {
			clearError();
			updateState();
		});
	});

	submitBtn?.addEventListener('click', () => {
		const { long, mixed, match } = checks();
		if (!currentInput.value) {
			showError('Enter your current password.');
			return;
		}
		if (!long) {
			showError('New password must be at least 8 characters.');
			return;
		}
		if (!mixed) {
			showError('Use both letters and numbers.');
			return;
		}
		if (!match) {
			showError('The new passwords do not match.');
			return;
		}

		clearError();
		currentInput.value = '';
		if (nextInput) nextInput.value = '';
		if (confirmInput) confirmInput.value = '';
		updateState();

		toast?.classList.remove('is-hidden');
		toast?.classList.add('is-visible');
		window.setTimeout(() => {
			window.location.href = 'account.html';
		}, 1600);
	});

	updateState();
}
