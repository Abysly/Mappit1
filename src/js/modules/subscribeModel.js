let modalLoaded = false;

export async function loadSubscribeModal() {
  // If already loaded, simply show it
  if (modalLoaded) {
    document.getElementById("subscribeModal")?.classList.remove("hidden");
    return;
  }

  try {
    const response = await fetch("/subscribe.html");
    const html = await response.text();

    // Create a wrapper and inject the modal HTML into the DOM
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;
    document.body.appendChild(wrapper);

    // After injection, attach the event listener safely
    const subscribeModalEl = document.getElementById("subscribeModal");
    if (subscribeModalEl) {
      subscribeModalEl.addEventListener("click", (e) => {
        // If the click is on the backdrop (i.e. the modal container)
        if (e.target.id === "subscribeModal") {
          closeSubscribeModal();
        }
      });
    } else {
      console.warn("subscribeModal element not found after injection!");
    }

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
