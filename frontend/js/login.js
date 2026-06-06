import { createAccount, loginAccount, setActiveStudent } from "./store.js";

export function setupLoginPage() {
  const form = document.querySelector("#loginForm");
  const status = document.querySelector("#loginStatus");
  const modeButtons = document.querySelectorAll("[data-auth-mode]");
  const formTitle = document.querySelector("#login-form-title");
  const submitButton = document.querySelector("#loginSubmit");
  const formHint = document.querySelector("#loginHint");

  if (!form || !status) {
    return;
  }

  let authMode = "signin";
  updateAuthMode(authMode);

  modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      authMode = button.dataset.authMode;
      status.textContent = "";
      updateAuthMode(authMode);
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = data.get("name").trim();
    const email = data.get("email").trim().toLowerCase();

    if (!name || !email) {
      status.textContent = "Enter your name and email to continue.";
      return;
    }

    submitButton.disabled = true;
    status.textContent = authMode === "create" ? "Creating your account..." : "Signing you in...";

    try {
      const student =
        authMode === "create" ? await createAccount({ name, email }) : await loginAccount({ name, email });
      setActiveStudent(student);
      status.textContent =
        authMode === "create" ? "Account created. Your StudyFlow profile is ready." : "Signed in.";
      form.reset();
      window.location.href = getDashboardPath();
    } catch (error) {
      status.textContent = error.message;
    } finally {
      submitButton.disabled = false;
    }
  });

  function updateAuthMode(mode) {
    modeButtons.forEach((button) => {
      const isActive = button.dataset.authMode === mode;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    if (formTitle) {
      formTitle.textContent = mode === "create" ? "Create account" : "Student login";
    }

    if (submitButton) {
      submitButton.textContent = mode === "create" ? "Create account" : "Sign in";
    }

    if (formHint) {
      formHint.textContent =
        mode === "create"
          ? "Create a StudyFlow profile with just your name and email."
          : "Use the exact name and email from your StudyFlow account.";
    }
  }
}

function getDashboardPath() {
  return window.location.pathname.endsWith("/pages/login.html") ? "index.html" : "pages/index.html";
}
