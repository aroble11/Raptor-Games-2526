/*
 * RAPTOR GAME LIST
 * ================
 * This is the only file you need to edit to add a game.
 *
 * To add a student, copy one line inside "games" and change it:
 *   { student: "Name", folder: "name_game_1", section: "dodge-the-creeps", screenshot: "name_screenshot.png" },
 *
 *   student    – first name shown on the tile
 *   folder     – the game's folder inside game-prog-2526/
 *   section    – must match an "id" in "sections" below
 *   screenshot – image file in the site's main folder (used if there's no preview art)
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
    { student: "Leo",     folder: "leo_game_2",     section: "zombie-survivor",  screenshot: "leo2_screenshot.png" },
    { student: "Mariano", folder: "mariano_game_2", section: "zombie-survivor",  screenshot: "mariano2_screenshot.png" },
    { student: "Aliyah",  folder: "aliyah_game_2",  section: "zombie-survivor",  screenshot: "aliyah2_screenshot.png" },
    { student: "David",   folder: "david_game_2",   section: "zombie-survivor",  screenshot: "david_screenshot.png" },

    // ---- Dodge the Creeps ----
    { student: "Gael",    folder: "gael_game_1",    section: "dodge-the-creeps", screenshot: "g_screenshot.png" },
    { student: "Mariano", folder: "mariano_game_1", section: "dodge-the-creeps", screenshot: "m_screenshot.png" },
    { student: "David",   folder: "david_game_1",   section: "dodge-the-creeps", screenshot: "h_screenshot.png" },
    { student: "Aliyah",  folder: "aliyah_game_1",  section: "dodge-the-creeps", screenshot: "a_screenshot.png" },
    { student: "Leo",     folder: "leo_game_1",     section: "dodge-the-creeps", screenshot: "l_screenshot.png" },
    { student: "Said",    folder: "said_game_1",    section: "dodge-the-creeps", screenshot: "s_screenshot.png" },
    { student: "Luisa",   folder: "luisa_game_1",   section: "dodge-the-creeps", screenshot: "luisa_screenshot.png" },
    { student: "Edgar",   folder: "edgar_game_1",   section: "dodge-the-creeps", screenshot: "edgar_screenshot.png" },
    { student: "Gerardo", folder: "gerardo_game_1", section: "dodge-the-creeps", screenshot: "gerardo_screenshot.png" },
    { student: "Ian",     folder: "ian_game_1",     section: "dodge-the-creeps", screenshot: "ian_screenshot.png" },
    { student: "Cisco",   folder: "cisco_game_1",   section: "dodge-the-creeps", screenshot: "cisco_screenshot.png" },
  ],
};
