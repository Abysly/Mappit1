export async function initializeEventDetails() {
  const container = document.getElementById("eventDetailsContainer");
  if (!container) return;

  const eventJson = localStorage.getItem("selectedEvent");
  if (!eventJson) {
    container.innerHTML = `<p class="text-red-500">❌ Event not found.</p>`;
    return;
  }

  const event = JSON.parse(eventJson);
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;

  container.innerHTML = `
  <div class="max-w-4xl mx-auto p-4 animate-fade-in">
    ${
      event.banner_image
        ? `<div class="relative rounded-xl overflow-hidden shadow-lg mb-6 h-48">
            <img src="/public/assets/${event.banner_image}" alt="Event Banner" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-base-100/90 to-transparent"></div>
            <h1 class="absolute bottom-4 left-4 text-4xl font-bold text-primary drop-shadow-lg">${event.title}</h1>
          </div>`
        : `<h1 class="text-4xl font-bold text-primary mb-6">${event.title}</h1>`
    }

    <div class="card lg:card-side bg-base-100 shadow-xl">
      <figure class="lg:w-1/3">
        <img src="/public/assets/${
          event.event_image
        }" alt="Event Image" class="w-full h-full object-cover" />
      </figure>
      
      <div class="card-body lg:w-2/3">
        <div class="prose max-w-none">
          <p class="text-lg">${event.description}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div class="flex items-center gap-3">
            <div class="bg-primary/10 p-2 rounded-full">
              <svg class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold">Location</h3>
              <p class="text-sm opacity-80">${event.place_name}</p>
              <p class="text-xs opacity-60">${event.address}</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <div class="bg-secondary/10 p-2 rounded-full">
              <svg class="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold">Date & Time</h3>
              <p class="text-sm opacity-80">${new Date(
                event.start_date
              ).toLocaleDateString()}</p>
              <p class="text-xs opacity-60">${new Date(
                event.start_date
              ).toLocaleTimeString()} - ${new Date(
    event.end_date
  ).toLocaleTimeString()}</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <div class="bg-accent/10 p-2 rounded-full">
              <svg class="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold">Price</h3>
              <p class="text-sm opacity-80">${
                event.price ? `₹${event.price}` : "Free Entry"
              }</p>
              <p class="text-xs opacity-60">${
                event.seats_available
              } seats available</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <div class="bg-info/10 p-2 rounded-full">
              <svg class="h-6 w-6 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold">Category</h3>
              <p class="text-sm opacity-80">${event.category_name}</p>
              <p class="text-xs opacity-60">${event.target_audience}</p>
            </div>
          </div>
        </div>

        ${
          event.tags?.length
            ? `
          <div class="flex flex-wrap gap-2 mt-4">
            ${event.tags
              .map((tag) => `<span class="badge badge-outline">${tag}</span>`)
              .join("")}
          </div>
        `
            : ""
        }

        <div class="mt-6 pt-4 border-t border-base-200">
          <div class="flex items-center gap-3">
            <div class="avatar placeholder">
              <div class="bg-neutral text-neutral-content rounded-full w-10">
                <span>${event.organizer_name.charAt(0).toUpperCase()}</span>
              </div>
            </div>
            <div>
              <h3 class="font-semibold">Organized by</h3>
              <p class="text-sm opacity-80">${event.organizer_name}</p>
            </div>
          </div>
        </div>

        ${
          event.youtube_link
            ? `
          <div class="mt-6">
            <div class="aspect-video w-full rounded-xl shadow-lg overflow-hidden">
              <iframe src="${event.youtube_link.replace(
                "watch?v=",
                "embed/"
              )}" class="w-full h-full" frameborder="0" allowfullscreen></iframe>
            </div>
          </div>
        `
            : ""
        }

        <div class="card-actions justify-end mt-6" id="registerBtnContainer">
          ${
            event.allow_register
              ? event.registration_link
                ? `<a href="${event.registration_link}" target="_blank" class="btn btn-primary">Register Now</a>`
                : `<button class="btn btn-primary" id="customRegisterBtn">Register Now</button>`
              : ""
          }
        </div>

      </div>
    </div>
  </div>
`;

  // ⛳ Handle dynamic check for internal registration
  if (event.allow_register && !event.registration_link && user) {
    try {
      const res = await fetch(
        `http://localhost:5000/api/events/${event.id}/is-registered?user_id=${user.id}`
      );
      const { registered } = await res.json();
      const container = document.getElementById("registerBtnContainer");

      if (registered) {
        container.innerHTML = `<button class="btn btn-success" disabled>✅ Registered</button>`;
      } else {
        const registerBtn = document.getElementById("customRegisterBtn");
        if (registerBtn) {
          registerBtn.addEventListener("click", async () => {
            const confirm = window.confirm(
              "Do you want to register for this event?"
            );
            if (!confirm) return;

            try {
              const response = await fetch(
                `http://localhost:5000/api/events/${event.id}/register`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ user_id: user.id }),
                  credentials: "include",
                }
              );

              if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Registration failed: ${errorText}`);
              }

              alert("🎉 Successfully registered!");
              registerBtn.className = "btn btn-success";
              registerBtn.textContent = "✅ Registered";
              registerBtn.disabled = true;
            } catch (error) {
              console.error("Registration error:", error);
              alert("❌ Failed to register. Please try again.");
            }
          });
        }
      }
    } catch (err) {
      console.error("Error checking registration:", err);
    }
  }
}
