// Opens a QrUploadModal with a given badge label and encoded value, so a page never has to know
// how the QR image itself is generated.
//
// This calls a public QR-image API purely for a decorative "scan to continue on your phone"
// prompt — there is no real upload-relay backend behind it in this static site. Swap
// `buildQrImageUrl` for a real signed-upload-link endpoint before this ships anywhere that needs
// the QR to actually do something.
import { openModal } from './common.js';

function buildQrImageUrl(value) {
	const target = `https://slimout.example/upload?value=${encodeURIComponent(value)}`;
	return `https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=0&data=${encodeURIComponent(target)}`;
}

export function openQrModal(id, { badge, value }) {
	const modal = document.querySelector(`[data-modal="${id}"]`);
	const badgeEl = modal?.querySelector('[data-qr-badge]');
	const imageEl = modal?.querySelector('[data-qr-image]');
	if (badgeEl) badgeEl.textContent = `Uploading: ${badge}`;
	if (imageEl) imageEl.style.backgroundImage = `url("${buildQrImageUrl(value)}")`;
	openModal(id);
}
