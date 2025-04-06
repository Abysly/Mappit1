import { checkAuthState } from "./authState.js";
import { loadAuthModal } from "./authModel.js";
import { loadSubscribeModal } from "./subscribeModel.js"; // Create if needed

export async function checkLoginAccess() {
  const { isAuthenticated } = await checkAuthState();

  if (!isAuthenticated) {
    alert("Please login to continue.");
    loadAuthModal();
    return false;
  }

  return true;
}

export async function checkSubscriptionAccess() {
  const { isAuthenticated, isSubscribed } = await checkAuthState();

  if (!isAuthenticated) {
    alert("Please login to access this feature.");
    loadAuthModal();
    return false;
  }

  if (!isSubscribed) {
    alert("This is a premium feature. Please subscribe to continue.");
    loadSubscribeModal();
    return false;
  }

  return true;
}
export async function setupSubscriptionUI() {
  const { isSubscribed } = await checkAuthState();

  document.querySelectorAll("[data-subscriber-only]").forEach((el) => {
    el.classList.toggle("hidden", !isSubscribed);
  });
}
