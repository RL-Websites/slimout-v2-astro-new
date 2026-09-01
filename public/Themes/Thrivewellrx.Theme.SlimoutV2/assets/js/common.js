// Consolidated shared/reusable vanilla JS: drawer + modal mechanics, animation helpers, the
// quiz and intake step-flow engines, and the auth-page forms (Login/Register/Forgot/Reset
// Password). Each section below guards itself against its own markup, so it's safe for every
// page to load this file once via main.js.

// This project's JS (assets/js/*.js) is loaded as plain browser <script type="module"> files —
// there is no Vite/webpack bundling step for it (only the SCSS pipeline is prebuilt, see
// scripts/build-css.mjs). A bare `import $ from "jquery"` can't resolve in that model (native
// ESM doesn't do bare-specifier resolution without an import map), so jQuery's own standalone
// ESM build is vendored here instead of pulled from node_modules at request time. It's still
// installed as a real npm dependency (see package.json) for version tracking/`npm install`;
// this file is a synced copy of node_modules/jquery/dist-module/jquery.module.min.js.
import $ from "./vendor/jquery.js";

// ===== Drawer mechanics =====
// Shared slide-in drawer / bottom-sheet mechanics: open/close with a body-scroll lock, and an
// optional close delay so a panel can finish its exit transition before being re-hidden. Backs
// the header's mobile nav drawer (wired below), the cart shipping drawer, and the checkout terms
// drawer — each wires its own triggers (see the Header chrome section below, and cart.js/checkout.js)
// since their markup differs.

const DRAWER_OPEN_CLASS = "is-open";

export function initDrawer({
  panel,
  openTriggers = [],
  closeTriggers = [],
  closeDelay = 0,
} = {}) {
  if (!panel) return { open() {}, close() {} };

  let closeTimer = null;

  function open() {
    if (closeTimer) window.clearTimeout(closeTimer);
    panel.hidden = false;
    void panel.offsetWidth;
    panel.classList.add(DRAWER_OPEN_CLASS);
    document.body.style.overflow = "hidden";
  }

  function close() {
    panel.classList.remove(DRAWER_OPEN_CLASS);
    document.body.style.overflow = "";
    if (closeDelay > 0) {
      closeTimer = window.setTimeout(() => {
        panel.hidden = true;
      }, closeDelay);
    }
  }

  openTriggers.forEach((el) => el?.addEventListener("click", open));
  closeTriggers.forEach((el) => el?.addEventListener("click", close));

  return { open, close };
}

// ===== Header chrome =====
// Scroll progress bar, the Treatments dropdown (click to open, hover to preview), and the
// mobile nav drawer (open/close mechanics shared via initDrawer above).

const scrollBar = document.getElementById("scroll-bar");
function updateScrollBar() {
  if (!scrollBar) return;
  const h = document.documentElement.scrollHeight - window.innerHeight;
  scrollBar.style.width =
    (h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0) + "%";
}
window.addEventListener("scroll", updateScrollBar, { passive: true });
updateScrollBar();

// Homepage-only `[data-header-scroll]` header (see Header.astro's `variant="transparent"`):
// starts fully transparent over the hero, gets a blurred dark bg + shadow once the page
// scrolls past the hero. No-op (empty NodeList) on every other page.
const $headerScroll = $("[data-header-scroll]");
if ($headerScroll.length) {
  function updateHeaderScroll() {
    $headerScroll.toggleClass("is-scrolled", window.scrollY > 40);
  }
  window.addEventListener("scroll", updateHeaderScroll, { passive: true });
  updateHeaderScroll();
}

const treatToggle = document.getElementById("treatments-toggle");
const treatPanel = document.getElementById("treatments-panel");
const treatPlus = document.getElementById("treatments-plus");
treatToggle?.addEventListener("click", () => {
  const isOpen = treatPanel?.classList.toggle("is-open") === true;
  treatToggle.setAttribute("aria-expanded", String(isOpen));
  treatPlus?.classList.toggle("is-rotated", isOpen);
});

document.addEventListener("click", (e) => {
  const target = e.target;
  if (!treatPanel || !treatPanel.classList.contains("is-open")) return;
  if (
    target.closest("#treatments-toggle") ||
    target.closest("#treatments-panel")
  )
    return;
  treatPanel.classList.remove("is-open");
  treatToggle?.setAttribute("aria-expanded", "false");
  treatPlus?.classList.remove("is-rotated");
});

const treatLinks = Array.from(
  document.querySelectorAll(".header-treatments-link"),
);
const treatPreviewItems = Array.from(
  document.querySelectorAll(".header-treatments-preview-item"),
);
treatLinks.forEach((link, i) => {
  link.addEventListener("mouseenter", () => {
    treatLinks.forEach((l, j) => l.classList.toggle("is-active", j === i));
    treatPreviewItems.forEach((item, j) =>
      item.classList.toggle("is-active", j === i),
    );
  });
});

initDrawer({
  panel: document.getElementById("mobile-drawer"),
  openTriggers: [document.getElementById("mobile-menu-toggle")],
  closeTriggers: [document.getElementById("mobile-drawer-close")],
});

// ===== Modal mechanics =====
// Modal open/close behavior for the Modal component. Any element in the page can open a modal with
// `data-modal-open="<id>"`; any element inside the modal (scrim, close button, ...) can close it
// with `data-modal-close`. Escape closes the top-most open modal. Body scroll is locked while any
// modal is open.

const MODAL_OPEN_CLASS = "is-open";
let modalLockCount = 0;

function lockModalScroll() {
  if (modalLockCount === 0) {
    document.body.style.overflow = "hidden";
  }
  modalLockCount++;
}

function unlockModalScroll() {
  modalLockCount = Math.max(0, modalLockCount - 1);
  if (modalLockCount === 0) {
    document.body.style.overflow = "";
  }
}

function getModal(id) {
  return document.querySelector(`[data-modal="${id}"]`);
}

export function isModalOpen(id) {
  return !!getModal(id)?.classList.contains(MODAL_OPEN_CLASS);
}

export function openModal(id) {
  const modal = getModal(id);
  if (!modal || modal.classList.contains(MODAL_OPEN_CLASS)) return;
  modal.classList.add(MODAL_OPEN_CLASS);
  lockModalScroll();
  modal.dispatchEvent(new CustomEvent("modal-open"));
}

export function closeModal(id) {
  const modal = getModal(id);
  if (!modal || !modal.classList.contains(MODAL_OPEN_CLASS)) return;
  modal.classList.remove(MODAL_OPEN_CLASS);
  unlockModalScroll();
  modal.dispatchEvent(new CustomEvent("modal-close"));
}

let modalsInitialized = false;

function initModals() {
  if (modalsInitialized || typeof document === "undefined") return;
  modalsInitialized = true;

  document.addEventListener("click", (e) => {
    const target = e.target;

    const opener = target.closest("[data-modal-open]");
    if (opener) {
      openModal(opener.dataset.modalOpen || "");
      return;
    }

    const closer = target.closest("[data-modal-close]");
    if (closer) {
      const modal = closer.closest("[data-modal]");
      if (modal) closeModal(modal.dataset.modal || "");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const open = document.querySelector(`[data-modal].${MODAL_OPEN_CLASS}`);
    if (open) closeModal(open.dataset.modal || "");
  });
}

// Auto-initialize on page load
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initModals);
  } else {
    initModals();
  }
}

// ===== Animation helpers =====
// Shared UI animation helpers — spinner and step-loader transitions used by quiz and intake.
// Both skip their animation under prefers-reduced-motion, running the callback immediately instead.

/**
 * Shows the shared spin animation on a step-nav button (`.common-nav-next`/`.common-nav-save`)
 * for `duration` ms, then runs `callback`. Reserved for genuine submit actions (Review's "Submit",
 * Done's "Finish") — ordinary "Next" progression uses `withStepLoader` instead.
 */
function runWithSpinner(
  button,
  callback,
  { duration = 1000, reducedMotion = false } = {},
) {
  if (!button || reducedMotion) {
    callback();
    return;
  }

  button.classList.add("is-loading");
  window.setTimeout(() => {
    button.classList.remove("is-loading");
    callback();
  }, duration);
}

/**
 * Hides `currentStepEl`, shows the shared "Loading next question" loader (`CommonStepLoader`) for
 * `duration` ms, then runs `callback` — used between question steps so the next question appears
 * with a brief, consistent transition instead of popping in instantly. Skipped under
 * prefers-reduced-motion, where `callback` runs immediately and the loader never shows.
 */
function withStepLoader(
  loaderEl,
  currentStepEl,
  callback,
  { duration = 550, reducedMotion = false } = {},
) {
  if (!loaderEl || reducedMotion) {
    callback();
    return;
  }

  currentStepEl?.classList.remove("is-active");
  loaderEl.hidden = false;
  window.setTimeout(() => {
    loaderEl.hidden = true;
    callback();
  }, duration);
}

// ===== Shared step-form helpers =====
// Pure state helpers for multi-step forms (quiz, intake) — no DOM access here.

/**
 * Computes the next selection set for a multi-select (checkbox) question when `value` is
 * toggled. Picking an exclusive option (e.g. "None of the above") clears every other
 * selection; picking any non-exclusive option clears whichever exclusive option was set.
 */
function toggleMultiSelection(selected, value, exclusiveValues) {
  const next = new Set(selected);

  if (next.has(value)) {
    next.delete(value);
    return next;
  }

  if (exclusiveValues.has(value)) {
    next.clear();
    next.add(value);
    return next;
  }

  for (const exclusiveValue of exclusiveValues) {
    next.delete(exclusiveValue);
  }
  next.add(value);
  return next;
}

function progressPercent(step, totalSteps) {
  if (step <= 0) return 0;
  if (step > totalSteps) return 100;
  return (step / totalSteps) * 100;
}

// ===== Quiz flow =====
// Multi-step quiz: per-question gating, age/eligibility warning modals, review + results screens.
// No-op unless the page has [data-quiz] markup.

const quizEl = document.querySelector("[data-quiz]");

if (quizEl) {
  // Quiz-specific answer formatters (pure, no DOM access beyond the values passed in).
  function formatChoiceAnswer(label) {
    return label || "Not answered yet";
  }

  function formatDateAnswer(day, month, year) {
    if (!day || !month || !year) return "Not answered yet";
    return `${month}/${day}/${year}`;
  }

  function formatUnitsAnswer(values) {
    const filled = values.filter((value) => value.text);
    if (!filled.length) return "Not answered yet";
    return filled.map((value) => `${value.text} ${value.suffix}`).join(" / ");
  }

  function formatMultiAnswer(labels) {
    if (!labels.length) return "Not answered yet";
    return labels.join(", ");
  }

  const totalQuestions = Number(quizEl.dataset.quizTotal || "0");
  const reviewStep = totalQuestions;
  const doneStep = totalQuestions + 1;

  const steps = Array.from(quizEl.querySelectorAll("[data-quiz-step]")).sort(
    (a, b) => Number(a.dataset.quizStep) - Number(b.dataset.quizStep),
  );
  const stepByIndex = new Map(
    steps.map((el) => [Number(el.dataset.quizStep), el]),
  );

  const progressRow = quizEl.querySelector(".common-progress-bar");
  const progressTrack = quizEl.querySelector(".common-progress-bar-track");
  const progressFill = quizEl.querySelector("[data-progress-fill]");
  const progressCounter = quizEl.querySelector("[data-progress-counter]");
  const backBtn = quizEl.querySelector("[data-progress-back]");
  const navBar = quizEl.querySelector("[data-step-nav]");
  const nextBtn = quizEl.querySelector("[data-step-next]");
  const nextLabelEl = quizEl.querySelector("[data-step-next-label]");
  const saveBtn = quizEl.querySelector("[data-step-save]");
  const stepLoaderEl = quizEl.querySelector("[data-step-loading]");

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  let current = 0;
  let fromReview = false;

  function stepNeedsEligibilityWarning(index) {
    const el = stepByIndex.get(index);
    if (!el || el.dataset.quizType !== "multi") return false;
    if (!el.querySelector('[data-exclusive="true"] .input-checkbox-input'))
      return false;
    return Array.from(
      el.querySelectorAll(".input-checkbox-input:checked"),
    ).some(
      (input) =>
        input.closest("[data-field-option]")?.dataset.exclusive !== "true",
    );
  }

  function stepNeedsAgeWarning(index) {
    const el = stepByIndex.get(index);
    if (!el || el.dataset.quizType !== "date") return false;
    const [day, month, year] = Array.from(el.querySelectorAll("select")).map(
      (s) => s.value,
    );
    if (!day || !month || !year) return false;
    const dob = new Date(Number(year), Number(month) - 1, Number(day));
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const hadBirthdayThisYear =
      today.getMonth() > dob.getMonth() ||
      (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
    if (!hadBirthdayThisYear) age--;
    return age < 18;
  }

  const advanceGates = [
    {
      modalId: "quiz-age-warning-modal",
      test: () => stepNeedsAgeWarning(current),
    },
    {
      modalId: "quiz-eligibility-warning-modal",
      test: () => stepNeedsEligibilityWarning(current),
    },
  ];

  let pendingAdvance = null;

  function advanceOrWarn(advance) {
    const gate = advanceGates.find((g) => g.test());
    if (gate) {
      pendingAdvance = advance;
      openModal(gate.modalId);
      return;
    }
    advance();
  }

  function stepType(index) {
    return stepByIndex.get(index)?.dataset.quizType ?? null;
  }

  function isStepReady(index) {
    const el = stepByIndex.get(index);
    if (!el) return true;
    switch (el.dataset.quizType) {
      case "choice":
        return !!el.querySelector(".input-radio-input:checked");
      case "date":
        return Array.from(el.querySelectorAll("select")).every(
          (select) => select.value !== "",
        );
      case "units":
        return Array.from(el.querySelectorAll(".general-input-field")).every(
          (input) => input.value.trim() !== "",
        );
      case "multi":
        return !!el.querySelector(".input-checkbox-input:checked");
      default:
        return true;
    }
  }

  function allQuestionsReady() {
    for (let i = 0; i < totalQuestions; i++) {
      if (!isStepReady(i)) return false;
    }
    return true;
  }

  function updateProgress() {
    if (current === doneStep) {
      if (progressRow) progressRow.style.display = "none";
      if (progressTrack) progressTrack.style.display = "none";
      return;
    }
    if (progressRow) progressRow.style.display = "";
    if (progressTrack) progressTrack.style.display = "";

    const pct = progressPercent(
      Math.min(current + 1, totalQuestions),
      totalQuestions,
    );
    if (progressFill) progressFill.style.width = `${pct}%`;
    if (backBtn) backBtn.style.visibility = current > 0 ? "visible" : "hidden";
    if (progressCounter) {
      progressCounter.textContent =
        current < totalQuestions ? `${current + 1} of ${totalQuestions}` : "";
    }
  }

  function updateNavBar() {
    const type = stepType(current);

    if (type === "choice" || type === "done") {
      navBar.style.display = "none";
      return;
    }

    navBar.style.display = "";
    navBar.classList.remove("common-nav--framed");
    saveBtn.hidden = true;
    nextBtn.classList.remove("common-nav-next--secondary");

    if (type === "review") {
      nextLabelEl.textContent = "Submit";
      nextBtn.disabled = !allQuestionsReady();
      return;
    }

    // date / units / multi
    nextLabelEl.textContent =
      current === totalQuestions - 1 ? "Review Your Answers" : "Next";
    nextBtn.disabled = !isStepReady(current);

    if (fromReview) {
      saveBtn.hidden = false;
      nextBtn.classList.add("common-nav-next--secondary");
    }
  }

  let hasRenderedOnce = false;

  function showStep(index) {
    steps.forEach((el) => el.classList.remove("is-active"));
    stepByIndex.get(index)?.classList.add("is-active");
    current = index;
    updateProgress();
    updateNavBar();
    if (hasRenderedOnce) {
      window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
    }
    hasRenderedOnce = true;
  }

  function goToStep(index, { fromReview: editing = false } = {}) {
    fromReview = editing;
    showStep(index);
  }

  function advanceWithLoader(showNextStep) {
    withStepLoader(stepLoaderEl, stepByIndex.get(current), showNextStep, {
      reducedMotion,
    });
  }

  function next() {
    if (fromReview) {
      advanceOrWarn(() => goToStep(reviewStep));
      return;
    }
    if (current === reviewStep) {
      buildResults();
      showStep(doneStep);
      return;
    }
    if (current === totalQuestions - 1) {
      advanceOrWarn(() => {
        buildReview();
        advanceWithLoader(() => showStep(reviewStep));
      });
      return;
    }
    advanceOrWarn(() =>
      advanceWithLoader(() => showStep(Math.min(current + 1, doneStep))),
    );
  }

  function back() {
    if (current <= 0) return;
    if (current === reviewStep) {
      showStep(totalQuestions - 1);
      return;
    }
    showStep(Math.max(current - 1, 0));
  }

  function choose(stepIndex) {
    const advance = () => {
      if (fromReview) {
        goToStep(reviewStep);
        return;
      }
      if (stepIndex === totalQuestions - 1) {
        buildReview();
        showStep(reviewStep);
        return;
      }
      showStep(Math.min(stepIndex + 1, doneStep));
    };

    if (fromReview) {
      advance();
      return;
    }

    advanceWithLoader(advance);
  }

  // --- Wire up per-step-type behavior ---

  steps.forEach((el) => {
    const index = Number(el.dataset.quizStep);
    const type = el.dataset.quizType;

    if (type === "choice") {
      el.querySelectorAll(".input-radio-input").forEach((input) => {
        input.addEventListener("change", () => choose(index));
      });
    }

    if (type === "date") {
      el.querySelectorAll("select").forEach((select) => {
        select.addEventListener("change", updateNavBar);
      });
    }

    if (type === "units") {
      el.querySelectorAll(".general-input-field").forEach((input) => {
        input.addEventListener("input", updateNavBar);
      });
    }

    if (type === "multi") {
      const exclusiveValues = new Set(
        Array.from(
          el.querySelectorAll('[data-exclusive="true"] .input-checkbox-input'),
        ).map((input) => input.value),
      );
      el.querySelectorAll(".input-checkbox-input").forEach((input) => {
        input.addEventListener("change", () => {
          const selectedBeforeToggle = new Set(
            Array.from(
              el.querySelectorAll(".input-checkbox-input:checked"),
            ).map((c) => c.value),
          );
          if (input.checked) selectedBeforeToggle.delete(input.value);
          else selectedBeforeToggle.add(input.value);

          const resolved = toggleMultiSelection(
            selectedBeforeToggle,
            input.value,
            exclusiveValues,
          );

          el.querySelectorAll(".input-checkbox-input").forEach((checkbox) => {
            checkbox.checked = resolved.has(checkbox.value);
          });
          updateNavBar();
        });
      });
    }
  });

  backBtn?.addEventListener("click", back);
  nextBtn?.addEventListener("click", () => {
    if (nextBtn.disabled) return;
    // Only the true "Submit" action gets the button spinner — ordinary "Next" clicks use
    // the step loader (advanceWithLoader) instead.
    if (stepType(current) === "review") {
      runWithSpinner(nextBtn, next, { reducedMotion });
    } else {
      next();
    }
  });
  saveBtn?.addEventListener("click", () =>
    advanceOrWarn(() => goToStep(reviewStep)),
  );

  function wireGateModal(modalId) {
    document
      .querySelector(`[data-modal="${modalId}"] [data-warning-confirm]`)
      ?.addEventListener("click", () => {
        const advance = pendingAdvance;
        pendingAdvance = null;
        closeModal(modalId);
        advance?.();
      });
    document
      .querySelector(`[data-modal="${modalId}"]`)
      ?.addEventListener("modal-close", () => {
        pendingAdvance = null;
      });
  }

  advanceGates.forEach((gate) => wireGateModal(gate.modalId));

  // --- Exit confirmation modal ---

  const logoLink = quizEl.querySelector(".common-logo-link");
  logoLink?.addEventListener("click", (e) => {
    if (current === 0 || current === doneStep) return;
    e.preventDefault();
    openModal("quiz-exit-modal");
  });
  document
    .querySelector('[data-modal="quiz-exit-modal"] [data-confirmation-confirm]')
    ?.addEventListener("click", () => {
      closeModal("quiz-exit-modal");
      if (logoLink) window.location.href = logoLink.href;
    });

  // --- Review screen ---

  function readAnswer(index) {
    const el = stepByIndex.get(index);
    if (!el) return "Not answered yet";

    switch (el.dataset.quizType) {
      case "choice": {
        const checked = el.querySelector(".input-radio-input:checked");
        const label = checked
          ?.closest("[data-field-option]")
          ?.querySelector(".input-radio-label");
        return formatChoiceAnswer(label?.textContent?.trim());
      }
      case "date": {
        const [day, month, year] = Array.from(
          el.querySelectorAll("select"),
        ).map((s) => s.value);
        return formatDateAnswer(day, month, year);
      }
      case "units": {
        const values = Array.from(el.querySelectorAll(".general-input")).map(
          (wrap) => ({
            text:
              wrap.querySelector(".general-input-field")?.value?.trim() || "",
            suffix:
              wrap
                .querySelector(".general-input-suffix")
                ?.textContent?.trim() || "",
          }),
        );
        return formatUnitsAnswer(values);
      }
      case "multi": {
        const labels = Array.from(
          el.querySelectorAll(".input-checkbox-input:checked"),
        ).map(
          (input) =>
            input
              .closest("[data-field-option]")
              ?.querySelector(".input-checkbox-label")
              ?.textContent?.trim() || "",
        );
        return formatMultiAnswer(labels);
      }
      default:
        return "Not answered yet";
    }
  }

  function buildReview() {
    const list = quizEl.querySelector("[data-quiz-review-list]");
    if (!list) return;
    list.innerHTML = "";

    for (let i = 0; i < totalQuestions; i++) {
      const question = stepByIndex.get(i)?.dataset.quizQuestion || "";
      const answer = readAnswer(i);
      const isEmpty = answer === "Not answered yet";

      const row = document.createElement("div");
      row.className = "quiz-review-row";
      row.innerHTML = `
				<div class="quiz-review-row-body">
					<span class="quiz-review-row-eyebrow">Question ${i + 1}</span>
					<span class="quiz-review-row-question">${question}</span>
					<span class="quiz-review-row-answer${isEmpty ? " quiz-review-row-answer--empty" : ""}">${answer}</span>
				</div>
				<button type="button" class="quiz-review-row-edit" data-quiz-edit="${i}">Edit</button>
			`;
      list.appendChild(row);
    }

    list.querySelectorAll("[data-quiz-edit]").forEach((btn) => {
      btn.addEventListener("click", () =>
        goToStep(Number(btn.dataset.quizEdit), { fromReview: true }),
      );
    });
  }

  // --- Results screen ---

  function buildResults() {
    const preferenceStepEl = steps.find((el) =>
      el.querySelector('input[name="preference"]'),
    );
    const preference =
      preferenceStepEl?.querySelector(
        '.input-radio-input[name="preference"]:checked',
      )?.value || "semaglutide";
    const preferenceLabel =
      preference === "tirzepatide" ? "Tirzepatide" : "Semaglutide";

    const currentWeight = quizEl
      .querySelector('input[name="weight-current"]')
      ?.value?.trim();
    const goalWeight = quizEl
      .querySelector('input[name="weight-goal"]')
      ?.value?.trim();

    const chipsEl = quizEl.querySelector("[data-quiz-chips]");
    if (chipsEl) {
      const chips = [
        currentWeight && { label: "Current", value: `${currentWeight} lb` },
        goalWeight && { label: "Goal", value: `${goalWeight} lb` },
        { label: "Preference", value: preferenceLabel },
      ].filter(Boolean);

      chipsEl.innerHTML = chips
        .map(
          (chip) =>
            `<span class="quiz-results-chip"><span class="quiz-results-chip-label">${chip.label}</span><span class="quiz-results-chip-value">${chip.value}</span></span>`,
        )
        .join("");
    }

    const cards = Array.from(quizEl.querySelectorAll("[data-quiz-rec]"));
    const matching = cards.filter((card) => card.dataset.family === preference);
    const other = cards.filter((card) => card.dataset.family !== preference);
    const shown = [matching[0], matching[1], other[0]].filter(Boolean);

    cards.forEach((card) => {
      card.style.display = shown.includes(card) ? "" : "none";
    });
    shown.forEach((card, i) => {
      const badge = card.querySelector("[data-quiz-badge]");
      if (!badge) return;
      badge.textContent = i === 0 ? "Best match" : "Also suitable";
      badge.classList.toggle("quiz-results-card-badge--best", i === 0);
    });
  }

  // --- Program selection modal (results screen "Buy Now") ---

  const PROGRAM_MODAL_ID = "quiz-program-modal";
  const programNameEl = document.querySelector(
    `[data-modal="${PROGRAM_MODAL_ID}"] [data-quiz-program-name]`,
  );
  const programOptionsEl = document.querySelector(
    `[data-modal="${PROGRAM_MODAL_ID}"] [data-quiz-program-options]`,
  );
  const programConfirmBtn = document.querySelector(
    `[data-modal="${PROGRAM_MODAL_ID}"] [data-quiz-program-confirm]`,
  );

  let programMonths = 1;

  function renderProgramOptions(basePrice) {
    if (!programOptionsEl) return;

    programOptionsEl.innerHTML = [1, 2]
      .map((months) => {
        const checked = months === programMonths;
        const title = `${months} Month Program`;
        const note =
          months === 1
            ? "Single shipment, cancel anytime"
            : "Two shipments, best value";
        const price = `$${(basePrice * months).toFixed(2)}`;

        return `
          <label class="quiz-program-modal-option" data-field-option>
            <input
              class="input-radio-input"
              type="radio"
              name="quiz-program"
              value="${months}"
              ${checked ? "checked" : ""}
            />
            <span class="input-radio-dot"></span>
            <span class="quiz-program-modal-option-body">
              <span class="input-radio-label">${title}</span>
              <span class="quiz-program-modal-option-note">${note}</span>
            </span>
            <span class="quiz-program-modal-option-price">${price}</span>
          </label>
        `;
      })
      .join("");

    programOptionsEl
      .querySelectorAll('input[name="quiz-program"]')
      .forEach((input) => {
        input.addEventListener("change", () => {
          programMonths = Number(input.value);
        });
      });
  }

  quizEl.querySelectorAll("[data-quiz-buy-name]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const name = btn.dataset.quizBuyName || "";
      const basePrice =
        parseFloat((btn.dataset.quizBuyPrice || "").replace(/[^0-9.]/g, "")) ||
        0;

      programMonths = 1;
      if (programNameEl) programNameEl.textContent = name;
      renderProgramOptions(basePrice);
    });
  });

  programConfirmBtn?.addEventListener("click", () => {
    closeModal(PROGRAM_MODAL_ID);
    window.location.href = "cart.html";
  });

  showStep(0);
}

// ===== Intake flow =====
// Multi-step health intake form: conditional follow-ups, review + submit/finish sequence.
// No-op unless the page has [data-intake] markup.

const intakeEl = document.querySelector("[data-intake]");

if (intakeEl) {
  // Intake-specific answer formatters (pure, no DOM access beyond the values passed in).

  // Exclusive picks that clear every other selection in a multi-select question (and vice versa).
  const INTAKE_EXCLUSIVE_LABELS = new Set(["None", "No known allergies"]);

  function exclusiveValuesFor(options) {
    return new Set(
      options.filter((label) => INTAKE_EXCLUSIVE_LABELS.has(label)),
    );
  }

  function formatSingleAnswer(value) {
    if (value === undefined || value === null) return "Not answered yet";
    if (typeof value === "object")
      return String(value.other || "").trim() || "Not answered yet";
    return String(value).trim() ? String(value) : "Not answered yet";
  }

  function formatMultiAnswer(picks, otherText) {
    const parts = picks.filter((label) => label !== "Others");
    const other = String(otherText || "").trim();
    if (other) parts.push(other);
    return parts.length ? parts.join(", ") : "Not answered yet";
  }

  function formatUnitsAnswer(groups) {
    const parts = [];
    groups.forEach((group) => {
      const filled = group.values.filter(
        (value) => String(value.text || "").trim() !== "",
      );
      if (filled.length) {
        parts.push(
          `${group.label}: ${filled.map((value) => value.text).join(" / ")} ${filled[0].suffix}`,
        );
      }
    });
    return parts.length ? parts.join(" · ") : "Not answered yet";
  }

  const totalQuestions = Number(intakeEl.dataset.intakeTotal || "0");
  const reviewStep = totalQuestions + 1;
  const doneStep = totalQuestions + 2;

  const steps = Array.from(
    intakeEl.querySelectorAll("[data-intake-step]"),
  ).sort((a, b) => Number(a.dataset.intakeStep) - Number(b.dataset.intakeStep));
  const stepByIndex = new Map(
    steps.map((el) => [Number(el.dataset.intakeStep), el]),
  );

  const progressRow = document.querySelector(".common-progress-bar");
  const progressTrack = document.querySelector(".common-progress-bar-track");
  const progressFill = document.querySelector("[data-progress-fill]");
  const progressCounter = document.querySelector("[data-progress-counter]");
  const backBtn = document.querySelector("[data-progress-back]");
  const navBar = document.querySelector("[data-step-nav]");
  const nextBtn = document.querySelector("[data-step-next]");
  const nextLabelEl = document.querySelector("[data-step-next-label]");
  const saveBtn = document.querySelector("[data-step-save]");
  const loadingEl = document.querySelector("[data-intake-loading]");
  const placedEl = document.querySelector("[data-intake-placed]");
  const stepLoaderEl = document.querySelector("[data-step-loading]");

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  let current = 0;
  let fromReview = false;

  function stepType(index) {
    return stepByIndex.get(index)?.dataset.intakeType ?? null;
  }

  function othersChecked(el) {
    return Array.from(
      el.querySelectorAll(
        ".input-radio-input:checked, .input-checkbox-input:checked",
      ),
    ).some((input) => input.value === "Others");
  }

  function otherText(el) {
    return el.querySelector(".general-textarea")?.value?.trim() || "";
  }

  function isStepReady(index) {
    const el = stepByIndex.get(index);
    if (!el) return true;

    switch (el.dataset.intakeType) {
      case "units":
        return Array.from(el.querySelectorAll(".general-input-field")).every(
          (input) => input.value.trim() !== "",
        );
      case "multi": {
        const checked = el.querySelectorAll(".input-checkbox-input:checked");
        if (!checked.length) return false;
        return !othersChecked(el) || otherText(el) !== "";
      }
      case "choice": {
        const checked = el.querySelector(".input-radio-input:checked");
        if (!checked) return false;
        return checked.value !== "Others" || otherText(el) !== "";
      }
      default:
        return true;
    }
  }

  function allQuestionsReady() {
    for (let i = 1; i <= totalQuestions; i++) {
      if (!isStepReady(i)) return false;
    }
    return true;
  }

  function updateCondAndOther(el) {
    const checkedValues = Array.from(
      el.querySelectorAll(
        ".input-radio-input:checked, .input-checkbox-input:checked",
      ),
    ).map((input) => input.value);

    const condEl = el.querySelector(".intake-question-cond");
    if (condEl) condEl.hidden = !checkedValues.includes(condEl.dataset.cond);

    const otherWrap = el.querySelector(".intake-question-other");
    if (otherWrap) otherWrap.hidden = !checkedValues.includes("Others");
  }

  function updateOtherCount(el) {
    const textarea = el.querySelector(".general-textarea");
    const counter = el.querySelector("[data-other-count]");
    if (!textarea || !counter) return;
    const max = Number(textarea.getAttribute("maxlength") || "300");
    counter.textContent = `${textarea.value.length}/${max} characters`;
  }

  function updateProgress() {
    if (current === 0 || current === doneStep) {
      if (progressRow) progressRow.style.display = "none";
      if (progressTrack) progressTrack.style.display = "none";
      return;
    }
    if (progressRow) progressRow.style.display = "";
    if (progressTrack) progressTrack.style.display = "";

    const pct = progressPercent(
      Math.min(current, totalQuestions),
      totalQuestions,
    );
    if (progressFill) progressFill.style.width = `${pct}%`;
    if (backBtn) backBtn.style.visibility = current > 0 ? "visible" : "hidden";
    if (progressCounter) {
      progressCounter.textContent =
        current <= totalQuestions ? `${current} of ${totalQuestions}` : "";
    }
  }

  function updateNavBar() {
    const type = stepType(current);
    const el = stepByIndex.get(current);

    if (type === "choice" && !fromReview && !(el && othersChecked(el))) {
      navBar.style.display = "none";
      return;
    }

    navBar.style.display = "";
    navBar.classList.toggle(
      "common-nav--framed",
      type === "intro" || type === "done",
    );
    saveBtn.hidden = true;
    nextBtn.classList.remove("common-nav-next--secondary");

    if (type === "intro") {
      nextLabelEl.textContent = "Complete Health Assessment";
      nextBtn.disabled = false;
      return;
    }

    if (type === "done") {
      nextLabelEl.textContent = "Finish";
      nextBtn.disabled = false;
      return;
    }

    if (type === "review") {
      nextLabelEl.textContent = "Submit";
      nextBtn.disabled = !allQuestionsReady();
      return;
    }

    // choice (only reachable here when fromReview) / units / multi
    nextLabelEl.textContent =
      current === totalQuestions ? "Review Your Answers" : "Next";
    nextBtn.disabled = !isStepReady(current);

    if (fromReview) {
      saveBtn.hidden = false;
      nextBtn.classList.add("common-nav-next--secondary");
    }
  }

  let hasRenderedOnce = false;

  function showStep(index) {
    steps.forEach((el) => el.classList.remove("is-active"));
    stepByIndex.get(index)?.classList.add("is-active");
    current = index;
    updateProgress();
    updateNavBar();
    if (hasRenderedOnce) {
      window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
    }
    hasRenderedOnce = true;
  }

  function goToStep(index, { fromReview: editing = false } = {}) {
    fromReview = editing;
    showStep(index);
  }

  function advanceWithLoader(showNextStep) {
    withStepLoader(stepLoaderEl, stepByIndex.get(current), showNextStep, {
      reducedMotion,
    });
  }

  function next() {
    if (fromReview) {
      goToStep(reviewStep);
      return;
    }
    if (current === reviewStep) {
      showStep(doneStep);
      return;
    }
    if (current === totalQuestions) {
      buildReview();
      advanceWithLoader(() => showStep(reviewStep));
      return;
    }
    advanceWithLoader(() => showStep(Math.min(current + 1, doneStep)));
  }

  function back() {
    if (current <= 0) return;
    if (current === reviewStep) {
      showStep(totalQuestions);
      return;
    }
    showStep(Math.max(current - 1, 0));
  }

  function choose(stepIndex) {
    const advance = () => {
      if (fromReview) {
        goToStep(reviewStep);
        return;
      }
      if (stepIndex === totalQuestions) {
        buildReview();
        showStep(reviewStep);
        return;
      }
      showStep(Math.min(stepIndex + 1, doneStep));
    };

    if (fromReview) {
      advance();
      return;
    }

    advanceWithLoader(advance);
  }

  // --- Wire up per-step-type behavior ---

  steps.forEach((el) => {
    const index = Number(el.dataset.intakeStep);
    const type = el.dataset.intakeType;

    if (type === "choice") {
      el.querySelectorAll(".input-radio-input").forEach((input) => {
        input.addEventListener("change", () => {
          updateCondAndOther(el);
          if (input.value === "Others") {
            updateNavBar();
            return;
          }
          if (fromReview) {
            updateNavBar();
            return;
          }
          choose(index);
        });
      });
    }

    if (type === "units") {
      el.querySelectorAll(".general-input-field").forEach((input) => {
        input.addEventListener("input", updateNavBar);
      });
    }

    if (type === "multi") {
      const options = Array.from(
        el.querySelectorAll("[data-field-option] .input-checkbox-input"),
      );
      const optionLabels = options.map((input) => input.value);
      const exclusiveValues = exclusiveValuesFor(optionLabels);

      options.forEach((input) => {
        input.addEventListener("change", () => {
          const selectedBeforeToggle = new Set(
            Array.from(
              el.querySelectorAll(".input-checkbox-input:checked"),
            ).map((c) => c.value),
          );
          if (input.checked) selectedBeforeToggle.delete(input.value);
          else selectedBeforeToggle.add(input.value);

          const resolved = toggleMultiSelection(
            selectedBeforeToggle,
            input.value,
            exclusiveValues,
          );

          options.forEach((checkbox) => {
            checkbox.checked = resolved.has(checkbox.value);
          });
          updateCondAndOther(el);
          updateNavBar();
        });
      });
    }

    const textarea = el.querySelector(".general-textarea");
    textarea?.addEventListener("input", () => {
      updateOtherCount(el);
      updateNavBar();
    });
  });

  backBtn?.addEventListener("click", back);
  saveBtn?.addEventListener("click", () => goToStep(reviewStep));

  // --- Review screen ---

  function readAnswer(index) {
    const el = stepByIndex.get(index);
    if (!el) return "Not answered yet";

    switch (el.dataset.intakeType) {
      case "units": {
        const groups = Array.from(
          el.querySelectorAll(".intake-units-group"),
        ).map((group) => ({
          label:
            group
              .querySelector(".intake-units-group-label")
              ?.textContent?.trim() || "",
          values: Array.from(group.querySelectorAll(".general-input")).map(
            (wrap) => ({
              text:
                wrap.querySelector(".general-input-field")?.value?.trim() || "",
              suffix:
                wrap
                  .querySelector(".general-input-suffix")
                  ?.textContent?.trim() || "",
            }),
          ),
        }));
        return formatUnitsAnswer(groups);
      }
      case "multi": {
        const picks = Array.from(
          el.querySelectorAll(".input-checkbox-input:checked"),
        ).map(
          (input) =>
            input
              .closest("[data-field-option]")
              ?.querySelector(".input-checkbox-label")
              ?.textContent?.trim() || "",
        );
        return formatMultiAnswer(picks, otherText(el));
      }
      case "choice": {
        const checked = el.querySelector(".input-radio-input:checked");
        const label = checked
          ?.closest("[data-field-option]")
          ?.querySelector(".input-radio-label")
          ?.textContent?.trim();
        if (label === "Others")
          return formatSingleAnswer({ other: otherText(el) });
        return formatSingleAnswer(label);
      }
      default:
        return "Not answered yet";
    }
  }

  function buildReview() {
    const list = document.querySelector("[data-intake-review-list]");
    if (!list) return;
    list.innerHTML = "";

    for (let i = 1; i <= totalQuestions; i++) {
      const question = stepByIndex.get(i)?.dataset.intakeQuestion || "";
      const answer = readAnswer(i);
      const isEmpty = answer === "Not answered yet";

      const row = document.createElement("div");
      row.className = "intake-review-row";
      row.innerHTML = `
				<div class="intake-review-row-body">
					<span class="intake-review-row-eyebrow">Question ${i}</span>
					<span class="intake-review-row-question">${question}</span>
					<span class="intake-review-row-answer${isEmpty ? " intake-review-row-answer--empty" : ""}">${answer}</span>
				</div>
				<button type="button" class="intake-review-row-edit" data-intake-edit="${i}">Edit</button>
			`;
      list.appendChild(row);
    }

    list.querySelectorAll("[data-intake-edit]").forEach((btn) => {
      btn.addEventListener("click", () =>
        goToStep(Number(btn.dataset.intakeEdit), { fromReview: true }),
      );
    });
  }

  // --- Done: loading -> order-placed sequence ---

  function finish() {
    if (loadingEl) loadingEl.hidden = false;
    window.setTimeout(() => {
      if (loadingEl) loadingEl.hidden = true;
      if (placedEl) placedEl.hidden = false;
    }, 1500);
  }

  // The "Finish" button on the done step reuses the shared Next button. Only these true
  // submit-type actions (Submit, Finish) get the button spinner — ordinary "Next" clicks use
  // the step loader (advanceWithLoader) instead.
  nextBtn?.addEventListener("click", () => {
    if (nextBtn.disabled) return;
    const type = stepType(current);
    if (type === "done") {
      runWithSpinner(nextBtn, finish, { reducedMotion });
    } else if (type === "review") {
      runWithSpinner(nextBtn, next, { reducedMotion });
    } else {
      next();
    }
  });

  showStep(0);
}

// ===== Auth forms: Login, Register, Forgot Password, Reset Password =====
// Shared validation and form state management

// ===== Login Form =====
function initLoginForm() {
  const form = document.querySelector(".login-card");
  if (!form) return;

  const errorEl = document.querySelector("[data-error]");
  const submitBtn = document.querySelector("[data-submit]");
  const emailInput = document.querySelector('[data-field="email"]');
  const passwordInput = document.querySelector('[data-field="password"]');
  const rememberToggle = document.querySelector("[data-remember]");
  const passwordToggle = document.querySelector("[data-password-toggle]");

  function clearError() {
    if (!errorEl) return;
    errorEl.classList.add("is-hidden");
    errorEl.textContent = "";
    emailInput?.classList.remove("login-input--error");
    passwordInput?.classList.remove("login-input--error");
  }

  function showError(message) {
    if (!errorEl) return;
    errorEl.textContent = message;
    errorEl.classList.remove("is-hidden");
    emailInput?.classList.add("login-input--error");
    passwordInput?.classList.add("login-input--error");
  }

  function updateSubmitState() {
    const ready = !!emailInput?.value.trim() && !!passwordInput?.value.trim();
    submitBtn?.classList.toggle("is-enabled", ready);
  }

  form?.addEventListener("input", () => {
    clearError();
    updateSubmitState();
  });

  rememberToggle?.addEventListener("click", () => {
    rememberToggle.classList.toggle("is-checked");
  });

  let revealed = false;
  passwordToggle?.addEventListener("click", () => {
    revealed = !revealed;
    if (passwordInput) passwordInput.type = revealed ? "text" : "password";
  });

  submitBtn?.addEventListener("click", () => {
    if (!submitBtn.classList.contains("is-enabled")) return;
    const email = emailInput?.value.trim() || "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError("Enter a valid email address.");
      return;
    }
    clearError();
  });

  updateSubmitState();
}

// ===== Register Form =====
function initRegisterForm() {
  const form = document.querySelector(".register-card");
  if (!form) return;

  const errorEl = document.querySelector("[data-error]");
  const submitBtn = document.querySelector("[data-submit]");
  const emailInput = document.querySelector('[data-field="email"]');
  const firstInput = document.querySelector('[data-field="first"]');
  const lastInput = document.querySelector('[data-field="last"]');
  const passwordInput = document.querySelector('[data-field="password"]');
  const confirmInput = document.querySelector('[data-field="confirm"]');

  function clearError() {
    if (!errorEl) return;
    errorEl.classList.add("is-hidden");
    errorEl.textContent = "";
    document.querySelectorAll(".register-input--error").forEach((el) => {
      el.classList.remove("register-input--error");
    });
  }

  function showError(message, ...fields) {
    if (!errorEl) return;
    errorEl.textContent = message;
    errorEl.classList.remove("is-hidden");
    fields.forEach((el) => el?.classList.add("register-input--error"));
  }

  function updateSubmitState() {
    const filled =
      !!emailInput?.value.trim() &&
      !!firstInput?.value.trim() &&
      !!lastInput?.value.trim() &&
      !!passwordInput?.value &&
      !!confirmInput?.value;
    submitBtn?.classList.toggle("is-enabled", filled);
  }

  form?.addEventListener("input", () => {
    clearError();
    updateSubmitState();
  });

  document.querySelectorAll(".register-select").forEach((select) => {
    select.addEventListener("change", () => {
      select.classList.toggle("register-select--filled", !!select.value);
    });
  });

  document.querySelectorAll("[data-gender]").forEach((option) => {
    option.addEventListener("click", () => {
      document.querySelectorAll("[data-gender]").forEach((el) => {
        el.classList.toggle("is-active", el === option);
      });
    });
  });

  let revealed = false;
  document.querySelectorAll("[data-password-toggle]").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      revealed = !revealed;
      const type = revealed ? "text" : "password";
      if (passwordInput) passwordInput.type = type;
      if (confirmInput) confirmInput.type = type;
    });
  });

  submitBtn?.addEventListener("click", () => {
    if (!submitBtn.classList.contains("is-enabled")) return;

    const email = emailInput?.value.trim() || "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError("Enter a valid email address.", emailInput);
      return;
    }
    const password = passwordInput?.value || "";
    const confirm = confirmInput?.value || "";
    if (password.length < 8) {
      showError("Password must be at least 8 characters.", passwordInput);
      return;
    }
    if (password !== confirm) {
      showError("Passwords do not match.", passwordInput, confirmInput);
      return;
    }

    clearError();
  });

  updateSubmitState();
}

// ===== Forgot Password Form =====
function initForgotPasswordForm() {
  const form = document.querySelector(".forgot-card");
  if (!form) return;

  const errorEl = document.querySelector("[data-error]");
  const submitBtn = document.querySelector("[data-submit]");
  const emailInput = document.querySelector('[data-field="email"]');

  function clearError() {
    if (!errorEl) return;
    errorEl.classList.add("is-hidden");
    errorEl.textContent = "";
    emailInput?.classList.remove("forgot-input--error");
  }

  function showError(message) {
    if (!errorEl) return;
    errorEl.textContent = message;
    errorEl.classList.remove("is-hidden");
    emailInput?.classList.add("forgot-input--error");
  }

  function updateSubmitState() {
    const ready = !!emailInput?.value.trim();
    submitBtn?.classList.toggle("is-enabled", ready);
  }

  form?.addEventListener("input", () => {
    clearError();
    updateSubmitState();
  });

  submitBtn?.addEventListener("click", () => {
    if (!submitBtn.classList.contains("is-enabled")) return;
    const email = emailInput?.value.trim() || "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError("Enter a valid email address.");
      return;
    }
    clearError();
  });

  updateSubmitState();
}

// ===== Reset Password Form =====
function initResetPasswordForm() {
  const formState = document.querySelector(
    '[data-reset-password-state="form"]',
  );
  if (!formState) return;

  const doneState = document.querySelector(
    '[data-reset-password-state="done"]',
  );
  const errorEl = document.querySelector("[data-error]");
  const submitBtn = document.querySelector("[data-submit]");
  const submitLabel = document.querySelector("[data-submit-label]");
  const passwordInput = document.querySelector('[data-field="password"]');
  const confirmInput = document.querySelector('[data-field="confirm"]');
  const lengthRule = document.querySelector('[data-requirement="length"]');
  const mixRule = document.querySelector('[data-requirement="mix"]');

  function checks() {
    const password = passwordInput?.value ?? "";
    const confirm = confirmInput?.value ?? "";
    const long = password.length >= 8;
    const mixed = /[A-Za-z]/.test(password) && /[0-9]/.test(password);
    return { password, confirm, long, mixed };
  }

  function clearError() {
    if (!errorEl) return;
    errorEl.classList.add("is-hidden");
    errorEl.textContent = "";
    passwordInput?.classList.remove("reset-password-input--error");
    confirmInput?.classList.remove("reset-password-input--error");
  }

  function showError(message, ...fields) {
    if (!errorEl) return;
    errorEl.textContent = message;
    errorEl.classList.remove("is-hidden");
    fields.forEach((el) => el?.classList.add("reset-password-input--error"));
  }

  function updateState() {
    const { password, confirm, long, mixed } = checks();
    lengthRule?.classList.toggle("reset-password-requirement--met", long);
    mixRule?.classList.toggle("reset-password-requirement--met", mixed);
    submitBtn?.classList.toggle("is-enabled", !!password && !!confirm);
  }

  [passwordInput, confirmInput].forEach((input) => {
    input?.addEventListener("input", () => {
      clearError();
      updateState();
    });
  });

  document.querySelectorAll("[data-password-toggle]").forEach((toggle) => {
    let revealed = false;
    toggle.addEventListener("click", () => {
      revealed = !revealed;
      const field = toggle.dataset.passwordToggle;
      const input = field === "confirm" ? confirmInput : passwordInput;
      if (input) input.type = revealed ? "text" : "password";
    });
  });

  submitBtn?.addEventListener("click", () => {
    if (submitBtn.dataset.busy) return;
    const { password, confirm, long, mixed } = checks();

    if (!password || !confirm) {
      showError(
        "Please fill in both password fields.",
        passwordInput,
        confirmInput,
      );
      return;
    }
    if (!long || !mixed) {
      showError(
        "Password must be at least 8 characters and include letters and numbers.",
        passwordInput,
      );
      return;
    }
    if (password !== confirm) {
      showError("Passwords do not match.", passwordInput, confirmInput);
      return;
    }

    clearError();
    submitBtn.dataset.busy = "true";
    if (submitLabel) submitLabel.textContent = "Resetting…";

    window.setTimeout(() => {
      formState.classList.add("is-hidden");
      doneState?.classList.remove("is-hidden");
    }, 600);
  });

  updateState();
}

// Initialize forms on page load
document.addEventListener("DOMContentLoaded", () => {
  initLoginForm();
  initRegisterForm();
  initForgotPasswordForm();
  initResetPasswordForm();
});

// ===== Notification Toast helpers =====
// Shared show/hide for pill-style notification toasts (`.notification-toast`): fades a toast in
// from the top-center of the page, then auto-dismisses it. Close buttons dismiss immediately.
// Used by the homepage's toast showcase below and by the cart shipping drawer's "Added to cart"
// confirmation (see Shipping Drawer Handler).

const TOAST_AUTO_DISMISS_MS = 3200;

function showToast(toast) {
  if (!toast) return;
  window.clearTimeout(Number(toast.dataset.dismissTimer));
  toast.classList.add("is-visible");
  toast.dataset.dismissTimer = String(
    window.setTimeout(() => hideToast(toast), TOAST_AUTO_DISMISS_MS),
  );
}

function hideToast(toast) {
  if (!toast) return;
  window.clearTimeout(Number(toast.dataset.dismissTimer));
  toast.classList.remove("is-visible");
}

document.querySelectorAll(".notification-toast").forEach((toast) => {
  toast
    .querySelector('[data-bs-dismiss="toast"]')
    ?.addEventListener("click", () => hideToast(toast));
});

// ===== Shipping Drawer Handler =====
// Handles the "Add to cart" buttons that open the shared shipping/lab-consent drawer (see
// ShippingDrawer.astro, mounted on the Testosterone category page and the cart page): pick a
// shipping option, then "I Agree" closes the drawer, bumps the header cart badge, and shows the
// "Added to cart" toast.

const drawerPanel = document.querySelector("[data-cart-drawer]");
if (drawerPanel) {
  const drawerNameEl = document.querySelector("[data-cart-drawer-name]");
  const drawerAgreeBtn = document.querySelector("[data-cart-drawer-agree]");
  const shipOptionEls = document.querySelectorAll("[data-cart-ship-option]");
  const cartToast = document.querySelector("[data-cart-toast]");
  const cartBadges = document.querySelectorAll(".header-cart-badge");
  let pendingShip = "Regular";
  let pendingProduct = null;

  const { open: openDrawer, close: closeDrawer } = initDrawer({
    panel: drawerPanel,
    closeTriggers: Array.from(
      document.querySelectorAll("[data-cart-drawer-close]"),
    ),
    closeDelay: 400,
  });

  // Update drawer options UI
  function updateDrawerOptions() {
    shipOptionEls.forEach((opt) => {
      const active = opt.dataset.cartShipOption === pendingShip;
      opt.classList.toggle("drawer-option--active", active);
      const dot = opt.querySelector("[data-cart-option-dot]");
      if (dot) dot.textContent = active ? "✓" : "";
    });
  }

  // Handle shipping option selection
  shipOptionEls.forEach((opt) => {
    opt.addEventListener("click", () => {
      pendingShip = opt.dataset.cartShipOption;
      updateDrawerOptions();
    });
  });

  // Handle "Add to cart" button clicks - open drawer
  document.querySelectorAll("[data-cart-add]").forEach((btn) => {
    btn.addEventListener("click", () => {
      pendingProduct = {
        name: btn.dataset.cartName || "Product",
        unit: parseFloat(btn.dataset.cartUnit || "0"),
      };
      pendingShip = "Regular";
      updateDrawerOptions();
      if (drawerNameEl) drawerNameEl.textContent = pendingProduct.name;
      openDrawer();
    });
  });

  // Handle "I Agree" - confirm the add, close the drawer, and surface feedback
  drawerAgreeBtn?.addEventListener("click", () => {
    if (!pendingProduct) return;
    closeDrawer();
    cartBadges.forEach((badge) => {
      badge.textContent = String((parseInt(badge.textContent, 10) || 0) + 1);
      badge.classList.remove("is-hidden");
    });
    showToast(cartToast);
    pendingProduct = null;
  });
}

// ===== Notification Toast Demo =====
// Wires the "Show Toast" demo button (Toast component) to stagger-fade in every notification
// toast on the page.

const toastShowAllBtn = document.getElementById("showAllToasts");
const notificationToasts = Array.from(
  document.querySelectorAll(".toast-region .toast"),
);

if (toastShowAllBtn && notificationToasts.length) {
  const TOAST_STAGGER_MS = 120;

  toastShowAllBtn.addEventListener("click", () => {
    notificationToasts.forEach((toast, index) => {
      window.setTimeout(() => showToast(toast), index * TOAST_STAGGER_MS);
    });
  });
}

// ===== FAQ Accordion =====
// Single-open accordion for the FaqSection component (`.faq-item`): expanding a question slides
// its answer open and swaps the icon from + to −; expanding another question closes whichever
// one was previously open. Slide animation uses an explicit pixel height (rather than CSS
// `height: auto`, which can't be transitioned) computed from the panel's scrollHeight.
//
// Delegated on `document` rather than queried/attached once at script-load time: the FAQ
// section lives inside an Oqtane Module that Blazor mounts asynchronously, after this theme
// script has already run. A one-time `querySelectorAll('.faq-item')` would find nothing (or
// go stale if Blazor re-renders the module later), so the trigger/panel/icon are all looked
// up from the event target at click time instead.

function closeFaqItem(item) {
  const trigger = item.querySelector("[data-faq-trigger]");
  const panel = item.querySelector("[data-faq-panel]");
  if (!panel) return;

  panel.style.height = panel.scrollHeight + "px";
  void panel.offsetHeight;
  panel.style.height = "0px";
  item.classList.remove("is-open");
  trigger?.setAttribute("aria-expanded", "false");
}

function openFaqItem(item) {
  const trigger = item.querySelector("[data-faq-trigger]");
  const panel = item.querySelector("[data-faq-panel]");
  if (!panel) return;

  item.classList.add("is-open");
  trigger?.setAttribute("aria-expanded", "true");
  panel.style.height = panel.scrollHeight + "px";
}

document.addEventListener("click", (e) => {
  const trigger = e.target.closest && e.target.closest("[data-faq-trigger]");
  if (!trigger) return;

  const item = trigger.closest(".faq-item");
  if (!item) return;

  const isOpen = item.classList.contains("is-open");

  // Only close other items within the same accordion instance, so multiple
  // independent FAQ sections on one page don't interfere with each other.
  const scope = item.closest("#faq-list") || item.parentElement || document;
  scope.querySelectorAll(".faq-item").forEach((other) => {
    if (other !== item && other.classList.contains("is-open")) {
      closeFaqItem(other);
    }
  });

  if (isOpen) {
    closeFaqItem(item);
  } else {
    openFaqItem(item);
  }
});

// transitionend bubbles, so this single listener catches every panel once its
// open-slide animation finishes, regardless of when that panel was added to the DOM.
document.addEventListener("transitionend", (e) => {
  if (e.propertyName !== "height") return;

  const panel = e.target.closest && e.target.closest("[data-faq-panel]");
  if (!panel) return;

  const item = panel.closest(".faq-item");
  if (!item || !item.classList.contains("is-open")) return;

  panel.style.height = "auto";
});

// ===== State Select Dropdown =====
// Custom searchable dropdown for the StateSelectDropdown component (`[data-state-select]`).
// Each instance is wired independently so a page can host more than one (e.g. billing +
// shipping state pickers). Clicking outside any open instance closes it.

const stateSelectEls = Array.from(
  document.querySelectorAll("[data-state-select]"),
);

if (stateSelectEls.length) {
  const openStateSelects = new Set();

  function closeStateSelect(root) {
    const panel = root.querySelector("[data-state-select-panel]");
    const trigger = root.querySelector("[data-state-select-trigger]");
    const search = root.querySelector("[data-state-select-search]");
    root.classList.remove("is-open");
    trigger?.setAttribute("aria-expanded", "false");
    if (panel) panel.hidden = true;
    if (search) search.value = "";
    root.querySelectorAll("[data-state-select-option]").forEach((opt) => {
      opt.hidden = false;
    });
    const emptyEl = root.querySelector("[data-state-select-empty]");
    if (emptyEl) emptyEl.hidden = true;
    openStateSelects.delete(root);
  }

  function openStateSelect(root) {
    openStateSelects.forEach((openRoot) => {
      if (openRoot !== root) closeStateSelect(openRoot);
    });
    const panel = root.querySelector("[data-state-select-panel]");
    const trigger = root.querySelector("[data-state-select-trigger]");
    root.classList.add("is-open");
    trigger?.setAttribute("aria-expanded", "true");
    if (panel) panel.hidden = false;
    openStateSelects.add(root);
    root.querySelector("[data-state-select-search]")?.focus();
  }

  stateSelectEls.forEach((root) => {
    const trigger = root.querySelector("[data-state-select-trigger]");
    const valueEl = root.querySelector("[data-state-select-value]");
    const hiddenInput = root.querySelector("[data-state-select-input]");
    const search = root.querySelector("[data-state-select-search]");
    const options = Array.from(
      root.querySelectorAll("[data-state-select-option]"),
    );
    const emptyEl = root.querySelector("[data-state-select-empty]");
    const placeholder = valueEl?.textContent || "Select State";

    trigger?.addEventListener("click", () => {
      if (root.classList.contains("is-open")) {
        closeStateSelect(root);
      } else {
        openStateSelect(root);
      }
    });

    function selectOption(option) {
      options.forEach((opt) => opt.classList.remove("is-selected"));
      options.forEach((opt) => opt.setAttribute("aria-selected", "false"));
      option.classList.add("is-selected");
      option.setAttribute("aria-selected", "true");
      if (hiddenInput) hiddenInput.value = option.dataset.value || "";
      if (valueEl) {
        valueEl.textContent = option.dataset.label || placeholder;
        valueEl.classList.add("state-select-value--filled");
      }
      hiddenInput?.dispatchEvent(new Event("change", { bubbles: true }));
      closeStateSelect(root);
      trigger?.focus();
    }

    options.forEach((option) => {
      option.addEventListener("click", () => selectOption(option));
    });

    search?.addEventListener("input", () => {
      const query = search.value.trim().toLowerCase();
      let visibleCount = 0;
      options.forEach((option) => {
        const matches = (option.dataset.label || "")
          .toLowerCase()
          .includes(query);
        option.hidden = !matches;
        if (matches) visibleCount++;
      });
      if (emptyEl) emptyEl.hidden = visibleCount !== 0;
    });
  });

  document.addEventListener("click", (e) => {
    const target = e.target;
    openStateSelects.forEach((root) => {
      if (!root.contains(target)) closeStateSelect(root);
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    openStateSelects.forEach((root) => closeStateSelect(root));
  });
}

// ===== Homepage scroll/parallax effects (jQuery) =====
// A small set of tasteful, scroll-linked effects for the redesigned homepage: reveal-on-scroll,
// a hero/CTA parallax drift, the "CARE, MADE PERSONAL" word-by-word color reveal, and simple
// horizontal-rail arrow controls. Every block below guards itself on its own markup (same
// convention as the rest of this file) so it's a no-op on any page without that markup, and
// every effect degrades to "just show the content" if JS doesn't run — see the CSS in
// _animations.scss for the `.reveal-pending` fallback contract.
const reducedMotionQuery =
  typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : { matches: false };

// --- Generic reveal-on-scroll: [data-reveal], optionally staggered by [data-reveal-delay] ---

const $revealEls = $("[data-reveal]");
if ($revealEls.length && "IntersectionObserver" in window) {
  $revealEls.addClass("reveal-pending");

  if (reducedMotionQuery.matches) {
    $revealEls.addClass("is-in");
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = Number(el.dataset.revealDelay || 0);
          window.setTimeout(() => el.classList.add("is-in"), delay);
          observer.unobserve(el);
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" },
    );
    $revealEls.each(function () {
      revealObserver.observe(this);
    });
  }
}

// --- "Curtain" reveal for CareSection's [data-curtain] panel ---

const $curtainEls = $("[data-curtain]");
if ($curtainEls.length && "IntersectionObserver" in window) {
  if (reducedMotionQuery.matches) {
    $curtainEls.addClass("is-in");
  } else {
    const curtainObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.2 },
    );
    $curtainEls.each(function () {
      curtainObserver.observe(this);
    });
  }
}

// --- "Understand the process" step crossfade: [data-move-grid] ---
// The image column is a plain CSS `position:sticky` block (see _how-it-works.scss) — a
// deliberately simpler stand-in for the design's scroll-pinned 300vh crossfade, with no
// scroll-jacking or manual scroll-offset math. This just swaps which stacked image is visible,
// and dims the inactive step text, as each step block crosses the viewport's vertical center.
// Desktop (lg) only; below that the SCSS mobile fallback already shows every image/step pair
// as a static stacked block, so no JS is needed there.

const $moveGrids = $("[data-move-grid]");
if ($moveGrids.length && "IntersectionObserver" in window) {
  $moveGrids.each(function () {
    const grid = this;
    const images = Array.from(grid.querySelectorAll("[data-move-img]"));
    const stepEls = Array.from(grid.querySelectorAll("[data-move-step]"));
    if (!images.length || !stepEls.length) return;

    function setActiveStep(index) {
      images.forEach((img) => {
        img.classList.toggle("is-active", Number(img.dataset.moveImg) === index);
      });
      stepEls.forEach((step) => {
        step.classList.toggle("is-active", Number(step.dataset.moveStep) === index);
      });
    }

    setActiveStep(0);

    if (reducedMotionQuery.matches || window.innerWidth < 1024) return;

    grid.classList.add("is-ready");

    const stepObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          setActiveStep(Number(entry.target.dataset.moveStep));
        });
      },
      { threshold: 0, rootMargin: "-45% 0px -45% 0px" },
    );
    stepEls.forEach((step) => stepObserver.observe(step));
  });
}

// --- "Care designed around you" scroll-linked grow-to-full-bleed: [data-expand] ---
// Desktop (lg) only — a real scroll-pinned effect (300vh track, sticky viewport), unlike
// [data-move-grid]'s deliberately simpler class-swap crossfade. Every frame, for each
// [data-expand] section still in view, this computes how far the user has scrolled through
// its 300vh height (0 at the top, 1 once the section's bottom reaches the viewport bottom)
// and writes it as the `--p` custom property on [data-expand-frame] (drives width/height/
// border-radius/scrim-opacity in _care.scss via calc()), plus a `--tp` "text progress" that
// only starts once the frame is mostly grown, on [data-expand-text]. Below 1024px, or with
// prefers-reduced-motion, this never runs — the plain CSS (var(--p,1) / var(--tp,1) fallbacks)
// already renders the fully-grown end state, so it degrades to a normal static section.

const $expandSections = $("[data-expand]");
if (
  $expandSections.length &&
  !reducedMotionQuery.matches &&
  window.innerWidth >= 1024
) {
  let expandTicking = false;

  function applyExpand() {
    $expandSections.each(function () {
      const rect = this.getBoundingClientRect();
      const trackable = rect.height - window.innerHeight;
      const p =
        trackable > 0
          ? Math.min(1, Math.max(0, -rect.top / trackable))
          : 1;
      const tp = Math.min(1, Math.max(0, (p - 0.55) / 0.45));

      const frame = this.querySelector("[data-expand-frame]");
      if (frame) frame.style.setProperty("--p", p.toFixed(4));

      const text = this.querySelector("[data-expand-text]");
      if (text) {
        text.style.setProperty("--tp", tp.toFixed(4));
        text.classList.toggle("is-in", tp > 0.5);
      }
    });
    expandTicking = false;
  }

  function queueExpand() {
    if (expandTicking) return;
    expandTicking = true;
    window.requestAnimationFrame(applyExpand);
  }

  window.addEventListener("scroll", queueExpand, { passive: true });
  window.addEventListener("resize", queueExpand, { passive: true });
  applyExpand();
}

// --- "Explore Weight Loss Options" scroll-pinned headline/cluster reveal: [data-brk-track] ---
// Desktop (lg) only — a real 190vh scroll-pinned track (see _explore.scss's .explore-hero /
// .explore-hero-viewport), matching the design's own [data-brk-track] engine: as the user scrolls
// through it, each headline line slides up out of its clip wrapper, the two cluster images settle
// in from an offset/rotated/scaled entry state toward their resting transform (which itself is a
// small permanent offset/rotation, not "upright" — ported directly from the design's per-image
// data-dx/dy/r/s/py/pr authored values) with a continuous idle float composited on top, and the
// copy block fades/slides in. Below 1024px, or with prefers-reduced-motion, this never runs — the
// plain CSS renders every element at rest (no transform, full opacity), so it degrades to a
// normal static section.

const $brkTracks = $("[data-brk-track]");
if ($brkTracks.length && !reducedMotionQuery.matches && window.innerWidth >= 1024) {
  const brkClamp01 = (v) => Math.min(1, Math.max(0, v));
  const brkEaseOut = (t) => 1 - Math.pow(1 - brkClamp01(t), 2.6);
  const brkLerp = (a, b, t) => a + (b - a) * t;

  const brkTracks = $brkTracks
    .map(function () {
      return {
        track: this,
        words: Array.from(this.querySelectorAll("[data-brk-w]")),
        items: Array.from(this.querySelectorAll("[data-brk-i]")),
        cluster: this.querySelector("[data-brk-cluster]"),
        copy: this.querySelector("[data-brk-copy]"),
      };
    })
    .get();

  let brkTicking = false;

  function applyBrk() {
    const vh = window.innerHeight;
    brkTracks.forEach(({ track, words, items, cluster, copy }) => {
      const r = track.getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 2) return;
      const p = brkClamp01(-r.top / Math.max(1, r.height - vh));

      words.forEach((w) => {
        const off = parseFloat(w.dataset.o || 0);
        const e = brkEaseOut((p - off) / 0.26);
        w.style.transform = "translate3d(0," + ((1 - e) * 108).toFixed(2) + "%,0)";
        w.style.opacity = (0.15 + e * 0.85).toFixed(3);
      });

      items.forEach((it) => {
        const off = parseFloat(it.dataset.o || 0);
        const e = brkEaseOut((p - off) / (0.72 - off));
        const dx = parseFloat(it.dataset.dx || 0) * (1 - e);
        const dy = 40 * (1 - e) + parseFloat(it.dataset.dy || 0) * e;
        const r0 = parseFloat(it.dataset.r || 0);
        const rot = brkLerp(r0 * 3.4 - 26, r0, e);
        const sc = brkLerp(parseFloat(it.dataset.s || 0.55), 1, e);
        const settle = brkClamp01((p - 0.62) / 0.38);
        it._brkBase = {
          dx: dx,
          dy: dy + settle * parseFloat(it.dataset.py || 0),
          rot: rot + settle * parseFloat(it.dataset.pr || 0),
          sc: sc * (1 + settle * 0.012),
        };
        it.style.opacity = (0.06 + e * 0.94).toFixed(3);
      });

      if (cluster) {
        const clusterE = brkEaseOut(brkClamp01(p / 0.72));
        cluster.style.transform =
          "translate3d(0," + (clusterE * -0.8).toFixed(2) + "vh,0) scale(" + (1 + clusterE * 0.04).toFixed(3) + ")";
      }

      if (copy) {
        const ct = brkEaseOut((p - 0.14) / 0.26);
        copy.style.opacity = ct.toFixed(3);
        copy.style.transform = "translate3d(0," + ((1 - ct) * 26).toFixed(1) + "px,0)";
      }
    });
    brkTicking = false;
  }

  function queueBrk() {
    if (brkTicking) return;
    brkTicking = true;
    window.requestAnimationFrame(applyBrk);
  }

  window.addEventListener("scroll", queueBrk, { passive: true });
  window.addEventListener("resize", queueBrk, { passive: true });
  applyBrk();

  // Continuous idle float, composited on top of each cluster image's scroll-derived base
  // transform — a perpetually-running cue that the cluster isn't a static image, matching the
  // design's own floaters loop (a couple of gentle, phase-offset sine waves per image).
  const brkFloaters = [];
  brkTracks.forEach(({ items }) => items.forEach((it, i) => brkFloaters.push({ it, i })));
  if (brkFloaters.length) {
    const brkT0 = performance.now();
    const brkFloatTick = (now) => {
      const t = (now - brkT0) / 1000;
      brkFloaters.forEach(({ it, i }) => {
        const b = it._brkBase;
        if (!b) return;
        const ph = i * 2.1;
        const fy = Math.sin(t * 0.46 + ph) * 1.9 + Math.sin(t * 0.19 + ph * 1.7) * 1.1;
        const fx = Math.cos(t * 0.33 + ph * 1.3) * 1.3;
        const fr = Math.sin(t * 0.29 + ph * 0.8) * 1.5;
        const fs = 1 + Math.sin(t * 0.37 + ph) * 0.008;
        it.style.transform =
          "translate3d(" + (b.dx + fx).toFixed(2) + "%," + (b.dy + fy).toFixed(2) + "%,0) rotate(" +
          (b.rot + fr).toFixed(2) + "deg) scale(" + (b.sc * fs).toFixed(4) + ")";
      });
      window.requestAnimationFrame(brkFloatTick);
    };
    window.requestAnimationFrame(brkFloatTick);
  }
}

// --- Parallax drift: [data-hero-parallax] / [data-parallax], strength via [data-parallax-strength] ---
// rAF-batched so every parallax element is read/written together, once per frame, instead of
// causing layout thrashing across separate scroll handlers.

const $parallaxEls = $("[data-hero-parallax], [data-parallax]");
if ($parallaxEls.length && !reducedMotionQuery.matches) {
  let parallaxTicking = false;

  function applyParallax() {
    const viewportMid = window.innerHeight / 2;
    $parallaxEls.each(function () {
      const strength = Number(this.dataset.parallaxStrength || 0.16);
      const rect = this.getBoundingClientRect();
      const elMid = rect.top + rect.height / 2;
      const offset = (viewportMid - elMid) * strength;
      this.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    });
    parallaxTicking = false;
  }

  function queueParallax() {
    if (parallaxTicking) return;
    parallaxTicking = true;
    window.requestAnimationFrame(applyParallax);
  }

  window.addEventListener("scroll", queueParallax, { passive: true });
  window.addEventListener("resize", queueParallax, { passive: true });
  applyParallax();
}

// --- "CARE, MADE PERSONAL" word-by-word scroll-tied reveal: [data-word-reveal] ---
// Desktop only (matches the source design, which freezes this as static dark text on
// tablet/mobile); every word is dark by default (see _trust-bar.scss), JS only dims the
// not-yet-reached ones, so a JS failure just leaves the whole sentence lit.

const $wordReveal = $("[data-word-reveal]");
if ($wordReveal.length && !reducedMotionQuery.matches) {
  let wordTicking = false;

  function applyWordReveal() {
    const isDesktop = window.innerWidth > 1024;
    $wordReveal.each(function () {
      const $words = $(this).find("[data-word]");
      if (!isDesktop) {
        $words.removeClass("is-dim");
        return;
      }
      const rect = this.getBoundingClientRect();
      const vh = window.innerHeight;
      // Progress is tied to the paragraph's own height (not a fixed viewport band), matching
      // the design: a taller/shorter wrapped paragraph reveals at the same felt pace either way.
      const progress = Math.min(
        1,
        Math.max(0, (vh * 0.82 - rect.top) / (rect.height + vh * 0.32)),
      );
      const n = $words.length;
      $words.each(function (i) {
        const lit = progress > ((i + 0.6) / n) * 0.92;
        $(this).toggleClass("is-dim", !lit);
      });
    });
    wordTicking = false;
  }

  function queueWordReveal() {
    if (wordTicking) return;
    wordTicking = true;
    window.requestAnimationFrame(applyWordReveal);
  }

  window.addEventListener("scroll", queueWordReveal, { passive: true });
  window.addEventListener("resize", queueWordReveal, { passive: true });
  applyWordReveal();
}

// --- Programs tile hover-grow: [data-exp-row] / [data-exp] ---
// The hovered tile grows (flex-grow 2.2), its siblings contract (0.95), and a short pointer-enter
// delay absorbs quick passes so adjacent tiles don't fight each other mid-transition. Desktop
// (>1024px) only — below that every tile stays equal-width (flex-grow reset to 1) and stacked
// per the responsive CSS, matching the design's own tablet/mobile fallback.

$("[data-exp-row]").each(function () {
  const row = this;
  const $panels = $(row).find("[data-exp]");
  if (!$panels.length) return;

  const REST = 1;
  const OPEN = 2.2;
  const SHRUNK = 0.95;

  function apply(active) {
    $panels.each(function () {
      const isActive = this === active;
      this.style.flexGrow = active == null ? REST : isActive ? OPEN : SHRUNK;
      this.classList.toggle("is-active", isActive);
      this.classList.toggle("is-dim", active != null && !isActive);
    });
  }

  let hoverTimer;
  $panels.on("pointerenter", function () {
    if (window.innerWidth <= 1024) return;
    const target = this;
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(() => apply(target), 130);
  });
  $panels.on("focusin", function () {
    if (window.innerWidth <= 1024) return;
    clearTimeout(hoverTimer);
    apply(this);
  });
  $(row).on("pointerleave", () => {
    clearTimeout(hoverTimer);
    apply(null);
  });
});

// --- Horizontal product rail arrows: [data-rail] / [data-rail-track] / [data-rail-prev,next] ---
// Native overflow-x scrolling + snap already makes the rail usable by touch/trackpad/scrollbar;
// the arrow buttons are a progressive-enhancement convenience that page by ~2 cards using
// jQuery's animate() for a smooth, interruptible scroll (no custom easing loop needed). Edge
// state (an arrow dims + stops accepting clicks once the rail is scrolled all the way to that
// side) mirrors the design's own rail sync().

$("[data-rail]").each(function () {
  const $rail = $(this);
  const $track = $rail.find("[data-rail-track]").first();
  if (!$track.length) return;

  const $prev = $rail.find("[data-rail-prev]");
  const $next = $rail.find("[data-rail-next]");

  function step() {
    const $card = $track.children().first();
    const cardWidth = $card.length ? $card.outerWidth(true) : 280;
    return cardWidth * 2;
  }

  function syncEdges() {
    const el = $track[0];
    const max = el.scrollWidth - el.clientWidth - 1;
    const atStart = el.scrollLeft <= 2;
    const atEnd = el.scrollLeft >= max;
    $prev.css({ opacity: atStart ? 0.32 : 1, pointerEvents: atStart ? "none" : "auto" });
    $next.css({ opacity: atEnd ? 0.32 : 1, pointerEvents: atEnd ? "none" : "auto" });
  }

  $prev.on("click", () => {
    $track.stop(true, false).animate({ scrollLeft: "-=" + step() }, 420, syncEdges);
  });
  $next.on("click", () => {
    $track.stop(true, false).animate({ scrollLeft: "+=" + step() }, 420, syncEdges);
  });
  $track.on("scroll", syncEdges);
  window.addEventListener("resize", syncEdges, { passive: true });
  syncEdges();
});
