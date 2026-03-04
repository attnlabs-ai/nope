import React, { useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const quotes = [
  "Every block is a vote for who you want to be 🗳️",
  "You're literally rewiring your brain right now 🧠",
  "Future you just said thank you 🙏",
  "Discipline is choosing what you want most over what you want now ⚡",
  "You didn't open this app by accident 🎯"
];

const CATEGORY_EMOJI = {
  alcohol: "🍺",
  gambling: "🎰",
  shopping: "🛍️",
  food_delivery: "🍕",
  nicotine: "🚬",
  gaming: "🎮",
  adult: "🔞",
  supplements: "💊",
  caffeine: "☕"
};

function timeAgo(date) {
  const now = new Date();
  const diffMs = Math.max(0, now - date);
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("tb_token");
    if (!token) return;

    fetch(`${API_URL}/api/events/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        setStats(data.stats || null);
        setRecent(data.recent || []);
      })
      .catch(() => {});
  }, []);

  const quote = useMemo(() => quotes[Math.floor(Math.random() * quotes.length)], []);

  if (!localStorage.getItem("tb_token")) {
    return (
      <div className="card">
        <h2>Connect your account</h2>
        <p>Log in via the API to see dashboard stats.</p>
      </div>
    );
  }

  function getLevel(blocks) {
    if (blocks >= 100) return { level: 5, title: "Nope Legend", emoji: "🏆", next: Infinity };
    if (blocks >= 51) return { level: 4, title: "Shopping Sensei", emoji: "🧘", next: 100 };
    if (blocks >= 21) return { level: 3, title: "Impulse Ninja", emoji: "🥷", next: 51 };
    if (blocks >= 6) return { level: 2, title: "Getting There", emoji: "💪", next: 21 };
    return { level: 1, title: "Beginner", emoji: "🌱", next: 6 };
  }

  const blocks = stats?.blocks ?? 0;
  const coins = blocks * 15;
  const streak = stats?.streakDays ?? 0;
  const saved = Number(stats?.estimatedSaved || 0).toFixed(2);
  const level = getLevel(blocks);
  const progress = level.next === Infinity ? 100 : Math.min(100, Math.round((blocks / level.next) * 100));
  const blocksToNext = level.next === Infinity ? 0 : Math.max(0, level.next - blocks);

  return (
    <div className="dashboard">
      <div className="card greeting-card">
        <div className="greeting-row">
          <div>
            <div className="greeting-text">{getGreeting()}, champion.</div>
            <div className="greeting-sub">You are levelled up and in control.</div>
          </div>
          <div className="level-pill">{level.emoji} Lv.{level.level} {level.title}</div>
        </div>
        <div className="xp-bar">
          <div className="xp-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="xp-note">
          {level.next === Infinity ? "Max level unlocked" : `${blocksToNext} blocks to Level ${level.level + 1}`}
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card streak">
          <div className="stat-emoji">🔥</div>
          <div className="stat-label">Streak</div>
          <div className="stat-value">{streak} days</div>
        </div>
        <div className="stat-card coins">
          <div className="stat-emoji">🪙</div>
          <div className="stat-label">Coins</div>
          <div className="stat-value">{coins}</div>
        </div>
        <div className="stat-card blocks">
          <div className="stat-emoji">🛑</div>
          <div className="stat-label">Blocks</div>
          <div className="stat-value">{blocks}</div>
        </div>
        <div className="stat-card saved">
          <div className="stat-emoji">💰</div>
          <div className="stat-label">Saved</div>
          <div className="stat-value">${saved}</div>
        </div>
      </div>

      <div className="quote-card">{quote}</div>

      <div className="card wins-card">
        <div className="wins-title">Your Recent Wins</div>
        {recent.length === 0 ? (
          <div className="empty-state">No wins yet — go browse something sketchy to test it! 🚀</div>
        ) : (
          <div className="wins-list">
            {recent.map((event) => {
              const emoji = CATEGORY_EMOJI[event.category] || "✨";
              const time = event.timestamp ? timeAgo(new Date(event.timestamp)) : "Just now";
              return (
                <div className="win-card" key={event.id || event.timestamp}>
                  <div className="win-left">
                    <div className="win-emoji">{emoji}</div>
                    <div>
                      <div className="win-title">You resisted {event.domain || "that site"}</div>
                      <div className="win-time">{time}</div>
                    </div>
                  </div>
                  <div className="win-chip">+15 🪙</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
