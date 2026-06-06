import { clearActiveStudent, getActiveStudent } from "./store.js";

export function setupNavigation() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");

  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const isOpen = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  setupAccountMenu();
}

function setupAccountMenu() {
  const student = getActiveStudent();

  document.querySelectorAll("[data-active-student]").forEach((target) => {
    target.textContent = student ? `${student.name} (${student.email})` : "No active profile";
  });

  document.querySelectorAll("[data-sign-out]").forEach((button) => {
    button.addEventListener("click", () => {
      clearActiveStudent();
      window.location.href = "../index.html";
    });
  });
}
