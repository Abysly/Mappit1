export function initializeMapToggle(mapInstance) {
  window.mapInstance = mapInstance;
  const toggleMapBtn = document.getElementById("toggleMapBtn");
  const eventMap = document.getElementById("eventMap");
  if (toggleMapBtn && eventMap) {
    toggleMapBtn.addEventListener("click", () => {
      const isHidden = eventMap.classList.contains("hidden");

      eventMap.classList.toggle("hidden");
      toggleMapBtn.querySelector("span").textContent = isHidden
        ? "Hide Map"
        : "View Map";

      if (isHidden && mapInstance) {
        setTimeout(() => {
          clearMarkers(mapInstance);
          addMarkersToMap(mapInstance, window.approvedEvents);
          mapInstance.invalidateSize();
        }, 300);
      }
    });
  }
}

export async function loadApprovedEvents() {
  try {
    const response = await fetch(
      "http://localhost:5000/api/events?is_approved=true"
    );
    const events = await response.json();
    const eventList = document.getElementById("eventList");
    const paginationContainer = document.getElementById("pagination");
    const searchInput = document.getElementById("eventSearch");
    const categorySelect = document.getElementById("categorySelect");
    const placeSelect = document.getElementById("placeSelect");
    const dateSelect = document.getElementById("dateSelect");

    if (!eventList) return;

    window.events = events;
    const eventsPerPage = 9;
    let currentPage = 1;

    function applyFilters() {
      const searchTerm = searchInput?.value.trim().toLowerCase() || "";
      const selectedCategory = categorySelect?.value || "";
      const selectedPlace = placeSelect?.value || "";
      const selectedDate = dateSelect?.value || "";

      const now = new Date();
      const filtered = window.events.filter((event) => {
        const titleMatch = event.title.toLowerCase().startsWith(searchTerm);

        const categoryMatch =
          !selectedCategory ||
          selectedCategory === "Category" ||
          event.category_name === selectedCategory;

        const placeMatch =
          !selectedPlace ||
          selectedPlace === "Place" ||
          event.place_name === selectedPlace;

        const startDate = new Date(event.start_date);
        let dateMatch = true;
        if (selectedDate === "today") {
          const today = new Date();
          dateMatch = startDate.toDateString() === today.toDateString();
        } else if (selectedDate === "this_weekend") {
          const day = now.getDay();
          const weekendStart = new Date(now);
          weekendStart.setDate(now.getDate() + (6 - day));
          const weekendEnd = new Date(weekendStart);
          weekendEnd.setDate(weekendStart.getDate() + 1);
          dateMatch = startDate >= weekendStart && startDate <= weekendEnd;
        } else if (selectedDate === "this_month") {
          dateMatch =
            startDate.getMonth() === now.getMonth() &&
            startDate.getFullYear() === now.getFullYear();
        }

        return titleMatch && categoryMatch && placeMatch && dateMatch;
      });

      currentPage = 1;
      window.approvedEvents = filtered.filter((e) => e.latitude && e.longitude);
      renderEvents(filtered, currentPage);
    }

    function renderEvents(filteredEvents, page = 1) {
      eventList.innerHTML = "";

      const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
      const startIndex = (page - 1) * eventsPerPage;
      const endIndex = startIndex + eventsPerPage;
      const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

      if (filteredEvents.length === 0) {
        eventList.innerHTML =
          '<p class="text-gray-600">No matching events found.</p>';
        paginationContainer.innerHTML = "";
        return;
      }

      eventList.className =
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";

      paginatedEvents.forEach((event) => {
        const card = document.createElement("div");
        card.className =
          "bg-base-300 p-4 text-sm rounded-xl shadow-md hover:shadow-lg transition space-y-2 relative border border-base-300 animate-fade-in";
        card.style.cursor = "pointer";

        card.innerHTML = `
    <div class="flex justify-between items-start">
      <h3 class="text-base font-semibold text-base-content">${event.title}</h3>
      <button onclick='window.viewEventDetails(${JSON.stringify(event)})'
        class="ml-2 px-3 py-1 bg-primary hover:bg-primary-focus text-primary-content text-xs font-medium rounded shadow transition">
        View Details
      </button>
    </div>
    <p class="text-base-content/70 text-xs">${event.description}</p>

    <div class="flex items-center text-xs text-base-content/60 gap-1">
      <svg class="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <span>${event.place_name}</span>
    </div>

    <div class="flex items-center text-xs text-base-content/60 gap-1">
      <svg class="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
      <span>${new Date(event.start_date).toLocaleDateString()}</span>
    </div>
    `;

        // ⬇️ Add click listener to focus map on marker
        card.addEventListener("click", () => {
          const mapContainer = document.getElementById("eventMap");
          const marker = window.eventMarkers?.[event.id];

          if (!window.mapInstance || !marker) return;

          // Reveal map if hidden
          if (mapContainer?.classList.contains("hidden")) {
            mapContainer.classList.remove("hidden");
            const toggleBtn = document.getElementById("toggleMapBtn");
            if (toggleBtn) {
              toggleBtn.querySelector("span").textContent = "Hide Map";
            }

            // Allow time for DOM reveal before adjusting map
            setTimeout(() => {
              window.mapInstance.invalidateSize();
              focusOnMarker(marker);
            }, 300);
          } else {
            focusOnMarker(marker);
          }
        });

        eventList.appendChild(card);
      });

      updatePaginationControls(totalPages, page, filteredEvents);
    }

    // helper function to pan and zoom to marker
    function focusOnMarker(marker) {
      window.mapInstance.setView(marker.getLatLng(), 15, {
        animate: true,
        duration: 0.5,
      });
      marker.openPopup();
    }

    function updatePaginationControls(totalPages, currentPage, filteredEvents) {
      paginationContainer.innerHTML = "";

      if (totalPages <= 1) return;

      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.className = `px-3 py-1 rounded ${
          i === currentPage
            ? "bg-blue-600 text-white font-semibold"
            : "bg-gray-200 hover:bg-gray-300"
        }`;
        btn.addEventListener("click", () => {
          currentPage = i;
          renderEvents(filteredEvents, currentPage);

          if (
            document
              .getElementById("eventMap")
              ?.classList.contains("hidden") === false &&
            window.mapInstance
          ) {
            const pageEvents = filteredEvents
              .slice(
                (currentPage - 1) * eventsPerPage,
                currentPage * eventsPerPage
              )
              .filter((e) => e.latitude && e.longitude);

            window.approvedEvents = pageEvents;

            clearMarkers(window.mapInstance);
            addMarkersToMap(window.mapInstance, pageEvents);
          }
        });

        paginationContainer.appendChild(btn);
      }
    }

    [searchInput, categorySelect, placeSelect, dateSelect].forEach((el) => {
      if (el) el.addEventListener("input", applyFilters);
    });

    applyFilters();
  } catch (error) {
    console.error("Failed to load approved events:", error);
    document.getElementById("eventList").innerHTML =
      '<p class="text-red-600">Error loading events.</p>';
  }
}

export async function populateDropdowns() {
  try {
    const [categoriesRes, placesRes] = await Promise.all([
      fetch("http://localhost:5000/api/categories"),
      fetch("http://localhost:5000/api/places"),
    ]);

    const categories = await categoriesRes.json();
    const places = await placesRes.json();

    const categorySelect = document.getElementById("categorySelect");
    const placeSelect = document.getElementById("placeSelect");

    categorySelect.length = 1;
    placeSelect.length = 1;

    categories.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat.name;
      option.textContent = cat.name;
      categorySelect.appendChild(option);
    });

    places.forEach((place) => {
      const option = document.createElement("option");
      option.value = place.name;
      option.textContent = place.name;
      placeSelect.appendChild(option);
    });
  } catch (err) {
    console.error("Error loading dropdown data:", err);
  }
}

export function addMarkersToMap(mapInstance, events) {
  if (!mapInstance || !Array.isArray(events)) return;

  window.eventMarkers = {}; // reset marker refs

  events.forEach((event) => {
    if (event.latitude && event.longitude) {
      const marker = L.marker([event.latitude, event.longitude])
        .addTo(mapInstance)
        .bindPopup(
          `
      <div class="w-64 space-y-2">
        <h3 class="text-lg font-bold">${event.title}</h3>
        <p>📍 ${event.place_name}</p>
        <p>📅 ${new Date(event.start_date).toLocaleDateString()}</p>
        <p>🎯 ${event.target_audience || "General"}</p>
        <p>💺 ${event.total_seats || "N/A"}</p>
        <p>💰 ₹${event.price || 0}</p>
        <p class="text-xs opacity-70 line-clamp-3">${event.description}</p>
        <a href="#eventdetails" onclick='window.viewEventDetails(${JSON.stringify(
          event
        )})'
          class="inline-block mt-2 w-full text-center px-3 py-1.5 bg-base-100 text-base-content text-xs font-medium rounded hover:bg-base-200 transition">
          View Full Details →
        </a>
      </div>
      `,
          { className: "custom-popup" }
        );

      window.eventMarkers[event.id] = marker; // track by event.id
    }
  });
}

export function clearMarkers(mapInstance) {
  mapInstance.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      mapInstance.removeLayer(layer);
    }
  });
}
window.viewEventDetails = function (eventData) {
  // Save to localStorage (or sessionStorage if preferred)
  localStorage.setItem("selectedEvent", JSON.stringify(eventData));

  // Redirect to the event details page
  window.location.href = "#eventdetails";
};
