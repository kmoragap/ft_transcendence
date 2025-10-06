import { t } from "../i18n.js";
const API_BASE = "/api/pong";

type GameRow = {
  id: string;
  player1Name: string;
  player2Name: string;
  score1: number;
  score2: number;
  maxScore: number;
  winnerId: string | null;
  gameType: "VS_HUMAN" | "VS_AI";
  createdAt: string;
};

type LeaderRow = {
  playerId: string | null;
  name: string;
  wins: number;
};

async function fetchJSON<T>(url: string): Promise<T> {
  const r = await fetch(url, { credentials: "include" });
  if (!r.ok) throw new Error(`Request failed: ${r.status}`);
  return r.json();
}

function fmtDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function renderDashboard(): HTMLElement {
  const title = document.createElement("h1");
  title.className =
    "pl-2.5 font-[jura] text-[#66fcf1] uppercase title mobile-title";
  const line = document.createElement("span");
  line.className = "mid_line";
  line.setAttribute("data-i18n", "dashboard");
  line.textContent = "DASHBOARD";
  title.appendChild(line);

  const wrap = document.createElement("section");
  wrap.className =
    "relative m-0 flex flex-col items-center justify-center text-center z-10";

  const card = document.createElement("div");
  card.className = [
    "flex flex-col bg-[rgba(102,252,241,0.1)] rounded-md flex-1",
    "shadow-lg px-4 md:px-8 py-4 md:py-5",
    "w-full max-w-7xl mx-auto mt-5",
    "min-h-75",
  ].join(" ");

  const header = document.createElement("div");
  header.className = "flex items-center justify-between px-0 pb-5";

  const tabs = document.createElement("div");
  tabs.className = "flex gap-1.5 md:gap-2.5";

  function makeTab(label: string, translationKey?: string) {
    const btn = document.createElement("button");
    btn.textContent = label;
    if (translationKey) {
      btn.setAttribute("data-i18n", translationKey);
    }
    btn.className = [
      "px-2 md:px-3 py-1 md:py-1.5 rounded-md border",
      "border-[rgba(102,252,241,0.25)] text-sm md:text-base font-medium",
      "text-[#66fcf1] bg-[rgba(102,252,241,0.1)]   hover:bg-[rgba(102,252,241,0.12)]",
      "focus-visible:ring-2 focus-visible:ring-[#66fcf1] hover:shadow-lg",
      "active:scale-95 animation-[press_0.2s_ease]",
      "transition cursor-pointer",
    ].join(" ");
    return btn;
  }

  const tabLast = makeTab(t("last_5_games"), "last_5_games");
  const tabTop = makeTab(t("top_5_players"), "top_5_players");
  tabs.appendChild(tabLast);
  tabs.appendChild(tabTop);

  header.appendChild(tabs);

  // Content
  const body = document.createElement("div");
  body.className =
    "py-2 md:py-2.5 text-left bg-[rgba(30,41,40,0.7)] w-full flex-1 border border-[rgba(102,252,241,0.15)]";

  const table = document.createElement("div");
  table.className = "px-2 md:px-2.5";

  body.appendChild(table);

  card.appendChild(header);
  card.appendChild(body);
  wrap.appendChild(title);
  wrap.appendChild(card);

  function renderGames(rows: GameRow[]) {
    table.innerHTML = "";
    const list = document.createElement("div");
    list.className = "divide-y divide-[rgba(102,252,241,0.1)]";

    if (rows.length === 0) {
      const empty = document.createElement("div");
      empty.className = "p-4 text-[rgba(255,255,255,0.75)]";
      empty.textContent = t("no_finished_games");
      list.appendChild(empty);
    } else {
      rows.forEach(g => {
        const line = document.createElement("div");
        line.className =
          "flex flex-col md:flex-row md:items-center justify-between p-2 md:p-3 hover:bg-[rgba(102,252,241,0.06)] gap-1 md:gap-0";

        // Main game info: "dvaisman 0:3 Roger Federror"
        const gameInfo = document.createElement("div");
        gameInfo.className = "text-white text-sm md:text-base";
        gameInfo.textContent = `${g.player1Name} ${g.score1}:${g.score2} ${g.player2Name}`;

        // Time info
        const timeInfo = document.createElement("div");
        timeInfo.className = "text-xs text-[rgba(255,255,255,0.6)]";
        timeInfo.textContent = fmtDate(g.createdAt);

        line.appendChild(gameInfo);
        line.appendChild(timeInfo);
        list.appendChild(line);
      });
    }

    table.appendChild(list);
  }

  function renderLeaders(rows: LeaderRow[]) {
    table.innerHTML = "";
    const list = document.createElement("div");
    list.className = "divide-y divide-[rgba(102,252,241,0.1)]";

    if (rows.length === 0) {
      const empty = document.createElement("div");
      empty.className = "p-4 text-[rgba(255,255,255,0.75)]";
      empty.textContent = t("no_winners_yet");
      list.appendChild(empty);
    } else {
      rows.forEach((p, idx) => {
        const line = document.createElement("div");
        line.className =
          "flex flex-col md:flex-row md:items-center justify-between p-2 md:p-3 hover:bg-[rgba(102,252,241,0.06)] gap-1 md:gap-0";

        const left = document.createElement("div");
        left.className = "flex items-center gap-2 md:gap-3";
        const rank = document.createElement("div");
        rank.className = "w-6 md:w-7 text-center font-bold text-[#66fcf1]";
        rank.textContent = String(idx + 1);

        const name = document.createElement("div");
        name.className = "text-white text-sm md:text-base";
        name.textContent = p.name ?? p.playerId ?? "Unknown";

        left.appendChild(rank);
        left.appendChild(name);

        const right = document.createElement("div");
        right.className = "text-[#66fcf1] text-sm";
        right.textContent = `${p.wins} win${p.wins === 1 ? "" : "s"}`;

        line.appendChild(left);
        line.appendChild(right);
        list.appendChild(line);
      });
    }

    table.appendChild(list);
  }

  async function loadLast5() {
    try {
      const data = await fetchJSON<GameRow[]>(`${API_BASE}/games?take=5`);
      renderGames(data);
      tabLast.classList.add("bg-[rgba(102,252,241,0.12)]");
      tabTop.classList.remove("bg-[rgba(102,252,241,0.12)]");
    } catch (e) {
      table.innerHTML = `<div class="p-4 text-red-300" data-i18n="failed_to_load_games">Failed to load games</div>`;
      console.error(e);
    }
  }

  async function loadTop5() {
    try {
      const data = await fetchJSON<LeaderRow[]>(
        `${API_BASE}/leaderboard?limit=5`
      );
      renderLeaders(data);
      tabTop.classList.add("bg-[rgba(102,252,241,0.12)]");
      tabLast.classList.remove("bg-[rgba(102,252,241,0.12)]");
    } catch (e) {
      table.innerHTML = `<div class="p-4 text-red-300">Failed to load leaderboard</div>`;
      console.error(e);
    }
  }

  tabLast.addEventListener("click", loadLast5);
  tabTop.addEventListener("click", loadTop5);

  window.addEventListener("languageChanged", () => {
    if (tabLast.classList.contains("bg-[rgba(102,252,241,0.12)]")) {
      loadLast5();
    } else if (tabTop.classList.contains("bg-[rgba(102,252,241,0.12)]")) {
      loadTop5();
    }
  });

  loadLast5();

  return wrap;
}
