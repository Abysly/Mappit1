import L from "leaflet";

export function setupEventMapTheme(mapInstance) {
  if (!mapInstance) return;

  const darkTheme = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
  );
  const positronTheme = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
  );
  const lightTheme = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  );
  const warmTheme = L.tileLayer(
    "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
  );

  const baseLayers = {
    Light: lightTheme,
    Dark: darkTheme,
    Positron: positronTheme,
    Hot: warmTheme,
  };

  L.control.layers(baseLayers).addTo(mapInstance);
  lightTheme.addTo(mapInstance); // Default layer
}
