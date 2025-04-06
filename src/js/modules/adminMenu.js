const adminContentMap = {
  dashboard: "src/components/adminDashboard/dashboard.html",
  approveevents: "src/components/adminDashboard/approve-events.html",
  manageevents: "src/components/adminDashboard/event-management.html",
  usermanagement: "src/components/adminDashboard/user-management.html",
  venuemanagement: "src/components/adminDashboard/venue-management.html",
  analytics: "src/components/adminDashboard/analytics.html",
  moderation: "src/components/adminDashboard/content-moderation.html",
  settings: "src/components/adminDashboard/system-settings.html",
};

export function setupAdminMenu() {
  const buttons = document.querySelectorAll("[data-admin-menu]");
  const contentArea = document.getElementById("admin-content");
  document.getElementById("eventDropdownBtn").addEventListener("click", () => {
    const submenu = document.getElementById("eventSubMenu");
    const icon = document.getElementById("eventDropdownIcon");

    submenu.classList.toggle("hidden");
    icon.classList.toggle("rotate-180");
  });

  if (!contentArea) {
    console.error("Admin content container not found");
    return;
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      // Remove highlight from all
      buttons.forEach((b) =>
        b.classList.remove("bg-gray-100", "font-bold", "text-blue-600")
      );
      // Highlight active
      btn.classList.add("bg-gray-100", "font-bold", "text-blue-600");

      const view = btn.dataset.adminMenu;
      const file = adminContentMap[view];

      if (!file) {
        console.warn(`No file mapped for menu: ${view}`);
        return;
      }

      try {
        const res = await fetch(file);
        if (!res.ok) throw new Error("Failed to fetch content");
        const html = await res.text();
        contentArea.innerHTML = html;
        // After loading, initialize specific admin page functionality
        if (view === "approveevents") {
          initializeAdminPage(); // Only call for the approveevents page
        }
      } catch (err) {
        console.error(`Error loading ${file}:`, err);
        contentArea.innerHTML = `<p class="text-red-500">Failed to load ${view} section.</p>`;
      }
    });
  });

  // Load default section
  const defaultBtn = document.querySelector("[data-admin-menu].default");
  if (defaultBtn) defaultBtn.click();
}

// adminMenu.js

export function initializeAdminPage() {
  console.log("Admin page features initialized.");

  // Call the function to load events that need approval
  loadEventsForApproval();
}

// Function to load events for approval (not approved yet)
async function loadEventsForApproval() {
  console.log("Loading events for approval...");

  const tbody = document.getElementById("events-tbody");
  tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4">Loading events...</td></tr>`; // Display loading message

  try {
    // Fetch pending events (those with is_approved = false)
    const response = await fetch("/api/events/pending");

    if (!response.ok) {
      throw new Error("Failed to fetch events");
    }

    const events = await response.json();
    populateEventsTable(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-red-500">Failed to load events.</td></tr>`;
  }
}

// Function to populate the events table with pending events
function populateEventsTable(events) {
  const tbody = document.getElementById("events-tbody");
  tbody.innerHTML = ""; // Clear the existing table rows

  if (events.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4">No events to approve.</td></tr>`;
    return;
  }

  events.forEach((event) => {
    // Create table row for each event
    const row = document.createElement("tr");
    row.classList.add("border-b");

    // Create the table cells
    row.innerHTML = `
      <td class="px-4 py-2">${event.title}</td>
      <td class="px-4 py-2">${event.description}</td>
      <td class="px-4 py-2">${event.organizer_name}</td>
      <td class="px-4 py-2">${event.category_name}</td>
      <td class="px-4 py-2">${event.place_name}</td>
      <td class="px-4 py-2 space-x-2">
        <button class="text-green-600 hover:underline approve-btn" data-id="${event.id}">Approve</button>
        <button class="text-red-600 hover:underline delete-btn" data-id="${event.id}">Delete</button>
      </td>
    `;

    // Append the row to the table body
    tbody.appendChild(row);
  });

  // Set up event listeners for approve and delete buttons
  setupEventActions();
}

// Function to handle event actions (approve, delete)
function setupEventActions() {
  // Use event delegation for approve and delete buttons
  const tbody = document.getElementById("events-tbody");

  tbody.addEventListener("click", async (event) => {
    if (event.target.classList.contains("approve-btn")) {
      const eventId = event.target.getAttribute("data-id");
      await approveEvent(eventId);
    } else if (event.target.classList.contains("delete-btn")) {
      const eventId = event.target.getAttribute("data-id");
      await deleteEvent(eventId);
    }
  });
}

// Function to approve an event
async function approveEvent(eventId) {
  console.log("Approving event with ID:", eventId);

  try {
    const response = await fetch(`/api/events/${eventId}/approve`, {
      method: "POST",
    });

    if (response.ok) {
      console.log("Event approved successfully!");
      // Reload events after approval
      loadEventsForApproval();
    } else {
      throw new Error("Failed to approve event");
    }
  } catch (error) {
    console.error("Error approving event:", error);
  }
}

// Function to delete an event
async function deleteEvent(eventId) {
  console.log("Deleting event with ID:", eventId);

  try {
    const response = await fetch(`/api/events/${eventId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      console.log("Event deleted successfully!");
      // Reload events after deletion
      loadEventsForApproval();
    } else {
      throw new Error("Failed to delete event");
    }
  } catch (error) {
    console.error("Error deleting event:", error);
  }
}
