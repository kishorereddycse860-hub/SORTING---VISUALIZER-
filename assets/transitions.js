/* =========================================================
   SortLab — page transitions
   Clicking an internal link now flies you down a neon
   synthwave street (via StreetFX) instead of a hard page
   jump — buildings recede on both sides, light streaks rush
   past, and it accelerates like a warp-drive engage. Falls
   back to instant nav if canvas / StreetFX isn't available,
   or motion is reduced.
   ========================================================= */

(function(){
  "use strict";

  if ("scrollRestoration" in history){
    history.scrollRestoration = "manual";
  }

  const NAV_FLAG = "sl_pt_nav";
  const COVER_MS = 2200;
  const REVEAL_MS = 2400;

  const WARP_LABELS = [
    "O(1)", "O(n)", "O(log n)", "O(n log n)", "O(n\u00B2)", "O(n\u00B3)",
    "swap()", "compare", "i++", "j--", "pivot", "merge()",
    "partition()", "heapify()", "divide & conquer", "recursive",
    "stable", "in-place", "temp = arr[i]", "arr[j]",
    "bubble sort", "selection sort", "insertion sort",
    "merge sort", "quick sort", "heap sort", "sorted \u2713"
  ];

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let street = null;
  let rampRaf = null;

  function buildOverlay(){
    const overlay = document.getElementById("ptOverlay");
    if (!overlay || overlay.dataset.built) return overlay;
    overlay.dataset.built = "1";
    overlay.innerHTML = `<canvas class="pt-canvas"></canvas><div class="pt-label">entering…</div>`;
    return overlay;
  }

  function ensureStreet(overlay){
    if (street || reduced || !window.StreetFX) return street;
    const canvas = overlay.querySelector(".pt-canvas");
    if (!canvas) return null;
    street = window.StreetFX.start(canvas, {
      speed: 1.8,
      density: 30,
      streakCount: 48,
      labels: WARP_LABELS,
      labelScale: 1.4
    });
    // "engaging warp drive" — ramp speed up fast so it genuinely feels
    // like accelerating forward down the street, not just idling
    const rampStart = performance.now();
    const RAMP_MS = 850, FROM = 1.8, TO = 6.5;
    function ramp(now){
      const p = Math.min(1, (now - rampStart) / RAMP_MS);
      const eased = 1 - Math.pow(1 - p, 3);
      if (street) street.setSpeed(FROM + (TO - FROM) * eased);
      if (p < 1) rampRaf = requestAnimationFrame(ramp);
    }
    rampRaf = requestAnimationFrame(ramp);
    return street;
  }

  function isSameOriginHtmlLink(a){
    if (!a || !a.getAttribute) return false;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return false;
    if (a.target && a.target !== "" && a.target !== "_self") return false;
    if (a.hasAttribute("download")) return false;
    let url;
    try { url = new URL(href, window.location.href); } catch (err) { return false; }
    if (url.origin !== window.location.origin) return false;
    return true;
  }

  function playEntrance(){
    window.scrollTo(0, 0);
    const overlay = buildOverlay();
    if (!overlay) return;
    const wasInternalNav = sessionStorage.getItem(NAV_FLAG) === "1";
    sessionStorage.removeItem(NAV_FLAG);

    if (!wasInternalNav || reduced){
      overlay.classList.remove("pt-covering", "pt-covered", "pt-revealing");
      return; // direct load / refresh — no forced warp
    }

    overlay.classList.add("pt-covered");
    const s = ensureStreet(overlay);
    void overlay.offsetWidth;
    requestAnimationFrame(() => {
      overlay.classList.add("pt-revealing");
      overlay.classList.remove("pt-covered");
      setTimeout(() => {
        overlay.classList.remove("pt-revealing", "pt-covering");
        if (rampRaf){ cancelAnimationFrame(rampRaf); rampRaf = null; }
        if (s){ s.stop(); street = null; }
      }, REVEAL_MS);
    });
  }

  function handleClick(e){
    const a = e.target.closest ? e.target.closest("a") : null;
    if (!isSameOriginHtmlLink(a)) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

    const dest = a.href;
    if (dest === window.location.href) return;

    e.preventDefault();
    window.scrollTo(0, 0);

    if (reduced){
      window.location.href = dest;
      return;
    }

    const overlay = buildOverlay();
    overlay.classList.remove("pt-revealing");
    overlay.classList.add("pt-covering");
    ensureStreet(overlay);
    sessionStorage.setItem(NAV_FLAG, "1");
    setTimeout(() => { window.location.href = dest; }, COVER_MS);
  }

  document.addEventListener("click", handleClick);
  window.addEventListener("DOMContentLoaded", playEntrance);
})();
