export function initializeSettingsPage() {
  const themes = [
    "light",
    "dark",
    "cupcake",
    "bumblebee",
    "emerald",
    "corporate",
    "synthwave",
    "retro",
    "cyberpunk",
    "valentine",
    "halloween",
    "garden",
    "forest",
    "aqua",
    "lofi",
    "pastel",
    "fantasy",
    "wireframe",
    "black",
    "luxury",
    "dracula",
    "cmyk",
    "autumn",
    "business",
    "acid",
    "lemonade",
    "night",
    "coffee",
    "winter",
    "dim",
    "nord",
    "sunset",
  ];

  const select = document.getElementById("theme-select");
  if (!select) return;

  // Populate dropdown
  themes.forEach((theme) => {
    const option = document.createElement("option");
    option.value = theme;
    option.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
    select.appendChild(option);
  });

  // Set current theme
  const currentTheme =
    localStorage.getItem("theme") ||
    document.documentElement.getAttribute("data-theme") ||
    "light";
  select.value = currentTheme;

  // Apply on change
  select.addEventListener("change", () => {
    const selected = select.value;
    document.documentElement.setAttribute("data-theme", selected);
    localStorage.setItem("theme", selected);
  });

  // Apply saved theme
  if (themes.includes(currentTheme)) {
    document.documentElement.setAttribute("data-theme", currentTheme);
  }
}
