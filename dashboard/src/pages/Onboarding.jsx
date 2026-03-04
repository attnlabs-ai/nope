import React, { useState } from "react";

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

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [categories, setCategories] = useState({
    alcohol: true,
    gambling: true,
    shopping: true
  });
  const [mode, setMode] = useState("block");
  const [frictionPercent, setFrictionPercent] = useState(100);
  const [cooldownHours] = useState(24);
  const [status, setStatus] = useState("");

  const toggleCategory = (category) => {
    setCategories({ ...categories, [category]: !categories[category] });
  };

  const register = async () => {
    setStatus("");
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      setStatus("Registration failed");
      return;
    }

    const data = await res.json();
    localStorage.setItem("tb_token", data.token);
    setStep(2);
  };

  const saveSettings = async () => {
    setStatus("");
    const token = localStorage.getItem("tb_token");
    const settings = {
      categories,
      defaultMode: mode,
      frictionPercent,
      cooldownHours
    };

    const res = await fetch(`${API_URL}/api/settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ settings })
    });

    if (!res.ok) {
      setStatus("Save failed");
      return;
    }

    setStep(4);
  };

  return (
    <div className="onboard-shell">
      <div className="card onboard-card">
        {step === 1 && (
          <div className="onboard-actions">
            <div className="big-emoji bounce">🛑</div>
            <div className="onboard-title">Meet your new spending bodyguard.</div>
            <div className="onboard-sub">60 seconds. No judgment. Just protection.</div>
            <input
              className="input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="btn btn-primary" onClick={register}>Let's go! 🚀</button>
            {status && <div className="onboard-sub">{status}</div>}
          </div>
        )}

        {step === 2 && (
          <div className="onboard-actions">
            <div className="onboard-title">What are we protecting you from?</div>
            <div className="onboard-sub">Pick everything. We don't judge.</div>
            <div className="category-grid">
              {CATEGORY_LIST.map((category) => (
                <div
                  key={category.id}
                  className={`category-card ${categories[category.id] ? "selected" : ""}`}
                  onClick={() => toggleCategory(category.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="category-emoji">{category.emoji}</div>
                  <div className="category-label">{category.label}</div>
                </div>
              ))}
            </div>
            <button className="btn btn-primary" onClick={() => setStep(3)}>
              These are my weak spots →
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="onboard-actions">
            <div className="onboard-title">How tough do you want us to be?</div>
            <div className="mode-grid">
              {MODE_LIST.map((option) => (
                <div
                  key={option.id}
                  className={`mode-card ${mode === option.id ? "selected" : ""}`}
                  onClick={() => setMode(option.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="mode-emoji">{option.emoji}</div>
                  <div className="mode-title">{option.title}</div>
                  <div className="mode-desc">{option.desc}</div>
                </div>
              ))}
            </div>
            {mode === "friction" && (
              <div>
                <div className="onboard-sub">Penalty: {frictionPercent}%</div>
                <input
                  className="slider"
                  type="range"
                  min="25"
                  max="200"
                  step="25"
                  value={frictionPercent}
                  onChange={(e) => setFrictionPercent(Number(e.target.value))}
                />
              </div>
            )}
            <button className="btn btn-primary" onClick={saveSettings}>Set my rules →</button>
            {status && <div className="onboard-sub">{status}</div>}
          </div>
        )}

        {step === 4 && (
          <div className="onboard-actions">
            <div className="celebration-emoji">🎉</div>
            <div className="onboard-title">You're officially protected.</div>
            <div className="onboard-sub">Nope is watching your back.</div>
            <div className="coin-bonus">🪙 50 bonus coins for joining!</div>
            <button
              className="btn btn-primary"
              onClick={() => (window.location.href = "/")}
            >
              See my dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
