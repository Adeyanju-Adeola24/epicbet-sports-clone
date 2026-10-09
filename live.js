// Live betting simulation — mock data, demo only (no real odds feed)
const LIVE = [
  { id: "l1", sport: "football", league: "England · Premier League", home: "Arsenal", away: "Chelsea", hs: 2, as: 1, min: 67, cap: 90,
    odds: [{ label: "1", value: 1.72 }, { label: "X", value: 4.10 }, { label: "2", value: 4.60 }] },
  { id: "l2", sport: "football", league: "Spain · La Liga", home: "Real Madrid", away: "Sevilla", hs: 1, as: 0, min: 34, cap: 90,
    odds: [{ label: "1", value: 1.55 }, { label: "X", value: 4.40 }, { label: "2", value: 6.00 }] },
  { id: "l3", sport: "tennis", league: "ATP · Dubai", home: "C. Alcaraz", away: "D. Medvedev", hs: 1, as: 0, min: 0, cap: 0, setNote: "Set 2 · 3-2",
    odds: [{ label: "1", value: 1.68 }, { label: "2", value: 2.15 }] },
  { id: "l4", sport: "basketball", league: "EuroLeague", home: "Fenerbahçe", away: "Real Madrid BC", hs: 58, as: 61, min: 0, cap: 0, setNote: "Q3 · 04:12",
    odds: [{ label: "1", value: 2.40 }, { label: "2", value: 1.58 }] },
  { id: "l5", sport: "hockey", league: "NHL", home: "Edmonton Oilers", away: "Colorado Avalanche", hs: 3, as: 3, min: 0, cap: 0, setNote: "P3 · 08:44",
    odds: [{ label: "1", value: 2.55 }, { label: "X", value: 4.00 }, { label: "2", value: 2.35 }] },
  { id: "l6", sport: "esports", league: "CS2 · Major Qualifier", home: "NAVI", away: "FaZe Clan", hs: 9, as: 7, min: 0, cap: 0, setNote: "Map 2",
    odds: [{ label: "1", value: 1.85 }, { label: "2", value: 1.95 }] },
];

const SPORT_FILTERS = [
  { id: "all", name: "All live" },
  { id: "football", name: "⚽ Football" },
  { id: "tennis", name: "🎾 Tennis" },
  { id: "basketball", name: "🏀 Basketball" },
  { id: "hockey", name: "🏒 Hockey" },
  { id: "esports", name: "🎮 Esports" },
];

const state = { filter: "all", picks: new Map() };
const rnd = (a, b) => a + Math.random() * (b - a);

function clockLabel(m) {
  if (m.sport === "football") return `${m.min}'`;
  return m.setNote;
}

function renderFilters() {
  const box = document.getElementById("liveFilters");
  box.innerHTML = "";
  SPORT_FILTERS.forEach((f) => {
    const b = document.createElement("button");
    b.className = "chip" + (state.filter === f.id ? " active" : "");
    b.textContent = f.name;
    b.onclick = () => { state.filter = f.id; render(); };
    box.appendChild(b);
  });
}

function render() {
  renderFilters();
  const wrap = document.getElementById("liveList");
  const games = LIVE.filter((m) => state.filter === "all" || m.sport === state.filter);
  document.getElementById("liveCount").textContent = `${games.length} live now`;
  wrap.innerHTML = "";
  games.forEach((m) => {
    const card = document.createElement("div");
    card.className = "live-card";
    const odds = m.odds.map((o) => {
      const k = `${m.id}:${o.label}`;
      return `<button class="odd${state.picks.has(k) ? " selected" : ""}" data-k="${k}" data-id="${m.id}" data-label="${o.label}"><small>${o.label}</small><strong>${o.value.toFixed(2)}</strong></button>`;
    }).join("");
    card.innerHTML = `
      <div class="lc-top"><span><span class="live-dot"></span>LIVE · ${m.league} · ${clockLabel(m)}</span><span>👁 ${Math.floor(rnd(400, 5200))} watching</span></div>
      <div class="live-teams">
        <div><div class="t">${m.home}</div><div class="t">${m.away}</div></div>
        <div class="live-score">${m.hs}<span class="sep">:</span>${m.as}</div>
        <div class="odds">${odds}</div>
      </div>`;
    wrap.appendChild(card);
  });
  wrap.querySelectorAll(".odd").forEach((btn) => {
    btn.onclick = () => {
      const k = btn.dataset.k;
      if (state.picks.has(k)) state.picks.delete(k);
      else {
        const m = LIVE.find((g) => g.id === btn.dataset.id);
        const o = m.odds.find((x) => x.label === btn.dataset.label);
        state.picks.set(k, { match: m, label: o.label, value: o.value });
      }
      render();
    };
  });
  const n = state.picks.size;
  const bar = document.getElementById("liveBar");
  if (!n) bar.innerHTML = `<span style="color:var(--muted)">👆 Click odds to collect picks, then place them on the Sports page.</span>`;
  else {
    const combined = [...state.picks.values()].reduce((a, s) => a * s.value, 1);
    bar.innerHTML = `<strong>${n} pick${n > 1 ? "s" : ""}</strong><span>Combined <strong style="color:var(--accent)">${combined.toFixed(2)}</strong></span><span style="flex:1"></span><a class="btn btn-primary" href="./index.html">Place on Sports →</a>`;
  }
}

function tick() {
  LIVE.forEach((m) => {
    if (m.sport === "football" && m.min < m.cap) m.min += 1;
    if (Math.random() < 0.05) {
      if (Math.random() < 0.5) m.hs += 1; else m.as += 1;
    }
    m.odds.forEach((o) => {
      o.value = Math.min(12, Math.max(1.05, o.value + rnd(-0.06, 0.06)));
    });
  });
  // keep pick values fresh
  state.picks.forEach((s, k) => {
    const o = s.match.odds.find((x) => x.label === s.label);
    if (o) s.value = o.value;
  });
  render();
}

document.addEventListener("DOMContentLoaded", () => {
  render();
  setInterval(tick, 5000);
});
