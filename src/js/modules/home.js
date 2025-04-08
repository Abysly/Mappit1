export function setupScrollToSection() {
  const button = document.getElementById("goToFeaturesBtn");
  const section = document.getElementById("features");

  if (!button || !section) return;

  button.addEventListener("click", (e) => {
    e.preventDefault(); // prevent hash routing
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}
export function setupFaqToggle() {
  const faqSection = document.getElementById("faqList");
  if (!faqSection) return;

  const items = faqSection.querySelectorAll(".faq-item");

  items.forEach((item) => {
    const answer = item.querySelector(".faq-answer");

    item.addEventListener("click", () => {
      const isOpen = answer.style.maxHeight && answer.style.maxHeight !== "0px";

      // Close all other answers
      items.forEach((el) => {
        const elAnswer = el.querySelector(".faq-answer");
        elAnswer.style.maxHeight = null;
      });

      // Toggle current one
      if (!isOpen) {
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });
}
