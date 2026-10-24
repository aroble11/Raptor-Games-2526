/* Character-select gallery: builds the roster from games.js, shows the selected
 * game on the big monitor, and launches it in the arcade player.
 * You shouldn't need to edit this file — add games in games.js. */
(function () {
  "use strict";

  var GAMES_PATH = "game-prog-2526/";
  var PREVIEW_PATH = "previews/";
  var data = window.RAPTOR_GALLERY;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var narrow = window.matchMedia("(max-width: 719px)");

  var $ = function (id) { return document.getElementById(id); };
  var main = $("gallery"), stage = $("stage"), roster = $("roster");
  var still = $("screen-still"), video = $("screen-video"), monitor = $("monitor");
  var nameEl = $("sel-name"), gameEl = $("sel-game"), keysEl = $("sel-keys"), blurbEl = $("sel-blurb"), startEl = $("start");
  var captionEl = $("demo-caption"), introStart = $("intro-start"), homeLink = $("home-link");

  function el(tag, attrs, text) {
    var node = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    if (text != null) node.textContent = text;
    return node;
  }
  var SMALL_WORDS = /^(a|an|and|at|by|for|in|of|on|or|the|to)$/;
  function titleCase(s) {
    return s.toLowerCase().split(" ").map(function (w, i) {
      return i > 0 && SMALL_WORDS.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1);
    }).join(" ");
  }

  function fail(message) {
    console.error("[gallery] " + message);
    main.appendChild(el("p", { class: "gallery-error" }, "Games couldn't be loaded. " + message));
  }
  if (!data || !Array.isArray(data.sections) || !Array.isArray(data.games)) { fail("Check games.js for a typo."); return; }

  // ---------- validate data ----------
  var sectionsById = {};
  data.sections.forEach(function (s) { sectionsById[s.id] = s; });
  var bySection = {};
  data.games.forEach(function (g, i) {
    var where = "games.js entry #" + (i + 1) + " (" + (g && g.student) + ")";
    if (!g || !g.student || !g.folder || !g.section) { console.warn("[gallery] " + where + " is missing student, folder or section — skipped."); return; }
    if (!/^[A-Za-z0-9_-]+$/.test(g.folder)) { console.warn("[gallery] " + where + ": folder may only use letters, numbers, _ and - — skipped."); return; }
    if (!sectionsById[g.section]) { console.warn("[gallery] " + where + ": unknown section \"" + g.section + "\" — skipped."); return; }
    (bySection[g.section] = bySection[g.section] || []).push(g);
  });

  // ---------- roster ----------
  var items = [];   // { game, section, tile, row, col }
  var rows = [];    // arrays of item indexes, one per section row

  data.sections.forEach(function (section) {
    var games = bySection[section.id];
    if (!games || !games.length) return;
    var rowEl = el("div", { class: "row", role: "group", "aria-labelledby": "row-" + section.id });
    var head = el("h3", { id: "row-" + section.id }, titleCase(section.title));
    head.appendChild(el("small", null, games.length + (games.length === 1 ? " game" : " games")));
    rowEl.appendChild(head);
    var tiles = el("div", { class: "tiles" });
    var rowIdx = [];
    games.forEach(function (game, col) {
      var idx = items.length;
      var tile = el("button", { type: "button", class: "tile", "aria-pressed": "false", tabindex: "-1",
        "aria-label": game.student + ", " + titleCase(section.title) });
      var pic = el("span", { class: "pic" });
      var img = el("img", { src: PREVIEW_PATH + game.folder + "-tile.webp", alt: "", loading: "lazy" });
      img.addEventListener("error", function onErr() {
        if (game.screenshot && img.getAttribute("src") !== game.screenshot) { img.src = game.screenshot; return; }
        img.removeEventListener("error", onErr); img.remove(); pic.classList.add("no-thumb");
      });
      pic.appendChild(img);
      tile.appendChild(pic);
      tile.appendChild(el("span", { class: "tile-name" }, game.student.toUpperCase()));
      tile.addEventListener("click", function () {
        if (idx === selected) launch(); else select(idx, { scrollStage: narrow.matches });
      });
      tile.addEventListener("dblclick", function () { if (idx === selected) launch(); });
      tile.addEventListener("pointerenter", function () { new Image().src = PREVIEW_PATH + game.folder + "-poster.webp"; });
      tiles.appendChild(tile);
      items.push({ game: game, section: section, tile: tile, row: rows.length, col: col });
      rowIdx.push(idx);
    });
    rowEl.appendChild(tiles);
    roster.appendChild(rowEl);
    rows.push(rowIdx);
  });

  if (!items.length) { fail("No games are listed yet."); return; }

  // ---------- stage ----------
  var selected = -1;

  function keyCaps(kind) {
    var wrap = el("span", { class: "keypad keypad--" + (kind === "arrows" ? "arrows" : "wasd") });
    (kind === "arrows" ? ["↑", "←", "↓", "→"] : ["W", "A", "S", "D"]).forEach(function (k) { wrap.appendChild(el("span", { class: "kbd" }, k)); });
    return wrap;
  }

  function showMedia(game, loop) {
    stage.classList.remove("is-live");
    video.loop = loop !== false;
    video.pause();
    video.removeAttribute("src");
    still.onerror = function () {
      if (game.screenshot && still.getAttribute("src") !== game.screenshot) still.src = game.screenshot;
      else still.onerror = null;
    };
    still.src = PREVIEW_PATH + game.folder + "-poster.webp";
    if (reduceMotion.matches || (navigator.connection && navigator.connection.saveData)) return;
    video.src = PREVIEW_PATH + game.folder + ".webm";
    var p = video.play();
    if (p && p.catch) p.catch(function () {});
  }
  video.addEventListener("playing", function () { stage.classList.add("is-live"); });
  video.addEventListener("error", function () { stage.classList.remove("is-live"); });

  function select(idx, opts) {
    opts = opts || {};
    if (idx < 0 || idx >= items.length) return;
    if (selected >= 0) {
      var old = items[selected].tile;
      old.classList.remove("is-selected"); old.setAttribute("aria-pressed", "false"); old.tabIndex = -1;
    }
    leaveIntro();
    selected = idx;
    var it = items[idx], g = it.game, s = it.section, href = GAMES_PATH + g.folder + "/";
    it.tile.classList.add("is-selected"); it.tile.setAttribute("aria-pressed", "true"); it.tile.tabIndex = 0;

    nameEl.textContent = g.student.toUpperCase();
    fitName();
    gameEl.textContent = titleCase(s.title);
    keysEl.textContent = "";
    keysEl.appendChild(keyCaps(g.keys || s.keys));
    blurbEl.textContent = g.blurb || s.blurb || g.controls || s.controls || "";
    startEl.href = href;
    monitor.href = href;
    monitor.setAttribute("aria-label", "Play " + g.student + "'s " + titleCase(s.title) + " game");
    startEl.setAttribute("aria-label", "Insert coin to start: play " + g.student + "'s " + titleCase(s.title) + " game");
    showMedia(g);

    if (opts.focus) {
      it.tile.focus({ preventScroll: true });
      it.tile.scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduceMotion.matches ? "auto" : "smooth" });
    }
    if (opts.scrollStage) stage.scrollIntoView({ block: "start", behavior: reduceMotion.matches ? "auto" : "smooth" });
  }

  // Shrink long names so they stay on one line (e.g. GERARDO on a narrow column).
  function fitName() {
    nameEl.style.fontSize = "";
    var size = parseFloat(getComputedStyle(nameEl).fontSize);
    while (nameEl.scrollWidth > nameEl.clientWidth + 1 && size > 28) {
      size -= 2;
      nameEl.style.fontSize = size + "px";
    }
  }
  var fitTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(fitTimer);
    fitTimer = setTimeout(function () { if (selected >= 0) fitName(); }, 100);
  });

  function launch(opts) {
    var it = items[selected];
    if (!it) return;
    if (window.RaptorPlayer) window.RaptorPlayer.open(it.game, it.section, it.tile, opts);
    else location.href = GAMES_PATH + it.game.folder + "/";
  }

  // ---------- welcome screen + demo reel (before anyone picks a game) ----------
  var inIntro = false, demoOrder = [], demoPos = 0, demoTimer = null;
  $("intro-title").textContent = items.length + " STUDENT GAMES";

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function demoIdx() { return demoOrder[demoPos]; }
  function showDemo() {
    clearTimeout(demoTimer);
    var it = items[demoIdx()], href = GAMES_PATH + it.game.folder + "/";
    captionEl.textContent = it.game.student.toUpperCase() + " · " + titleCase(it.section.title);
    captionEl.appendChild(el("span", { class: "cap-hint" }, " — click to choose"));
    monitor.href = href;
    monitor.setAttribute("aria-label", "Choose " + it.game.student + "'s " + titleCase(it.section.title) + " game, now showing");
    showMedia(it.game, false);
    // Move on when the clip ends; the timer covers missing clips. Reduced motion keeps one still.
    if (!reduceMotion.matches) demoTimer = setTimeout(nextDemo, 6000);
  }
  function nextDemo() {
    if (!inIntro) return;
    demoPos = (demoPos + 1) % demoOrder.length;
    showDemo();
  }
  video.addEventListener("ended", nextDemo);

  function enterIntro() {
    if (selected >= 0) {
      var old = items[selected].tile;
      old.classList.remove("is-selected"); old.setAttribute("aria-pressed", "false"); old.tabIndex = -1;
    }
    selected = -1;
    items[0].tile.tabIndex = 0;
    inIntro = true;
    stage.classList.add("is-intro");
    stage.setAttribute("aria-label", "Welcome");
    demoOrder = shuffle(items.map(function (_, i) { return i; }));
    demoPos = 0;
    showDemo();
  }
  function leaveIntro() {
    inIntro = false;
    clearTimeout(demoTimer);
    items[0].tile.tabIndex = -1;
    stage.classList.remove("is-intro");
    stage.setAttribute("aria-label", "Selected game");
  }

  introStart.addEventListener("click", function (e) {
    e.preventDefault();
    items[0].tile.focus({ preventScroll: true });
    roster.scrollIntoView({ block: narrow.matches ? "start" : "nearest", behavior: reduceMotion.matches ? "auto" : "smooth" });
  });
  homeLink.addEventListener("click", function (e) {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    enterIntro();
    window.scrollTo({ top: 0, behavior: reduceMotion.matches ? "auto" : "smooth" });
  });

  // Plain clicks on the monitor / Start open the player (on the welcome screen the monitor
  // picks the game that's showing); Ctrl/Cmd/middle-click still open a new tab.
  [monitor, startEl].forEach(function (a) {
    a.addEventListener("click", function (e) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      if (inIntro) select(demoIdx(), { focus: true });
      else launch();
    });
  });

  // ---------- keyboard: arrows choose, Enter starts ----------
  function move(key) {
    var it = items[selected];
    if (key === "ArrowLeft" || key === "ArrowRight") {
      return (selected + (key === "ArrowRight" ? 1 : -1) + items.length) % items.length;
    }
    var r = it.row + (key === "ArrowDown" ? 1 : -1);
    if (r < 0 || r >= rows.length) return selected;
    return rows[r][Math.min(it.col, rows[r].length - 1)];
  }

  document.addEventListener("keydown", function (e) {
    if (document.documentElement.classList.contains("player-open")) return;
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    var a = document.activeElement;
    var free = !a || a === document.body || roster.contains(a) || stage.contains(a);
    if (!free) return;
    if (/^Arrow(Left|Right|Up|Down)$/.test(e.key)) {
      e.preventDefault();
      select(inIntro ? 0 : move(e.key), { focus: true });
    } else if (e.key === "Enter" && (a === document.body || !a)) {
      e.preventDefault();
      if (inIntro) select(demoIdx(), { focus: true }); else launch();
    }
  });

  // ---------- start-up ----------
  window.RaptorGallery = {
    openByFolder: function (folder, opts) {
      for (var i = 0; i < items.length; i++) {
        if (items[i].game.folder === folder) { select(i); launch(opts); return; }
      }
    },
  };

  stage.hidden = false;
  var startFolder = window.RaptorPlayer && window.RaptorPlayer.hashFolder();
  if (startFolder) window.RaptorGallery.openByFolder(startFolder, { fromHistory: true });
  if (selected < 0) enterIntro();
})();
