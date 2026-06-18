// ---------------------------------------------------------------
// Cosmetic layer only. This file does NOT touch your game logic —
// it just watches the text that script.js already writes into
// #result, #user-score and #cpu-score, and toggles CSS classes
// for color / glow / bump effects.
// ---------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  const resultEl = document.getElementById("result");
  const userScoreEl = document.getElementById("user-score");
  const cpuScoreEl = document.getElementById("cpu-score");
  const playerCrt = document.getElementById("player-crt");

  if (resultEl) {
    const resultObserver = new MutationObserver(() => {
      const text = resultEl.textContent.toUpperCase();
      resultEl.classList.remove("is-win", "is-lose", "is-tie");
      if (playerCrt) playerCrt.classList.remove("glow-win", "glow-lose", "glow-tie");

      if (text.includes("あなたの勝ち")) {
        resultEl.classList.add("is-win");
        if (playerCrt) playerCrt.classList.add("glow-win");
      } else if (text.includes("あなたの負け")) {
        resultEl.classList.add("is-lose");
        if (playerCrt) playerCrt.classList.add("glow-lose");
      } else if (text.includes("引き分け")) {
        resultEl.classList.add("is-tie");
        if (playerCrt) playerCrt.classList.add("glow-tie");
      }
    });
    resultObserver.observe(resultEl, { childList: true, characterData: true, subtree: true });
  }

  const bump = (el) => {
    if (!el) return;
    const observer = new MutationObserver(() => {
      el.classList.remove("bump");
      // restart animation
      void el.offsetWidth;
      el.classList.add("bump");
      setTimeout(() => el.classList.remove("bump"), 220);
    });
    observer.observe(el, { childList: true, characterData: true, subtree: true });
  };

  bump(userScoreEl);
  bump(cpuScoreEl);
});