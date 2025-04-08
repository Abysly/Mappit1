import { API_BASE_URL } from "../../config.js";

export async function initializeYourEvents() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || !user.id) {
    console.error("User not found in localStorage.");
    return;
  }

  const container = document.getElementById("your-events-container");
  if (!container) {
    console.error("❌ your-events-container not found");
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/users/${user.id}/events`);
    const events = await res.json();

    if (!Array.isArray(events)) {
      throw new Error("Invalid response format");
    }

    if (events.length === 0) {
      container.innerHTML = `<p class="text-base-content opacity-70">You haven't created any events yet.</p>`;
      return;
    }

    container.innerHTML = events
      .map(
        (event) => `
        <div class="bg-base-100 shadow rounded-xl p-4 hover:shadow-md transition" data-event-id="${
          event.id
        }">
          <h3 class="text-lg font-semibold text-base-content">${
            event.title
          }</h3>
          <p class="text-sm text-primary mt-1">${formatDate(
            event.start_date
          )} · ${event.address || "Online"}</p>
          <p class="text-base-content mt-2 text-sm opacity-80">${
            event.description || "No description provided."
          }</p>
          <div class="mt-4 flex justify-between items-center">
            <span class="text-sm text-info font-medium">${
              event.registrations_count
            } registered</span>
            <button class="text-sm text-error hover:underline delete-btn">Delete</button>
          </div>
        </div>
      `
      )
      .join("");

    // Attach event listeners to delete buttons
    container.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const card = e.target.closest("[data-event-id]");
        const eventId = card.dataset.eventId;

        const confirmDelete = confirm(
          "Are you sure you want to delete this event?"
        );
        if (!confirmDelete) return;

        try {
          const res = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
            method: "DELETE",
          });

          if (res.ok) {
            card.remove(); // Remove from DOM
          } else {
            const { error } = await res.json();
            alert("Delete failed: " + (error || "Unknown error"));
          }
        } catch (err) {
          console.error("Failed to delete event:", err);
          alert("Something went wrong. Please try again.");
        }
      });
    });
  } catch (error) {
    console.error("Error fetching your events:", error);
    container.innerHTML = `<p class="text-red-500">Failed to load your events.</p>`;
  }
}

function formatDate(dateStr) {
  const options = { month: "short", day: "numeric", year: "numeric" };
  return new Date(dateStr).toLocaleDateString(undefined, options);
}
