// Mock data recreation (original placeholder data, not copied from epicbet)
const SPORTS = [
  { id: "football", name: "Football", icon: "⚽", count: 1284 },
  { id: "tennis", name: "Tennis", icon: "🎾", count: 342 },
  { id: "basketball", name: "Basketball", icon: "🏀", count: 518 },
  { id: "hockey", name: "Ice Hockey", icon: "🏒", count: 214 },
  { id: "cricket", name: "Cricket", icon: "🏏", count: 156 },
  { id: "volleyball", name: "Volleyball", icon: "🏐", count: 98 },
  { id: "esports", name: "Esports", icon: "🎮", count: 187 },
  { id: "mma", name: "MMA", icon: "🥊", count: 64 },
];

const MATCHES = [
  {
    league: "England · Premier League", sport: "football", live: true, minute: "67'",
    home: "Arsenal", away: "Chelsea", market: "1X2",
    odds: [
      { label: "1", value: 2.10 },
      { label: "X", value: 3.40 },
      { label: "2", value: 3.10 },
    ],
  },
  {
    league: "England · Premier League", sport: "football", live: false, time: "Today 21:00",
    home: "Liverpool", away: "Man City", market: "1X2",
    odds: [
      { label: "1", value: 2.55 },
      { label: "X", value: 3.55 },
      { label: "2", value: 2.60 },
    ],
  },
  {
    league: "Spain · La Liga", sport: "football", live: true, minute: "34'",
    home: "Real Madrid", away: "Sevilla", market: "1X2",
    odds: [
      { label: "1", value: 1.55 },
      { label: "X", value: 4.20 },
      { label: "2", value: 5.50 },
    ],
  },
  {
    league: "Spain · La Liga", sport: "football", live: false, time: "Today 22:30",
    home: "Barcelona", away: "Atlético", market: "1X2",
    odds: [
      { label: "1", value: 1.92 },
      { label: "X", value: 3.70 },
      { label: "2", value: 3.80 },
    ],
  },
  {
    league: "ATP · Dubai", sport: "tennis", live: true, minute: "Set 2",
    home: "C. Alcaraz", away: "D. Medvedev", market: "Winner",
    odds: [
      { label: "1", value: 1.68 },
      { label: "2", value: 2.15 },
    ],
  },
  {
    league: "NBA", sport: "basketball", live: false, time: "Tomorrow 02:30",
    home: "LA Lakers", away: "Boston Celtics", market: "Moneyline",
    odds: [
      { label: "1", value: 2.30 },
      { label: "2", value: 1.65 },
    ],
  },
  {
    league: "NHL", sport: "hockey", live: false, time: "Tomorrow 01:00",
    home: "Toronto Maple Leafs", away: " NY Rangers", market: "1X2",
    odds: [
      { label: "1", value: 2.45 },
      { label: "X", value: 3.90 },
      { label: "2", value: 2.55 },
    ],
  },
  {
    league: "CS2 · Major Qualifier", sport: "esports", live: true, minute: "Map 2",
    home: "NAVI", away: "FaZe Clan", market: "Winner",
    odds: [
      { label: "1", value: 1.85 },
      { label: "2", value: 1.95 },
    ],
  },
];

const state = {
  activeSport: "all",
  query: "",
  mode: "single",
  slip: new Map(), // key -> {matchIdx, label, value, stake}
};

function keyFor(m, o) { return `${m.home}-${m.away}-${o.label}`; }

function renderSports() {
  const tabs = document.getElementById("sportsTabs");
  const list = document.getElementById("sportList");
  const all = [{ id: "all", name: "All Sports", icon: "🏆", count: MATCHES.length * 214 }];
  tabs.innerHTML = "";
  [...all, ...SPORTS].forEach((s) => {
    const b = document.createElement("button");
    b.className = "sport-tab" + (state.activeSport === s.id ? " active" : "");
    b.innerHTML = `<span>${s.icon}</span> ${s.name} <span class="count">${s.count}</span>`;
    b.onclick = () => { state.activeSport = s.id; renderAll(); };
    tabs.appendChild(b);
  });
  list.innerHTML = "";
  [...all, ...SPORTS].forEach((s) => {
    const b = document.createElement("button");
    b.className = "sport-row" + (state.activeSport === s.id ? " active" : "");
    b.innerHTML = `<span class="ico">${s.icon}</span><span>${s.name}</span><span class="n">${s.count}</span>`;
    b.onclick = () => { state.activeSport = s.id; renderAll(); };
    list.appendChild(b);
  });
}

function filteredMatches() {
  return MATCHES.map((m, idx) => ({ ...m, idx })).filter((m) => {
    if (state.activeSport !== "all" && m.sport !== state.activeSport) return false;
    if (state.query) {
      const q = state.query.toLowerCase();
      if (!(`${m.home} ${m.away} ${m.league}`.toLowerCase().includes(q))) return false;
    }
    return true;
  });
}

function renderMatches() {
  const wrap = document.getElementById("matches");
  const items = filteredMatches();
  const liveCount = items.filter((m) => m.live).length;
  document.getElementById("liveCount").textContent = `${liveCount} live · ${items.length} matches`;
  if (!items.length) {
    wrap.innerHTML = `<div class="panel"><div class="slip-empty">No matches found. Try another sport or search.</div></div>`;
    return;
  }
  const groups = {};
  items.forEach((m) => { (groups[m.league] ||= []).push(m); });
  wrap.innerHTML = "";
  Object.entries(groups).forEach(([league, games]) => {
    const box = document.createElement("section");
    box.className = "league";
    const head = document.createElement("button");
    head.className = "league-head";
    head.innerHTML = `<span>▾ ${league}</span><small>${games.length} matches · ${games[0].market}</small>`;
    head.onclick = () => body.hidden = !body.hidden;
    const body = document.createElement("div");
    games.forEach((m) => {
      const row = document.createElement("div");
      row.className = "match";
      const timeHtml = m.live
        ? `<div class="match-time live"><span class="live-dot"></span>LIVE ${m.minute}</div>`
        : `<div class="match-time">${m.time}</div>`;
      const oddsHtml = m.odds.map((o) => {
        const k = keyFor(m, o);
        const sel = state.slip.has(k) ? " selected" : "";
        return `<button class="odd${sel}" data-key="${k}" data-match="${m.idx}" data-label="${o.label}" data-value="${o.value}"><small>${o.label}</small><strong>${o.value.toFixed(2)}</strong></button>`;
      }).join("");
      row.innerHTML = `${timeHtml}<div class="match-teams"><div>${m.home} <small>vs</small> ${m.away}</div><small>${league} · ${m.market}</small></div><div class="odds">${oddsHtml}</div>`;
      body.appendChild(row);
    });
    box.appendChild(head);
    box.appendChild(body);
    wrap.appendChild(box);
  });
  wrap.querySelectorAll(".odd").forEach((btn) => {
    btn.onclick = () => toggleSlip(btn.dataset);
  });
}

function toggleSlip({ key, match, label, value }) {
  if (state.slip.has(key)) state.slip.delete(key);
  else {
    const m = MATCHES[Number(match)];
    state.slip.set(key, { match: m, label, value: Number(value), stake: 10 });
  }
  renderAll();
}

function renderSlip() {
  const box = document.getElementById("slipItems");
  const count = state.slip.size;
  document.getElementById("slipTitle").textContent = `Betslip (${count})`;
  const fab = document.getElementById("fabCount");
  if (fab) fab.textContent = count ? `Betslip · ${count}` : "Betslip";
  if (!count) {
    box.innerHTML = `<div class="slip-empty">👆 Click any odds to add selections.<br/>Your betslip will appear here.</div>`;
  } else {
    box.innerHTML = "";
    state.slip.forEach((s, k) => {
      const el = document.createElement("div");
      el.className = "slip-item";
      el.innerHTML = `
        <div class="top"><div><div><strong>${s.match.home} vs ${s.match.away}</strong></div>
        <div>Pick: <span class="pick">${s.label} @ ${s.value.toFixed(2)}</span></div></div>
        <button class="rm" aria-label="remove">✕</button></div>
        <div class="stake-row"><input type="number" min="1" value="${s.stake}" aria-label="stake"/><span style="color:var(--muted);font-size:12px">USDT</span></div>`;
      el.querySelector(".rm").onclick = () => { state.slip.delete(k); renderAll(); };
      el.querySelector("input").oninput = (e) => { s.stake = Number(e.target.value || 0); renderTotals(); };
      box.appendChild(el);
    });
  }
  renderTotals();
}

function renderTotals() {
  const entries = [...state.slip.values()];
  let totalOdds = 1, totalStake = 0, win = 0;
  if (state.mode === "single") {
    totalStake = entries.reduce((a, s) => a + (Number(s.stake) || 0), 0);
    win = entries.reduce((a, s) => a + (Number(s.stake) || 0) * s.value, 0);
    totalOdds = entries.length ? entries.reduce((a, s) => a + s.value, 0) / entries.length : 0;
    document.getElementById("rowOddsLabel").textContent = "Avg. odds";
  } else {
    totalOdds = entries.reduce((a, s) => a * s.value, 1);
    totalStake = entries.length ? Number(entries[0].stake) || 0 : 0;
    win = totalStake * (entries.length ? totalOdds : 0);
    document.getElementById("rowOddsLabel").textContent = "Combined odds";
  }
  document.getElementById("totalOdds").textContent = entries.length ? totalOdds.toFixed(2) : "—";
  document.getElementById("totalStake").textContent = totalStake.toFixed(2) + " USDT";
  document.getElementById("potential").textContent = entries.length ? win.toFixed(2) + " USDT" : "—";
  document.getElementById("placeBtn").disabled = !entries.length;
  document.getElementById("placeBtn").textContent = entries.length ? `Place bet · ${win.toFixed(2)} USDT` : "Place bet";
}

function renderAll() { renderSports(); renderMatches(); renderSlip(); }

document.addEventListener("DOMContentLoaded", () => {
  renderAll();
  document.getElementById("search").addEventListener("input", (e) => {
    state.query = e.target.value; renderMatches();
  });
  document.querySelectorAll(".tabs button").forEach((b) => {
    b.onclick = () => {
      document.querySelectorAll(".tabs button").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      state.mode = b.dataset.mode;
      renderTotals();
    };
  });
  document.getElementById("clearBtn").onclick = () => { state.slip.clear(); renderAll(); };
  document.getElementById("placeBtn").onclick = () => {
    alert(`Demo bet placed: ${state.slip.size} selection(s). Potential win ${document.getElementById("potential").textContent}.`);
    state.slip.clear(); renderAll();
  };
});
