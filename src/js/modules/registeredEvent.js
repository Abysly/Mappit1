export async function initializeRegisteredEvents() {
  const container = document.getElementById("registeredEventsContainer");
  if (!container) {
    console.error("❌ registeredEventsContainer not found");
    return;
  }

  const userJson = localStorage.getItem("user");
  if (!userJson) {
    container.innerHTML = `<p class="text-red-500">❌ You must be logged in to see registered events.</p>`;
    return;
  }

  const user = JSON.parse(userJson);
  console.log("📦 Loaded user:", user);

  try {
    const response = await fetch(
      `http://localhost:5000/api/users/${user.id}/registrations`
    );
    const events = await response.json();

    console.log("📦 Fetched registered events:", events);

    if (!events || events.length === 0) {
      container.innerHTML = `<p class="text-gray-500">No events registered yet.</p>`;
      return;
    }

    container.innerHTML = events
      .map((event) => {
        const eventDate = new Date(event.start_date).toLocaleDateString(
          undefined,
          {
            month: "long",
            day: "numeric",
            year: "numeric",
          }
        );
        const location = event.venue || "TBD";

        return `
          <div class="bg-base-100 shadow rounded-xl p-4 hover:shadow-md transition">
            <h3 class="text-lg font-semibold text-base-content">${
              event.title
            }</h3>
            <p class="text-sm text-primary mt-1">${eventDate} · ${location}</p>
            <p class="text-base-content mt-2 text-sm opacity-80">
              ${event.description || ""}
            </p>
            <div class="mt-4 flex justify-between items-center">
              <span class="text-sm text-success font-medium">Registered</span>
              <button class="text-sm text-primary hover:underline" onclick="storeAndGoToEventDetails(${
                event.id
              })">
                View Details
              </button>
            </div>
          </div>
        `;
      })
      .join("");
  } catch (err) {
    console.error("❌ Failed to load registered events:", err);
    container.innerHTML = `<p class="text-red-500">❌ Failed to load events.</p>`;
  }
}

// Global function for button click to view event details
window.storeAndGoToEventDetails = function (eventId) {
  fetch(`http://localhost:5000/api/events/${eventId}`)
    .then((res) => {
      if (!res.ok) throw new Error("Event not found");
      return res.json();
    })
    .then((eventData) => {
      localStorage.setItem("selectedEvent", JSON.stringify(eventData));
      window.location.href = "/pages/event-details.html";
    })
    .catch((err) => {
      console.error("Failed to load event details:", err);
      alert("❌ Unable to load event details.");
    });
};
