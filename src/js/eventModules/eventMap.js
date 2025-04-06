import L from "leaflet";

export let map; // We will assign map later

export function setupEventMap() {
  const mapContainer = document.getElementById("eventMap");
  if (!mapContainer) return;

  map = L.map("eventMap", {
    center: [20.5937, 78.9629],
    zoom: 5,
    minZoom: 2,
    maxZoom: 18,
    maxBounds: [
      [-200.0, -200.0],
      [200, 200],
    ],
    maxBoundsViscosity: 1.0,
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  L.control.scale({ imperial: false }).addTo(map);
}
