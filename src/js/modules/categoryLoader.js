// ========================= Categories ===============================

let categoryData = [];
const CATEGORY_PAGE_SIZE = 5;
let categoryCurrentPage = 1;

export async function loadCategories() {
  console.log("Loading categories...");

  try {
    const response = await fetch("http://localhost:5000/api/categories");

    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }

    categoryData = await response.json();
    console.log("Fetched categories:", categoryData);

    renderCategoryPage(categoryCurrentPage);
    renderCategoryPagination();
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
}

function renderCategoryPage(page) {
  const start = (page - 1) * CATEGORY_PAGE_SIZE;
  const end = start + CATEGORY_PAGE_SIZE;
  const pageData = categoryData.slice(start, end);
  populateCategoryTable(pageData);
}

function renderCategoryPagination() {
  const pagination = document.getElementById("category-pagination");
  pagination.innerHTML = "";

  const pageCount = Math.ceil(categoryData.length / CATEGORY_PAGE_SIZE);

  for (let i = 1; i <= pageCount; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = `mx-1 px-3 py-1 border rounded ${
      i === categoryCurrentPage
        ? "bg-blue-500 text-white"
        : "bg-white text-blue-500"
    }`;
    btn.addEventListener("click", () => {
      categoryCurrentPage = i;
      renderCategoryPage(i);
      renderCategoryPagination();
    });
    pagination.appendChild(btn);
  }
}

function populateCategoryTable(categories) {
  const tbody = document.getElementById("category-tbody");

  if (!tbody) {
    console.error('The tbody element with id "category-tbody" was not found.');
    return;
  }

  tbody.innerHTML = "";

  categories.forEach((category) => {
    const row = document.createElement("tr");
    row.classList.add("border-b");

    row.innerHTML = `
      <td class="px-4 py-2">${category.id}</td>
      <td class="px-4 py-2">${category.name}</td>
      <td class="px-4 py-2 space-x-2">
        <button class="text-blue-600 hover:underline edit-category-btn" data-id="${category.id}">Edit</button>
        <button class="text-red-600 hover:underline delete-category-btn" data-id="${category.id}">Delete</button>
      </td>
    `;

    tbody.appendChild(row);
  });

  setupCategoryActions();
}

function setupCategoryActions() {
  const editBtns = document.querySelectorAll(".edit-category-btn");
  const deleteBtns = document.querySelectorAll(".delete-category-btn");

  editBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      alert(`Edit category ${id} (to be implemented)`);
    });
  });

  deleteBtns.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const confirmDelete = confirm(
        `Are you sure you want to delete category ${id}?`
      );
      if (!confirmDelete) return;

      try {
        const res = await fetch(`http://localhost:5000/api/categories/${id}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          throw new Error("Failed to delete category");
        }

        await loadCategories(); // Refresh the table
      } catch (err) {
        console.error("Error deleting category:", err);
        alert("❌ Failed to delete category.");
      }
    });
  });
}

// ========================= Places ===============================

let placeData = [];
const PLACE_PAGE_SIZE = 5;
let placeCurrentPage = 1;

export async function loadPlaces() {
  console.log("Loading places...");

  try {
    const response = await fetch("http://localhost:5000/api/places");

    if (!response.ok) {
      throw new Error("Failed to fetch places");
    }

    placeData = await response.json();
    console.log("Fetched places:", placeData);

    renderPlacePage(placeCurrentPage);
    renderPlacePagination();
  } catch (error) {
    console.error("Error fetching places:", error);
  }
}

function renderPlacePage(page) {
  const start = (page - 1) * PLACE_PAGE_SIZE;
  const end = start + PLACE_PAGE_SIZE;
  const pageData = placeData.slice(start, end);
  populatePlaceTable(pageData);
}

function renderPlacePagination() {
  const pagination = document.getElementById("place-pagination");
  pagination.innerHTML = "";

  const pageCount = Math.ceil(placeData.length / PLACE_PAGE_SIZE);

  for (let i = 1; i <= pageCount; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = `mx-1 px-3 py-1 border rounded ${
      i === placeCurrentPage
        ? "bg-blue-500 text-white"
        : "bg-white text-blue-500"
    }`;
    btn.addEventListener("click", () => {
      placeCurrentPage = i;
      renderPlacePage(i);
      renderPlacePagination();
    });
    pagination.appendChild(btn);
  }
}

function populatePlaceTable(places) {
  const tbody = document.getElementById("place-tbody");

  if (!tbody) {
    console.error('The tbody element with id "place-tbody" was not found.');
    return;
  }

  tbody.innerHTML = "";

  places.forEach((place) => {
    const row = document.createElement("tr");
    row.classList.add("border-b");

    row.innerHTML = `
      <td class="px-4 py-2">${place.id}</td>
      <td class="px-4 py-2">${place.name}</td>
      <td class="px-4 py-2 space-x-2">
        <button class="text-blue-600 hover:underline edit-place-btn" data-id="${place.id}">Edit</button>
        <button class="text-red-600 hover:underline delete-place-btn" data-id="${place.id}">Delete</button>
      </td>
    `;

    tbody.appendChild(row);
  });

  setupPlaceActions();
}

function setupPlaceActions() {
  const editBtns = document.querySelectorAll(".edit-place-btn");
  const deleteBtns = document.querySelectorAll(".delete-place-btn");

  editBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      alert(`Edit place ${id} (to be implemented)`);
    });
  });

  deleteBtns.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const confirmDelete = confirm(
        `Are you sure you want to delete place ${id}?`
      );
      if (!confirmDelete) return;

      try {
        const res = await fetch(`http://localhost:5000/api/places/${id}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          throw new Error("Failed to delete place");
        }

        await loadPlaces(); // Refresh the table
      } catch (err) {
        console.error("Error deleting place:", err);
        alert("❌ Failed to delete place.");
      }
    });
  });
}

export function setupCategoryAndPlaceCreation() {
  const addCategoryBtn = document.getElementById("add-category-btn");
  const addPlaceBtn = document.getElementById("add-place-btn");

  addCategoryBtn?.addEventListener("click", async () => {
    const name = prompt("Enter new category name:");
    if (!name) return;

    try {
      const res = await fetch("http://localhost:5000/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) throw new Error("Failed to create category");

      await loadCategories(); // refresh the list
    } catch (err) {
      console.error("Error creating category:", err);
      alert("❌ Failed to create category.");
    }
  });

  addPlaceBtn?.addEventListener("click", async () => {
    const name = prompt("Enter new place name:");
    if (!name) return;

    try {
      const res = await fetch("http://localhost:5000/api/places", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) throw new Error("Failed to create place");

      await loadPlaces(); // refresh the list
    } catch (err) {
      console.error("Error creating place:", err);
      alert("❌ Failed to create place.");
    }
  });
}
