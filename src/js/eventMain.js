// eventMain.js
import { setupEventMap } from "./eventModules/eventMap.js";
import { setupEventMapTheme } from "./eventModules/mapTheme.js";
import {
  initializeMapToggle,
  loadApprovedEvents,
  populateDropdowns,
} from "./eventModules/event.js";

export function initializeEventPage() {
  const map = setupEventMap();
  setupEventMapTheme(map);
  initializeMapToggle(map); // ✅ Pass the map instance here
  loadApprovedEvents();
  populateDropdowns();
}
