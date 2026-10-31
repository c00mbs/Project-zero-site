const form = document.querySelector("#signup-form");
const message = document.querySelector("#form-message");
const submit = document.querySelector(".submit-button");
const menu = document.querySelector(".menu-toggle");
const nav = document.querySelector(".desktop-nav");
document.querySelector("#year").textContent = new Date().getFullYear();

menu?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menu.setAttribute("aria-expanded", String(open));
});
nav?.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
  nav.classList.remove("open");
  menu?.setAttribute("aria-expanded", "false");
}));

form?.addEventListener("submit", async event => {
  event.preventDefault();
  message.textContent = "";
  const email = document.querySelector("#email").value.trim();
  const consent = document.querySelector("#consent").checked;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    message.textContent = "Enter a valid email address to continue.";
    return;
  }
  if (!consent) {
    message.textContent = "Please agree to receive development updates.";
    return;
  }
  const label = submit.querySelector(".button-label");
  submit.disabled = true;
  label.textContent = "SENDING TRANSMISSION...";
  try {
    const response = await fetch("/api/signup", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        email,
        consent: true,
        company: form.elements.company.value
      })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Transmission failed. Please try again.");
    window.location.assign("/thank-you.html");
  } catch (error) {
    message.textContent = error.message || "Unable to submit right now. Please try again.";
    submit.disabled = false;
    label.textContent = "TRANSMIT SIGNUP";
  }
});