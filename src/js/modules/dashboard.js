export async function loadDashboard() {
  console.log("Loading dashboard data...");

  try {
    const [usersRes, eventsRes, categoriesRes, recentRes] = await Promise.all([
      fetch("http://localhost:5000/api/users/count"),
      fetch("http://localhost:5000/api/events/count"),
      fetch("http://localhost:5000/api/categories/count"),
      fetch("http://localhost:5000/api/events/recent"),
    ]);

    if (!usersRes.ok || !eventsRes.ok || !categoriesRes.ok || !recentRes.ok) {
      throw new Error("One or more dashboard API requests failed.");
    }

    const users = await usersRes.json();
    const events = await eventsRes.json();
    const categories = await categoriesRes.json();
    const recentEvents = await recentRes.json();

    document.getElementById("total-users").textContent = users.count || 0;
    document.getElementById("total-events").textContent = events.count || 0;
    document.getElementById("total-categories").textContent =
      categories.count || 0;

    populateRecentEvents(recentEvents);
  } catch (error) {
    console.error("Dashboard load error:", error);
  }
}

function populateRecentEvents(events) {
  const tbody = document.getElementById("recent-events-tbody");

  if (!tbody) {
    console.error('Element with id "recent-events-tbody" not found.');
    return;
  }

  tbody.innerHTML = "";

  events.forEach((event) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td class="px-4 py-2">${event.title}</td>
      <td class="px-4 py-2">${new Date(
        event.created_at
      ).toLocaleDateString()}</td>
      <td class="px-4 py-2">${event.organizer || "N/A"}</td>
      <td class="px-4 py-2">
        <span class="inline-block px-2 py-1 text-xs rounded-full ${
          event.status === "active"
            ? "bg-green-100 text-green-700"
            : "bg-gray-200 text-gray-700"
        }">
          ${event.status}
        </span>
      </td>
    `;

    tbody.appendChild(tr);
  });
}
