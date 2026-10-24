/* Arcade-cabinet player: opens a game in an overlay instead of leaving the gallery.
 * Exposes window.RaptorPlayer.open(game, section, returnFocusEl). */
(function () {
  "use strict";

  var GAMES_PATH = "game-prog-2526/";
  var HASH_PREFIX = "#play/";
  var touchOnly = window.matchMedia("(hover: none) and (pointer: coarse)").matches;

  // ---------- build the overlay once ----------
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  var root = el("div", "player");
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-modal", "true");
  root.setAttribute("aria-labelledby", "player-title");
  root.hidden = true;

  var cabinet = el("div", "player-cabinet");
  var hud = el("header", "player-hud");

  var info = el("div", "hud-info");
  info.appendChild(el("span", "hud-label", "NOW PLAYING"));
  var title = el("h2", "hud-title"); title.id = "player-title";
  info.appendChild(title);
  var controls = el("p", "hud-controls");
  info.appendChild(controls);
  if (touchOnly) info.appendChild(el("p", "hud-warning", "⌨ These games need a keyboard"));

  var buttons = el("div", "hud-buttons");
  function hudButton(label, action, extraClass) {
    var b = el("button", "hud-btn" + (extraClass ? " " + extraClass : ""), label);
    b.type = "button";
    b.dataset.action = action;
    buttons.appendChild(b);
    return b;
  }
  hudButton("↻ RESTART", "restart");
  var fsBtn = hudButton("⛶ FULLSCREEN", "fullscreen");
  var newTab = el("a", "hud-btn", "↗ NEW TAB");
  newTab.target = "_blank";
  newTab.rel = "noopener";
  buttons.appendChild(newTab);
  var closeBtn = hudButton("✕ EXIT", "close", "hud-btn--exit");

  hud.appendChild(info);
  hud.appendChild(buttons);

  var stage = el("div", "player-stage");
  var loading = el("p", "player-loading", "INSERTING CARTRIDGE…");
  var resume = el("button", "player-resume", "▶ CLICK HERE TO CONTROL THE GAME");
  resume.type = "button";
  stage.appendChild(loading);
  stage.appendChild(resume);

  cabinet.appendChild(hud);
  cabinet.appendChild(stage);
  root.appendChild(cabinet);
  document.body.appendChild(root);

  var canFullscreen = !!(stage.requestFullscreen || stage.webkitRequestFullscreen);
  if (!canFullscreen) fsBtn.hidden = true;

  // ---------- state ----------
  var frame = null, current = null, returnFocus = null, pushedHistory = false, focusTimer = null;

  function makeFrame(src, label) {
    var f = document.createElement("iframe");
    f.className = "player-frame";
    f.title = label;
    f.setAttribute("allow", "fullscreen; autoplay; gamepad");
    f.addEventListener("load", function () {
      if (f.src === "about:blank") return;
      stage.classList.add("is-loaded");
      focusGame();
    });
    f.addEventListener("focus", updateFocusHint);
    f.addEventListener("blur", function () { setTimeout(updateFocusHint, 0); });
    f.src = src;
    return f;
  }

  function focusGame() {
    if (!frame) return;
    try {
      frame.focus();
      frame.contentWindow.focus();
      var canvas = frame.contentDocument && frame.contentDocument.getElementById("canvas");
      if (canvas) canvas.focus();
    } catch (e) { /* cross-origin or not ready yet */ }
    updateFocusHint();
  }

  function updateFocusHint() {
    // Keyboard input only reaches the game while its frame has focus.
    var focused = frame && document.activeElement === frame;
    stage.classList.toggle("needs-focus", !!frame && stage.classList.contains("is-loaded") && !focused);
  }

  function open(game, section, focusEl, opts) {
    opts = opts || {};
    if (current) close({ fromHistory: true });
    current = game;
    returnFocus = focusEl || document.activeElement;
    var src = GAMES_PATH + game.folder + "/";

    title.textContent = game.student.toUpperCase() + " // " + section.title;
    controls.textContent = (game.controls || section.controls || "");
    newTab.href = src;

    stage.classList.remove("is-loaded", "needs-focus");
    frame = makeFrame(src, game.student + "'s " + section.title.toLowerCase() + " game");
    stage.insertBefore(frame, resume);

    root.hidden = false;
    document.documentElement.classList.add("player-open");
    // Clicking a non-focusable part of the page moves focus without firing an event,
    // so re-check a few times a second whether the game still has the keyboard.
    clearInterval(focusTimer);
    focusTimer = setInterval(updateFocusHint, 400);
    requestAnimationFrame(function () { root.classList.add("is-open"); });

    if (!opts.fromHistory) {
      history.pushState({ raptorPlay: game.folder }, "", HASH_PREFIX + game.folder);
      pushedHistory = true;
    } else {
      pushedHistory = false;
    }
    closeBtn.focus();
  }

  function close(opts) {
    opts = opts || {};
    if (!current) return;
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    }
    if (frame) {
      frame.src = "about:blank";   // stops audio and frees the game's memory
      frame.remove();
      frame = null;
    }
    current = null;
    clearInterval(focusTimer);
    focusTimer = null;
    root.classList.remove("is-open");
    root.hidden = true;
    document.documentElement.classList.remove("player-open");

    if (!opts.fromHistory) {
      if (pushedHistory) history.back();
      else history.replaceState(null, "", location.pathname + location.search);
    }
    pushedHistory = false;
    if (returnFocus && document.contains(returnFocus)) returnFocus.focus();
  }

  function restart() {
    if (!frame || !current) return;
    stage.classList.remove("is-loaded", "needs-focus");
    var src = frame.src;
    frame.src = "about:blank";
    frame.src = src;
  }

  function toggleFullscreen() {
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    } else {
      (stage.requestFullscreen || stage.webkitRequestFullscreen).call(stage);
      setTimeout(focusGame, 200);
    }
  }

  // ---------- events ----------
  buttons.addEventListener("click", function (e) {
    var b = e.target.closest("[data-action]");
    if (!b) return;
    if (b.dataset.action === "close") close();
    else if (b.dataset.action === "restart") restart();
    else if (b.dataset.action === "fullscreen") toggleFullscreen();
  });
  resume.addEventListener("click", focusGame);

  // Clicking the dark area around the cabinet closes it.
  root.addEventListener("click", function (e) { if (e.target === root) close(); });

  document.addEventListener("keydown", function (e) {
    if (!current) return;
    if (e.key === "Escape" && !(document.fullscreenElement || document.webkitFullscreenElement)) {
      e.preventDefault(); close();
    } else if (e.key === "Tab") {
      // Keep Tab inside the player.
      var items = Array.prototype.filter.call(
        root.querySelectorAll("button:not([hidden]), a[href], iframe"),
        function (n) { return n.offsetParent !== null || n === frame; });
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  window.addEventListener("blur", function () { setTimeout(updateFocusHint, 0); });
  window.addEventListener("focus", updateFocusHint);
  document.addEventListener("focusin", updateFocusHint);
  document.addEventListener("fullscreenchange", function () {
    fsBtn.textContent = document.fullscreenElement ? "⛶ EXIT FULLSCREEN" : "⛶ FULLSCREEN";
    setTimeout(focusGame, 100);
  });

  window.addEventListener("popstate", function () {
    var folder = location.hash.indexOf(HASH_PREFIX) === 0 ? location.hash.slice(HASH_PREFIX.length) : null;
    if (current && current.folder !== folder) close({ fromHistory: true });
    if (folder && !current && window.RaptorGallery) window.RaptorGallery.openByFolder(folder, { fromHistory: true });
  });

  window.RaptorPlayer = {
    open: open,
    close: close,
    hashFolder: function () {
      return location.hash.indexOf(HASH_PREFIX) === 0 ? decodeURIComponent(location.hash.slice(HASH_PREFIX.length)) : null;
    },
  };
})();
