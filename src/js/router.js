import { setupPricingToggle } from "../js/modules/pricingToggle.js";
import { initializeEventPage } from "./eventMain.js";
import { setupProfileMenu } from "../js/modules/profileMenu.js"; // ✅ Import profile menu setup
import { initializeHostPage } from "../js/modules/host.js"; // ✅ Import host setup
import { setupAdminMenu } from "../js/modules/adminMenu.js";
import { initializeSettingsPage } from "../js/modules/settings.js";
import { initializeEventDetails } from "../js/modules/eventdetails.js";
import { initializeRegisteredEvents } from "../js/modules/registeredEvent.js";
export async function loadPage(page) {
  try {
    const res = await fetch(`/src/pages/${page}.html`);
    const html = await res.text();
    document.getElementById("content").innerHTML = html;

    // 🔧 Run specific setup functions depending on the page
    if (page === "pricing") {
      setupPricingToggle();
    } else if (page === "events") {
      initializeEventPage();
    } else if (page === "profile") {
      setupProfileMenu(); // ✅ Profile page setup
    } else if (page === "host") {
      initializeHostPage(); // ✅ Hook in host logic
    } else if (page == "admin") {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user?.is_admin) {
        document.getElementById(
          "content"
        ).innerHTML = `<p class="text-red-500 p-4">❌ Access Denied</p>`;
        return;
      }

      setupAdminMenu();
    } else if (page === "settings") {
      initializeSettingsPage(); // ✅ Hook in settings logic
    } else if (page === "eventdetails") {
      initializeEventDetails();
    }
  } catch (err) {
    document.getElementById("content").innerHTML = `<p>Page not found.</p>`;
  }
}

export function setupRouter() {
  // On hash change
  window.addEventListener("hashchange", () => {
    const page = location.hash.replace("#", "") || "home";
    loadPage(page);
  });

  // On initial load
  const initialPage = location.hash.replace("#", "") || "home";
  loadPage(initialPage);
}
