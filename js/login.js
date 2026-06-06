import {
  findSavedStudent,
  getSavedStudents,
  saveStudentAccount,
  setActiveStudent
} from "./store.js";

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

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = data.get("name").trim();
    const email = data.get("email").trim().toLowerCase();

    if (!name || !email) {
      status.textContent = "Enter your name and email to continue.";
      return;
    }

    const savedStudent = findSavedStudent(email);

    if (authMode === "signin") {
      if (!savedStudent || savedStudent.name.toLowerCase() !== name.toLowerCase()) {
        status.textContent = "No local account matches those details. Create an account first.";
        return;
      }

      setActiveStudent(savedStudent);
      status.textContent = "Signed in. Your StudyFlow data now saves to this browser profile.";
    } else {
      const savedStudents = getSavedStudents();
      const matchingName = savedStudents.find((student) => student.name.toLowerCase() === name.toLowerCase());

      if (matchingName) {
        status.textContent = "That user name is already taken.";
        return;
      }

      if (savedStudent) {
        status.textContent = "That email is already linked to an account. Sign in instead.";
        return;
      }

      const student = saveStudentAccount({ name, email });
      setActiveStudent(student);
      status.textContent = "Account created. Your StudyFlow profile is ready.";
    }

    form.reset();
    window.location.href = getDashboardPath();
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
          ? "Create a local StudyFlow profile with just your name and email."
          : "Use the exact name and email from an account created on this browser.";
    }
  }
}

function getDashboardPath() {
  return window.location.pathname.endsWith("/pages/login.html") ? "index.html" : "pages/index.html";
}
