// eventMain.js
// main.js
import "leaflet/dist/leaflet.css"; // Already needed for Leaflet
import "leaflet.fullscreen/Control.FullScreen.css"; // Add this too
import "leaflet.fullscreen";

import { setupEventMap } from "./eventModules/eventMap.js";
import { setupEventMapTheme } from "./eventModules/mapTheme.js";
import {
  initializeMapToggle,
  loadApprovedEvents,
  populateDropdowns,
} from "./eventModules/event.js";
import { loadFeaturedEvents } from "./eventModules/featuredEvent.js";

export function initializeEventPage() {
  const map = setupEventMap();
  setupEventMapTheme(map);
  initializeMapToggle(map); // ✅ Pass the map instance here
  loadApprovedEvents();
  populateDropdowns();
  loadFeaturedEvents();
}
