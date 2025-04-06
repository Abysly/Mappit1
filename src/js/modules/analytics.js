// src/js/modules/analytic.js
import {
  Chart,
  ScatterController,
  LinearScale,
  PointElement,
  TimeScale,
  Tooltip,
  Title,
} from "chart.js";
import "chartjs-adapter-date-fns";

// Register required Chart.js components
Chart.register(
  ScatterController,
  LinearScale,
  PointElement,
  TimeScale,
  Tooltip,
  Title
);

let analyticsChartInstance = null;

export async function initAnalytics() {
  const canvas = document.getElementById("analytics-chart");
  if (!canvas) return console.warn("❗ analytics-chart canvas not found");

  try {
    const response = await fetch("http://localhost:5000/api/events");
    const events = await response.json();

    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();

    const filtered = events.filter((event) => {
      const date = new Date(event.start_date);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    });

    const dataPoints = filtered.map((event) => ({
      x: new Date(event.start_date),
      y: parseFloat(event.price) || 0, // 👈 convert price to number
      title: event.title,
    }));

    if (analyticsChartInstance) {
      analyticsChartInstance.destroy();
    }

    analyticsChartInstance = new Chart(canvas.getContext("2d"), {
      type: "scatter",
      data: {
        datasets: [
          {
            label: "Event Price vs Date",
            data: dataPoints,
            backgroundColor: "rgba(99, 102, 241, 0.8)", // indigo-500
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.raw.title}: ₹${ctx.raw.y}`,
            },
          },
          title: {
            display: true,
            text: "Events This Month (Date vs Price)",
          },
        },
        scales: {
          x: {
            type: "time",
            time: {
              unit: "day",
              stepSize: 3, // 👈 every 3 days
              tooltipFormat: "MMM dd",
            },
            min: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            max: new Date(
              new Date().getFullYear(),
              new Date().getMonth() + 1,
              0
            ),
            title: {
              display: true,
              text: "Date",
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 10, // 👈 every ₹10
            },
            title: {
              display: true,
              text: "Price (₹)",
            },
          },
        },
      },
    });
  } catch (err) {
    console.error("❌ Failed to load analytics:", err);
  }
}

export function destroyAnalytics() {
  if (analyticsChartInstance) {
    analyticsChartInstance.destroy();
    analyticsChartInstance = null;
  }
}
