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

        // After content is injected, call loadEventsForApproval
        if (view === "approveevents") {
          loadEventsForApproval();
        }
        if (view === "manageevents") {
          loadApprovedEvents();
        }
        if (view === "usermanagement") {
          loadUsers();
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
  loadApprovedEvents();
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
      <td class="px-4 py-2">${event.description}</td>
      <td class="px-4 py-2">${event.organizer_name}</td>
      <td class="px-4 py-2">${event.category_name}</td>
      <td class="px-4 py-2">${event.place_name}</td>
      <td class="px-4 py-2 space-x-2">
        <button class="text-blue-600 hover:underline promote-btn" data-id="${event.id}">Promote</button>
        <button class="text-red-600 hover:underline delete-btn" data-id="${event.id}">Delete</button>
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

    row.innerHTML = `
      <td class="px-4 py-2">${user.id}</td>
      <td class="px-4 py-2">${user.name}</td>
      <td class="px-4 py-2">${user.email}</td>
      <td class="px-4 py-2">
        <img src="/backend/uploads/${
          user.profile_pic
        }" alt="Profile Pic" class="w-10 h-10 rounded-full object-cover" />
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
  const deleteButtons = document.querySelectorAll(".delete-user-btn");
  deleteButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      alert(`Delete user ${id} (implement this later)`);
    });
  });
}

// Function to handle event actions (promote, delete)
function setupEventPromote() {
  // Promote button
  const promoteButtons = document.querySelectorAll(".promote-btn");
  promoteButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const eventId = event.target.getAttribute("data-id");
      promoteEvent(eventId);
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

// Function to promote an event (currently just an alert)
function promoteEvent(eventId) {
  console.log("Promoting event with ID:", eventId);
  alert("Event promoted! (Feature will be implemented later)");
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
