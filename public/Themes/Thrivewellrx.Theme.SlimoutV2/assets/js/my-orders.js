// My Orders page: order list pagination/filtering, the package-contents popover, the order
// status detail switcher, and document-upload marking. No-ops on any page without this markup.
import { readJSON, writeJSON } from './storage.js';

const rowsContainer = document.querySelector('[data-orders-rows]');
const cardsContainer = document.querySelector('[data-orders-cards]');

if (rowsContainer) {
	const PER_PAGE = 10;
	const DOCS_KEY = 'slimout_order_docs';
	// The mobile card list mirrors the desktop rows one-to-one (same order, same data-order-id) —
	// counting/paging is driven by the desktop rows only, then mirrored onto the matching card.
	const rows = Array.from(rowsContainer.querySelectorAll('[data-order-row]'));
	const cards = cardsContainer ? Array.from(cardsContainer.querySelectorAll('[data-order-row]')) : [];
	const filterEls = Array.from(document.querySelectorAll('[data-filter]'));
	const emptyEl = document.querySelector('[data-orders-empty]');
	const rangeEl = document.querySelector('[data-orders-range]');
	const prevBtn = document.querySelector('[data-orders-prev]');
	const nextBtn = document.querySelector('[data-orders-next]');

	let filter = 'All';
	let page = 0;

	function cardFor(orderId) {
		return cards.find((card) => card.dataset.orderId === orderId);
	}

	// Elements sharing a doc marker across both the desktop row and its mirrored mobile card.
	function docElsFor(orderId, key) {
		const selector = `[data-order-row][data-order-id="${CSS.escape(orderId)}"] [data-doc="${key}"]`;
		const fromRows = Array.from(rowsContainer.querySelectorAll(selector));
		const fromCards = cardsContainer ? Array.from(cardsContainer.querySelectorAll(selector)) : [];
		return fromRows.concat(fromCards);
	}

	function applyView() {
		const matches = rows.filter((row) => filter === 'All' || (row.dataset.status || '').split(',').includes(filter));
		const pages = Math.max(1, Math.ceil(matches.length / PER_PAGE));
		page = Math.min(page, pages - 1);
		const start = page * PER_PAGE;
		const slice = matches.slice(start, start + PER_PAGE);

		rows.forEach((row) => {
			row.classList.add('is-hidden');
			cardFor(row.dataset.orderId)?.classList.add('is-hidden');
		});
		slice.forEach((row, i) => {
			row.classList.remove('is-hidden');
			row.classList.toggle('my-orders-row--alt', i % 2 !== 0);
			row.classList.toggle('my-orders-row--last', i === slice.length - 1);
			cardFor(row.dataset.orderId)?.classList.remove('is-hidden');
		});

		emptyEl?.classList.toggle('is-visible', matches.length === 0);

		const from = matches.length ? start + 1 : 0;
		const to = Math.min(matches.length, start + PER_PAGE);
		if (rangeEl) rangeEl.textContent = matches.length ? `${from}–${to} of ${matches.length}` : '0 of 0';

		if (prevBtn) prevBtn.disabled = page <= 0;
		if (nextBtn) nextBtn.disabled = page >= pages - 1;
	}

	filterEls.forEach((el) => {
		el.addEventListener('click', () => {
			filterEls.forEach((f) => f.classList.toggle('is-active', f === el));
			filter = el.dataset.filter || 'All';
			page = 0;
			applyView();
		});
	});

	prevBtn?.addEventListener('click', () => {
		page = Math.max(0, page - 1);
		applyView();
	});
	nextBtn?.addEventListener('click', () => {
		page = page + 1;
		applyView();
	});

	applyView();

	// Package-contents popover — one shared panel, repositioned per badge on click.
	const popover = document.querySelector('[data-order-popover]');
	const popoverList = document.querySelector('[data-order-popover-list]');
	let openBadge = null;

	function closePopover() {
		popover?.classList.remove('is-open');
		openBadge = null;
	}

	function placePopover(badge) {
		if (!popover) return;
		const r = badge.getBoundingClientRect();
		const width = 210;
		const pad = 8;
		const left = Math.max(pad, Math.min(r.left, window.innerWidth - width - pad));
		const flip = r.bottom + 140 > window.innerHeight && r.top > 150;
		popover.style.left = `${left}px`;
		if (flip) {
			popover.style.top = 'auto';
			popover.style.bottom = `${window.innerHeight - r.top + pad}px`;
		} else {
			popover.style.bottom = 'auto';
			popover.style.top = `${r.bottom + pad}px`;
		}
	}

	document.querySelectorAll('[data-package-badge]').forEach((badgeEl) => {
		badgeEl.addEventListener('click', (e) => {
			e.stopPropagation();
			if (openBadge === badgeEl) {
				closePopover();
				return;
			}
			openBadge = badgeEl;
			const contents = (badgeEl.dataset.contents || '').split('|').filter(Boolean);
			if (popoverList) {
				popoverList.innerHTML = '';
				contents.forEach((name) => {
					const line = document.createElement('div');
					line.className = 'order-popover-item';
					line.textContent = name;
					popoverList.appendChild(line);
				});
			}
			placePopover(badgeEl);
			popover?.classList.add('is-open');
		});
	});

	document.addEventListener('click', (e) => {
		if (openBadge && !e.target.closest('[data-order-popover]')) closePopover();
	});
	window.addEventListener('scroll', () => closePopover(), true);
	window.addEventListener('resize', () => closePopover());

	// Document upload — a native file picker marks the document received and persists it, keyed
	// by order id.
	function markDoc(orderId, key) {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.jpg,.jpeg,.png,.pdf';
		input.style.display = 'none';
		input.addEventListener('change', () => {
			if (input.files && input.files[0]) {
				const docs = readJSON(DOCS_KEY, {});
				docs[orderId] = Object.assign({}, docs[orderId], { [key]: true });
				writeJSON(DOCS_KEY, docs);
				docElsFor(orderId, key).forEach((el) => {
					el.classList.toggle('is-hidden', el.getAttribute('data-doc-view') === 'pending');
				});
			}
			input.remove();
		});
		document.body.appendChild(input);
		input.click();
	}

	document.querySelectorAll('[data-doc-view="pending"]').forEach((docEl) => {
		docEl.addEventListener('click', () => {
			const orderId = docEl.dataset.orderId;
			const key = docEl.dataset.doc;
			if (orderId && key) markDoc(orderId, key);
		});
	});

	// Apply any previously-saved uploads on load.
	const savedDocs = readJSON(DOCS_KEY, {});
	Object.keys(savedDocs).forEach((orderId) => {
		Object.keys(savedDocs[orderId]).forEach((key) => {
			const done = savedDocs[orderId][key];
			docElsFor(orderId, key).forEach((el) => {
				const isDoneView = el.getAttribute('data-doc-view') === 'done';
				el.classList.toggle('is-hidden', done ? !isDoneView : isDoneView);
			});
		});
	});
}

// Order status modal — separate markup on the same page, so it gets its own guard.
document.addEventListener('click', (e) => {
	const trigger = e.target.closest('[data-view-status]');
	if (!trigger) return;
	const orderId = trigger.dataset.orderId || '';
	document.querySelectorAll('[data-order-status-block]').forEach((block) => {
		block.classList.toggle('is-active', block.dataset.orderId === orderId);
	});
	const idEl = document.querySelector('[data-order-status-id]');
	if (idEl) idEl.textContent = orderId;
});
