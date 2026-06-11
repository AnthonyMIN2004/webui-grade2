"use strict";

/**
 * 焼肉食べたい？ app
 * - Background image comes from TheMealDB API (free, no API key needed)
 * - The "No" button dodges the cursor; only "Yes" is clickable
 */

// ---------------------------------------------------------------------------
// Config — tweak everything here, no magic numbers in the logic below
// ---------------------------------------------------------------------------
const CONFIG = {
  shops: {
    // Overpass API: free OpenStreetMap query service, no key needed.
    // Searches restaurants tagged as yakiniku/bbq inside Osaka city.
    url: "https://overpass-api.de/api/interpreter",
    query: `
      [out:json][timeout:10];
      area["name:en"="Osaka"]["admin_level"="7"]->.osaka;
      node(area.osaka)["amenity"="restaurant"]["cuisine"~"yakiniku|barbecue|bbq"];
      out body 30;
    `,
    timeoutMs: 12000,
    maxResults: 5,
  },
  dodge: {
    padding: 20,          // min distance (px) from stage edges
    growStartAt: 3,       // yes-button starts growing after N dodges
    growStep: 0.08,       // scale added per dodge
    growMax: 1.6,         // max yes-button scale
    fadeStartAt: 8,       // no-button starts fading after N dodges
    fadeStep: 0.15,       // opacity removed per dodge
    fadeMin: 0.15,        // no-button never fully disappears
  },
  taunts: [
    "おっと、手が滑った？",
    "「いいえ」は選べません",
    "逃げ足は速いよ",
    "焼肉に「いいえ」はない",
    "カルビが待ってるよ…",
    "無駄な抵抗はやめよう",
    "タン塩から始めよう？",
    "もう諦めて「はい」を押そう",
  ],
};

// ---------------------------------------------------------------------------
// DOM references
// ---------------------------------------------------------------------------
const dom = {
  stage: document.getElementById("stage"),
  askView: document.getElementById("askView"),
  winView: document.getElementById("winView"),
  yesBtn: document.getElementById("yesBtn"),
  noBtn: document.getElementById("noBtn"),
  retryBtn: document.getElementById("retryBtn"),
  shopList: document.getElementById("shopList"),
  taunt: document.getElementById("taunt"),
};

// ---------------------------------------------------------------------------
// Dodge logic
// ---------------------------------------------------------------------------
let dodgeCount = 0;

/** Clamp a value between min and max. */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/** Return a random integer between min and max (inclusive). */
function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

/**
 * Get taunt message based on dodge count.
 * @returns {string} Taunt message
 */
function currentTaunt() {
  const index = clamp(dodgeCount - 1, 0, CONFIG.taunts.length - 1);
  return CONFIG.taunts[index];
}

/**
 * Convert No button to absolute positioning for dodging.
 * Called once on first dodge to enable smooth movement.
 */
function detachNoButton() {
  const btnRect = dom.noBtn.getBoundingClientRect();
  const stageRect = dom.stage.getBoundingClientRect();
  dom.noBtn.style.position = "absolute";
  dom.noBtn.style.left = `${btnRect.left - stageRect.left}px`;
  dom.noBtn.style.top = `${btnRect.top - stageRect.top}px`;
}

/**
 * Reposition No button to random location within stage bounds.
 */
function moveNoButton() {
  const { padding } = CONFIG.dodge;
  const maxX = dom.stage.clientWidth - dom.noBtn.offsetWidth - padding;
  const maxY = dom.stage.clientHeight - dom.noBtn.offsetHeight - padding;
  dom.noBtn.style.left = `${randomBetween(padding, Math.max(maxX, padding))}px`;
  dom.noBtn.style.top = `${randomBetween(padding, Math.max(maxY, padding))}px`;
}

/**
 * Progressive escalation: grow Yes button and fade No button.
 * Creates increasing pressure to click Yes.
 */
function applyEscalation() {
  const { growStartAt, growStep, growMax, fadeStartAt, fadeStep, fadeMin } =
    CONFIG.dodge;

  if (dodgeCount >= growStartAt) {
    const scale = clamp(1 + dodgeCount * growStep, 1, growMax);
    dom.yesBtn.style.transform = `scale(${scale})`;
  }
  if (dodgeCount >= fadeStartAt) {
    const opacity = clamp(1 - (dodgeCount - fadeStartAt) * fadeStep, fadeMin, 1);
    dom.noBtn.style.opacity = opacity;
  }
}

/**
 * Handle No button dodges on hover/click/touch.
 * @param {Event} event
 */
function handleDodge(event) {
  event.preventDefault();
  if (dodgeCount === 0) {
    detachNoButton();
  }
  dodgeCount += 1;
  moveNoButton();
  dom.taunt.textContent = currentTaunt();
  applyEscalation();
}

// ---------------------------------------------------------------------------
// Yakiniku shop search (Overpass API / OpenStreetMap)
// ---------------------------------------------------------------------------

/**
 * Render restaurant list in the win view.
 * @param {Array} shops - Array of restaurant objects from Overpass API
 */
function renderShops(shops) {
  if (shops.length === 0) {
    dom.shopList.textContent = "近くのお店が見つかりませんでした…検索して探そう！";
    return;
  }
  dom.shopList.innerHTML = "";
  const heading = document.createElement("p");
  heading.className = "shops__heading";
  heading.textContent = "大阪の焼肉屋さん、見つけたよ：";
  dom.shopList.appendChild(heading);

  const list = document.createElement("ul");
  list.className = "shops__list";
  for (const shop of shops) {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = `https://www.openstreetmap.org/node/${shop.id}`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = shop.tags.name ?? "(名前なし)";
    item.appendChild(link);
    list.appendChild(item);
  }
  dom.shopList.appendChild(list);
}

/**
 * Fetch and display yakiniku restaurants in Osaka from OpenStreetMap.
 * Includes timeout handling and graceful error recovery.
 */
async function loadYakinikuShops() {
  dom.shopList.textContent = "お店を探し中…🔍";
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CONFIG.shops.timeoutMs);

    const response = await fetch(CONFIG.shops.url, {
      method: "POST",
      body: "data=" + encodeURIComponent(CONFIG.shops.query),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!response.ok) {
      throw new Error(`API status ${response.status}`);
    }

    const data = await response.json();
    const named = (data.elements ?? []).filter((el) => el.tags?.name);
    const shuffled = named.sort(() => Math.random() - 0.5);
    renderShops(shuffled.slice(0, CONFIG.shops.maxResults));
  } catch (error) {
    console.warn("Shop search failed:", error.message);
    dom.shopList.textContent = "お店検索に失敗…でも焼肉への気持ちは本物！";
  }
}

/**
 * Switch to win view and load restaurant data.
 */
function showWinView() {
  dom.askView.classList.add("stage__inner--hidden");
  dom.winView.classList.remove("stage__inner--hidden");
  loadYakinikuShops();
}

/**
 * Reset game state and return to ask view.
 */
function resetGame() {
  dodgeCount = 0;
  dom.taunt.textContent = "";
  dom.yesBtn.style.transform = "";
  dom.noBtn.style.cssText = "";
  dom.winView.classList.add("stage__inner--hidden");
  dom.askView.classList.remove("stage__inner--hidden");
}

/**
 * Initialize event listeners for game interaction.
 */
function init() {
  dom.noBtn.addEventListener("mouseenter", handleDodge);
  dom.noBtn.addEventListener("click", handleDodge);
  dom.noBtn.addEventListener("touchstart", handleDodge, { passive: false });
  dom.yesBtn.addEventListener("click", showWinView);
  dom.retryBtn.addEventListener("click", resetGame);
}

init();