import { loadAuthModal } from "./authModel.js";
import { checkAuthState } from "./authState.js"; // Import from new file
import { API_BASE_URL } from "../../config.js";

// DOM elements cache
const authElements = {
  loginBtn: null,
  profileMenu: null,
  profilePic: null,
  adminMenuItem: null,
  dropdownMenu: null,
  logoutBtn: null,
};

export async function updateAuthUI() {
  // Initialize DOM elements if not cached
  if (!authElements.loginBtn) {
    authElements.loginBtn = document.getElementById("loginBtn");
    authElements.profileMenu = document.getElementById("profileMenu");
    authElements.profilePic = document.getElementById("profilePic");
    authElements.adminMenuItem = document.getElementById("adminMenuItem");
  }

  const { isAuthenticated, isAdmin, user, profilePicUrl } =
    await checkAuthState();
  console.log("🐱‍👤 profilePicUrl is:", profilePicUrl);

  const img = document.getElementById("profilePic");
  if (img) {
    img.src = profilePicUrl;
  }
  // Toggle UI elements
  if (authElements.loginBtn && authElements.profileMenu) {
    authElements.loginBtn.classList.toggle("hidden", isAuthenticated);
    authElements.profileMenu.classList.toggle("hidden", !isAuthenticated);
  }

  // Update admin menu
  if (authElements.adminMenuItem) {
    authElements.adminMenuItem.classList.toggle("hidden", !isAdmin);
  }

  // Update profile picture
  if (isAuthenticated && authElements.profilePic) {
    authElements.profilePic.src = profilePicUrl;
  }
}

export function setupAuthButtons() {
  // Initialize interactive elements
  authElements.dropdownMenu = document.getElementById("dropdownMenu");
  authElements.logoutBtn = document.getElementById("logoutBtn");
  const profileBtn = document.getElementById("profileBtn");

  // Event listeners
  document.getElementById("loginBtn")?.addEventListener("click", loadAuthModal);

  if (authElements.logoutBtn) {
    authElements.logoutBtn.addEventListener("click", async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          credentials: "include",
        });
        if (response.ok) {
          await updateAuthUI();
          window.location.href = "/";
        }
      } catch (error) {
        console.error("Logout failed:", error);
      }
    });
  }

  if (profileBtn && authElements.dropdownMenu) {
    profileBtn.addEventListener("click", () => {
      authElements.dropdownMenu.classList.toggle("hidden");
    });
  }
}
