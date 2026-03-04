export function createModal({ html, cssText, data, onAction }) {
  const container = document.createElement("div");
  container.innerHTML = html.trim();

  const overlay = container.firstElementChild;
  const style = document.createElement("style");
  style.textContent = cssText;
  overlay.appendChild(style);

  function setText(selector, value) {
    const el = overlay.querySelector(selector);
    if (el) el.textContent = value;
  }

  const cats = window.NopeCategories;
  const category = data.category || "default";
  const emoji = cats ? cats.getCategoryEmoji(category) : "🛑";
  const headline = cats ? cats.getRandomMessage(category) : "You got this.";

  setText("[data-tb='emoji']", emoji);
  setText("[data-tb='headline']", headline);
  setText("[data-tb='category-pill']", `${emoji} ${category.replace(/_/g, " ")}`);
  setText("[data-tb='streak']", `🔥 ${data.streakDays || 0}-day streak — keep going!`);

  overlay.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const action = target.getAttribute("data-action");

    if (action === "block") {
      const card = overlay.querySelector(".nope-card");
      if (card) {
        const float = document.createElement("div");
        float.className = "nope-coin-float";
        float.textContent = "+15 🪙";
        card.appendChild(float);
      }
      setTimeout(() => {
        onAction?.(action);
      }, 800);
      return;
    }

    if (action) onAction?.(action);
  });

  return {
    open() {
      document.documentElement.appendChild(overlay);
      document.documentElement.style.overflow = "hidden";
    },
    close() {
      overlay.remove();
      document.documentElement.style.overflow = "";
    }
  };
}
