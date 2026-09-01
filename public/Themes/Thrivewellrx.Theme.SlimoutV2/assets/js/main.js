// Single global script entry point, loaded on every page from Layout.astro. Each imported
// module guards itself (e.g. common.js's quiz/intake sections no-op unless they find
// [data-quiz]/[data-intake] in the DOM), so it's safe to import every component's script here
// rather than adding a page-specific <script> tag.
import "./common.js";
// import "./header.js";

// import "./dropzone.js";
// import "./file-slot.js";
// import "./product-modal.js";

// import "./account.js";
// import "./change-password.js";
// import "./contact-form.js";
// import "./order-confirmation.js";
import "./lab-results.js";
// import "./verify-identity.js";
import "./my-orders.js";
import "./cart.js";
// import "./checkout.js";
