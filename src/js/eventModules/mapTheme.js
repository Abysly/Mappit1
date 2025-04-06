import L from "leaflet";
import { map } from "./eventMap.js";

export function setupEventMapTheme() {
  if (!map) return; // Map must be initialized first

  const darkTheme = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
    {
      zIndex: 1,
    }
  );

  const positronTheme = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
    {
      zIndex: 2,
    }
  );

  const lightTheme = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      zIndex: 3,
    }
  );

  const warmTheme = L.tileLayer(
    "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
    {
      zIndex: 4,
    }
  );

  const baseLayers = {
    OpenStreetMap: lightTheme,
    "Dark Theme": darkTheme,
    Positron: positronTheme,
    "OpenStreet Hot": warmTheme,
  };

  L.control.layers(baseLayers).addTo(map);
  lightTheme.addTo(map); // Default
}
