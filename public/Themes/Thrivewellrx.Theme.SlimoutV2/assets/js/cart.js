// Cart page: line-item quantity/removal, coupon apply/clear, totals, and the shipping-option
// drawer (open/close mechanics shared via drawer.js). No-op on any other page.
import { initDrawer } from './drawer.js';

const rowsContainer = document.querySelector('[data-cart-rows]');

if (rowsContainer) {
	const BASE_SHIP = Number(rowsContainer.dataset.baseShip || '0');
	const OVERNIGHT = Number(rowsContainer.dataset.overnightShip || '0');
	const money = (n) => '$' + n.toFixed(2);

	const emptyEl = document.querySelector('[data-cart-empty]');
	const timelineWrap = document.querySelector('[data-cart-timeline-wrap]');
	const subtotalEl = document.querySelector('[data-cart-subtotal]');
	const shipCostEl = document.querySelector('[data-cart-ship-cost]');
	const shipLabelEl = document.querySelector('[data-cart-ship-label]');
	const totalEl = document.querySelector('[data-cart-total]');
	const couponRowEl = document.querySelector('[data-cart-coupon-row]');
	const couponCodeEl = document.querySelector('[data-cart-coupon-code]');
	const discountEl = document.querySelector('[data-cart-discount]');
	const couponInput = document.querySelector('[data-cart-coupon-input]');
	const couponApplyBtn = document.querySelector('[data-cart-coupon-apply]');
	const stickyBarEl = document.querySelector('[data-cart-sticky]');
	const stickyTotalEl = document.querySelector('[data-cart-sticky-total]');
	const stickyMetaEl = document.querySelector('[data-cart-sticky-meta]');
	const drawerNameEl = document.querySelector('[data-cart-drawer-name]');
	const drawerAgreeBtn = document.querySelector('[data-cart-drawer-agree]');
	const shipOptionEls = document.querySelectorAll('[data-cart-ship-option]');
	const rowTemplate = document.getElementById('cart-row-template');

	let appliedCoupon = null;
	let pendingShip = 'Regular';
	let pendingProduct = null;

	function getRows() {
		return rowsContainer ? Array.from(rowsContainer.querySelectorAll('[data-cart-row]')) : [];
	}

	function renumber() {
		getRows().forEach((row, i) => {
			const idx = row.querySelector('[data-cart-idx]');
			if (idx) idx.textContent = String(i + 1).padStart(2, '0');
		});
	}

	function recompute() {
		const rows = getRows();
		let subtotal = 0;
		let units = 0;
		let hasOvernight = false;

		rows.forEach((row) => {
			const unit = parseFloat(row.dataset.cartUnit || '0');
			const qtyEl = row.querySelector('[data-cart-qty-value]');
			const qty = parseInt(qtyEl?.textContent || '1', 10);
			subtotal += unit * qty;
			units += qty;
			if (row.dataset.cartShipping === 'Overnight') hasOvernight = true;

			const priceEl = row.querySelector('[data-cart-price]');
			if (priceEl) priceEl.textContent = money(unit * qty);

			const decBtn = row.querySelector('[data-cart-qty-dec]');
			if (decBtn) decBtn.dataset.disabled = qty <= 1 ? 'true' : 'false';
		});

		const hasItems = rows.length > 0;
		const shipping = hasItems ? BASE_SHIP + (hasOvernight ? OVERNIGHT : 0) : 0;
		const discount = appliedCoupon === 'FREE_100' ? subtotal : appliedCoupon ? subtotal * 0.1 : 0;
		const total = Math.max(0, subtotal + shipping - discount);

		const shipTypes = Array.from(new Set(rows.map((r) => r.dataset.cartShipping).filter(Boolean)));
		const shipLabel = shipTypes.length ? shipTypes.join(' + ') : 'no items';
		const itemCountText = `${units} ${units === 1 ? 'item' : 'items'}`;

		if (subtotalEl) subtotalEl.textContent = money(subtotal);
		if (shipCostEl) {
			shipCostEl.textContent = appliedCoupon === 'FREE_100' ? 'Free' : hasItems ? money(shipping) : '—';
		}
		if (shipLabelEl) shipLabelEl.textContent = `(${shipLabel})`;
		if (totalEl) totalEl.textContent = money(total);

		if (couponRowEl) couponRowEl.style.display = appliedCoupon ? 'flex' : 'none';
		if (appliedCoupon && couponCodeEl) {
			couponCodeEl.textContent = appliedCoupon === 'FREE_100' ? 'FREE_100 · 100% off' : appliedCoupon;
		}
		if (discountEl) discountEl.textContent = '−' + money(discount);

		document.querySelectorAll('[data-cart-item-count]').forEach((el) => {
			el.textContent = itemCountText;
		});
		if (stickyMetaEl) stickyMetaEl.textContent = `${itemCountText} · ${shipLabel}`;
		if (stickyTotalEl) stickyTotalEl.textContent = money(total);

		if (emptyEl) emptyEl.style.display = hasItems ? 'none' : '';
		if (timelineWrap) timelineWrap.style.display = hasItems ? '' : 'none';
		if (stickyBarEl) stickyBarEl.style.display = hasItems ? '' : 'none';

		renumber();
	}

	rowsContainer.addEventListener('click', (e) => {
		const row = e.target.closest('[data-cart-row]');
		if (!row) return;

		if (e.target.closest('[data-cart-qty-inc]')) {
			const qtyEl = row.querySelector('[data-cart-qty-value]');
			qtyEl.textContent = String(parseInt(qtyEl.textContent, 10) + 1);
			recompute();
			return;
		}

		const decBtn = e.target.closest('[data-cart-qty-dec]');
		if (decBtn) {
			if (decBtn.dataset.disabled === 'true') return;
			const qtyEl = row.querySelector('[data-cart-qty-value]');
			const val = parseInt(qtyEl.textContent, 10);
			if (val <= 1) return;
			qtyEl.textContent = String(val - 1);
			recompute();
			return;
		}

		if (e.target.closest('[data-cart-remove]')) {
			row.remove();
			recompute();
		}
	});

	couponApplyBtn?.addEventListener('click', () => {
		const raw = (couponInput?.value || '').trim();
		if (!raw) return;
		appliedCoupon = raw.toUpperCase().replace(/[\s-]+/g, '_');
		if (couponInput) couponInput.value = '';
		recompute();
	});

	document.addEventListener('click', (e) => {
		if (e.target.closest('[data-cart-coupon-clear]')) {
			appliedCoupon = null;
			recompute();
		}
	});

	function updateDrawerOptions() {
		shipOptionEls.forEach((opt) => {
			const active = opt.dataset.cartShipOption === pendingShip;
			opt.classList.toggle('drawer-option--active', active);
			const dot = opt.querySelector('[data-cart-option-dot]');
			if (dot) dot.textContent = active ? '✓' : '';
		});
	}

	shipOptionEls.forEach((opt) => {
		opt.addEventListener('click', () => {
			pendingShip = opt.dataset.cartShipOption;
			updateDrawerOptions();
		});
	});

	const { open: openDrawer, close: closeDrawer } = initDrawer({
		panel: document.querySelector('[data-cart-drawer]'),
		closeTriggers: Array.from(document.querySelectorAll('[data-cart-drawer-close]')),
		closeDelay: 400,
	});

	document.querySelectorAll('[data-cart-add]').forEach((btn) => {
		btn.addEventListener('click', () => {
			pendingProduct = {
				name: btn.dataset.cartName || 'Product',
				unit: parseFloat(btn.dataset.cartUnit || '0'),
			};
			pendingShip = 'Regular';
			updateDrawerOptions();
			if (drawerNameEl) drawerNameEl.textContent = pendingProduct.name;
			openDrawer();
		});
	});

	function addItemToCart(name, unit, shipping) {
		if (!rowTemplate || !rowsContainer) return;
		const clone = rowTemplate.content.firstElementChild.cloneNode(true);
		clone.dataset.cartUnit = String(unit);
		clone.dataset.cartShipping = shipping;
		const nameEl = clone.querySelector('[data-cart-name]');
		if (nameEl) nameEl.textContent = name;
		const shipLabelEl2 = clone.querySelector('[data-cart-shipping-label]');
		if (shipLabelEl2) shipLabelEl2.textContent = `${shipping} shipping`;
		const priceEl = clone.querySelector('[data-cart-price]');
		if (priceEl) priceEl.textContent = money(unit);
		rowsContainer.appendChild(clone);
		recompute();
	}

	drawerAgreeBtn?.addEventListener('click', () => {
		if (!pendingProduct) return;
		addItemToCart(pendingProduct.name, pendingProduct.unit, pendingShip);
		pendingProduct = null;
		closeDrawer();
		document.getElementById('top')?.scrollIntoView({ behavior: 'smooth' });
	});

	recompute();
}
