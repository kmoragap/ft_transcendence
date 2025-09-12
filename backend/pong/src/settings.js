// src/settings.ts
var defaultSettings = {
  name_p1: "Player 1",
  name_p2: "Player 2",
  p1Ai: true,
  p2Ai: true,
  p1Up: "Shift",
  p1Down: "Control",
  p2Up: "ArrowUp",
  p2Down: "ArrowDown",
  paddleSpeed: "standard",
  ballSpeed: "standard",
  ballSize: "normal",
  maxScore: 10,
  uiCol: "#66fcf1",
  ballCol: "#ffffff",
  innerBg: "#008000",
  outerBg: "#000000",
  showAiPath: true,
  trailLength: 20
};
function getCurrentSettings() {
  return {
    name_p1: document.getElementById("name_p1")?.value || "Player 1",
    name_p2: document.getElementById("name_p2")?.value || "Player 2",
    p1Ai: document.getElementById("p1Ai")?.checked || true,
    p2Ai: document.getElementById("p2Ai")?.checked || true,
    p1Up: document.getElementById("p1Up")?.value || "Shift",
    p1Down: document.getElementById("p1Down")?.value || "Control",
    p2Up: document.getElementById("p2Up")?.value || "ArrowUp",
    p2Down: document.getElementById("p2Down")?.value || "ArrowDown",
    paddleSpeed: document.getElementById("paddleSpeed")?.value || "standard",
    ballSpeed: document.getElementById("ballSpeed")?.value || "standard",
    ballSize: document.getElementById("ballSize")?.value || "normal",
    maxScore: parseInt(document.getElementById("maxScore")?.value || "10"),
    uiCol: document.getElementById("uiCol")?.value || "#66fcf1",
    ballCol: document.getElementById("ballCol")?.value || "#ffffff",
    innerBg: document.getElementById("innerBg")?.value || "#008000",
    outerBg: document.getElementById("outerBg")?.value || "#000000",
    showAiPath: true,
    trailLength: 20
  };
}
function setSettings(settings) {
  document.getElementById("name_p1").value = settings.name_p1;
  document.getElementById("name_p2").value = settings.name_p2;
  document.getElementById("p1Ai").checked = settings.p1Ai;
  document.getElementById("p2Ai").checked = settings.p2Ai;
  document.getElementById("p1Up").value = settings.p1Up;
  document.getElementById("p1Down").value = settings.p1Down;
  document.getElementById("p2Up").value = settings.p2Up;
  document.getElementById("p2Down").value = settings.p2Down;
  document.getElementById("paddleSpeed").value = settings.paddleSpeed;
  document.getElementById("ballSpeed").value = settings.ballSpeed;
  document.getElementById("ballSize").value = settings.ballSize;
  document.getElementById("maxScore").value = settings.maxScore.toString();
  document.getElementById("uiCol").value = settings.uiCol;
  document.getElementById("ballCol").value = settings.ballCol;
  document.getElementById("innerBg").value = settings.innerBg;
  document.getElementById("outerBg").value = settings.outerBg;
}
function resetToDefaults() {
  setSettings(defaultSettings);
}
function startGame() {
  const settings = getCurrentSettings();
  const params = new URLSearchParams();
  Object.entries(settings).forEach(([key, value]) => {
    params.set(key, value.toString());
  });
  const urlParams = new URLSearchParams(window.location.search);
  const lang = urlParams.get("lang") || "en";
  const mode = urlParams.get("mode") || "single";
  params.set("lang", lang);
  params.set("mode", mode);
  const gameUrl = `pong.html?${params.toString()}`;
  window.location.href = gameUrl;
}
function loadSettings() {
  const saved = localStorage.getItem("pong-settings");
  if (saved) {
    try {
      const settings = JSON.parse(saved);
      setSettings({ ...defaultSettings, ...settings });
    } catch (e) {
      console.warn("Failed to load saved settings:", e);
    }
  }
}
function saveSettings() {
  const settings = getCurrentSettings();
  localStorage.setItem("pong-settings", JSON.stringify(settings));
}
document.addEventListener("DOMContentLoaded", () => {
  loadSettings();
  document.getElementById("resetSettings")?.addEventListener("click", () => {
    resetToDefaults();
  });
  document.getElementById("startGame")?.addEventListener("click", () => {
    saveSettings();
    startGame();
  });
  const inputs = document.querySelectorAll("input, select");
  inputs.forEach((input) => {
    input.addEventListener("change", saveSettings);
  });
});
