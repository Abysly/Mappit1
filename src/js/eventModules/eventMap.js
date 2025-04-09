import L from "leaflet";
import "leaflet.fullscreen";
export let currentLocation = null;
export function setupEventMap(containerId = "eventMap", events = []) {
  const container = document.getElementById(containerId);
  if (!container) return null;

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

  // ✅ Fullscreen control
  L.control
    .fullscreen({
      position: "topright",
      title: "Show Fullscreen",
      titleCancel: "Exit Fullscreen",
      forceSeparateButton: true,
    })
    .addTo(map);

  // ✅ Custom "My Location" control
  const myLocationControl = L.Control.extend({
    options: { position: "topright" },
    onAdd: function () {
      const container = L.DomUtil.create(
        "div",
        "leaflet-bar leaflet-control leaflet-control-custom"
      );

      container.innerHTML = `
        <button id="locate-btn" title="Go to My Location">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="2" x2="12" y2="6"></line>
            <line x1="12" y1="18" x2="12" y2="22"></line>
            <line x1="2" y1="12" x2="6" y2="12"></line>
            <line x1="18" y1="12" x2="22" y2="12"></line>
          </svg>
        </button>
      `;

      const button = container.querySelector("#locate-btn");

      L.DomEvent.on(button, "click", (e) => {
        L.DomEvent.stopPropagation(e);
        L.DomEvent.preventDefault(e);

        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;

              // 🔄 Update global variable
              currentLocation = { lat: latitude, lng: longitude };

              map.setView([latitude, longitude], 15);

              // Remove previous if exists
              if (map._currentLocation) {
                map.removeLayer(map._currentLocation.dot);
                map.removeLayer(map._currentLocation.pulse);
              }

              // Add blue dot
              const blueDot = L.circleMarker([latitude, longitude], {
                radius: 8,
                fillColor: "#3388ff",
                color: "#ffffff",
                weight: 2,
                opacity: 1,
                fillOpacity: 1,
              }).addTo(map);

              // Add pulse
              const pulseCircle = L.circle([latitude, longitude], {
                radius: 50,
                color: "#3388ff",
                fillColor: "#3388ff",
                fillOpacity: 0.3,
                weight: 0,
                className: "pulse-circle",
              }).addTo(map);

              map._currentLocation = {
                dot: blueDot,
                pulse: pulseCircle,
              };
            },
            (err) => {
              alert("Unable to retrieve location: " + err.message);
            }
          );
        } else {
          alert("Geolocation not supported.");
        }
      });

      return container;
    },
  });

  map.addControl(new myLocationControl());

  return map;
}
