import {
  loginForm,
  registerForm,
  forgotPasswordForm,
} from "./formTemplates.js";
import { updateAuthUI } from "./authController.js";
import { API_BASE_URL } from "../../config.js";

export async function loadAuthModal() {
  console.log("Opening auth modal - Current Page:", window.location.pathname);
  let authContainer = document.getElementById("authContainer");

  if (!authContainer) {
    const res = await fetch("/src/components/auth.html");
    const div = document.createElement("div");
    div.innerHTML = await res.text();
    document.body.appendChild(div);
    authContainer = document.getElementById("authContainer");
  }

  if (!authContainer) {
    console.error("Auth modal could not be found after adding it.");
    return;
  }

  const formContent = document.getElementById("formContent");
  const toggleLink = document.getElementById("toggleFormLink");
  const forgotLink = document.getElementById("forgotPasswordLink");
  const closeBtn = document.getElementById("closeAuth");

  let isLogin = true;

  function resetAuthModal() {
    formContent.innerHTML = loginForm;
    isLogin = true;
    toggleLink.innerHTML = `Don't have an account? <span class="text-blue-600">Register</span>`;
    toggleLink.style.display = "block";
    forgotLink.style.display = "block";
  }

  resetAuthModal();

  toggleLink.addEventListener("click", (event) => {
    event.preventDefault();
    isLogin = !isLogin;
    formContent.innerHTML = isLogin ? loginForm : registerForm;
    toggleLink.innerHTML = isLogin
      ? `Don't have an account? <span class="text-blue-600">Register</span>`
      : `Already have an account? <span class="text-blue-600">Login</span>`;
  });

  forgotLink.addEventListener("click", (event) => {
    event.preventDefault();
    formContent.innerHTML = forgotPasswordForm;
    toggleLink.style.display = "none";
    forgotLink.style.display = "none";
  });

  closeBtn.addEventListener("click", () => {
    authContainer.classList.add("hidden");
    resetAuthModal();
  });

  authContainer.classList.remove("hidden");

  authContainer.addEventListener("click", (e) => {
    if (e.target === authContainer) {
      authContainer.classList.add("hidden");
      resetAuthModal();
    }
  });

  authContainer.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.target;
    const formType = form.id;

    try {
      // Handle forgot password form
      if (formType === "forgotForm") {
        alert("Password reset link would be sent to your email");
        authContainer.classList.add("hidden");
        resetAuthModal();
        return;
      }

      let isLogin = formType === "loginForm";
      const endpoint = `${API_BASE_URL}${
        isLogin ? "/auth/login" : "/auth/signup"
      }`;

      const response = await fetch(endpoint, {
        method: "POST",
        credentials: isLogin ? "include" : "omit",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(
          error.message || error.error || "Authentication failed"
        );
      }

      if (isLogin) {
        const data = await response.json();

        // Save user to localStorage
        localStorage.setItem("user", JSON.stringify(data.user));
        authContainer.classList.add("hidden");
        updateAuthUI();
      } else {
        // After successful registration
        formContent.innerHTML = loginForm;
        toggleLink.innerHTML = `Don't have an account? <span class="text-blue-600">Register</span>`;
        toggleLink.style.display = "block";
        forgotLink.style.display = "block";
        isLogin = true;
        alert("Registration successful! Please login");
      }
    } catch (error) {
      console.error("Auth error:", error);
      alert(error.message || "Server error - please try again later");
    }
  });
}
