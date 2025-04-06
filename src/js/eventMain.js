import { setupEventMap } from "./eventModules/eventMap.js";
import { setupEventMapTheme } from "./eventModules/mapTheme.js";

export function initializeEventPage() {
  const map = setupEventMap();
  setupEventMapTheme(map);
}
