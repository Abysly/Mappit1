let modalLoaded = false;

export async function loadSubscribeModal() {
  // Already loaded? Just show
  if (modalLoaded) {
    document.getElementById("subscribeModal")?.classList.remove("hidden");
    return;
  }

  try {
    const response = await fetch("/subscribe.html");
    const html = await response.text();

    // Create a wrapper and inject into DOM
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;
    document.body.appendChild(wrapper);

    modalLoaded = true;
  } catch (error) {
    console.error("Failed to load subscribe modal:", error);
  }
}

export function closeSubscribeModal() {
  const modal = document.getElementById("subscribeModal");
  if (modal) {
    modal.classList.add("hidden");
  }
}

// inside subscribeModel.js after injection:
document.getElementById("subscribeModal").addEventListener("click", (e) => {
  if (e.target.id === "subscribeModal") {
    closeSubscribeModal();
  }
});
