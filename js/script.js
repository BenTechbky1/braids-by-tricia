/* ==========================================================================
   BRAIDS BY TRICIA — SITE SCRIPT
   Plain JavaScript, no build step, no dependencies.

   Sections:
   1. Mobile navigation toggle
   2. Booking form -> WhatsApp message builder
   3. Pre-select a service on the booking page (from a "Book this style" link)
   ========================================================================== */

/* --------------------------------------------------------------------
   >>> REPLACE THIS <<<
   Tricia's real WhatsApp number goes here, in international format
   with no spaces, no "+", no leading zeros. Example for a UK mobile:
   "447123456789". This is the ONLY place the number needs to be set —
   every WhatsApp link/button on the site reads from this constant.
   -------------------------------------------------------------------- */
const WHATSAPP_NUMBER = "REPLACE_WITH_TRICIA_NUMBER";

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initBookingForm();
  prefillServiceFromQueryString();
});

/* ----------------------------------------------------------------------
   1. MOBILE NAVIGATION TOGGLE
   Accessible hamburger menu: toggles aria-expanded, opens/closes the
   list, and closes again after a link is clicked or Escape is pressed.
   ---------------------------------------------------------------------- */
function initMobileNav() {
  const toggle = document.querySelector(".nav__toggle");
  const list = document.querySelector(".nav__list");
  const nav = document.querySelector(".nav");

  if (!toggle || !list || !nav) return;

  const closeMenu = () => {
    list.classList.remove("is-open");
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  const openMenu = () => {
    list.classList.add("is-open");
    nav.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
  };

  toggle.addEventListener("click", () => {
    const isOpen = list.classList.contains("is-open");
    isOpen ? closeMenu() : openMenu();
  });

  list.querySelectorAll(".nav__link").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

/* ----------------------------------------------------------------------
   2. BOOKING FORM -> WHATSAPP
   Builds a pre-filled WhatsApp message from the appointment request
   form and opens WhatsApp (app on mobile, web.whatsapp.com on desktop)
   with the message ready to send. No backend required.
   ---------------------------------------------------------------------- */
function initBookingForm() {
  const form = document.querySelector("#booking-form");
  if (!form) return;

  const status = document.querySelector("#booking-status");

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
      showStatus(
        status,
        `Please fill in: ${missing.join(", ")}.`,
        "error"
      );
      return;
    }

    if (WHATSAPP_NUMBER === "REPLACE_WITH_TRICIA_NUMBER") {
      showStatus(
        status,
        "Booking isn't fully connected yet — the site owner still needs to add a WhatsApp number in js/script.js.",
        "error"
      );
      return;
    }

    const message = buildWhatsAppMessage(data);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    showStatus(
      status,
      "Opening WhatsApp with your appointment request…",
      "success"
    );

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

  lines.push(
    `Service: ${data.service}`,
    `Date: ${data.date}`
  );

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

/* ----------------------------------------------------------------------
   3. PRE-SELECT A SERVICE ON THE BOOKING PAGE
   "Book this style" buttons on the services page link to
   booking.html?service=Knotless%20Braids — this picks the matching
   <option> automatically so the customer doesn't re-type it.
   ---------------------------------------------------------------------- */
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
