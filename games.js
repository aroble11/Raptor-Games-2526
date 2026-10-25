/*
 * RAPTOR GAME LIST
 * ================
 * This is the only file you need to edit to add a game.
 *
 * To add a student, copy one line inside "games" and change it:
 *   { student: "Name", folder: "name_game_1", section: "dodge-the-creeps", screenshot: "screenshots/name_game_1.png" },
 *
 *   student    – first name shown on the tile
 *   folder     – the game's folder inside game-prog-2526/
 *   section    – must match an "id" in "sections" below
 *   screenshot – image in screenshots/, named after the folder (used if there's no preview art)
 *
 * Tiles appear in the same order as the lines below.
 *
 * NEW GODOT EXPORT? After copying the game's folder into game-prog-2526/,
 * run this once from the site folder so it uses the shared engine:
 *     python tools/share_engine.py . --apply --delete
 *
 * PREVIEW ART (optional) — put these in previews/, named after the folder:
 *     previews/<folder>.webm         short gameplay clip for the big monitor
 *     previews/<folder>-poster.webp  still frame shown before/instead of the clip
 *     previews/<folder>-tile.webp    square picture for the roster tile
 * Anything missing falls back to the screenshot.
 *
 * SECTIONS: "keys" picks the key icons shown — "wasd" or "arrows".
 */
window.RAPTOR_GALLERY = {
  sections: [
    {
      id: "zombie-survivor",
      title: "ZOMBIE SURVIVOR",
      blurb: "Move, and outlast the horde.",
      controls: "Use WASD keys to move",
      keys: "wasd",
    },
    {
      id: "dodge-the-creeps",
      title: "DODGE THE CREEPS",
      blurb: "Move, and avoid the creeps for as long as you can.",
      controls: "Use arrow keys to move",
      keys: "arrows",
    },
  ],

  games: [
    // ---- Zombie Survivor ----
    { student: "Leo",     folder: "leo_game_2",     section: "zombie-survivor",  screenshot: "screenshots/leo_game_2.png" },
    { student: "Mariano", folder: "mariano_game_2", section: "zombie-survivor",  screenshot: "screenshots/mariano_game_2.png" },
    { student: "Aliyah",  folder: "aliyah_game_2",  section: "zombie-survivor",  screenshot: "screenshots/aliyah_game_2.png" },
    { student: "David",   folder: "david_game_2",   section: "zombie-survivor",  screenshot: "screenshots/david_game_2.png" },

    // ---- Dodge the Creeps ----
    { student: "Gael",    folder: "gael_game_1",    section: "dodge-the-creeps", screenshot: "screenshots/gael_game_1.png" },
    { student: "Mariano", folder: "mariano_game_1", section: "dodge-the-creeps", screenshot: "screenshots/mariano_game_1.png" },
    { student: "David",   folder: "david_game_1",   section: "dodge-the-creeps", screenshot: "screenshots/david_game_1.png" },
    { student: "Aliyah",  folder: "aliyah_game_1",  section: "dodge-the-creeps", screenshot: "screenshots/aliyah_game_1.png" },
    { student: "Leo",     folder: "leo_game_1",     section: "dodge-the-creeps", screenshot: "screenshots/leo_game_1.png" },
    { student: "Said",    folder: "said_game_1",    section: "dodge-the-creeps", screenshot: "screenshots/said_game_1.png" },
    { student: "Luisa",   folder: "luisa_game_1",   section: "dodge-the-creeps", screenshot: "screenshots/luisa_game_1.png" },
    { student: "Edgar",   folder: "edgar_game_1",   section: "dodge-the-creeps", screenshot: "screenshots/edgar_game_1.png" },
    { student: "Gerardo", folder: "gerardo_game_1", section: "dodge-the-creeps", screenshot: "screenshots/gerardo_game_1.png" },
    { student: "Ian",     folder: "ian_game_1",     section: "dodge-the-creeps", screenshot: "screenshots/ian_game_1.png" },
    { student: "Cisco",   folder: "cisco_game_1",   section: "dodge-the-creeps", screenshot: "screenshots/cisco_game_1.png" },
  ],
};
