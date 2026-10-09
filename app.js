// Demo sportsbook front end — original code, mock data only (no real betting)
const SPORTS = [
  { id: "football", name: "Football", icon: "\u26BD", count: 1284 },
  { id: "tennis", name: "Tennis", icon: "\u{1F3BE}", count: 342 },
  { id: "basketball", name: "Basketball", icon: "\u{1F3C0}", count: 518 },
  { id: "hockey", name: "Ice Hockey", icon: "\u{1F3D2}", count: 214 },
  { id: "cricket", name: "Cricket", icon: "\u{1F3CF}", count: 156 },
  { id: "volleyball", name: "Volleyball", icon: "\u{1F3D0}", count: 98 },
  { id: "esports", name: "Esports", icon: "\u{1F3AE}", count: 187 },
  { id: "mma", name: "MMA", icon: "\u{1F94A}", count: 64 },
];

const TOP_LEAGUES = [
  { name: "England · Premier League", icon: "\u{1F3C6}", count: 10 },
  { name: "Spain · La Liga", icon: "\u{1F3C6}", count: 10 },
  { name: "ATP · Dubai", icon: "\u{1F3BE}", count: 16 },
  { name: "NBA", icon: "\u{1F3C0}", count: 12 },
];

const MATCHES = [
  { league: "England · Premier League", sport: "football", live: true, minute: "67'", home: "Arsenal", away: "Chelsea", more: 84,
    odds: [{ label: "1", value: 2.10 }, { label: "X", value: 3.40 }, { label: "2", value: 3.10 }] },
  { league: "England · Premier League", sport: "football", live: false, time: "Today 21:00", home: "Liverpool", away: "Man City", more: 112,
    odds: [{ label: "1", value: 2.55 }, { label: "X", value: 3.55 }, { label: "2", value: 2.60 }] },
  { league: "Spain · La Liga", sport: "football", live: true, minute: "34'", home: "Real Madrid", away: "Sevilla", more: 76,
    odds: [{ label: "1", value: 1.55 }, { label: "X", value: 4.20 }, { label: "2", value: 5.50 }] },
  { league: "Spain · La Liga", sport: "football", live: false, time: "Today 22:30", home: "Barcelona", away: "Atl\u00E9tico", more: 98,
    odds: [{ label: "1", value: 1.92 }, { label: "X", value: 3.70 }, { label: "2", value: 3.80 }] },
  { league: "ATP · Dubai", sport: "tennis", live: true, minute: "Set 2", home: "C. Alcaraz", away: "D. Medvedev", more: 24,
    odds: [{ label: "1", value: 1.68 }, { label: "2", value: 2.15 }] },
  { league: "ATP · Dubai", sport: "tennis", live: false, time: "Tomorrow 11:00", home: "J. Sinner", away: "A. Zverev", more: 22,
    odds: [{ label: "1", value: 1.74 }, { label: "2", value: 2.05 }] },
  { league: "NBA", sport: "basketball", live: false, time: "Tomorrow 02:30", home: "LA Lakers", away: "Boston Celtics", more: 45,
    odds: [{ label: "1", value: 2.30 }, { label: "2", value: 1.65 }] },
  { league: "NBA", sport: "basketball", live: true, minute: "Q3", home: "Denver Nuggets", away: "Phoenix Suns", more: 41,
    odds: [{ label: "1", value: 1.80 }, { label: "2", value: 2.00 }] },
  { league: "NHL", sport: "hockey", live: false, time: "Tomorrow 01:00", home: "Toronto Maple Leafs", away: "NY Rangers", more: 38,
    odds: [{ label: "1", value: 2.45 }, { label: "X", value: 3.90 }, { label: "2", value: 2.55 }] },
  { league: "CS2 · Major Qualifier", sport: "esports", live: true, minute: "Map 2", home: "NAVI", away: "FaZe Clan", more: 18,
    odds: [{ label: "1", value: 1.85 }, { label: "2", value: 1.95 }] },
];

const WINNERS = [
  ["alex***88", "1,240 USDT"], ["maria***21", "860 USDT"], ["crypto***king", "512 USDT"],
  ["bet***pro", "2,105 USDT"], ["lucky***7", "340 USDT"], ["nord***bet", "775 USDT"],
  ["spin***doc", "1,530 USDT"], ["odds***fan", "290 USDT"],
];

const state = { view: "lobby", sport: "all", query: "", mode: "single", slip: new Map(), winnerIdx: 0 };
const keyFor = (m, o) => `${m.home}-${m.away}-${o.label}`;

function visibleMatches() {
  return MATCHES.map((m, idx) => ({ ...m, idx })).filter((m) => {
    if (state.view === "live" && !m.live) return false;
    if (state.sport !== "all" && m.sport !== state.sport) return false;
    if (state.query && !`${m.home} ${m.away} ${m.league}`.toLowerCase().includes(state.query.toLowerCase())) return false;
    return true;
  });
}

function renderSidebar() {
  const tl = document.getElementById("topLeagues");
  tl.innerHTML = "";
  TOP_LEAGUES.forEach((l) => {
    const b = document.createElement("button");
    b.className = "tl-row";
    b.innerHTML = `<span class="ico">${l.icon}</span><span>${l.name}</span><span class="n">${l.count}</span>`;
    b.onclick = () => { state.sport = "all"; state.query = l.name.split(" · ")[0]; syncSearch(); renderMatches(); };
    tl.appendChild(b);
  });
  const list = document.getElementById("sportList");
  list.innerHTML = "";
  [{ id: "all", name: "All Sports", icon: "\u{1F3C6}", count: MATCHES.length * 214 }, ...SPORTS].forEach((s) => {
    const b = document.createElement("button");
    b.className = "sport-row" + (state.sport === s.id ? " active" : "");
    b.innerHTML = `<span class="ico">${s.icon}</span><span>${s.name}</span><span class="n">${s.count}</span>`;
    b.onclick = () => { state.sport = s.id; renderSidebar(); renderMatches(); };
    list.appendChild(b);
  });
}

function renderMatches() {
  const wrap = document.getElementById("matches");
  const items = visibleMatches();
  const live = MATCHES.filter((m) => m.live).length;
  document.getElementById("livePill").textContent = live;
  const titles = { lobby: ["Highlights", "Top matches right now"], live: ["Live now", `${items.length} matches in play`], all: ["All matches", `${items.length} matches`] };
  document.getElementById("viewTitle").textContent = state.query ? `Results for \u201C${state.query}\u201D` : titles[state.view][0];
  document.getElementById("viewSub").textContent = state.query ? `${items.length} matches` : titles[state.view][1];
  document.getElementById("lobbyHero").style.display = state.view === "lobby" && !state.query ? "" : "none";
  if (!items.length) { wrap.innerHTML = `<div class="panel"><div class="slip-empty">No matches found. Try another sport or search.</div></div>`; return; }
  // lobby: live first, then rest (max 6); live view: live only; all: everything
  let show = items;
  if (state.view === "lobby") show = [...items.filter((m) => m.live), ...items.filter((m) => !m.live)].slice(0, 6);
  const groups = {};
  show.forEach((m) => { (groups[m.league] ||= []).push(m); });
  wrap.innerHTML = "";
  Object.entries(groups).forEach(([league, games]) => {
    const box = document.createElement("section");
    box.className = "league";
    const head = document.createElement("button");
    head.className = "league-head";
    head.innerHTML = `<span>\u25BE ${league}</span><small>1X2 · Winner</small>`;
    head.onclick = () => body.hidden = !body.hidden;
    const body = document.createElement("div");
    games.forEach((m) => {
      const row = document.createElement("div");
      row.className = "match";
      const time = m.live
        ? `<div class="match-time live"><span class="live-dot"></span>LIVE ${m.minute}</div>`
        : `<div class="match-time">${m.time}</div>`;
      const odds = m.odds.map((o) => {
        const k = keyFor(m, o);
        return `<button class="odd${state.slip.has(k) ? " selected" : ""}" data-key="${k}" data-match="${m.idx}" data-label="${o.label}" data-value="${o.value}"><small>${o.label}</small><strong>${o.value.toFixed(2)}</strong></button>`;
      }).join("");
      row.innerHTML = `${time}<div class="match-teams"><div>${m.home} <small>vs</small> ${m.away}</div><small>${league}</small></div><div class="odds">${odds}</div><button class="more-link">+${m.more}</button>`;
      row.querySelector(".more-link").onclick = () => alert(`Demo: ${m.more} more markets for ${m.home} vs ${m.away} would open here.`);
      body.appendChild(row);
    });
    box.appendChild(head); box.appendChild(body); wrap.appendChild(box);
  });
  wrap.querySelectorAll(".odd").forEach((btn) => {
    btn.onclick = () => {
      const k = btn.dataset.key;
      if (state.slip.has(k)) state.slip.delete(k);
      else {
        const m = MATCHES[Number(btn.dataset.match)];
        state.slip.set(k, { match: m, label: btn.dataset.label, value: Number(btn.dataset.value), stake: 10 });
      }
      renderMatches(); renderSlip();
    };
  });
}

function slipTotals() {
  const entries = [...state.slip.values()];
  const n = entries.length;
  if (state.mode === "single") {
    const stake = entries.reduce((a, s) => a + (Number(s.stake) || 0), 0);
    const win = entries.reduce((a, s) => a + (Number(s.stake) || 0) * s.value, 0);
    const avg = n ? entries.reduce((a, s) => a + s.value, 0) / n : 0;
    return { odds: avg, stake, win, ok: n >= 1, need: "Add at least 1 selection" };
  }
  const combined = entries.reduce((a, s) => a * s.value, 1);
  const stake = n ? Number(entries[0].stake) || 0 : 0;
  if (state.mode === "combo") return { odds: combined, stake, win: stake * (n ? combined : 0), ok: n >= 2, need: "Choose at least 2 market outcomes" };
  return { odds: combined, stake, win: stake * (n ? combined : 0), ok: n >= 3, need: "Choose at least 3 market outcomes" };
}

function renderSlip() {
  const box = document.getElementById("slipItems");
  const n = state.slip.size;
  document.getElementById("slipTitle").textContent = `Betslip (${n})`;
  const badge = document.getElementById("dockBadge");
  badge.hidden = !n; badge.textContent = n;
  document.querySelectorAll(".tabs button").forEach((b) => {
    const need = b.dataset.mode === "combo" ? 2 : b.dataset.mode === "system" ? 3 : 1;
    b.disabled = n < need && n > 0 && state.mode !== b.dataset.mode ? false : false;
    b.title = n < need ? (b.dataset.mode === "single" ? "" : `Choose at least ${need} market outcomes`) : "";
  });
  if (!n) box.innerHTML = `<div class="slip-empty">\u{1F446} Click any odds to add selections.<br/>Single, Combo or System.</div>`;
  else {
    box.innerHTML = "";
    state.slip.forEach((s, k) => {
      const el = document.createElement("div");
      el.className = "slip-item";
      const stakeField = state.mode === "single" || [...state.slip.keys()][0] === k
        ? `<div class="stake-row"><input type="number" min="1" value="${s.stake}" aria-label="stake"/><span style="color:var(--muted);font-size:12px">USDT</span></div>` : "";
      el.innerHTML = `<div class="top"><div><div><strong>${s.match.home} vs ${s.match.away}</strong></div>
        <div>Pick: <span class="pick">${s.label} @ ${s.value.toFixed(2)}</span></div></div>
        <button class="rm" aria-label="remove">\u2715</button></div>${stakeField}`;
      el.querySelector(".rm").onclick = () => { state.slip.delete(k); renderMatches(); renderSlip(); };
      const inp = el.querySelector("input");
      if (inp) inp.oninput = (e) => { s.stake = Number(e.target.value || 0); renderTotals(); };
      box.appendChild(el);
    });
  }
  renderTotals();
}

function renderTotals() {
  const t = slipTotals();
  const n = state.slip.size;
  document.getElementById("totalOdds").textContent = n ? t.odds.toFixed(2) : "\u2014";
  document.getElementById("totalStake").textContent = t.stake.toFixed(2) + " USDT";
  document.getElementById("potential").textContent = n ? t.win.toFixed(2) + " USDT" : "\u2014";
  const btn = document.getElementById("placeBtn");
  btn.disabled = !t.ok;
  btn.textContent = !n ? "Place Bet" : t.ok ? `Place Bet \u00B7 ${t.win.toFixed(2)} USDT` : t.need;
}

function renderWinners() {
  const feed = document.getElementById("winnersFeed");
  feed.innerHTML = "";
  for (let i = 0; i < 4; i++) {
    const [u, a] = WINNERS[(state.winnerIdx + i) % WINNERS.length];
    const row = document.createElement("div");
    row.className = "winner-row";
    row.innerHTML = `<span>${u}</span><b>+${a}</b>`;
    feed.appendChild(row);
  }
}

function syncSearch() { document.getElementById("search").value = state.query; }

document.addEventListener("DOMContentLoaded", () => {
  renderSidebar(); renderMatches(); renderSlip(); renderWinners();
  setInterval(() => { state.winnerIdx = (state.winnerIdx + 1) % WINNERS.length; renderWinners(); }, 6000);

  document.querySelectorAll(".cat-tab").forEach((b) => {
    b.onclick = () => {
      document.querySelectorAll(".cat-tab").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      state.view = b.dataset.view; state.query = ""; syncSearch(); renderMatches();
    };
  });
  document.getElementById("heroCta").onclick = () => {
    document.querySelector('[data-view="live"]').click();
    document.getElementById("matches").scrollIntoView({ behavior: "smooth" });
  };
  const searchBtn = document.getElementById("searchBtn");
  const searchWrap = document.getElementById("searchWrap");
  searchBtn.onclick = () => { searchWrap.hidden = !searchWrap.hidden; if (!searchWrap.hidden) document.getElementById("search").focus(); };
  document.getElementById("search").addEventListener("input", (e) => { state.query = e.target.value; renderMatches(); });

  document.querySelectorAll(".tabs button").forEach((b) => {
    b.onclick = () => {
      document.querySelectorAll(".tabs button").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      state.mode = b.dataset.mode; renderSlip();
    };
  });
  document.getElementById("clearBtn").onclick = () => { state.slip.clear(); renderMatches(); renderSlip(); };
  document.getElementById("placeBtn").onclick = () => {
    alert(`Demo bet placed (${state.mode}): ${state.slip.size} selection(s). Potential win ${document.getElementById("potential").textContent}.`);
    state.slip.clear(); renderMatches(); renderSlip();
  };
  document.getElementById("dockSlip").onclick = (e) => {
    e.preventDefault();
    document.querySelector(".betslip").scrollIntoView({ behavior: "smooth" });
  };

  const modal = document.getElementById("authModal");
  const title = document.getElementById("authTitle");
  document.querySelectorAll("[data-auth]").forEach((b) => {
    b.onclick = () => { title.textContent = b.dataset.auth === "login" ? "Login" : "Register"; modal.classList.add("open"); };
  });
  document.getElementById("authCancel").onclick = () => modal.classList.remove("open");
  document.getElementById("authGo").onclick = () => { modal.classList.remove("open"); alert("Demo only \u2014 no account created."); };
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("open"); });
});
