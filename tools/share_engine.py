#!/usr/bin/env python3
"""Move duplicate Godot web engines into a shared engine/<version>/ folder.

Usage (from the site folder):
    python tools/share_engine.py .                  # preview only, changes nothing
    python tools/share_engine.py . --apply          # share engine, keep old copies
    python tools/share_engine.py . --apply --delete # ...and delete the old copies

Run it after copying a new Godot web export into game-prog-2526/.
Games already using the shared engine are left alone.
"""
import hashlib, json, os, re, shutil, sys

ENGINE_SUFFIXES = [".wasm", ".js", ".audio.worklet.js", ".audio.position.worklet.js"]
ENGINE_NAMES = {".wasm": "godot.wasm", ".js": "godot.js",
                ".audio.worklet.js": "godot.audio.worklet.js",
                ".audio.position.worklet.js": "godot.audio.position.worklet.js"}


def md5(p):
    h = hashlib.md5()
    with open(p, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def engine_version(wasm_path, js_path):
    data = open(wasm_path, "rb").read()
    m = re.search(rb"Godot Engine v(\d+\.\d+(?:\.\d+)?)\.(stable|rc\d*|beta\d*|dev\d*)", data)
    if not m:
        raise SystemExit(f"Could not read Godot version from {wasm_path}")
    ver = m.group(1).decode() + ("" if m.group(2) == b"stable" else "-" + m.group(2).decode())
    js = open(js_path, encoding="utf-8").read()
    kind = "debug" if "template_debug" in js else "release"
    return f"{ver}-{kind}"


def main():
    root = sys.argv[1]
    apply = "--apply" in sys.argv
    games_dir = os.path.join(root, "game-prog-2526")
    engine_root = os.path.join(root, "engine")
    engines = {}   # wasm md5 -> (version, {suffix: md5})
    unused = []
    for game in sorted(os.listdir(games_dir)):
        gdir = os.path.join(games_dir, game)
        html_path = os.path.join(gdir, "index.html")
        if not os.path.isfile(html_path):
            continue
        html = open(html_path, encoding="utf-8").read()
        m = re.search(r"const GODOT_CONFIG = (\{.*?\});\r?\n", html)
        if not m:
            print(f"SKIP {game}: no GODOT_CONFIG"); continue
        cfg = json.loads(m.group(1))
        exe = cfg["executable"]
        if exe.startswith("../"):
            print(f"OK   {game}: already shared ({exe})"); continue
        files = {s: os.path.join(gdir, exe + s) for s in ENGINE_SUFFIXES}
        missing = [p for p in files.values() if not os.path.isfile(p)]
        if missing:
            print(f"SKIP {game}: missing {missing}"); continue
        sums = {s: md5(p) for s, p in files.items()}
        key = sums[".wasm"]
        if key not in engines:
            ver = engine_version(files[".wasm"], files[".js"])
            engines[key] = (ver, sums)
            edir = os.path.join(engine_root, ver)
            if apply:
                os.makedirs(edir, exist_ok=True)
                for s, p in files.items():
                    dst = os.path.join(edir, ENGINE_NAMES[s])
                    if not os.path.exists(dst):
                        shutil.copyfile(p, dst)
                    if md5(dst) != sums[s]:
                        raise SystemExit(f"Engine file mismatch: {dst}")
            print(f"ENGINE {ver} <- {game}")
        ver, esums = engines[key]
        if esums != sums:
            print(f"SKIP {game}: same wasm but different JS/worklets than engine {ver}"); continue

        new_exe = f"../../engine/{ver}/godot"
        cfg["executable"] = new_exe
        cfg["mainPack"] = exe + ".pck"
        sizes = cfg.get("fileSizes", {})
        if exe + ".wasm" in sizes:
            sizes[new_exe + ".wasm"] = sizes.pop(exe + ".wasm")
        cfg["fileSizes"] = sizes
        new_html = html.replace(m.group(1), json.dumps(cfg, separators=(",", ":")), 1)
        old_tag = f'<script src="{exe}.js"></script>'
        if old_tag not in new_html:
            print(f"SKIP {game}: script tag not found"); continue
        new_html = new_html.replace(old_tag, f'<script src="{new_exe}.js"></script>', 1)
        if apply:
            with open(html_path, "w", encoding="utf-8", newline="") as f:
                f.write(new_html)
        print(f"{'DONE' if apply else 'PLAN'} {game}: {exe} -> engine/{ver}")
        unused += list(files.values())
    if not unused:
        print("\nNothing to clean up.")
        return
    delete = apply and "--delete" in sys.argv
    print("\nDeleted old per-game engine files:" if delete else "\nNow-unused per-game engine files:")
    for p in unused:
        print("  " + os.path.relpath(p, root))
        if delete:
            os.remove(p)


if __name__ == "__main__":
    main()
