import { API_BASE_URL } from "../../config.js";
import { updateAuthUI } from "./authController.js"; // make sure it's imported
import { initializeRegisteredEvents } from "./registeredEvent.js";
import { initializeYourEvents } from "./your-events.js";
const contentMap = {
  profile: "src/components/profileComponents/profile.html",
  edit: "src/components/profileComponents/edit-profile.html",
  groups: "src/components/profileComponents/groups.html",
  hostedevents: "src/components/profileComponents/your-events.html",
  events: "src/components/profileComponents/registered-events.html",
};

export function setupProfileMenu() {
  const menuButtons = document.querySelectorAll("[data-profile-menu]");
  const contentContainer = document.getElementById("profile-content"); // ✅ Not "content" anymore

  if (!contentContainer) {
    console.error("Content container not found (id='profile-content')");
    return;
  }

  menuButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      // Remove active styles
      menuButtons.forEach((btn) =>
        btn.classList.remove("bg-gray-200", "font-bold")
      );

      // Add active style to clicked button
      button.classList.add("bg-gray-200", "font-bold");

      const view = button.dataset.profileMenu;
      const file = contentMap[view];

      if (!file) {
        console.warn(`No content mapped for menu: ${view}`);
        return;
      }

      try {
        const res = await fetch(file);
        if (!res.ok) throw new Error("Failed to fetch content");
        const html = await res.text();
        contentContainer.innerHTML = html;

        // 👇 Setup upload logic if edit-profile is loaded
        if (view === "edit") {
          handleProfileUpload(); // ⬅️ defined below
          await updateAuthUI();
        }
        if (view === "events") {
          initializeRegisteredEvents(); // ✅ Initialize after DOM is ready
        }
        if (view === "hostedevents") {
          initializeYourEvents();
        }
      } catch (err) {
        console.error(`Error loading ${file}:`, err);
        contentContainer.innerHTML = `<p class="text-red-500">Failed to load ${view} section.</p>`;
      }
    });
  });

  // Trigger default menu on load
  const defaultBtn = document.querySelector("[data-profile-menu].default");
  if (defaultBtn) defaultBtn.click();
}

// 🔹 Helper function to handle file upload
function handleProfileUpload() {
  const fileInput = document.getElementById("profile-pic-upload");
  const uploadBtn = document.getElementById("upload-btn");
  const previewImg = document.getElementById("profile-pic-preview");

  if (!fileInput || !uploadBtn || !previewImg) {
    console.warn("Upload elements not found in DOM");
    return;
  }

  // Preview selected image
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        previewImg.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // Upload to server
  uploadBtn.addEventListener("click", async () => {
    const file = fileInput.files[0];
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("profile_pic", file);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/upload/profile-pic`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const contentType = res.headers.get("content-type");
      const text = await res.text(); // Read raw response

      let json = null;
      if (res.ok && contentType?.includes("application/json")) {
        json = JSON.parse(text);
        console.log("Upload success:", json);
        previewImg.src = `${API_BASE_URL}/uploads/${json.filename}`;
        alert("Profile picture uploaded successfully!");
        await updateAuthUI();
      } else {
        console.error("Upload failed (non-JSON):", text);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    }
  });
}
