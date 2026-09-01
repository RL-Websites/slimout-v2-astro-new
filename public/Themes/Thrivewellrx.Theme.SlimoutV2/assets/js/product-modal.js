// Product detail modal: Add to Cart swaps to a quantity stepper once the product is in the
// shared cart, and stays in sync everywhere the same product's modal appears (localStorage-backed,
// same "slimout_cart" shape used by the cart page). No-op unless a product modal exists.
import { readJSON, writeJSON } from './storage.js';

const CART_KEY = 'slimout_cart';

function readCart() {
	return readJSON(CART_KEY, []);
}

function cartCount(list) {
	return list.reduce((n, item) => n + (item.qty || 1), 0);
}

function updateCartBadge(list) {
	const count = cartCount(list);
	document.querySelectorAll('.header-cart-badge').forEach((badge) => {
		badge.textContent = String(count);
		badge.classList.toggle('is-hidden', count === 0);
	});
}

function writeCart(list) {
	writeJSON(CART_KEY, list);
	updateCartBadge(list);
}

const modals = document.querySelectorAll('[data-modal^="product-modal-"]');

if (modals.length) {
	updateCartBadge(readCart());

	modals.forEach((modal) => {
		const root = modal.querySelector('[data-product-name]');
		if (!root) return;

		const name = root.dataset.productName;
		const unit = parseFloat(root.dataset.productUnit || '0');
		const addBtn = root.querySelector('[data-product-add-to-cart]');
		const qtyWrap = root.querySelector('[data-product-qty]');
		const qtyValueEl = root.querySelector('[data-product-qty-value]');
		const decBtn = root.querySelector('[data-product-qty-dec]');
		const incBtn = root.querySelector('[data-product-qty-inc]');

		function render() {
			const list = readCart();
			const item = list.find((x) => x.name === name);
			const qty = item?.qty || 1;

			if (qtyValueEl) qtyValueEl.textContent = String(qty);
			if (decBtn) decBtn.dataset.disabled = qty <= 1 ? 'true' : 'false';
			addBtn?.classList.toggle('is-hidden', !!item);
			qtyWrap?.classList.toggle('is-hidden', !item);
		}

		function addOne() {
			const list = readCart();
			const item = list.find((x) => x.name === name);
			if (item) item.qty = (item.qty || 1) + 1;
			else list.push({ name, unit, qty: 1 });
			writeCart(list);
			render();
		}

		addBtn?.addEventListener('click', addOne);
		incBtn?.addEventListener('click', addOne);

		decBtn?.addEventListener('click', () => {
			if (decBtn.dataset.disabled === 'true') return;
			const list = readCart();
			const item = list.find((x) => x.name === name);
			if (!item || item.qty <= 1) return;
			item.qty -= 1;
			writeCart(list);
			render();
		});

		modal.addEventListener('modal-open', render);
		render();
	});
}
