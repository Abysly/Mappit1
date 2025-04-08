export async function loadFeaturedEvents() {
  try {
    const res = await fetch("http://localhost:5000/api/promote");
    const events = await res.json();

    const container = document.getElementById("featuredEventsList");
    container.innerHTML = ""; // Clear previous

    if (events.length === 0) {
      container.innerHTML =
        '<p class="text-gray-500">No featured events available.</p>';
      return;
    }

    events.forEach((event) => {
      const el = document.createElement("div");
      el.className = "flex items-start gap-4";

      el.innerHTML = `
  <div class="event-card bg-base-300 rounded-xl border border-base-300 overflow-hidden hover:shadow-lg transition-all duration-300 group h-full flex flex-col relative">
    <!-- Header with icon and basic info -->
    <div class="p-5 flex items-start gap-4">
      <div class="w-16 h-16 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <div class="flex-1">
        <h3 class="font-bold text-base-content group-hover:text-primary transition-colors">
          ${event.title}
        </h3>
        <div class="flex items-center text-sm text-base-content/60 mt-1">
          <svg class="w-4 h-4 mr-1 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          ${event.place_name || "TBD"}
        </div>
      </div>
    </div>

    <!-- Date and action section -->
    <div class="border-t border-base-200 p-5 mt-auto">
      <div class="flex items-center justify-between">
        <div class="flex items-center text-primary font-medium">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          ${formatDate(event.start_date)}
        </div>
        <button class="btn btn-primary btn-sm">
          Details
        </button>
      </div>
    </div>

    <!-- Optional badge -->
    ${
      event.isSpecial
        ? `<div class="absolute top-3 right-3 badge badge-error text-white font-semibold rotate-6">
            Featured
          </div>`
        : ""
    }
  </div>
`;

      container.appendChild(el);
    });
  } catch (err) {
    console.error("Error loading featured events:", err);
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
