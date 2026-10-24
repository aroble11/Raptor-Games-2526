/* Small flourishes: typed "boot" line in the hero and a Konami-code easter egg. */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value);
    } catch (e) { return null; }
  }

  // ---------- boot sequence: type out the eyebrow line ----------
  var eyebrow = document.querySelector(".hero-eyebrow");
  if (eyebrow && !reduceMotion) {
    var text = eyebrow.textContent;
    eyebrow.setAttribute("aria-label", text);        // screen readers get the full line at once
    eyebrow.textContent = "";
    var typed = document.createElement("span");
    typed.setAttribute("aria-hidden", "true");
    var cursor = document.createElement("span");
    cursor.className = "boot-cursor";
    cursor.setAttribute("aria-hidden", "true");
    eyebrow.appendChild(typed);
    eyebrow.appendChild(cursor);
    eyebrow.classList.add("is-booting");
    var i = 0;
    (function type() {
      typed.textContent = text.slice(0, ++i);
      if (i < text.length) setTimeout(type, text[i - 1] === " " ? 18 : 32);
      else setTimeout(function () { eyebrow.classList.remove("is-booting"); eyebrow.classList.add("is-booted"); }, 900);
    })();
  }

  // ---------- toast ----------
  var toastEl = null, toastTimer = null;
  function toast(message) {
    if (!toastEl) {
      toastEl = document.createElement("p");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-visible"); }, 2600);
  }

  // ---------- Konami code: ↑ ↑ ↓ ↓ ← → ← → B A toggles CRT mode ----------
  var CODE = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
  var pos = 0;
  function setCrt(on, announce) {
    document.documentElement.classList.toggle("crt", on);
    store("raptor-crt", on ? "1" : null);
    if (announce) toast(on ? "CHEAT CODE ACCEPTED // CRT MODE ON" : "CRT MODE OFF");
  }
  if (store("raptor-crt") === "1") setCrt(true, false);

  document.addEventListener("keydown", function (e) {
    var t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
    if (document.documentElement.classList.contains("player-open")) return;
    var key = (e.key || "").toLowerCase();
    if (key === CODE[pos]) pos++;
    else if (key === "arrowup") pos = pos === 2 ? 2 : 1;   // extra ↑ presses still count
    else pos = 0;
    if (pos === CODE.length) {
      pos = 0;
      setCrt(!document.documentElement.classList.contains("crt"), true);
    }
  });
})();
