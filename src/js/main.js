import { loadNavbar } from "../js/modules/loadComponents.js";
import { loadFooter } from "../js/modules/footer.js";
import { setupRouter } from "./router.js";
import { setupPricingToggle } from "../js/modules/pricingToggle.js";
import {
  setupAuthButtons,
  updateAuthUI,
} from "../js/modules/authController.js";

// Application initialization
async function initApp() {
  try {
    await Promise.all([loadNavbar(), loadFooter()]);

    setupRouter();
    setupPricingToggle();
    setupAuthButtons();

    // Initial auth check
    await updateAuthUI();

    // Setup periodic auth checks (every 5 minutes)
    const authCheckInterval = setInterval(updateAuthUI, 300000);

    // Cleanup on page unload
    window.addEventListener("beforeunload", () => {
      clearInterval(authCheckInterval);
    });
  } catch (error) {
    console.error("App initialization failed:", error);
    // Implement error UI here if needed
  }
}

// Start the app
document.addEventListener("DOMContentLoaded", initApp);
