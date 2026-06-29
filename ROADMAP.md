# RIFT PROTOCOL — Roadmap

**North star: single-player depth.** A roguelike-flavored **Escalations** ladder plus **progression / unlocks** is the primary growth vector. Online multiplayer is supported and maintained, but single-player depth is what we build toward — it's the tie-breaker when a feature could serve either.

Phases are ordered. Decisions inside Phase B/C are intentionally left open (to be designed before building).

---

## ✅ Already built
- Full 2v2 engine: 6 operatives, 120 cards, speed-tier resolution, interrupt-on-kill, blocks/pierce/burn/splash/ripostes.
- Flat, data-driven balance (~2–3 pt spread across all six classes).
- **Deploy** vs AI with four difficulty tiers (Recruit / Clasher / Captain / Warden).
- **Escalations** single-player ladder (6 runs, Easy/Medium/Hard, fixed zones, mirror-cell finals).
- **Online 1v1 multiplayer**: rooms by code, lobby (team/zone/timer/chat/ready), host-authoritative match sync, server-authoritative turn timer, opt-in session logging.
- Synthesized audio (RiftAudio), full UI, lore content, graceful art fallback.
- 12/12 spec assertions + 20/20 regression tests green.

---

## Now — Deploy & Validate
Get online play live and proven with real players.
- Deploy `server.js` (Railway), point `RIFT_SERVER_URL` at the **https** server URL.
- Two real browsers / devices: full join → lobby → match → chat → disconnect QA.
- Capture anything that breaks → that becomes the Phase A work.

**Known things to watch:** joiner in-match render under real network, turn-timer behavior, lobby sync timing, host backgrounding the tab.

## Phase A — Multiplayer Validation Fix
Fix whatever real-browser QA surfaces. Likely candidates: reconnect after a blip, visibility/refocus resync, auto-advance if the host goes idle. (Server-authoritative timer + raised socket ping tolerance already mitigate background-tab stalls.)

## Phase B — Progression & Unlocks  *(highest single-player impact)*
- Start with **3 operatives available** (Breachblade / Beacon / Longshot — striker / healer / control); gate the other three behind Escalation clears (proposal: each locked operative is unlocked by clearing its home Escalation).
- **Binary unlock gates, no currency** (clean, readable economy).
- Roster-screen lock/unlock UI; expand the `rift_player` save into a small versioned schema.
- Multiplayer stays **fully unlocked** for now; the gates may later apply to MP too as a funnel that pulls players into single-player. Built behind a single flag so that's a one-line change.

## Phase C — Escalation Depth
Where single-player gets its legs (built as opt-in layers so the core rules/tests stay intact):
- **Modifiers** — per-Escalation twist rules (faster energy ramp, an operative starts at half HP, boosted final, etc.). Highest variety-per-effort.
- **Daily seed** — same modifier set for everyone that day (optional leaderboard; the only item here needing server persistence).
- **New Warp Zones** and **boss rules on finals** (e.g., regen per round, starts with a full hand) to make Hard finals genuinely threatening.

## Phase D — Art & Polish *(runs in parallel; never blocking)*
Fill remaining art slots, richer resolution VFX, more audio variety.

## Phase E — 7th Operative *(when ready)*
A contained job: design the mechanic, write the cards, balance vs the existing six via the headless sim, add lore + art. A natural **prestige unlock** for clearing all six Hard Escalations.

---

| Phase | What it is | Blocking? |
|---|---|---|
| Deploy & Validate | Get online play live, QA it | Yes — everything else |
| A — MP Fix | Fix what QA surfaces | MP usability |
| B — Progression | Unlock gates + save system | No, but highest SP impact |
| C — Escalation Depth | Modifiers, daily seed, boss rules | No |
| D — Art & Polish | Fill placeholders, VFX, audio | No |
| E — 7th Operative | New class, cards, balance | No |
