// Header chrome: scroll progress bar, the Treatments dropdown (click to open, hover to preview),
// and the mobile nav drawer (open/close mechanics shared via common.js).
import { initDrawer } from './common.js';

const scrollBar = document.getElementById('scroll-bar');
function updateScrollBar() {
	if (!scrollBar) return;
	const h = document.documentElement.scrollHeight - window.innerHeight;
	scrollBar.style.width = (h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0) + '%';
}
window.addEventListener('scroll', updateScrollBar, { passive: true });
updateScrollBar();

const treatToggle = document.getElementById('treatments-toggle');
const treatPanel = document.getElementById('treatments-panel');
const treatPlus = document.getElementById('treatments-plus');
treatToggle?.addEventListener('click', () => {
	const isOpen = treatPanel?.classList.toggle('is-open') === true;
	treatToggle.setAttribute('aria-expanded', String(isOpen));
	treatPlus?.classList.toggle('is-rotated', isOpen);
});

document.addEventListener('click', (e) => {
	const target = e.target;
	if (!treatPanel || !treatPanel.classList.contains('is-open')) return;
	if (target.closest('#treatments-toggle') || target.closest('#treatments-panel')) return;
	treatPanel.classList.remove('is-open');
	treatToggle?.setAttribute('aria-expanded', 'false');
	treatPlus?.classList.remove('is-rotated');
});

const treatLinks = Array.from(document.querySelectorAll('.header-treatments-link'));
const treatPreviewItems = Array.from(document.querySelectorAll('.header-treatments-preview-item'));
treatLinks.forEach((link, i) => {
	link.addEventListener('mouseenter', () => {
		treatLinks.forEach((l, j) => l.classList.toggle('is-active', j === i));
		treatPreviewItems.forEach((item, j) => item.classList.toggle('is-active', j === i));
	});
});

initDrawer({
	panel: document.getElementById('mobile-drawer'),
	openTriggers: [document.getElementById('mobile-menu-toggle')],
	closeTriggers: [document.getElementById('mobile-drawer-close')],
});
