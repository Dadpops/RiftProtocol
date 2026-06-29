# RIFT PROTOCOL — session handoff

_A running brief so a fresh session (or a new person) can get up to speed fast. Updated after the **RIFT PROTOCOL** rename, **AI difficulty**, and **Phase-2 lore overhaul** (full lore content + Warp Zone map selection). In-game title is "RIFT PROTOCOL"; the main file was renamed `genre_fighters.html` → `rift_protocol.html` (and the source docs to `Rift_Protocol_*`). Single-player **Escalations** mode and **online multiplayer** are now in (see below)._

## What this is
A **single-file, browser-based 2v2 turn-based card battler**. Six classes, 120 cards, ~3-minute matches, no backend or build step. Built from `Rift_Protocol_Build_Spec.docx` + `Rift_Protocol_Card_Reference.docx`.

## How to run
- **Play:** serve the folder and open `/rift_protocol.html` (art only loads over HTTP, **not** `file://`):
  ```
  python -m http.server 8124 --directory .
  ```
  (The Claude preview server on :8123 doesn't survive between sessions.)
- **Online multiplayer:** `npm install express socket.io` then `node server.js` (serves the game + sockets on :3000). Set `RIFT_SERVER_URL` at the top of the gf-ui script to the server URL (localhost for dev, the Railway URL to deploy).
- **Tests (Node 18):**
  ```
  node test/run_tests.mjs     # 12 spec assertions + headless sims
  node test/regression.mjs    # 20 regression tests
  ```

## Files
| File | What |
|------|------|
| `rift_protocol.html` | The whole game. `<script id="gf-core">` = DOM-free engine (cards, rules, AIs, 12 assertions, sim; exports `GF`). `<script id="gf-ui">` = all DOM/animation, guarded on `document`. |
| `test/run_tests.mjs` | Extracts gf-core, runs the 12 assertions + headless sims. Uses synthetic `atk()` card fixtures (decoupled from the deck). |
| `test/regression.mjs` | 20 regressions (special handlers, audit fixes, energy/interrupt/burn/splash/HP, **deck-integrity: every class = 20 cards**). Uses synthetic `A()` fixtures. |
| `Rift_Protocol_Card_Reference.xlsx` | **Source of truth** — Rules + All-Cards + 6 per-class sheets, regenerated from live card data (no build script in repo; use a node-dump → openpyxl scratch script). |
| `artassets/` | Subfolders (NOT flat): `characterportraits/gf_<class>_portrait_v1.jpg` (6), `cardbacks/gf_card_back_<class>.png` (6), `skillportraits/gf_card_<type>.png` (attack/defend/buff/spell/potion/signature/**equip**), `Backgrounds/` (shrine, cyberpunk, wasteland, **western.png**, `gf_menu_bg.png`), `animations/gf_menu_intro.mp4`. Missing files degrade to colored placeholders. |
| `server.js` / `package.json` | **Online multiplayer** relay/lobby server (Node + Express + Socket.io). `npm install express socket.io` then `node server.js` (PORT defaults 3000). Railway deploy notes in the file header. Pure relay — never runs the engine. |
| `README.md` / `index.html` / `.claude/launch.json` | Player+arch docs / dev redirect / preview config. |

## Rules as currently built
- **Teams:** 2 fighters, two **different** classes. **Per-class HP (after parity pass):** Warden·Cleric·Drifter **17** · Breachblade(key `Soldier`)·Scout·Arcanist **15**. (Engine math tests use `makeFighter` default 20 → HP-agnostic.)
- **Energy ramps by round:** 3/4/6/8/10. Costs T1=1, T2=2, T3=3, T4=5.
- **Carry-over hand: cap 4/fighter (8 with both alive), 10 for a lone survivor** (`HAND_CAP_PAIR=4`/`HAND_CAP_SOLO=10`); discard 1/turn.
- **5 rounds.** Win by wiping both; else tiebreak **kills → total HP → draw**.
- **Owner-performs**; resolution in strict tiers T1→T4, simultaneous within a tier, **interrupt-on-kill**. Blocks = depletable pools capped at **17 absorb**; pierce skips pools; ripostes counter same-tier.
- **Breachblade "Junction"** (the Soldier rework): play a Junction (T1) to set the gunblade's element for the whole turn — modifies *every* hit (incl. multi-hit + Renzokuken). **Fire** = +1 **once per card** + burn 2; **Thunder** = pierce; **Blizzard** = slow (−1/hit, cap 2). Engine: `turn.junction` set in `computeAttack`, applied in `queueDamage`; the +1 is armed once per card via `turn._jxArmed`.
- Conditional handlers (`concussive`/`siege`/`high_noon`/`fan_hammer`/`fire_burn`/`firaga`/`solid_barrel`) read `amount` from card data.

## Status
- **12/12 assertions, 20/20 regressions, 0 sim errors.**
- **Class parity achieved:** two independent 5–6k heuristic sims show a **~2.1–2.5 pt spread, all 95% CIs overlap, ordering reshuffles run-to-run** → no clear ranking. (Win rates average ~48.5% by symmetry; everyone clusters there.) Was 7.9 (3 tiers) before this pass.
- **Cards:** every dead/unclear card fixed — **Recon** (no-op → discard 1, tutor a card from deck next turn), **Ante Up** (discard now real + draw 2), **Sleep** (text now matches its −2 team-energy mechanic). All special handlers map to a card; no orphans.
- **UI (built across 5 passes):** no-scroll battle frame; round counter top, **quit-to-menu** (confirm) top-left; **energy + Lock/Undo** right column; **decks on the right rail** (click to open an in-arena **deck viewer** with hover full-card preview); clicked cards **stage in the arena middle** in cast (tier) order; tier-by-tier resolution animation; **color-coded valid-target highlight** (enemies red / allies green); class type-symbol SVGs + per-type card art + per-class card backs; collapsible per-feature tutorial; restructured main menu — **RIFT PROTOCOL** title + mission-briefing tagline + nav **Deploy / Rift Cards / Lore / How to Play** (the deck-browser screen is "Rift Cards"); **Deploy** submenu = 4 clearance tiers (Recruit/Clasher/Captain/Warden) (Hotseat removed); **Lore** tab with full content (The RIFT charter / Operatives dossiers, each with a **portrait** / 6 Warp Zones with bg-image banners); **Warp Zone map picker** on class-select (Random default) drives the fight background; Rift Cards screen shows **Clearance** + **World of Origin**; tutorial (standalone + in-match accordion) is **reframed in the RIFT lore** with sections for Enemy clearance + Warp Zones; **fight cinematic** plays at match start (2s cap, fades into battle); "Created by Dadpops" link. Graceful art fallback everywhere.

## AI difficulty (done — themed as operative clearances)
- **Recruit** = `aiRandom` · **Clasher** = `aiHeuristic` (unchanged medium) · **Captain** = `aiCaptain` (HP-threshold triage, focus-fire/finishers, hand-size pressure, junction-before-flurry synergy — pure rule priority, no lookahead) · **Warden** = `aiWarden` (Captain's scorer + full card-pool class knowledge via `state.cardMemory`, **energy-aware** threat model: guards only the fighter the enemy's *affordable* burst can drop this round, presses offense otherwise). (Hotseat removed — multiplayer via private rooms planned instead; dormant `mode==='hotseat'` branches left in place, harmless.)
- `cardMemory` is tallied in `resolveTurn` (pure side-effect, never read by the engine → harmless to tests). Dispatch helper `aiForMode(mode)`; sim + UI both route through it; all four AIs exported on `GF`.
- **Sim-verified ladder** (4k matches each): Captain>Clasher 53.9%, **Warden>Captain 50.9%**, Warden>Clasher 54.5% (> Captain's), vs Recruit ~66–67% → monotone **Recruit < Clasher < Captain ≤ Warden**, 0 errors.

## In progress / paused
- **Escalations mode — DONE this session** (the old "Towers" idea, shipped under the name **Escalations**; UI never says "Towers"). Six Escalations, all unlocked: Easy ×2 (3 battles) / Medium ×2 (4) / Hard ×2 (5), each in a fixed home Warp Zone, ending in a guaranteed mirror team of the home operative; AI tier drawn per battle from the tier's pool (top tier on the final). Single-player only, HP resets each battle, serializable `escRun` state, localStorage save stub (`rift_player`) writing `escalationClears`. All gf-ui; engine untouched; 12/12 + 20/20 green; browser-verified incl. a full Easy clear. See the **Escalations mode** entry in the [gf-handoff](../../.claude/projects/C--Users-chris-Desktop-GenreFighters/memory/gf-handoff.md) memory for the full design + integration notes.
- **Online multiplayer — DONE this session.** 1v1 over Socket.io via a new `server.js` (relay/lobby; rooms by 4-char code; host-authoritative match sync — host runs the engine and broadcasts state snapshots, joiner renders + sends pick intentions, never resolves locally). Client is all additive gf-ui under a closure-scoped `MP` object that's a no-op when offline; entry via Deploy → **Multiplayer** (username modal → Create/Join → lobby with team/zone/timer pickers, ready, chat → match with turn timer + opponent name + in-match chat + disconnect handling). Config constant `RIFT_SERVER_URL` at the top of gf-ui (set to the Railway URL to deploy). See the **Online multiplayer** entry in the [gf-handoff](../../.claude/projects/C--Users-chris-Desktop-GenreFighters/memory/gf-handoff.md) memory for the full design/verification.
- **Next likely frontier:** flesh out the save system (the `rift_player` stub is intentionally minimal — extend for unlocks/identity), Escalation rewards/unlock gating, and multiplayer hardening (reconnect, the joiner in-match render couldn't be exercised live in the preview due to websocket throttling — verify it in a real foreground browser).
- **Lore content is complete (Phase 2 done)** — The RIFT charter, six operative dossiers, and six Warp Zone reports are all written.

## Decisions locked in
- **In-game title is "RIFT PROTOCOL"** (superseded the earlier "RIFT Duos"); org is the **RIFT** = *Rapid Interdimensional Field Team*. Main file is `rift_protocol.html` (renamed from the original `genre_fighters.html`); engine class keys remain unchanged. Operative profile fields live on `CLASSES`: `clearance`, `world` (origin name), `worldDesc`, `backstory` (the old `origin` field was removed). Warp Zone bg/report text lives in `WARP_ZONES` (gf-ui); fight background = selected map (`UI.map`/`UI.mapBg`, Random default) with graceful fallback to the class-theme list.
- **No real-world IP in user-visible strings.** Class display codenames: Soldier→**Breachblade**, Arcanist→**Tempest**, Scout→**Wraith**, Drifter→**Longshot**, Cleric→**Beacon**, Warden→**Aegis** (all via `display`; `dn()` renders them). Renaming the Warden class to "Aegis" also clears the name clash with the **Warden** difficulty tier. IP move names renamed (only `name:`, `special:` keys stay) — Renzokuken→Blade Cascade, Gunblade Slash→Breach Slash, Fira→Scorch, Firaga→Cataclysm, Ultima→Annihilation, Ether Flask→Mana Draught, Frost Shard/Frost Junction, Phase Out, Cold Shot, Sundown, Battle Surge, Anchor Down, Dig In.
- Characters→**Operatives**: dropped the IP "Influences" line; each operative now has `title` (role), `clearance` (rank flavor), `origin` (abstract World of Origin — no genre named). Background-theme keys (`cyberpunk`/`wasteland`/etc.) stay as internal asset filenames only (never shown).
- **Equal viability is the balance goal** — no class a clear winner or trap (~2–3pt spread). Naming pass changed **no card values** → balance preserved (5k mirror spread 2.7 pts).
- Soldier reworked into Breachblade (Junction gunblade); Fire junction = **+1 once per card** + burn; Breach Slash (was Gunblade Slash) = 5; Blade Cascade (was Renzokuken) = 3×3 flurry.
- Hand cap **4/10**; energy ramp, 5 rounds, kill-first tiebreak, no mirror teams, stackable buffs — all unchanged.
- Excel is the source of truth; **regenerated** IP-free (Rules title "RIFT PROTOCOL"; class table columns Codename/HP/Title/Clearance/World of Origin/Backstory/Budget/Blurb; per-class sheets renamed to codenames). Regenerate after card edits via node-dump → openpyxl.

## Gotchas
- **Single-file**; keep gf-core **DOM-free** so Node tests run.
- Keep **12 assertions + 20 regressions** green — *update, don't delete* when rules change. Tests now use **synthetic card fixtures** (`atk()`/`A()`) so card redesigns don't break them — prefer that pattern.
- **Test-pinned card values** (don't change without updating the test): Brace (block 10), Piercing Round (5 pierce), Counter-Sniper, Double Tap, Taunt, Suppress, Sacrifice, Divine Intervention, Both Barrels, High Noon. Gunblade Slash is cost-pinned only (value free).
- **Regenerate the xlsx** after card edits. **Graceful image fallback** must stay (`artassets/` may be incomplete). Art needs HTTP, not `file://`.
- The browser **screenshot tool flaked** intermittently this session — DOM/eval verification is the reliable fallback.
