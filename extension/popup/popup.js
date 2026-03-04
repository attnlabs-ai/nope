async function getSettings() {
  return await chrome.runtime.sendMessage({ type: "getSettings" });
}

async function setSettings(settings) {
  return await chrome.runtime.sendMessage({ type: "setSettings", settings });
}

async function getEvents() {
  return await chrome.runtime.sendMessage({ type: "getEvents" });
}

const QUOTES = [
  "Every block is a vote for who you want to be 🗳️",
  "You're literally rewiring your brain right now 🧠",
  "Future you just said thank you 🙏",
  "Discipline is choosing what you want most over what you want now ⚡",
  "You didn't open this app by accident 🎯"
];

const statusPill = document.getElementById("statusPill");
const statusText = document.getElementById("statusText");
const dashboardBtn = document.getElementById("dashboardBtn");
const coinCountEl = document.getElementById("coinCount");
const blockCountEl = document.getElementById("blockCount");
const levelFill = document.getElementById("levelFill");
const levelNote = document.getElementById("levelNote");
const levelPill = document.querySelector(".level-pill");
const streakValue = document.getElementById("streakValue");
const footerQuote = document.getElementById("footerQuote");

function getLevel(blocks) {
  if (blocks >= 100) return { level: 5, title: "Nope Legend", emoji: "🏆", next: Infinity };
  if (blocks >= 51) return { level: 4, title: "Shopping Sensei", emoji: "🧘", next: 100 };
  if (blocks >= 21) return { level: 3, title: "Impulse Ninja", emoji: "🥷", next: 51 };
  if (blocks >= 6) return { level: 2, title: "Getting There", emoji: "💪", next: 21 };
  return { level: 1, title: "Beginner", emoji: "🌱", next: 6 };
}

function setStatus(enabled) {
  statusText.textContent = enabled ? "Active" : "Paused";
  if (enabled) {
    statusPill.classList.remove("paused");
  } else {
    statusPill.classList.add("paused");
  }
}

(async () => {
  const { settings } = await getSettings();
  setStatus(!!settings.enabled);

  const { events } = await getEvents();
  const list = Array.isArray(events) ? events : [];
  const blocks = list.length || 0;
  blockCountEl.textContent = String(blocks);
  coinCountEl.textContent = String(blocks * 15);
  streakValue.textContent = `${Math.max(1, blocks)}-day streak`;

  const level = getLevel(blocks);
  const progress = level.next === Infinity ? 100 : Math.min(100, Math.round((blocks / level.next) * 100));
  levelFill.style.width = `${progress}%`;
  levelNote.textContent = level.next === Infinity
    ? `${level.emoji} ${level.title}`
    : `${Math.max(0, level.next - blocks)} blocks to Level ${level.level + 1}`;
  if (levelPill) levelPill.textContent = `${level.emoji} Lv.${level.level} ${level.title}`;

  footerQuote.textContent = QUOTES[Math.floor(Math.random() * QUOTES.length)];
})().catch(() => {
  footerQuote.textContent = "You didn't open this app by accident 🎯";
});

dashboardBtn.addEventListener("click", () => {
  chrome.tabs.create({ url: "http://localhost:5173" });
});

statusPill.addEventListener("click", async () => {
  const { settings } = await getSettings();
  const next = { ...settings, enabled: !settings.enabled };
  await setSettings(next);
  setStatus(next.enabled);
});
