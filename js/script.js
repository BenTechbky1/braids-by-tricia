/* ==========================================================================
   BRAIDS BY TRICIA — SITE SCRIPT
   Plain JavaScript, no build step, no dependencies.

   Sections:
   1. Mobile navigation toggle
   2. Booking form -> WhatsApp message builder
   3. Pre-select a service on the booking page (from a "Book this style" link)
   ========================================================================== */

const WHATSAPP_NUMBER = "34631653956";

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initBookingForm();
  prefillServiceFromQueryString();
});

function initMobileNav() {
  const toggle = document.querySelector(".nav__toggle");
  const list = document.querySelector(".nav__list");
  const nav = document.querySelector(".nav");

  if (!toggle || !list || !nav) return;

  const closeMenu = () => {
    list.classList.remove("is-open");
    nav.classList.remove("is-open");
    document.body.classList.remove("nav-locked");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  };

  const openMenu = () => {
    list.classList.add("is-open");
    nav.classList.add("is-open");
    document.body.classList.add("nav-locked");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close menu");
  };

  toggle.addEventListener("click", () => {
    const isOpen = list.classList.contains("is-open");
    isOpen ? closeMenu() : openMenu();
  });

  list.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

function initBookingForm() {
  const form = document.querySelector("#booking-form");
  if (!form) return;

  const status = document.querySelector("#booking-status");
  const dateField = form.querySelector("#date");

  if (dateField) {
    const today = new Date().toISOString().split("T")[0];
    dateField.setAttribute("min", today);
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = {
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      service: form.service.value,
      date: form.date.value,
      time: form.time.value,
      hairLength: form.hairLength.value,
      braidSize: form.braidSize.value,
      notes: form.notes.value.trim(),
      confirmed: form.confirmRequest.checked,
    };

    const missing = [];
    if (!data.name) missing.push("full name");
    if (!data.phone) missing.push("phone number");
    if (!data.service) missing.push("service");
    if (!data.date) missing.push("preferred date");
    if (!data.confirmed) missing.push("confirmation checkbox");

    if (missing.length > 0) {
      showStatus(status, `Please fill in: ${missing.join(", ")}.`, "error");
      return;
    }

    const message = buildWhatsAppMessage(data);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    showStatus(status, "Opening WhatsApp with your appointment request…", "success");
    window.open(url, "_blank", "noopener");
  });
}

function buildWhatsAppMessage(data) {
  const lines = [
    "Hello Tricia, I would like to request an appointment.",
    "",
    `Name: ${data.name}`,
    `Phone: ${data.phone}`,
  ];

  if (data.email) lines.push(`Email: ${data.email}`);

  lines.push(`Service: ${data.service}`, `Date: ${data.date}`);

  if (data.time) lines.push(`Time: ${data.time}`);
  if (data.hairLength) lines.push(`Hair length: ${data.hairLength}`);
  if (data.braidSize) lines.push(`Braid size: ${data.braidSize}`);
  if (data.notes) lines.push(`Notes: ${data.notes}`);

  return lines.join("\n");
}

function showStatus(el, message, type) {
  if (!el) return;
  el.textContent = message;
  el.classList.remove("form-status--error", "form-status--success");
  el.classList.add("form-status--visible", `form-status--${type}`);
}

function prefillServiceFromQueryString() {
  const select = document.querySelector("#service");
  if (!select) return;

  const params = new URLSearchParams(window.location.search);
  const requested = params.get("service");
  if (!requested) return;

  const match = Array.from(select.options).find(
    (option) => option.value.toLowerCase() === requested.toLowerCase()
  );

  if (match) {
    select.value = match.value;
  }
}
