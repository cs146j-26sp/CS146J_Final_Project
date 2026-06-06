import { clearActiveStudent, getActiveStudent, setActiveStudent } from "./store.js";

const DEMO_CREDENTIALS = {
  name: "Ivy League",
  email: "demo@stanford.edu",
  password: "test123"
};

export function setupLoginPage() {
  const form = document.querySelector("#loginForm");
  const status = document.querySelector("#loginStatus");
  const signedInPanel = document.querySelector("#signedInPanel");
  const currentStudent = document.querySelector("#currentStudent");
  const signOut = document.querySelector("#signOutButton");

  if (!form || !status || !signedInPanel || !currentStudent || !signOut) {
    return;
  }

  if (!isApprovedActiveStudent()) {
    clearActiveStudent();
  }

  renderCurrentStudent();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = data.get("name").trim();
    const email = data.get("email").trim().toLowerCase();
    const password = data.get("password");

    if (!isApprovedDemoLogin(name, email, password)) {
      status.textContent = "Use the approved demo credentials to sign in.";
      return;
    }

    setActiveStudent({ name, email });
    status.textContent = "Signed in. Your StudyFlow data now saves to this student profile.";
    form.reset();
    renderCurrentStudent();
    window.location.href = getDashboardPath();
  });

  signOut.addEventListener("click", () => {
    clearActiveStudent();
    status.textContent = "Signed out. Sign in again to load a saved student workspace.";
    renderCurrentStudent();
  });
}

function isApprovedDemoLogin(name, email, password) {
  return (
    name === DEMO_CREDENTIALS.name &&
    email === DEMO_CREDENTIALS.email &&
    password === DEMO_CREDENTIALS.password
  );
}

function isApprovedActiveStudent() {
  const student = getActiveStudent();
  return !student || (student.name === DEMO_CREDENTIALS.name && student.email === DEMO_CREDENTIALS.email);
}

function renderCurrentStudent() {
  const student = getActiveStudent();
  const signedInPanel = document.querySelector("#signedInPanel");
  const currentStudent = document.querySelector("#currentStudent");

  signedInPanel.hidden = !student;
  currentStudent.textContent = student ? `${student.name} (${student.email})` : "";
}

function getDashboardPath() {
  return window.location.pathname.endsWith("/pages/login.html") ? "index.html" : "pages/index.html";
}
