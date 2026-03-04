import React, { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const CATEGORY_LIST = [
  { emoji: "🍺", id: "alcohol", label: "Alcohol" },
  { emoji: "🎰", id: "gambling", label: "Gambling" },
  { emoji: "🛍️", id: "shopping", label: "Shopping" },
  { emoji: "🍕", id: "food_delivery", label: "Food Delivery" },
  { emoji: "🚬", id: "nicotine", label: "Nicotine" },
  { emoji: "🎮", id: "gaming", label: "Gaming" },
  { emoji: "🔞", id: "adult", label: "Adult" },
  { emoji: "💊", id: "supplements", label: "Supplements" },
  { emoji: "☕", id: "caffeine", label: "Caffeine" }
];

const MODE_LIST = [
  { id: "block", emoji: "🛑", title: "Full Block", desc: "Just stop me. No questions." },
  { id: "cooldown", emoji: "⏰", title: "Cool-Down", desc: "Make me wait 24 hours first." },
  { id: "friction", emoji: "💸", title: "Friction Cost", desc: "I can buy it, but I pay a penalty." }
];

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("tb_token");
    if (!token) return;

    fetch(`${API_URL}/api/settings`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setSettings(data.settings || null))
      .catch(() => {});
  }, []);

  if (!localStorage.getItem("tb_token")) {
    return (
      <div className="card">
        <h2>Connect your account</h2>
        <p>Log in via the API to manage settings.</p>
      </div>
    );
  }

  if (!settings) {
    return <div className="card">Loading settings…</div>;
  }

  const updateCategory = (category) => {
    setSettings({
      ...settings,
      categories: {
        ...settings.categories,
        [category]: !settings.categories?.[category]
      }
    });
  };

  const save = () => {
    setMessage("");
    const token = localStorage.getItem("tb_token");
    fetch(`${API_URL}/api/settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ settings })
    })
      .then((res) => res.json())
      .then(() => setMessage("Saved"))
      .catch(() => setMessage("Save failed"));
  };

  return (
    <div className="dashboard">
      <div>
        <div className="settings-header">Your Rules ⚔️</div>
        <div className="onboard-sub">Tune what gets blocked and how tough the guard is.</div>
      </div>

      <div className="card">
        <div className="section-title">Categories</div>
        <div className="category-grid">
          {CATEGORY_LIST.map((category) => (
            <div
              key={category.id}
              className={`category-card ${settings.categories?.[category.id] ? "selected" : ""}`}
              onClick={() => updateCategory(category.id)}
              role="button"
              tabIndex={0}
            >
              <div className="category-emoji">{category.emoji}</div>
              <div className="category-label">{category.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="section-title">Mode</div>
        <div className="mode-grid">
          {MODE_LIST.map((option) => (
            <div
              key={option.id}
              className={`mode-card ${settings.defaultMode === option.id ? "selected" : ""}`}
              onClick={() => setSettings({ ...settings, defaultMode: option.id })}
              role="button"
              tabIndex={0}
            >
              <div className="mode-emoji">{option.emoji}</div>
              <div className="mode-title">{option.title}</div>
              <div className="mode-desc">{option.desc}</div>
            </div>
          ))}
        </div>

        {settings.defaultMode === "friction" && (
          <div>
            <div className="onboard-sub">Penalty: {settings.frictionPercent || 100}%</div>
            <input
              className="slider"
              type="range"
              min="25"
              max="200"
              step="25"
              value={settings.frictionPercent || 100}
              onChange={(e) => setSettings({
                ...settings,
                frictionPercent: Number(e.target.value)
              })}
            />
          </div>
        )}

        {settings.defaultMode === "cooldown" && (
          <div>
            <div className="onboard-sub">Cooldown hours</div>
            <input
              className="input"
              type="number"
              min="1"
              max="72"
              value={settings.cooldownHours || 24}
              onChange={(e) => setSettings({
                ...settings,
                cooldownHours: Number(e.target.value)
              })}
            />
          </div>
        )}
      </div>

      <div className="card">
        <div className="section-title">Accountability</div>
        <input
          className="input"
          type="email"
          placeholder="Accountability partner email"
          value={settings.accountabilityEmail || ""}
          onChange={(e) => setSettings({ ...settings, accountabilityEmail: e.target.value })}
        />
      </div>

      <button className="btn btn-primary full-width" onClick={save}>Save rules</button>
      {message && <div className="onboard-sub">{message}</div>}
    </div>
  );
}
