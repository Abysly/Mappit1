import { loadAuthModal } from "./authModel.js";
import { checkAuthState } from "./authState.js";
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

  if (authElements.loginBtn && authElements.profileMenu) {
    authElements.loginBtn.classList.toggle("hidden", isAuthenticated);
    authElements.profileMenu.classList.toggle("hidden", !isAuthenticated);
  }

  if (authElements.adminMenuItem) {
    authElements.adminMenuItem.classList.toggle("hidden", !isAdmin);
  }

  const announcementWrapper = document.getElementById("announcementWrapper");
  if (announcementWrapper) {
    announcementWrapper.classList.toggle("hidden", !isAuthenticated);
  }

  if (isAuthenticated && authElements.profilePic) {
    authElements.profilePic.src = profilePicUrl;
  }
}

export function setupAuthButtons() {
  authElements.dropdownMenu = document.getElementById("dropdownMenu");
  authElements.logoutBtn = document.getElementById("logoutBtn");
  const profileBtn = document.getElementById("profileBtn");
  const announcementBtn = document.getElementById("announcementIcon");
  const announcementDropdown = document.getElementById("announcementDropdown");

  // Login
  document.getElementById("loginBtn")?.addEventListener("click", loadAuthModal);

  // Logout
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

  // Toggle profile menu
  if (profileBtn && authElements.dropdownMenu) {
    profileBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      authElements.dropdownMenu.classList.toggle("hidden");
      announcementDropdown?.classList.add("hidden");
    });
  }

  // Toggle announcement dropdown
  if (announcementBtn && announcementDropdown) {
    announcementBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      announcementDropdown.classList.toggle("hidden");
      authElements.dropdownMenu?.classList.add("hidden");
    });
  }

  // Close dropdowns when clicking outside
  document.addEventListener("click", (e) => {
    if (
      !authElements.dropdownMenu?.contains(e.target) &&
      !profileBtn?.contains(e.target)
    ) {
      authElements.dropdownMenu?.classList.add("hidden");
    }

    if (
      !announcementDropdown?.contains(e.target) &&
      !announcementBtn?.contains(e.target)
    ) {
      announcementDropdown?.classList.add("hidden");
    }
  });

  // Close profile dropdown when clicking on profile menu items
  const profileLinks = authElements.dropdownMenu?.querySelectorAll("a, button");
  profileLinks?.forEach((el) => {
    el.addEventListener("click", () => {
      authElements.dropdownMenu?.classList.add("hidden");
    });
  });
}
