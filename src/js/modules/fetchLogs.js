// fetchLog.js

// Function to log actions in frontend (approve/delete)
export function logEventAction(action, eventId) {
  const log = {
    eventId,
    action,
    timestamp: new Date().toISOString(),
  };

  // Retrieve existing logs from localStorage, or initialize an empty array if not found
  let logs = JSON.parse(localStorage.getItem("eventLogs")) || [];

  // Add the new log to the array
  logs.push(log);

  // Store updated logs back in localStorage
  localStorage.setItem("eventLogs", JSON.stringify(logs));

  console.log(`Log created for event ID ${eventId} with action ${action}`);
}

// Function to display logs from localStorage in the admin panel
export function showLogs() {
  const logsContainer = document.getElementById("logs-container");
  const logs = JSON.parse(localStorage.getItem("eventLogs")) || [];

  if (logs.length === 0) {
    logsContainer.innerHTML = "<p>No logs available.</p>";
  } else {
    logsContainer.innerHTML = ""; // Clear any previous logs

    logs.forEach((log) => {
      const logElement = document.createElement("div");
      logElement.classList.add(
        "log-entry",
        "p-2",
        "mb-2",
        "border",
        "rounded",
        "bg-gray-100"
      );
      logElement.innerHTML = `
        <p><strong>Action:</strong> ${log.action}</p>
        <p><strong>Event ID:</strong> ${log.eventId}</p>
        <p><strong>Timestamp:</strong> ${log.timestamp}</p>
      `;
      logsContainer.appendChild(logElement);
    });
  }
}
