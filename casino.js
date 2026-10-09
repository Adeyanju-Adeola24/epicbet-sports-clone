// Casino lobby — mock game catalog, demo only
const GAMES = [
  { name: "Neon Fruits Deluxe", provider: "Epic Studios", cat: "slots", rtp: "96.5%", players: 2314, emoji: "🍒", bg: "linear-gradient(135deg,#3b0764,#a21caf)" },
  { name: "Pyramid Gold", provider: "Epic Studios", cat: "slots", rtp: "96.1%", players: 1876, emoji: "🐪", bg: "linear-gradient(135deg,#713f12,#ca8a04)" },
  { name: "Candy Cascade", provider: "SugarWorks", cat: "slots", rtp: "95.8%", players: 3201, emoji: "🍬", bg: "linear-gradient(135deg,#831843,#ec4899)" },
  { name: "Wolf Moon Rising", provider: "NightSpin", cat: "slots", rtp: "96.8%", players: 1204, emoji: "🐺", bg: "linear-gradient(135deg,#020617,#334155)" },
  { name: "Turbo Roulette", provider: "Live Arena", cat: "live", rtp: "97.3%", players: 986, emoji: "🎡", bg: "linear-gradient(135deg,#7f1d1d,#ef4444)" },
  { name: "Blackjack VIP", provider: "Live Arena", cat: "live", rtp: "99.2%", players: 743, emoji: "🃏", bg: "linear-gradient(135deg,#052e16,#16a34a)" },
  { name: "Lightning Baccarat", provider: "Live Arena", cat: "live", rtp: "98.9%", players: 512, emoji: "⚡", bg: "linear-gradient(135deg,#172554,#3b82f6)" },
  { name: "Dream Wheel", provider: "Live Arena", cat: "live", rtp: "96.6%", players: 689, emoji: "🎯", bg: "linear-gradient(135deg,#4a044e,#d946ef)" },
  { name: "Classic Blackjack", provider: "TablePro", cat: "table", rtp: "99.4%", players: 431, emoji: "♠️", bg: "linear-gradient(135deg,#111827,#4b5563)" },
  { name: "European Roulette", provider: "TablePro", cat: "table", rtp: "97.3%", players: 598, emoji: "🎰", bg: "linear-gradient(135deg,#064e3b,#34d399)" },
  { name: "Texas Hold'em", provider: "TablePro", cat: "table", rtp: "98.1%", players: 377, emoji: "♥️", bg: "linear-gradient(135deg,#7c2d12,#fb923c)" },
  { name: "Rocket Crash", provider: "InstantPlay", cat: "crash", rtp: "97.0%", players: 4102, emoji: "🚀", bg: "linear-gradient(135deg,#0c4a6e,#22d3ee)" },
  { name: "Mines Turbo", provider: "InstantPlay", cat: "crash", rtp: "97.5%", players: 2890, emoji: "💣", bg: "linear-gradient(135deg,#3f3f46,#a1a1aa)" },
  { name: "Plinko Rush", provider: "InstantPlay", cat: "crash", rtp: "96.9%", players: 1954, emoji: "🔮", bg: "linear-gradient(135deg,#312e81,#818cf8)" },
  { name: "Dragon Tiger", provider: "Live Arena", cat: "live", rtp: "96.7%", players: 366, emoji: "🐉", bg: "linear-gradient(135deg,#450a0a,#f97316)" },
  { name: "Starburst Nights", provider: "NightSpin", cat: "slots", rtp: "96.0%", players: 1543, emoji: "💫", bg: "linear-gradient(135deg,#1e1b4b,#8b5cf6)" },
];

const CATS = [
  { id: "all", name: "All games" },
  { id: "slots", name: "🎰 Slots" },
  { id: "live", name: "🎥 Live Dealer" },
  { id: "table", name: "♣️ Table Games" },
  { id: "crash", name: "🚀 Crash & Instant" },
];

const state = { cat: "all", q: "" };

function renderCats() {
  const box = document.getElementById("casinoCats");
  box.innerHTML = "";
  CATS.forEach((c) => {
    const b = document.createElement("button");
    b.className = "chip" + (state.cat === c.id ? " active" : "");
    b.textContent = c.name;
    b.onclick = () => { state.cat = c.id; render(); };
    box.appendChild(b);
  });
}

function render() {
  renderCats();
  const grid = document.getElementById("gameGrid");
  const list = GAMES.filter((g) => {
    if (state.cat !== "all" && g.cat !== state.cat) return false;
    if (state.q && !(g.name + " " + g.provider).toLowerCase().includes(state.q.toLowerCase())) return false;
    return true;
  });
  document.getElementById("gameCount").textContent = `${list.length} games`;
  grid.innerHTML = list.length ? "" : `<div class="panel"><div class="slip-empty">No games match your search.</div></div>`;
  list.forEach((g) => {
    const card = document.createElement("div");
    card.className = "game-card";
    card.innerHTML = `
      <div class="game-thumb" style="background:${g.bg}">${g.emoji}</div>
      <div class="game-body">
        <h3>${g.name}</h3><small>${g.provider} · 👥 ${g.players.toLocaleString()}</small>
        <div class="game-meta"><span class="rtp">RTP ${g.rtp}</span><button class="btn btn-primary" style="padding:6px 12px">Play</button></div>
      </div>`;
    card.querySelector("button").onclick = () => alert(`Demo: "${g.name}" would launch here. No real-money play in this clone.`);
    grid.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  render();
  document.getElementById("casinoSearch").addEventListener("input", (e) => { state.q = e.target.value; render(); });
});
