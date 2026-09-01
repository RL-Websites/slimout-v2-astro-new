// Order Confirmation page — the collapsible order-details panel. No-op on any other page.
const toggle = document.getElementById('order-details-toggle');
const details = document.getElementById('order-details');
const chevron = document.getElementById('order-details-chevron');
const label = toggle?.querySelector('.order-confirmation-panel-pill');

toggle?.addEventListener('click', () => {
	const isOpen = details?.classList.toggle('is-open') === true;
	chevron?.classList.toggle('is-open', isOpen);
	toggle.setAttribute('aria-expanded', String(isOpen));
	if (label) {
		label.childNodes[0].textContent = isOpen ? 'Hide Details' : 'View Details';
	}
});
