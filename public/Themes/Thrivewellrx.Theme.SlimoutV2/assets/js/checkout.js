// Checkout page: card-field formatting/brand detection, the summary/lab accordions, the
// same-as-shipping and save-payment toggles, and the terms modal (open/close mechanics shared via
// common.js). No-op on any other page.
import { initDrawer } from './common.js';

const cardNumberInput = document.querySelector('[data-card-number]');

if (cardNumberInput) {
	function detectBrand(digits) {
		if (!digits || digits.length < 2) return null;
		if (/^4/.test(digits)) return 'visa';
		const first2 = parseInt(digits.slice(0, 2), 10);
		const first4 = parseInt(digits.slice(0, 4), 10);
		if ((first2 >= 51 && first2 <= 55) || (first4 >= 2221 && first4 <= 2720)) return 'mastercard';
		if (first2 === 34 || first2 === 37) return 'amex';
		return null;
	}

	const expiryInput = document.querySelector('[data-card-expiry]');
	const cvcInput = document.querySelector('[data-card-cvc]');
	const brandEls = document.querySelectorAll('[data-brand]');

	cardNumberInput.addEventListener('input', (e) => {
		const target = e.target;
		const digits = target.value.replace(/\D/g, '').slice(0, 16);
		target.value = digits.replace(/(.{4})(?=.)/g, '$1 ');
		const brand = detectBrand(digits);
		brandEls.forEach((el) => el.classList.toggle('is-active', el.dataset.brand === brand));
	});

	expiryInput?.addEventListener('input', (e) => {
		const target = e.target;
		const d = target.value.replace(/\D/g, '').slice(0, 4);
		target.value = d.length >= 2 ? d.slice(0, 2) + ' / ' + d.slice(2) : d;
	});

	cvcInput?.addEventListener('input', (e) => {
		const target = e.target;
		target.value = target.value.replace(/\D/g, '').slice(0, 4);
	});

	const summaryToggle = document.querySelector('[data-summary-toggle]');
	const summaryBody = document.querySelector('[data-summary-body]');
	summaryToggle?.addEventListener('click', () => {
		const open = summaryToggle.classList.toggle('is-open');
		summaryBody?.classList.toggle('is-open', open);
		summaryToggle.setAttribute('aria-expanded', String(open));
	});

	const labToggle = document.querySelector('[data-lab-toggle]');
	const labTests = document.querySelector('[data-lab-tests]');
	labToggle?.addEventListener('click', () => {
		const open = labToggle.classList.toggle('is-open');
		labTests?.classList.toggle('is-open', open);
		labToggle.setAttribute('aria-expanded', String(open));
	});

	const sameToggle = document.querySelector('[data-same-toggle]');
	const billingNotice = document.querySelector('[data-billing-notice]');
	const billingFields = document.querySelector('[data-billing-fields]');
	sameToggle?.addEventListener('click', () => {
		const same = sameToggle.classList.toggle('is-checked');
		billingNotice?.classList.toggle('is-hidden', !same);
		billingFields?.classList.toggle('is-hidden', same);
	});

	document.querySelectorAll('[data-save-toggle]').forEach((el) => {
		el.addEventListener('click', () => {
			const key = el.dataset.saveToggle;
			const checked = !el.classList.contains('is-checked');
			document.querySelectorAll(`[data-save-toggle="${key}"]`).forEach((match) => {
				match.classList.toggle('is-checked', checked);
			});
		});
	});

	const termsToggle = document.querySelector('[data-terms-toggle]');
	const termsScroll = document.querySelector('[data-terms-scroll]');
	const termsHint = document.querySelector('[data-terms-hint]');
	const termsAgreeBtn = document.querySelector('[data-terms-agree]');
	const payButtons = document.querySelectorAll('[data-pay]');

	let termsRead = false;

	function setTermsAgreed(agreed) {
		termsToggle?.classList.toggle('is-checked', agreed);
		payButtons.forEach((btn) => btn.classList.toggle('is-enabled', agreed));
	}

	const { open: openTermsModal, close: closeTermsModal } = initDrawer({
		panel: document.querySelector('[data-terms-modal]'),
		closeTriggers: Array.from(document.querySelectorAll('[data-terms-close]')),
		closeDelay: 380,
	});

	termsToggle?.addEventListener('click', () => {
		if (termsToggle.classList.contains('is-checked')) {
			setTermsAgreed(false);
			return;
		}
		openTermsModal();
	});

	termsScroll?.addEventListener('scroll', () => {
		if (termsRead || !termsScroll) return;
		if (termsScroll.scrollTop + termsScroll.clientHeight >= termsScroll.scrollHeight - 24) {
			termsRead = true;
			termsAgreeBtn?.classList.add('is-enabled');
			termsHint?.classList.add('is-hidden');
		}
	});

	termsAgreeBtn?.addEventListener('click', () => {
		if (!termsRead) return;
		setTermsAgreed(true);
		closeTermsModal();
	});
}
