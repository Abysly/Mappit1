import { setupEventMap } from "../eventModules/eventMap.js";
import { setupEventMapTheme } from "../eventModules/mapTheme.js";
import { map } from "../eventModules/eventMap.js";
import L from "leaflet";

export function initializeHostPage() {
  setupEventMap();
  setupEventMapTheme();

  let marker;

  async function loadDropdowns() {
    try {
      const [placesRes, categoriesRes] = await Promise.all([
        fetch("http://localhost:5000/api/places"),
        fetch("http://localhost:5000/api/categories"),
      ]);

      const places = await placesRes.json();
      const categories = await categoriesRes.json();

      const placeSelect = document.getElementById("place");
      const categorySelect = document.getElementById("category");

      placeSelect.innerHTML = `<option disabled selected>Select Place</option>`;
      places.forEach((place) => {
        const option = document.createElement("option");
        option.value = place.id;
        option.textContent = place.name;
        placeSelect.appendChild(option);
      });

      categorySelect.innerHTML = `<option disabled selected>Select Category</option>`;
      categories.forEach((cat) => {
        const option = document.createElement("option");
        option.value = cat.id;
        option.textContent = cat.name;
        categorySelect.appendChild(option);
      });
    } catch (err) {
      console.error("❌ Dropdown load error:", err);
    }
  }

  loadDropdowns();

  async function getAddressFromCoords(lat, lng) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "event-platform/1.0",
        },
      });
      return await res.json();
    } catch (err) {
      console.error("❌ Geocoding error:", err);
      return null;
    }
  }

  map.on("click", async (e) => {
    const { lat, lng } = e.latlng;
    const geoData = await getAddressFromCoords(lat, lng);

    if (!geoData?.address?.country || geoData.address.country !== "India") {
      alert("❌ Please select a location *within India*.");
      return;
    }

    if (!marker) {
      marker = L.marker([lat, lng], { draggable: true }).addTo(map);
      marker.on("dragend", async (event) => {
        const { lat, lng } = event.target.getLatLng();
        const draggedData = await getAddressFromCoords(lat, lng);

        if (
          !draggedData?.address?.country ||
          draggedData.address.country !== "India"
        ) {
          alert("❌ Marker must stay within India.");
          marker.setLatLng([20.5937, 78.9629]);
          setLocationFields("", "", "");
          return;
        }

        setLocationFields(lat, lng, draggedData.display_name);
      });
    } else {
      marker.setLatLng([lat, lng]);
    }

    setLocationFields(lat, lng, geoData.display_name);
  });

  const allowRegisterCheckbox = document.querySelector(
    "input[name='allow_register']"
  );
  const registrationLinkInput = document.querySelector(
    "input[name='registration_link']"
  );

  function updateRegistrationLinkState() {
    registrationLinkInput.disabled = allowRegisterCheckbox.checked;
    registrationLinkInput.placeholder = allowRegisterCheckbox.checked
      ? "Registration handled internally"
      : "Enter external registration link";
  }

  allowRegisterCheckbox.addEventListener("change", updateRegistrationLinkState);
  updateRegistrationLinkState();

  function setLocationFields(lat, lng, address) {
    document.querySelector("input[name='latitude']").value = lat
      ? lat.toFixed(6)
      : "";
    document.querySelector("input[name='longitude']").value = lng
      ? lng.toFixed(6)
      : "";
    document.querySelector("input[name='address']").value = address || "";
  }

  document.querySelector("input[name='address']").readOnly = true;
  document.querySelector("input[name='latitude']").readOnly = true;
  document.querySelector("input[name='longitude']").readOnly = true;

  let currentStep = 1;
  const steps = document.querySelectorAll(".form-step");

  function updateStep() {
    steps.forEach((step) => {
      step.classList.toggle("hidden", +step.dataset.step !== currentStep);
    });

    document.getElementById("prevBtn").disabled = currentStep === 1;
    document.getElementById("nextBtn").textContent =
      currentStep === steps.length ? "🚀 Submit" : "Next ➡";
  }

  document.getElementById("nextBtn").addEventListener("click", () => {
    if (currentStep < steps.length) {
      currentStep++;
      updateStep();
    } else {
      document
        .getElementById("eventForm")
        .dispatchEvent(
          new SubmitEvent("submit", { bubbles: true, cancelable: true })
        );
    }
  });

  document.getElementById("prevBtn").addEventListener("click", () => {
    if (currentStep > 1) {
      currentStep--;
      updateStep();
    }
  });

  document.getElementById("eventForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const jsonData = {};

    // ✅ Handle checkboxes
    const isPublic = formData.get("is_public") === "on";
    const allowRegister = formData.get("allow_register") === "on";

    jsonData.is_public = isPublic;
    jsonData.allow_register = allowRegister;

    // ✅ Loop and conditionally add fields
    formData.forEach((value, key) => {
      if (key === "is_public" || key === "allow_register") return;

      if (key === "registration_link") {
        jsonData[key] = allowRegister ? null : value;
      } else {
        jsonData[key] = value;
      }
    });

    // ✅ Convert types
    jsonData.category_id = parseInt(jsonData.category_id);
    jsonData.place_id = parseInt(jsonData.place_id);
    jsonData.latitude = parseFloat(jsonData.latitude);
    jsonData.longitude = parseFloat(jsonData.longitude);
    jsonData.seats_available = parseInt(jsonData.seats_available);
    jsonData.price = parseFloat(jsonData.price);
    jsonData.tags = jsonData.tags
      ? jsonData.tags.split(",").map((t) => t.trim())
      : [];

    console.log("🚀 Submitting event with data:", jsonData);

    try {
      const response = await fetch("http://localhost:5000/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData),
        credentials: "include",
      });

      const text = await response.text();
      if (!response.ok) {
        console.error("❌ Server responded with:", response.status, text);
        throw new Error("Event submission failed!");
      }

      const result = JSON.parse(text);
      alert(`✅ Event created successfully! (ID: ${result.id})`);

      setTimeout(() => {
        e.target.reset();
        window.location.hash = "#events";
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error("❌ Error submitting form:", err);
      alert("❌ Failed to create event. Please try again.");
    }
  });

  updateStep();
}
