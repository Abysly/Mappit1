import {
  loadCategories,
  loadPlaces,
  setupCategoryAndPlaceCreation,
} from "./categoryLoader.js";
import { loadDashboard } from "./dashboard.js";
import { initBackupExport } from "./backupSetting.js";
import { initAnalytics } from "./analytics.js";
const adminContentMap = {
  dashboard: "src/components/adminDashboard/dashboard.html",
  approveevents: "src/components/adminDashboard/approve-events.html",
  manageevents: "src/components/adminDashboard/event-management.html",
  usermanagement: "src/components/adminDashboard/user-management.html",
  categorymanagement: "src/components/adminDashboard/category-management.html",
  analytics: "src/components/adminDashboard/analytics.html",
  moderation: "src/components/adminDashboard/content-moderation.html",
  logs: "src/components/adminDashboard/logs.html",
  settings: "src/components/adminDashboard/system-settings.html",
  announcement: "src/components/adminDashboard/announcement.html",
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
        if (view === "manageevents") {
          loadApprovedEvents();
          setupEventPromote();
          loadPromotedEvents();
        }
        if (view === "usermanagement") {
          loadUsers();
        }
        if (view === "categorymanagement") {
          loadCategories();

          loadPlaces();
          setupCategoryAndPlaceCreation();
        }
        if (view === "dashboard") {
          loadDashboard();
        }
        if (view === "settings") {
          initBackupExport();
        }
        if (view === "analytics") {
          initAnalytics();
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
// Function to load approved events
// Function to load approved events
async function loadApprovedEvents() {
  console.log("Loading approved events...");

  try {
    const response = await fetch(
      "http://localhost:5000/api/events?is_approved=true"
    );

    if (!response.ok) {
      throw new Error("Failed to fetch approved events");
    }

    const events = await response.json();
    console.log("Fetched approved events:", events);

    // Retry checking for tbody element multiple times (up to 5 attempts)
    let attempts = 0;
    const maxAttempts = 5;
    const interval = setInterval(() => {
      const mbody = document.getElementById("events-mbody");

      if (mbody) {
        clearInterval(interval);
        populateApprovedEventsTable(events);
      } else {
        attempts++;
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          console.error("The mbody element is still not available.");
        }
      }
    }, 100); // Retry every 100ms
  } catch (error) {
    console.error("Error fetching approved events:", error);
  }
}

// Function to populate the approved events table with all approved events
function populateApprovedEventsTable(events) {
  const mbody = document.getElementById("events-mbody");

  if (!mbody) {
    console.error('The mbody element with id "events-mbody" was not found.');
    return;
  }

  mbody.innerHTML = ""; // Clear the existing table rows

  events.forEach((event) => {
    const row = document.createElement("tr");
    row.classList.add("border-b");

    row.innerHTML = `
  <td class="px-4 py-2">${event.title}</td>
  <td class="px-4 py-2 truncate w-1/6">${event.description}</td>
  <td class="px-4 py-2">${event.organizer_name}</td>
  <td class="px-4 py-2">${event.category_name}</td>
  <td class="px-4 py-2 w-1/5 truncate">${event.place_name}</td>
  <td class="px-4 py-2">
    <div class="flex gap-2">
      <button
        class="bg-green-600 text-white px-3 py-1 rounded-md promote-btn hover:bg-green-700"
        data-id="${event.id}"
      >
        Promote
      </button>
      <button
        class="bg-red-600 text-white px-3 py-1 rounded-md delete-btn hover:bg-red-700"
        data-id="${event.id}"
      >
        Delete
      </button>
    </div>
  </td>
`;

    mbody.appendChild(row);
  });

  // Set up event listeners for promote and delete buttons
  setupEventPromote();
}

async function loadUsers() {
  console.log("Loading users...");

  const loader = document.getElementById("user-loader");
  if (loader) loader.classList.remove("hidden"); // Show loader

  try {
    const res = await fetch("http://localhost:5000/api/users", {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch users");

    const users = await res.json();
    console.log("Fetched users:", users);

    const tbody = document.getElementById("users-tbody");
    if (tbody) {
      populateUsersTable(users);
    } else {
      console.error("The tbody element is not available yet.");
    }
  } catch (error) {
    console.error("Error loading users:", error);
  } finally {
    if (loader) loader.classList.add("hidden"); // Hide loader
  }
}

function populateUsersTable(users) {
  const tbody = document.getElementById("users-tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (!Array.isArray(users) || users.length === 0) {
    console.warn("No users found.");
    return;
  }

  users.forEach((user) => {
    const row = document.createElement("tr");
    row.classList.add("border-b");

    const isAdmin = user.role === "admin"; // Assuming you use a 'role' field

    row.innerHTML = `
      <td class="px-4 py-2">${user.id}</td>
      <td class="px-4 py-2">${user.name}</td>
      <td class="px-4 py-2">${user.email}</td>
      <td class="px-4 py-2">
        <img src="/backend/uploads/${user.profile_pic}" 
             alt="Profile Pic" 
             class="w-10 h-10 rounded-full object-cover" />
      </td>
      <td class="px-4 py-2">
        ${
          user.is_admin
            ? `<span class="text-green-600">Admin</span>`
            : `<span class="text-gray-500">User</span>`
        }
      </td>
      <td class="px-4 py-2">
        ${
          user.is_subscribed
            ? `<span class="text-blue-600">Subscribed</span>`
            : `<span class="text-gray-500">Free</span>`
        }
      </td>
      <td class="px-4 py-2 space-x-2">
  ${
    user.is_admin
      ? `<button class="text-yellow-600 hover:underline remove-admin-btn" data-id="${user.id}">Remove Admin</button>`
      : `<button class="text-green-600 hover:underline make-admin-btn" data-id="${user.id}">Make Admin</button>`
  }
  <button class="text-red-600 hover:underline delete-user-btn" data-id="${
    user.id
  }">Delete</button>
</td>
    `;

    tbody.appendChild(row);
  });

  setupUserActions();
}
function setupUserActions() {
  document.querySelectorAll(".delete-user-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      alert(`Delete user ${id} (implement this later)`);
    });
  });

  document.querySelectorAll(".make-admin-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      await makeAdmin(id);
    });
  });

  document.querySelectorAll(".remove-admin-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      await removeAdmin(id);
    });
  });
}
async function makeAdmin(id) {
  try {
    const res = await fetch(
      `http://localhost:5000/api/users/${id}/make-admin`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to promote user");

    alert("User promoted to admin!");
    loadUsers(); // Refresh the list
  } catch (err) {
    console.error("Error promoting user:", err);
    alert("Error promoting user to admin");
  }
}

async function removeAdmin(id) {
  try {
    const res = await fetch(
      `http://localhost:5000/api/users/${id}/remove-admin`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to demote admin");

    alert("Admin role removed!");
    loadUsers(); // Refresh the list
  } catch (err) {
    console.error("Error removing admin:", err);
    alert("Error removing admin role");
  }
}

// Function to handle event actions (promote, delete)
function setupEventPromote() {
  // Promote button
  const promoteButtons = document.querySelectorAll(".promote-btn");
  promoteButtons.forEach((button) => {
    button.addEventListener("click", async (event) => {
      const eventId = event.target.getAttribute("data-id");
      await promoteEvent(eventId);
    });
  });

  // Delete button (no change here, as per your note)
  const deleteButtons = document.querySelectorAll(".delete-btn");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", async (event) => {
      const eventId = event.target.getAttribute("data-id");
      await deleteEvent(eventId);
    });
  });
}

// 🔥 Real promotion API call
async function promoteEvent(eventId) {
  try {
    const res = await fetch("http://localhost:5000/api/promote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ event_id: eventId }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to promote event");
      return;
    }

    alert("Event promoted successfully!");
    // Optionally re-fetch/promoted events
    await loadPromotedEvents();
    await loadApprovedEvents();
  } catch (err) {
    console.error("Promotion error:", err);
    alert("An error occurred while promoting the event.");
  }
}
async function loadPromotedEvents() {
  try {
    const res = await fetch("http://localhost:5000/api/promote");
    const events = await res.json();

    const tbody = document.getElementById("promoted-events-body");
    tbody.innerHTML = ""; // Clear existing rows

    if (!Array.isArray(events) || events.length === 0) {
      const row = document.createElement("tr");
      row.innerHTML = `<td colspan="6" class="px-4 py-2 text-center text-gray-500">No promoted events</td>`;
      tbody.appendChild(row);
      return;
    }

    events.forEach((event) => {
      const row = document.createElement("tr");
      row.classList.add("border-b", "hover:bg-gray-50");

      row.innerHTML = `
        <td class="px-4 py-2 font-medium">${event.title}</td>
        <td class="px-4 py-2">${event.description}</td>
        <td class="px-4 py-2">${event.organizer_name || "N/A"}</td>
        <td class="px-4 py-2">${event.category_name || "N/A"}</td>
        <td class="px-4 py-2">${event.place_name || "N/A"}</td>
        <td class="px-4 py-2">
          <button class="text-red-600 hover:underline remove-promote-btn" data-id="${
            event.promote_id
          }">
            Remove
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });

    setupPromoteDeleteButtons(); // Hook up the "Remove" buttons
  } catch (err) {
    console.error("Failed to load promoted events:", err);
  }
}
function setupPromoteDeleteButtons() {
  const buttons = document.querySelectorAll(".remove-promote-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const promoteId = btn.getAttribute("data-id");

      try {
        const res = await fetch(
          `http://localhost:5000/api/promote/${promoteId}`,
          {
            method: "DELETE",
          }
        );

        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Failed to remove promotion");
          return;
        }

        alert("Promotion removed!");
        await loadPromotedEvents();
        await loadApprovedEvents();
      } catch (err) {
        console.error("Delete error:", err);
        alert("Error removing promoted event.");
      }
    });
  });
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
      showToast("Event deleted successfully!", "green"); // Reload events after deletion
      loadEventsForApproval();
      loadApprovedEvents();
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
