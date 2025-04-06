import { logEventAction, showLogs } from "../modules/fetchLogs.js";

const adminContentMap = {
  logs: "src/components/adminDashboard/logs.html",
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

        // After content is injected, call loadEventsForApproval
        if (view === "approveevents") {
          loadEventsForApproval();
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

// This function will be exported and called from main.js
export function initializeAdminPage() {
  console.log("Admin page features initialized.");

  // You can also load events for approval once the page is initialized
  loadEventsForApproval();
}

// Function to load all events (approved and pending)
// Function to load all events (approved = false)
async function loadEventsForApproval() {
  console.log("Loading events for approval...");

  try {
    const response = await fetch(
      "http://localhost:5000/api/events?is_approved=false"
    );

    if (!response.ok) {
      throw new Error("Failed to fetch events");
    }

    const events = await response.json();
    console.log("Fetched events:", events);

    // Ensure tbody exists before attempting to populate
    const tbody = document.getElementById("events-tbody");
    if (tbody) {
      populateEventsTable(events);
    } else {
      console.error("The tbody element is not available yet.");
    }
  } catch (error) {
    console.error("Error fetching events:", error);
  }
}

// Function to populate the events table with all events (approved or pending)
function populateEventsTable(events) {
  const tbody = document.getElementById("events-tbody");

  if (!tbody) {
    console.error('The tbody element with id "events-tbody" was not found.');
    return;
  }

  tbody.innerHTML = ""; // Clear the existing table rows

  events.forEach((event) => {
    const row = document.createElement("tr");
    row.classList.add("border-b");

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

    tbody.appendChild(row);
  });

  // Set up event listeners for approve and delete buttons
  setupEventActions();
}

// Function to handle event actions (approve, delete)
function setupEventActions() {
  // Approve button
  const approveButtons = document.querySelectorAll(".approve-btn");
  approveButtons.forEach((button) => {
    button.addEventListener("click", async (event) => {
      const eventId = event.target.getAttribute("data-id");
      await approveEvent(eventId);
    });
  });

  // Delete button
  const deleteButtons = document.querySelectorAll(".delete-btn");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", async (event) => {
      const eventId = event.target.getAttribute("data-id");
      await deleteEvent(eventId);
    });
  });
}

// Function to approve an event
async function approveEvent(eventId) {
  console.log("Approving event with ID:", eventId);

  try {
    const response = await fetch(
      `http://localhost:5000/api/events/${eventId}/approve`,
      {
        method: "POST",
      }
    );

    if (response.ok) {
      console.log("Event approved successfully!");
      await logEventAction("approve", eventId);
      // Show success toast notification
      showToast("Event approved successfully!", "green");
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
    const response = await fetch(
      `http://localhost:5000/api/events/${eventId}`,
      {
        method: "DELETE",
      }
    );

    if (response.ok) {
      console.log("Event deleted successfully!");
      await logEventAction("approve", eventId);
      // Reload events after deletion
      showToast("Event Deleted successfully!", "red");
      loadEventsForApproval();
    } else {
      throw new Error("Failed to delete event");
    }
  } catch (error) {
    console.error("Error deleting event:", error);
  }
}
// Function to show toast notification
function showToast(message, color) {
  const toast = document.createElement("div");
  toast.classList.add(
    "fixed",
    "bottom-4",
    "right-4",
    "bg-" + color + "-500",
    "text-white",
    "py-2",
    "px-4",
    "rounded",
    "shadow-lg",
    "text-sm"
  );

  toast.innerText = message;

  document.body.appendChild(toast);

  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.remove();
  }, 3000);
}
