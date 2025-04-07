import L from "leaflet";

export function setupEventMap(containerId = "eventMap", events = []) {
  const container = document.getElementById(containerId);
  if (!container) return null;

  // Prevent reinitializing
  if (container._leaflet_id) {
    container._leaflet_id = null;
  }

  const map = L.map(containerId, {
    center: [20.5937, 78.9629],
    zoom: 5,
    minZoom: 4,
    maxZoom: 18,
    maxBounds: [
      [-200.0, -200.0],
      [200, 200],
    ],
    maxBoundsViscosity: 1.0,
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
  L.control.scale({ imperial: false }).addTo(map);

  return map;
}
