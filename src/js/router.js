import {
  setupPricingToggle,
  setupPricingPage,
} from "../js/modules/pricingToggle.js";
import { initializeEventPage } from "./eventMain.js";
import { setupProfileMenu } from "../js/modules/profileMenu.js";
import { initializeHostPage } from "../js/modules/host.js";
import { setupAdminMenu } from "../js/modules/adminMenu.js";
import { initializeSettingsPage } from "../js/modules/settings.js";
import { initializeEventDetails } from "../js/modules/eventdetails.js";
import { initializeRegisteredEvents } from "../js/modules/registeredEvent.js";
import { setupScrollToSection, setupFaqToggle } from "../js/modules/home.js";
import { checkLoginAccess } from "../js/modules/authService.js"; // ✅ Import auth check

export async function loadPage(page) {
  try {
    const res = await fetch(`/src/pages/${page}.html`);
    const html = await res.text();
    document.getElementById("content").innerHTML = html;

    // 🔧 Run specific setup functions depending on the page
    if (page === "pricing") {
      setupPricingToggle();
      setupPricingPage();
    } else if (page === "events") {
      initializeEventPage();

      // ✅ Protect "Create Event" button
      const createBtn = document.getElementById("createEventBtn");
      if (createBtn) {
        createBtn.addEventListener("click", async (e) => {
          e.preventDefault();
          const ok = await checkLoginAccess();
          if (ok) {
            window.location.hash = "host";
          }
        });
      }
    } else if (page === "profile") {
      setupProfileMenu();
    } else if (page === "host") {
      initializeHostPage();
    } else if (page === "admin") {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.is_admin) {
        document.getElementById(
          "content"
        ).innerHTML = `<p class="text-red-500 p-4">❌ Access Denied</p>`;
        return;
      }

      setupAdminMenu();
    } else if (page === "settings") {
      initializeSettingsPage();
    } else if (page === "eventdetails") {
      initializeEventDetails();
    } else if (page === "home") {
      setupScrollToSection();
      setupFaqToggle();
    }
  } catch (err) {
    document.getElementById("content").innerHTML = `<p>Page not found.</p>`;
  }
}

export function setupRouter() {
  window.addEventListener("hashchange", () => {
    const page = location.hash.replace("#", "") || "home";
    loadPage(page);
  });

  const initialPage = location.hash.replace("#", "") || "home";
  loadPage(initialPage);
}
