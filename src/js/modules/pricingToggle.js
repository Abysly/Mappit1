import { checkAuthState } from "./authState.js";

export async function setupPricingToggle() {
  const monthlyBtn = document.getElementById("monthlyBtn");
  const yearlyBtn = document.getElementById("yearlyBtn");
  const prices = document.querySelectorAll(".price");
  const durations = document.querySelectorAll(".duration");

  if (!monthlyBtn || !yearlyBtn) return;

  function highlight(activeBtn, inactiveBtn) {
    activeBtn.classList.add("bg-white", "text-slate-900", "shadow");
    inactiveBtn.classList.remove("bg-white", "text-slate-900", "shadow");
    inactiveBtn.classList.add("text-slate-700");
  }

  function updatePrices(billingType) {
    prices.forEach((price) => {
      price.textContent = `$${price.getAttribute(`data-${billingType}`)}`;
    });
    durations.forEach(
      (d) => (d.textContent = billingType === "monthly" ? "/mo" : "/yr")
    );
  }

  monthlyBtn.addEventListener("click", () => {
    highlight(monthlyBtn, yearlyBtn);
    updatePrices("monthly");
  });

  yearlyBtn.addEventListener("click", () => {
    highlight(yearlyBtn, monthlyBtn);
    updatePrices("yearly");
  });

  // 🌟 Highlight active subscription if logged in
  const { isAuthenticated, isSubscribed } = await checkAuthState();

  if (isAuthenticated && isSubscribed) {
    const proCard = document.querySelector('[data-plan="pro"]');
    if (proCard) {
      proCard.classList.add(
        "ring-4",
        "ring-green-500",
        "scale-105",
        "border-none"
      );

      const btn = proCard.querySelector("button");
      if (btn) {
        btn.textContent = "Active";
        btn.className =
          "px-6 py-2 bg-green-100 text-green-700 font-medium rounded-lg text-sm cursor-default";
      }
    }
  }

  // Trigger default Monthly state on load
  monthlyBtn.click();
}

export function setupPricingPage() {
  const upgradeBtn = document.getElementById("upgradeBtn");

  if (!upgradeBtn) return;

  upgradeBtn.addEventListener("click", async () => {
    const options = {
      key: "YOUR_TEST_KEY_ID", // Replace with your test key ID
      amount: 0, // 0 INR = ₹0 in paise (use 800 for ₹8 etc)
      currency: "INR",
      name: "Event Mapper",
      description: "Pro Plan Subscription",
      image: "/logo.png", // optional
      handler: function (response) {
        console.log("Payment success", response);

        // ✅ Call your backend to mark as subscribed
        fetch("/api/subscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            is_subscribed: true,
            payment_id: response.razorpay_payment_id,
          }),
        }).then(() => {
          alert("You are now subscribed to Pro!");
          window.location.hash = "#dashboard";
        });
      },
      theme: {
        color: "#6366F1",
      },
    };

    const rzp = new Razorpay(options);
    rzp.open();
  });
}
