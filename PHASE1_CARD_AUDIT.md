# Phase 1 — Card Language Audit (RIFT PROTOCOL)

**Status: READ-ONLY audit, presented at the stop-gate. No cards have been changed.**
Source of truth: the live `GF.CARDS` extracted from `rift_protocol.html` (not the xlsx). 120 cards, 112 unique (8 are duplicate copies). Every rewrite below is verified against the actual `gf-core` engine handlers, not the old card prose.

> **Post-implementation update:** the icon *symbols* (Deliverable 3) were **dropped** after implementation per user feedback — the inline glyphs clashed with the existing type icons on the card footer and worked against the "condense + uniform size" goal. The condensed **wording** and the 12 **keywords** were kept; the `[DMG 5]`-style tokens in the mapping table below ship as **plain numbers** (`Deal 5 to one enemy.`). Cards were also standardized to a uniform height (catalog 200px, hand 192px). The "Card Language" help tab now lists keywords only.

---

## Deliverable 3 — Icon vocabulary (6 of 10 cap used)

Icons cover **quantities/resources only**. All 6 reuse SVG paths that already exist in `pillEffect()` (`rift_protocol.html:4582`) so the card language matches the mobile pill badges already shipping. One consistent outline style: 24×24 viewBox, `stroke=currentColor`, width 2–2.2, round caps, rendered ~13–15px.

| Token | Concept | Renders | SVG (reused path) | Color |
|---|---|---|---|---|
| `[DMG n]` | damage dealt / signed damage deltas | `5⚔` (numeral-first) | existing SWORD path (line 4584) | `--bad` red |
| `[BLK n]` | damage prevented (Block **and** Guard magnitude) | `10🛡` | existing SHIELD path (4585) | `--t1` teal |
| `[HEAL n]` | HP restored | `8✚` | existing PLUS path (4586) | `--good` green |
| `[NRG n]` | energy (cost badge + in-text energy) | `3●` | stroke version of `.ecirc` pip (line 25) | `--energy` |
| `[DRAW n]` | cards drawn/tutored | `2🂠` | two offset card rects (new) | neutral |
| `[DUR n]` | duration in turns beyond this one | `1⏳` | hourglass (new) | `--muted` |

Only 2 glyphs are genuinely new (DRAW, DUR); the other 4 are already drawn in the codebase. No mechanic ever gets an icon. **4 icon slots left unused** — headroom, not a gap.

---

## Deliverable 2 — Keyword vocabulary (12 locked)

The clustering pass found **16 candidate clusters**; the editor consolidated to **12 keywords** (cutting 4 as plain template English to keep the learning load low). Keywords are for **mechanics**; each has one-line auto-generated reminder text (the writer never hand-writes it).

| Keyword | Meaning (engine-true) | # cards | Reminder text |
|---|---|---|---|
| **Pierce** | attack skips depletable Block pools (not Guard) | 8 | "Ignores Block pools. Guard still reduces it." |
| **Block** | depletable shield pool, absorbs next N this turn (17/turn cap) | 15 | "Shield pool: absorbs the next N damage. Pierce goes through it." |
| **Guard** | flat per-hit reduction, never depletes, Pierce can't skip | 11 | "Every hit deals N less. Never runs out." |
| **Riposte** | attackers of this fighter take N back, same tier | 10 | "Enemies who attack this fighter take N back." |
| **Empower** | fighter's next single-target attack +N | 8 | "Next attack +N. Can't also take a second attack." |
| **Expose** | fighter takes +N from every hit | 6 | "Exposed fighters take +N from every attack." |
| **Weaken** | fighter's attacks deal N less | 3 | "Weakened attacks deal N less." |
| **Burn** | N damage at start of next turn, before heals | 2 | "Takes N at the start of its next turn." |
| **Junction** | Breachblade: set weapon element for the turn | 5 | "Every attack you make carries the element." |
| **Silence** | target can't play named card types next turn | 2 | "Next turn, can't play the listed types." |
| **Once** | usable once per match (carried by the card frame badge) | 13 | "Usable once per match." |
| **Flip** | coin flip, Heads is the better result | 3 | "Flip a coin — Heads is better." |

**Cut (written as plain template English, not keywords):** Counter → merged into **Riposte**; Flurry → "Deal [DMG 3]…, three times"; Retime → tier arrows ("resolves at T3"); Intercept → Taunt/Cover kept bespoke; Pitch → the trigger "Discard a card:". Naming avoids collisions with card names (Expose not "Mark" — two cards are named Mark/Marked Card; Riposte not "Counter" — cards named Counterstance/Counter-Sniper).

---

## Deliverable 4 — Sentence template

> **`[Trigger:] Verb+Magnitude Target[; rider].`** — one imperative sentence, Trigger → Effect → Magnitude.

- **Trigger** (optional, closed list): `Flip:` / `Discard a card:` / `Next turn:` / `Junction ELEMENT:` / `First time EVENT,`. No trigger = "when played, this turn."
- **Effect**: an imperative verb or effect-keyword with magnitude fused right after it (`Deal [DMG 5]`, `Heal [HEAL 8]`, `Empower 3`).
- **Target**: five core phrases — `one enemy` / `both enemies` / `a fighter` (yours) / `both fighters` (yours) / `this fighter` (caster) — plus two sanctioned specials: `the other enemy` (splash rider only, e.g. Cataclysm) and `enemy team` (side-wide resource effects only, e.g. Sleep's energy drain — distinct from "both enemies", which is per-fighter damage). Bare "enemy" = opponents, bare "fighter" = your side. No pronouns, no "target enemy."
- **Rider**: at most one, after a semicolon; trailing lone keyword joins with a comma (`, Pierce.`).
- **Word budget**: ≤11 whitespace tokens of unique text (an icon token = 1 word). Frame elements, badges, reminder text, glossary, hint, flavor all count **0**.
- **Duration**: this-turn is silent (never print "this turn"); "next turn" is spoken; the Equip frame speaks permanence.

Exemplars to match: `Deal [DMG 5] to one enemy, Pierce.` · `Block [BLK 5]; Riposte 4.` · `Guard [BLK 3] on a fighter.` · `Heal [HEAL 8] to a fighter.` · `Empower 3 on a fighter.` · `Flip: Empower 4 Heads, 2 Tails.` · `Junction Thunder: your attacks Pierce.`

---

## Deliverable 1 — Inventory & Deliverable 5 — Mapping table

Full per-card inventory (current text + word counts) and the current→proposed mapping for all 112 cards are in the two sections below. **Result:** average unique text drops from 10.6 → ~6 words; the 36 over-budget cards collapse to **3** (Double Tap 15, Sundown 13, Worn Duster 12), all flagged. 87 of 112 cards are clean; 25 carry a flag.

### Flag summary

| Flag | Count | Meaning |
|---|---|---|
| none | 90 | compresses cleanly, meaning preserved (incl. Sacrifice/Cataclysm/Sleep after their decisions) |
| meaning-risk | 18 | rewritten faithfully but a nuance moved to reminder text — review the wording |
| resists-compression | 3 | can't hit 11 words without losing meaning; ships at faithful minimum |
| needs-redesign | 0 | ~~4~~ all resolved — 3 kept with final text, Disrupt replaced by Flash Bang (own task) |

### ✅ The 4 design-decision cards — RESOLVED

1. **Wraith · Disrupt → REPLACED with Flash Bang (DONE + balance-verified).** The old text was a lie (T3 resolves *before* T4, so the engine sped the enemy up — a buff). Cut Disrupt, shipped **`Flash Bang`** (T1 Spell, aim enemy, `Weaken 3 on one enemy.`) — reuses the `suppress`/`turn.outgoing` handler (generalized to read `amount`), no new mechanic; keeps the class at 20 cards. **Balance (6,000 heuristic-mirror matches, A/B vs old Disrupt):** Wraith **47.1% → 48.7% (+1.6)**, moving from tied-lowest to mid-pack; every other class within −0.2…−0.5 (noise); band **46.6–50.2%, spread 3.6** — no class out of line, no further tuning needed.
2. **Beacon · Sacrifice → REWORD to engine behavior.** Per decision, the healthier fighter sacrifices to the weaker. New text: `Move up to [HEAL 6] from the healthier fighter to the weaker.` (11 words). Donor floors at 1 HP / no overheal → reminder text. No engine change.
3. **Tempest · Cataclysm → KEEP, sanction a splash target phrase.** Decision (mine): add **"the other enemy"** as a sanctioned splash-only rider target. New text: `Deal [DMG 9] to one enemy; [DMG 3] to the other enemy.` (10 words; rider inherits the verb). No engine change.
4. **Tempest · Sleep → KEEP, sanction an "enemy team" resource target.** Decision (mine): no bespoke "Lull" verb and no 13th keyword — write it as a plain next-turn energy debuff. New text: `Next turn: enemy team has [NRG 2] less energy.` (8 words). "enemy team" is sanctioned only for **side-wide resource** effects (distinct from "both enemies", which is per-fighter damage); the non-stacking + dies-with-the-slept-fighter nuance → reminder. No engine change.

*(The mapping-table rows below for these four cards are superseded by the final text here.)*

**Also worth knowing:** the audit found several cards whose current text disagrees with the engine and were rewritten to match the engine (flagged meaning-risk), including **Double Tap** (bonus fires on planned focus-fire, not just a prior hit), **Light Armor** (only boosts Evade, and it's reduction not a block), **Phase Out** (immunity starts at its own T2 resolution — T1 hits and burn still land), plus Frost Junction, Bluff, Reflect, and others.

---

## Deliverable 6 — Tooltip & legend plan

All hooks below were verified to exist in `gf-ui`. The plan adds **one data-driven glossary** (`{keyword → reminderText}` + `{icon → label}`, straight from the vocabulary table) and injects it into the preview surfaces that already exist — no new preview UI.

- **Reminder text is generated, never authored.** A single `KEYWORD_GLOSSARY` map drives every surface. Card rules text stays terse; the reminder is appended by the renderer.
- **Desktop hover** — extend `showHandPreview()` / `.hand-preview` (`rift_protocol.html:3973`, `previewCardHTML` at 3959) to render, under the rules line, the reminder text for each keyword/icon on the card. Same for the staged-chip `.card-preview` and the deck-viewer `dvPreviewHTML()` (4411).
- **Mobile long-press** — the pill press-hold (400 ms) in `cardPillHTML()` (4597) already opens the same preview popup; it inherits the reminders for free. Icons in `pillEffect()` (4582) get a `<title>`/aria-label from the glossary.
- **Menu legend, shown once to new profiles** — a "Card Language" panel added as a 5th tab in `openHelp()` (5420): the 6 icons with labels + the 12 keywords with reminders. Auto-opened once, gated on a localStorage flag alongside the existing `rift_onboarded` pattern (`TUT_KEY`, 5577). When Phase 2 adds the versioned profile + first-run flow, move this flag into that profile (e.g. `profile.seenCardLegend`) so it rides the export/import code; until then a standalone key is fine. Reachable any time from Help → Card Language and the mobile wizard.

---
## Deliverable 1 — Card inventory (live engine data, 112 unique cards / 120 total with copies)

### Breachblade (Soldier) — 18 unique, 20 cards

| Card | Type | Tier | Copies | Current rules text | Words |
|---|---|---|---|---|---|
| Adrenaline | Buff | T1 | 1 | Give a fighter's next attack this turn +3 damage. | 9 |
| Brace | Defend | T1 | 2 | Block the next 10 damage to a fighter this turn. | 10 |
| Combat Stim | Buff | T1 | 1 | Heal 4 to a fighter. | 5 |
| Combat Vest | Equip | T1 | 1 | Equip: this fighter takes 1 less from all attacks for the rest of the match. | **15** |
| Cover | Defend | T1 | 1 | Redirect all damage aimed at your ally onto this fighter this turn. | 12 |
| Field Medkit | Potion | T1 | 1 | Heal 8 to a fighter. Once per match. | 8 |
| Fire Junction | Spell | T1 | 1 | Junction FIRE this turn: each of your attacks deals +1 (once per card) and applies burn 2. | **17** |
| Frost Junction | Spell | T1 | 1 | Junction FROST this turn: each of your hits makes the target deal 1 less next turn (max 3). | **18** |
| Hold The Line | Spell | T1 | 1 | Both your fighters take 2 less from all attacks this turn. | 11 |
| Thunder Junction | Spell | T1 | 1 | Junction THUNDER this turn: your attacks ignore blocks (pierce). | 9 |
| Trigger | Attack | T1 | 2 | Deal 3 to one enemy. | 5 |
| Counterstance | Defend | T2 | 1 | Block the next 5 damage to this fighter, and deal 4 back to each attacker who hits it this turn. | **20** |
| Rough Divide | Attack | T2 | 1 | Deal 4 to one enemy. | 5 |
| Solid Barrel | Attack | T2 | 1 | Deal 3 to one enemy, twice (each hit carries your junction). | 11 |
| Suppressing Fire | Attack | T2 | 1 | Deal 3 to both enemies. | 5 |
| Breach Slash | Attack | T3 | 1 | Deal 5 to one enemy. | 5 |
| Piercing Round | Attack | T3 | 1 | Deal 5 to one enemy, ignoring blocks. | 7 |
| Blade Cascade | Signature | T4 | 1 | Flurry: deal 3 to one enemy three times (9). Each hit carries your junction. Once per match. | **17** |

### Tempest (Arcanist) — 18 unique, 20 cards

| Card | Type | Tier | Copies | Current rules text | Words |
|---|---|---|---|---|---|
| Blink | Defend | T1 | 1 | This fighter takes 4 less from all attacks this turn. | 10 |
| Focus | Buff | T1 | 1 | Give a fighter's next attack +3 damage this turn. That fighter can't also be given a second attack this turn. | **20** |
| Haste | Buff | T1 | 1 | A fighter's T4 attack resolves at T2 speed this turn. | 10 |
| Mana Draught | Potion | T1 | 1 | Heal 8 to a fighter. Once per match. | 8 |
| Mana Shield | Defend | T1 | 1 | Block the next 8 damage to this fighter this turn, then it breaks. | **13** |
| Silence | Spell | T1 | 1 | Target enemy can't play Spell or Signature cards next turn. | 10 |
| Sleep | Spell | T1 | 1 | Lull one enemy: the enemy team has 2 less energy next turn. | 12 |
| Stoneskin | Buff | T1 | 1 | A fighter takes 3 less from all attacks this turn. | 10 |
| Curse | Spell | T2 | 1 | Target enemy takes +3 from all attacks this turn. | 9 |
| Fire | Attack | T2 | 2 | Deal 3 to one enemy, then 2 more at the start of their next turn (burn). | **16** |
| Reflect | Defend | T2 | 1 | Block 4 damage to this fighter this turn, and deal 4 back to each attacker who hits it. | **18** |
| Thunder | Attack | T2 | 2 | Deal 4 to one enemy. | 5 |
| Drain | Spell | T3 | 1 | Deal 3 to one enemy and heal this fighter 3. | 10 |
| Frost Shard | Attack | T3 | 1 | Deal 4 to one enemy, ignoring all blocks. | 8 |
| Scorch | Attack | T3 | 1 | Deal 6 to one enemy. | 5 |
| Annihilation | Signature | T4 | 1 | Deal 8 to both enemies, ignoring all blocks. Once per match. | 11 |
| Cataclysm | Attack | T4 | 1 | Deal 9 to one enemy, and 3 to the other enemy. | 11 |
| Meteor Splash | Attack | T4 | 1 | Deal 5 to both enemies. | 5 |

### Wraith (Scout) — 19 unique, 20 cards

| Card | Type | Tier | Copies | Current rules text | Words |
|---|---|---|---|---|---|
| Adrenaline Rush | Buff | T1 | 1 | Give a fighter's next attack this turn +2 damage. | 9 |
| Disrupt | Spell | T1 | 1 | Target enemy's T4 attack resolves as T3 this turn, making it slower. | 12 |
| Evade | Defend | T1 | 1 | This fighter takes 4 less from all attacks this turn. | 10 |
| Light Armor | Equip | T1 | 1 | Equip: this fighter's Evade and dodge effects block 1 more for the rest of the match. | **16** |
| Med Injector | Potion | T1 | 1 | Heal 8 to one fighter. Once per match. | 8 |
| Recon | Spell | T1 | 1 | Discard a card. At the start of your next turn, pick any card from this deck into your hand. | **19** |
| Smoke Screen | Defend | T1 | 1 | Both your fighters take 3 less from all attacks this turn. | 11 |
| Steady Aim | Buff | T1 | 1 | Give a fighter's next attack this turn +1 damage. | 9 |
| Stim Patch | Buff | T1 | 1 | Heal 4 to one fighter. | 5 |
| Armor Piercer | Attack | T2 | 1 | Deal 4 to one enemy, ignoring all blocks. | 8 |
| Counter-Sniper | Defend | T2 | 1 | Block the next 3 damage to this fighter, and deal 4 to one attacker who hits it this turn. | **19** |
| Double Tap | Attack | T2 | 1 | Deal 3 to one enemy, then 1 more if they were already hit this turn. | **15** |
| Mark | Spell | T2 | 1 | Target enemy takes +2 from all attacks this turn. | 9 |
| Parry | Defend | T2 | 1 | Block the next 5 damage to this fighter, and deal 4 back to each attacker who hits it this turn. | **20** |
| Phase Out | Signature | T2 | 1 | This fighter takes no damage this turn and deals 4 to one enemy. Once per match. | **16** |
| Quick Shot | Attack | T2 | 2 | Deal 3 to one enemy. | 5 |
| Trip Mine | Spell | T2 | 1 | Deal 4 to the next enemy who attacks this fighter this turn. | 12 |
| Frag Out | Attack | T3 | 1 | Deal 3 to both enemies. | 5 |
| Headshot | Attack | T3 | 1 | Deal 6 to one enemy. | 5 |

### Longshot (Drifter) — 20 unique, 20 cards

| Card | Type | Tier | Copies | Current rules text | Words |
|---|---|---|---|---|---|
| Ante Up | Spell | T1 | 1 | Discard 1 card, then draw 2 extra cards from your deck next turn. | **13** |
| Bluff | Defend | T1 | 1 | This turn, the first enemy who attacks this fighter takes 3. If none attack, nothing happens. | **16** |
| Lucky Coin | Buff | T1 | 1 | Flip a coin: on heads, give a fighter's next attack +4 damage; on tails, +0. | **15** |
| Lucky Streak | Buff | T1 | 1 | Flip a coin: give a fighter's next attack +4 on heads, +2 on tails. | **14** |
| Sidestep | Defend | T1 | 1 | This fighter takes 5 less from all attacks this turn. | 10 |
| Snake Oil | Potion | T1 | 1 | Heal 8 to a fighter. Once per match. | 8 |
| Take Cover | Defend | T1 | 1 | Block the next 7 damage to this fighter this turn, then it breaks. | **13** |
| Whiskey | Buff | T1 | 1 | Heal 4 to a fighter, but they take +1 from all attacks next turn. | **14** |
| Worn Duster | Equip | T1 | 1 | Once per match, the first hit that would drop this fighter to 0 leaves them at 1; after that, they take +2 from all attacks for the rest of the match. | **31** |
| Gunslinger's Parry | Defend | T2 | 1 | Block the next 5 damage to this fighter this turn, and deal 4 back to each attacker who hits it. | **20** |
| Hip Fire | Attack | T2 | 1 | Deal 5 to one enemy. | 5 |
| Marked Card | Spell | T2 | 1 | Target enemy takes +3 from all attacks this turn. | 9 |
| Pistol Whip | Attack | T2 | 1 | Deal 5 to one enemy. | 5 |
| Quickdraw | Attack | T2 | 1 | Deal 4 to one enemy. | 5 |
| Fan The Hammer | Attack | T3 | 1 | Deal 4 to one enemy, then flip a coin: on heads, deal 3 more. | **14** |
| Ricochet | Attack | T3 | 1 | Deal 4 to one enemy, ignoring blocks. | 7 |
| Six Shooter | Attack | T3 | 1 | Deal 6 to one enemy. | 5 |
| Both Barrels | Attack | T4 | 1 | Deal 5 to both enemies. | 5 |
| Cold Shot | Attack | T4 | 1 | Deal 9 to one enemy. | 5 |
| Sundown | Signature | T4 | 1 | Deal 8 to one enemy, or 10 if your fighter is below half HP. Once per match. | **17** |

### Beacon (Cleric) — 19 unique, 20 cards

| Card | Type | Tier | Copies | Current rules text | Words |
|---|---|---|---|---|---|
| Bless | Buff | T1 | 1 | Give a fighter's next attack this turn +3 damage. | 9 |
| Cure | Defend | T1 | 1 | Heal 4 to a fighter. | 5 |
| Dispel | Spell | T1 | 1 | Remove all buffs and equips from one enemy. | 8 |
| Divine Intervention | Signature | T1 | 1 | Prevent up to 10 damage to each of your fighters this turn. Once per match. | **15** |
| Holy Water | Potion | T1 | 1 | Heal 6 to a fighter. Once per match. | 8 |
| Protect | Buff | T1 | 1 | This fighter takes 3 less from all attacks this turn. | 10 |
| Regen | Buff | T1 | 1 | A fighter heals 2 now and 2 at the start of your next turn. | **14** |
| Sacrifice | Spell | T1 | 1 | Move up to 6 HP from one of your fighters to the other. | **13** |
| Sanctuary | Buff | T1 | 1 | Both your fighters heal 1 and take 1 less from attacks this turn. | **13** |
| Shell | Defend | T1 | 1 | Block the next 9 damage to a fighter this turn. | 10 |
| Silence | Spell | T1 | 1 | One enemy cannot play Spell cards next turn. | 8 |
| Guardian | Defend | T2 | 1 | Block the next 5 damage to this fighter this turn, and deal 4 back to each attacker who hits it. | **20** |
| Holy Bolt | Attack | T2 | 2 | Deal 4 to one enemy. | 5 |
| Rebuke | Attack | T2 | 1 | Deal 3 to one enemy. | 5 |
| Condemn | Attack | T3 | 1 | Deal 3 to one enemy. | 5 |
| Sanctified Ground | Attack | T3 | 1 | Deal 3 to both enemies. | 5 |
| Searing Light | Attack | T3 | 1 | Deal 3 to one enemy, ignoring blocks. | 7 |
| Smite | Attack | T3 | 1 | Deal 5 to one enemy. | 5 |
| Wrath | Attack | T4 | 1 | Deal 7 to one enemy. | 5 |

### Aegis (Warden) — 18 unique, 20 cards

| Card | Type | Tier | Copies | Current rules text | Words |
|---|---|---|---|---|---|
| Battle Surge | Buff | T1 | 1 | Give a fighter's next attack +3 damage, but they take +1 from all attacks this turn. | **16** |
| Bulwark | Defend | T1 | 2 | Block the next 6 damage to this fighter this turn, and deal 3 back to each attacker who hits it. | **20** |
| Dig In | Defend | T1 | 1 | Block the next 6 damage to each of your fighters this turn. | 12 |
| Hold Position | Spell | T1 | 1 | Both your fighters take 2 less from all attacks this turn. | 11 |
| Medpack | Potion | T1 | 1 | Heal 8 to a fighter. Once per match. | 8 |
| Plated Armor | Equip | T1 | 1 | Equip: this fighter takes 2 less from all attacks for the rest of the match. | **15** |
| Reinforced Plating | Equip | T1 | 1 | Equip: the first time this fighter would break a block this match, it absorbs 2 more. | **16** |
| Repair Kit | Buff | T1 | 1 | Heal 5 to a fighter. | 5 |
| Taunt | Spell | T1 | 1 | All enemy attacks this turn must target this fighter. | 9 |
| Retaliate | Defend | T2 | 1 | Block 5 to this fighter this turn, and deal 4 back to each enemy who hits it. | **17** |
| Shield Bash | Attack | T2 | 1 | Deal 4 to one enemy. | 5 |
| Suppress | Spell | T2 | 1 | Target enemy deals 3 less this turn. | 7 |
| Breaching Round | Attack | T3 | 1 | Deal 4 to one enemy, ignoring all blocks. | 8 |
| Concussive Shell | Attack | T3 | 1 | Deal 4 to one enemy; that enemy deals 2 less next turn. | 12 |
| Covering Volley | Attack | T3 | 1 | Deal 2 to both enemies. | 5 |
| Rifle Burst | Attack | T3 | 2 | Deal 4 to one enemy. | 5 |
| Anchor Down | Signature | T4 | 1 | Deal 4 to one enemy; this fighter blocks the next 8 damage next turn. Once per match. | **17** |
| Heavy Slug | Attack | T4 | 1 | Deal 7 to one enemy. | 5 |

**Word-count summary:** avg 10.6 words; 36 of 112 cards exceed the 12-word target (bold above); worst: Worn Duster (31), Counterstance (20), Focus (20).


---

## Deliverable 5 — Full mapping table (current → proposed, all 112 cards)

### Breachblade (Soldier)

| Card | T | Current text | → Proposed | Icons/Keywords | Words | Flag |
|---|---|---|---|---|---|---|
| Fire Junction | 1 | Junction FIRE this turn: each of your attacks deals +1 (once per card) and applies burn 2. | Junction Fire: your attacks deal [DMG +1]; Burn 2. | [DMG] Junction Burn | 8 | ok |
| Thunder Junction | 1 | Junction THUNDER this turn: your attacks ignore blocks (pierce). | Junction Thunder: your attacks Pierce. | Junction Pierce | 5 | ok |
| Frost Junction | 1 | Junction FROST this turn: each of your hits makes the target deal 1 less next turn (max 3). | Junction Frost: every hit Weakens 1 next turn. | Junction Weaken | 8 |  **meaning-risk** |
| Trigger | 1 | Deal 3 to one enemy. | Deal [DMG 3] to one enemy. | [DMG] | 5 | ok |
| Rough Divide | 2 | Deal 4 to one enemy. | Deal [DMG 4] to one enemy. | [DMG] | 5 | ok |
| Solid Barrel | 2 | Deal 3 to one enemy, twice (each hit carries your junction). | Deal [DMG 3] to one enemy, twice. | [DMG] | 6 | ok |
| Breach Slash | 3 | Deal 5 to one enemy. | Deal [DMG 5] to one enemy. | [DMG] | 5 | ok |
| Piercing Round | 3 | Deal 5 to one enemy, ignoring blocks. | Deal [DMG 5] to one enemy, Pierce. | [DMG] Pierce | 6 | ok |
| Suppressing Fire | 2 | Deal 3 to both enemies. | Deal [DMG 3] to both enemies. | [DMG] | 5 | ok |
| Brace | 1 | Block the next 10 damage to a fighter this turn. | Block [BLK 10] on a fighter. | [BLK] Block | 5 | ok |
| Counterstance | 2 | Block the next 5 damage to this fighter, and deal 4 back to each attacker who hits it this turn. | Block [BLK 5]; Riposte 4. | [BLK] Block Riposte | 4 |  **meaning-risk** |
| Cover | 1 | Redirect all damage aimed at your ally onto this fighter this turn. | Redirect single-target attacks on your ally to this fighter. | — | 9 |  **meaning-risk** |
| Combat Vest | 1 | Equip: this fighter takes 1 less from all attacks for the rest of the match. | Guard [BLK 1] on this fighter. | [BLK] Guard | 5 | ok |
| Adrenaline | 1 | Give a fighter's next attack this turn +3 damage. | Empower 3 on a fighter. | Empower | 5 | ok |
| Combat Stim | 1 | Heal 4 to a fighter. | Heal [HEAL 4] to a fighter. | [HEAL] | 5 | ok |
| Hold The Line | 1 | Both your fighters take 2 less from all attacks this turn. | Guard [BLK 2] on both fighters. | [BLK] Guard | 5 | ok |
| Field Medkit | 1 | Heal 8 to a fighter. Once per match. | Heal [HEAL 8] to a fighter. | [HEAL] | 5 | ok |
| Blade Cascade | 4 | Flurry: deal 3 to one enemy three times (9). Each hit carries your junction. Once per match. | Deal [DMG 3] to one enemy, three times. | [DMG] | 7 | ok |

**Flag notes:**
- **Frost Junction** (meaning-risk): Old text's 'max 3' is engine-false (slowCap is 2); the true cap 2 now lives only in the Junction glossary entry, not on the card — per locked vocabulary — so the printed text no longer states any cap. Per-hit stacking is carried by 'every hit'. Flagged to design as one of the 20 mismatch cards.
- **Counterstance** (meaning-risk): Engine counters per attack PACKET (Solid Barrel attacker takes 8), fires even when the attack is fully blocked (attacker never 'hit'), and arms at T2 so T1 attacks are neither blocked nor countered. The locked Riposte reminder says 'enemies who attack take N back' — close but not packet-exact, and the T1 blind spot is stated nowhere. Text follows the sanctioned 'Block [BLK X]; Riposte N.' form; nuances flagged for the Riposte glossary entry.
- **Cover** (meaning-risk): Engine-true correction: only single-target attacks redirect — AoE, Cataclysm splash, Burn ticks, and Riposte counters still hit the ally, and enemy Taunt overrides Cover; protector death mid-turn ends it. 'single-target' carries the main fix but the exclusions need reminder text. Also uses 'your ally', outside the five locked target phrases — bespoke Redirect card, no locked phrase names the teammate. One of the 20 mismatch cards.

### Tempest (Arcanist)

| Card | T | Current text | → Proposed | Icons/Keywords | Words | Flag |
|---|---|---|---|---|---|---|
| Fire | 2 | Deal 3 to one enemy, then 2 more at the start of their next turn (burn). | Deal [DMG 3] to one enemy; Burn 2. | [DMG] Burn | 7 | ok |
| Scorch | 3 | Deal 6 to one enemy. | Deal [DMG 6] to one enemy. | [DMG] | 5 | ok |
| Cataclysm | 4 | Deal 9 to one enemy, and 3 to the other enemy. | Deal [DMG 9] to one enemy; Deal [DMG 3] to the other enemy. | [DMG] [DMG] | 11 |  **needs-redesign** |
| Thunder | 2 | Deal 4 to one enemy. | Deal [DMG 4] to one enemy. | [DMG] | 5 | ok |
| Frost Shard | 3 | Deal 4 to one enemy, ignoring all blocks. | Deal [DMG 4] to one enemy, Pierce. | [DMG] Pierce | 6 | ok |
| Meteor Splash | 4 | Deal 5 to both enemies. | Deal [DMG 5] to both enemies. | [DMG] | 5 | ok |
| Mana Shield | 1 | Block the next 8 damage to this fighter this turn, then it breaks. | Block [BLK 8]. | [BLK] Block | 2 | ok |
| Reflect | 2 | Block 4 damage to this fighter this turn, and deal 4 back to each attacker who hits it. | Block [BLK 4]; Riposte 4. | [BLK] Block Riposte | 4 |  **meaning-risk** |
| Blink | 1 | This fighter takes 4 less from all attacks this turn. | Guard [BLK 4] on this fighter. | [BLK] Guard | 6 | ok |
| Stoneskin | 1 | A fighter takes 3 less from all attacks this turn. | Guard [BLK 3] on a fighter. | [BLK] Guard | 6 | ok |
| Focus | 1 | Give a fighter's next attack +3 damage this turn. That fighter can't also be given a second attack this turn. | Empower 3 on a fighter. | Empower | 5 | ok |
| Haste | 1 | A fighter's T4 attack resolves at T2 speed this turn. | A fighter's T4 attack resolves at T2. | — | 7 | ok |
| Silence | 1 | Target enemy can't play Spell or Signature cards next turn. | Silence: Spells and Signatures. | Silence | 4 | ok |
| Sleep | 1 | Lull one enemy: the enemy team has 2 less energy next turn. | Lull one enemy: enemy team has [NRG 2] less next turn. | [NRG] | 10 |  **needs-redesign** |
| Drain | 3 | Deal 3 to one enemy and heal this fighter 3. | Deal [DMG 3] to one enemy; Heal [HEAL 3] to this fighter. | [DMG] [HEAL] | 10 | ok |
| Curse | 2 | Target enemy takes +3 from all attacks this turn. | Expose 3 on one enemy. | Expose | 5 | ok |
| Mana Draught | 1 | Heal 8 to a fighter. Once per match. | Heal [HEAL 8] to a fighter. | [HEAL] Once | 6 | ok |
| Annihilation | 4 | Deal 8 to both enemies, ignoring all blocks. Once per match. | Deal [DMG 8] to both enemies, Pierce. | [DMG] Pierce Once | 6 | ok |

**Flag notes:**
- **Cataclysm** (needs-redesign): Splash requires the target phrase 'the other enemy', which is outside the locked five-target list ('both enemies' would be wrong — the 9 and 3 hit different fighters, and splash only fires if a second enemy is alive). Needs a sanctioned splash target phrase or editor sign-off. Engine nuances (attack buff applies to the 9 only; splash fires even if the 9 is fully blocked) fit in glossary/hint.
- **Reflect** (meaning-risk): Engine is per HIT, not per attacker (a two-hit card eats two 4-counters), and the counter fires even on fully blocked or zeroed hits ('hits' means 'targets'). The locked Riposte reminder reads per-attacker/on-hit — the compressed text inherits that soft inaccuracy; fix belongs in the Riposte glossary entry, not the card.
- **Sleep** (needs-redesign): Engine-true (team-wide -2, non-stacking, dies with the lulled fighter — 'Lull one enemy' is load-bearing for that link), and the NRG icon table sanctions the 'enemy team has [NRG 2] less' phrasing. But 'Lull' is not in the closed verb list, the trigger 'Lull one enemy:' is not in the closed trigger list, and 'enemy team' is not one of the five target phrases. Needs editor sign-off on a bespoke verb or a new keyword.

### Wraith (Scout)

| Card | T | Current text | → Proposed | Icons/Keywords | Words | Flag |
|---|---|---|---|---|---|---|
| Quick Shot | 2 | Deal 3 to one enemy. | Deal [DMG 3] to one enemy. | [DMG] | 5 | ok |
| Double Tap | 2 | Deal 3 to one enemy, then 1 more if they were already hit this turn. | Deal [DMG 3] to one enemy; [DMG +1] if you also attack it or it took damage. | [DMG] | 15 |  **resists-compression** |
| Steady Aim | 1 | Give a fighter's next attack this turn +1 damage. | Empower 1 on a fighter. | Empower | 5 | ok |
| Headshot | 3 | Deal 6 to one enemy. | Deal [DMG 6] to one enemy. | [DMG] | 5 | ok |
| Armor Piercer | 2 | Deal 4 to one enemy, ignoring all blocks. | Deal [DMG 4] to one enemy, Pierce. | [DMG] Pierce | 6 | ok |
| Frag Out | 3 | Deal 3 to both enemies. | Deal [DMG 3] to both enemies. | [DMG] | 6 | ok |
| Evade | 1 | This fighter takes 4 less from all attacks this turn. | Guard [BLK 4] on this fighter. | [BLK] Guard | 6 | ok |
| Smoke Screen | 1 | Both your fighters take 3 less from all attacks this turn. | Guard [BLK 3] on both fighters. | [BLK] Guard | 6 | ok |
| Parry | 2 | Block the next 5 damage to this fighter, and deal 4 back to each attacker who hits it this turn. | Block [BLK 5]; Riposte 4. | [BLK] Block Riposte | 5 | ok |
| Counter-Sniper | 2 | Block the next 3 damage to this fighter, and deal 4 to one attacker who hits it this turn. | Block [BLK 3]; Riposte 4 (first only). | [BLK] Block Riposte | 7 | ok |
| Recon | 1 | Discard a card. At the start of your next turn, pick any card from this deck into your hand. | Discard a card: draw a chosen card next turn. | — | 9 |  **meaning-risk** |
| Adrenaline Rush | 1 | Give a fighter's next attack this turn +2 damage. | Empower 2 on a fighter. | Empower | 5 | ok |
| Stim Patch | 1 | Heal 4 to one fighter. | Heal [HEAL 4] to a fighter. | [HEAL] | 6 | ok |
| Light Armor | 1 | Equip: this fighter's Evade and dodge effects block 1 more for the rest of the match. | Your Evade Guards 1 more. | Guard | 5 |  **meaning-risk** |
| Trip Mine | 2 | Deal 4 to the next enemy who attacks this fighter this turn. | Riposte 4 (first only). | Riposte | 4 |  **meaning-risk** |
| Disrupt | 1 | Target enemy's T4 attack resolves as T3 this turn, making it slower. | One enemy's T4 attack resolves at T3. | — | 7 |  **needs-redesign** |
| Mark | 2 | Target enemy takes +2 from all attacks this turn. | Expose 2 on one enemy. | Expose | 5 | ok |
| Med Injector | 1 | Heal 8 to one fighter. Once per match. | Heal [HEAL 8] to a fighter. | [HEAL] | 6 | ok |
| Phase Out | 2 | This fighter takes no damage this turn and deals 4 to one enemy. Once per match. | Deal [DMG 4] to one enemy; this fighter then ignores all damage. | [DMG] | 11 |  **meaning-risk** |

**Flag notes:**
- **Double Tap** (resists-compression): Two-part OR condition (focus-fire OR prior HP damage) plus the engine nuances — focus-fire counts even later-tier/fully-blocked attacks, but a prior fully-BLOCKED hit does NOT count — cannot fit 11 words. Pronoun used for brevity against the no-pronoun rule; blocked-hit exclusion pushed to reminder. Original text was also inaccurate (said only 'already hit').
- **Recon** (meaning-risk): Engine soft-lies fixed/deferred: the discard may come from your TEAMMATE's hand and is paid at lock-in; the tutor offers the DRAW pile only (discard reshuffles in only when draw is empty), the picked card is EXTRA above the hand cap and optional, and it's lost if the owner is dead next turn. 'chosen' conveys tutor-not-random; the rest goes to the reminder.
- **Light Armor** (meaning-risk): Original text was wrong twice: there are no other 'dodge effects' (only Evade is boosted; Smoke Screen/Phase Out get nothing), and it adds to per-hit REDUCTION not a Block pool. Equip frame supplies permanence (no 'rest of match'). Names a sibling card (Evade) by necessity; removed-by-Dispel + self-only nuance → reminder.
- **Trip Mine** (meaning-risk): Mechanically a single-fire self-counter with no Block pool, so Riposte is exact — but thematically a 'mine', not a parry; consider whether reusing Riposte reads right here. Same reminders as Parry (fires even if their attack was blocked; T1 attacks are too fast; the 4 can be absorbed by the attacker's own shields).
- **Disrupt** (needs-redesign): The current text is a LIE (Scout's Sleep/Frost-tier bug): T3 resolves BEFORE T4, so the engine makes the enemy attack land a tier EARLIER and immune to cancel-on-death — a buff for the enemy, not a debuff. Only prints as a 'slow' vs a Hasted attack. DESIGN DECISION NEEDED at the stop-gate: fix the engine to genuinely delay/cancel the T4 attack, or keep this honest text and accept it as niche anti-Haste tech. Affects one card, printed-T4 attacks only.
- **Phase Out** (meaning-risk): 'then ignores all damage' correctly implies immunity from its own T2 resolution onward — fixing the original over-claim ('takes no damage this turn'): instant (T1) attacks already landed and a start-of-turn Burn tick still hurt. Immunity also blanks counter/mine damage; the 4 is a normal blockable attack. Once badge on the Signature frame carries once-per-match. Nuances → reminder.

### Longshot (Drifter)

| Card | T | Current text | → Proposed | Icons/Keywords | Words | Flag |
|---|---|---|---|---|---|---|
| Quickdraw | 2 | Deal 4 to one enemy. | Deal [DMG 4] to one enemy. | [DMG] | 5 | ok |
| Six Shooter | 3 | Deal 6 to one enemy. | Deal [DMG 6] to one enemy. | [DMG] | 5 | ok |
| Fan The Hammer | 3 | Deal 4 to one enemy, then flip a coin: on heads, deal 3 more. | Flip: Deal [DMG 7] Heads, [DMG 4] Tails to one enemy. | [DMG] [DMG] Flip | 9 | ok |
| Cold Shot | 4 | Deal 9 to one enemy. | Deal [DMG 9] to one enemy. | [DMG] | 5 | ok |
| Pistol Whip | 2 | Deal 5 to one enemy. | Deal [DMG 5] to one enemy. | [DMG] | 5 | ok |
| Ricochet | 3 | Deal 4 to one enemy, ignoring blocks. | Deal [DMG 4] to one enemy, Pierce. | [DMG] Pierce | 6 | ok |
| Both Barrels | 4 | Deal 5 to both enemies. | Deal [DMG 5] to both enemies. | [DMG] | 5 | ok |
| Sidestep | 1 | This fighter takes 5 less from all attacks this turn. | Guard [BLK 5] on this fighter. | [BLK] Guard | 6 | ok |
| Gunslinger's Parry | 2 | Block the next 5 damage to this fighter this turn, and deal 4 back to each attacker who hits it. | Block [BLK 5]; Riposte 4. | [BLK] Block Riposte | 4 | ok |
| Bluff | 1 | This turn, the first enemy who attacks this fighter takes 3. If none attack, nothing happens. | Riposte 3. | Riposte | 2 |  **meaning-risk** |
| Take Cover | 1 | Block the next 7 damage to this fighter this turn, then it breaks. | Block [BLK 7]. | [BLK] Block | 2 | ok |
| Lucky Coin | 1 | Flip a coin: on heads, give a fighter's next attack +4 damage; on tails, +0. | Flip: Empower 4 Heads. | Flip Empower | 4 | ok |
| Hip Fire | 2 | Deal 5 to one enemy. | Deal [DMG 5] to one enemy. | [DMG] | 5 | ok |
| Whiskey | 1 | Heal 4 to a fighter, but they take +1 from all attacks next turn. | Heal [HEAL 4] to a fighter; Expose 1 next turn. | [HEAL] Expose | 9 | ok |
| Worn Duster | 1 | Once per match, the first hit that would drop this fighter to 0 leaves them at 1; after that, they take +2 from all attacks for the rest of the match. | First time this fighter reaches 0, survive at 1; Expose 2 permanently. | Expose | 12 |  **resists-compression** |
| Marked Card | 2 | Target enemy takes +3 from all attacks this turn. | Expose 3 on one enemy. | Expose | 5 | ok |
| Lucky Streak | 1 | Flip a coin: give a fighter's next attack +4 on heads, +2 on tails. | Flip: Empower 4 Heads, 2 Tails. | Flip Empower | 6 | ok |
| Ante Up | 1 | Discard 1 card, then draw 2 extra cards from your deck next turn. | Discard a card: draw [DRAW 2] extra next turn. | [DRAW] | 8 | ok |
| Snake Oil | 1 | Heal 8 to a fighter. Once per match. | Heal [HEAL 8] to a fighter. | [HEAL] | 5 | ok |
| Sundown | 4 | Deal 8 to one enemy, or 10 if your fighter is below half HP. Once per match. | Deal [DMG 8] to one enemy; [DMG 10] if this fighter is below half HP. | [DMG] [DMG] | 13 |  **resists-compression** |

**Flag notes:**
- **Bluff** (meaning-risk): Old text says only the FIRST attacker takes 3; the engine has no once-flag and returns 3 for EVERY attack (every attacker, every hit, all turn) — default Riposte semantics. Rewrite matches the engine, but design must ratify engine-vs-text (or add a fired flag like Trip Mine and print 'Riposte 3 (first only).').
- **Worn Duster** (resists-compression): Known resister (12 words) — trigger + save + permanent Expose cannot compress further without losing the half of the card that matters. Equip frame + Once badge carry frame semantics. Engine nuances for glossary/design: the save is evaluated per TIER (a multi-hit burst in one tier is one save, even from deep negative), the start-of-turn burn tick kills straight through it, the +2 applies to attacks only (not counters/burn), and Dispel can strip the un-triggered flag.
- **Sundown** (resists-compression): Known resister (~13 words). 'this fighter' is required — dropping it ('if below half HP', 10 words) reads as the ENEMY's HP, a meaning risk worse than the overage. HP is checked at T4 resolution (same-turn chip damage can switch on the 10) — glossary material. Once badge carried by the Signature frame; not Pierce, blocks apply.

### Beacon (Cleric)

| Card | T | Current text | → Proposed | Icons/Keywords | Words | Flag |
|---|---|---|---|---|---|---|
| Smite | 3 | Deal 5 to one enemy. | Deal [DMG 5] to one enemy. | [DMG] | 5 | ok |
| Holy Bolt | 2 | Deal 4 to one enemy. | Deal [DMG 4] to one enemy. | [DMG] | 5 | ok |
| Condemn | 3 | Deal 3 to one enemy. | Deal [DMG 3] to one enemy. | [DMG] | 5 | ok |
| Searing Light | 3 | Deal 3 to one enemy, ignoring blocks. | Deal [DMG 3] to one enemy, Pierce. | [DMG] Pierce | 6 | ok |
| Wrath | 4 | Deal 7 to one enemy. | Deal [DMG 7] to one enemy. | [DMG] | 5 | ok |
| Sanctified Ground | 3 | Deal 3 to both enemies. | Deal [DMG 3] to both enemies. | [DMG] | 5 | ok |
| Cure | 1 | Heal 4 to a fighter. | Heal [HEAL 4] to a fighter. | [HEAL] | 5 | ok |
| Rebuke | 2 | Deal 3 to one enemy. | Deal [DMG 3] to one enemy. | [DMG] | 5 | ok |
| Shell | 1 | Block the next 9 damage to a fighter this turn. | Block [BLK 9] on a fighter. | [BLK] Block | 5 | ok |
| Guardian | 2 | Block the next 5 damage to this fighter this turn, and deal 4 back to each attacker who hits it. | Block [BLK 5]; Riposte 4. | [BLK] Block Riposte | 4 |  **meaning-risk** |
| Regen | 1 | A fighter heals 2 now and 2 at the start of your next turn. | Heal [HEAL 2] to a fighter, now and next turn. | [HEAL] [HEAL] | 9 |  **meaning-risk** |
| Bless | 1 | Give a fighter's next attack this turn +3 damage. | Empower 3 on a fighter. | Empower | 5 | ok |
| Protect | 1 | This fighter takes 3 less from all attacks this turn. | Guard [BLK 3] on a fighter. | [BLK] Guard | 5 | ok |
| Sanctuary | 1 | Both your fighters heal 1 and take 1 less from attacks this turn. | Heal [HEAL 1] to both fighters; Guard [BLK 1]. | [HEAL] [BLK] Guard | 7 | ok |
| Dispel | 1 | Remove all buffs and equips from one enemy. | Remove one enemy's Guard, Empower, and Equips. | Guard Empower | 7 |  **meaning-risk** |
| Silence | 1 | One enemy cannot play Spell cards next turn. | Silence: Spells. | Silence | 2 | ok |
| Sacrifice | 1 | Move up to 6 HP from one of your fighters to the other. | Move up to [HEAL 6] from the healthier fighter to the other. | [HEAL] | 11 |  **needs-redesign** |
| Holy Water | 1 | Heal 6 to a fighter. Once per match. | Heal [HEAL 6] to a fighter. | [HEAL] | 5 | ok |
| Divine Intervention | 1 | Prevent up to 10 damage to each of your fighters this turn. Once per match. | Block [BLK 10] on both fighters (stops Pierce). | [BLK] [BLK] Block Pierce | 7 | ok |

**Flag notes:**
- **Guardian** (meaning-risk): Locked Riposte reminder says 'each enemy who attacks... takes N back', but the engine fires 4 per HIT (multi-hit cards eat 4 per hit) and fires even when the attack is fully blocked or reduced to 0; the Riposte-flagged block pool also silently doesn't stop Pierce while the counter still triggers. Text matches the locked keyword exactly; the keyword definition understates the engine — flag to design for the Riposte glossary entry.
- **Regen** (meaning-risk): Written as 'Heal [HEAL 2] to a fighter, now and next turn.' — the delayed tick lands AFTER Burn (Burn can kill first, forfeiting it), stacks additively, survives the caster's death, dies with the target, and Dispel can't remove it. No keyword exists to carry that reminder at 0 words; 'next turn' slightly under-specifies 'start of target's next turn, after Burn'. Candidate for a future Regen keyword.
- **Dispel** (meaning-risk): Old text's 'all buffs' overpromised (block pools, riposte stances, taunt/cover, junctions, invuln, pending regen/shields all survive). Rewrite names exactly what the engine strips: this-turn Guard (turn.reduce), unspent Empower (attackBuff), and all permanent Equips (including an unspent Worn Duster save). Residual risk: the T1 side-order quirk (enemy T1 buffs applied after Dispel survive, asymmetric by side) is unprintable at any budget — flag to design; also uses keywords as nouns, a mild template stretch.
- **Sacrifice** (needs-redesign): Engine mismatch fixed: aim is none — the engine auto-drains the healthier fighter into the weaker one; the player never picks direction, so the old text lied. But 'the healthier fighter' is outside the locked five target phrases, the donor-floors-at-1 / no-overheal / both-alive caps have no keyword reminder to live in, and a Heal icon on a transfer that also REMOVES HP is icon-semantics strain. Card fights the template; recommend either a bespoke glossary entry or redesigning to player-chosen direction to match the printed promise.

### Aegis (Warden)

| Card | T | Current text | → Proposed | Icons/Keywords | Words | Flag |
|---|---|---|---|---|---|---|
| Rifle Burst | 3 | Deal 4 to one enemy. | Deal [DMG 4] to one enemy. | [DMG] | 5 |  **meaning-risk** |
| Shield Bash | 2 | Deal 4 to one enemy. | Deal [DMG 4] to one enemy. | [DMG] | 5 | ok |
| Concussive Shell | 3 | Deal 4 to one enemy; that enemy deals 2 less next turn. | Deal [DMG 4] to one enemy; Weaken 2 next turn. | [DMG] Weaken | 9 | ok |
| Breaching Round | 3 | Deal 4 to one enemy, ignoring all blocks. | Deal [DMG 4] to one enemy, Pierce. | [DMG] Pierce | 6 | ok |
| Heavy Slug | 4 | Deal 7 to one enemy. | Deal [DMG 7] to one enemy. | [DMG] | 5 | ok |
| Covering Volley | 3 | Deal 2 to both enemies. | Deal [DMG 2] to both enemies. | [DMG] | 5 | ok |
| Bulwark | 1 | Block the next 6 damage to this fighter this turn, and deal 3 back to each attacker who hits it. | Block [BLK 6]; Riposte 3. | [BLK] Block Riposte | 4 |  **meaning-risk** |
| Dig In | 1 | Block the next 6 damage to each of your fighters this turn. | Block [BLK 6] on both fighters. | [BLK] Block | 5 | ok |
| Retaliate | 2 | Block 5 to this fighter this turn, and deal 4 back to each enemy who hits it. | Block [BLK 5]; Riposte 4. | [BLK] Block Riposte | 4 |  **meaning-risk** |
| Battle Surge | 1 | Give a fighter's next attack +3 damage, but they take +1 from all attacks this turn. | Empower 3 on a fighter; Expose 1 on that fighter. | Empower Expose | 10 |  **meaning-risk** |
| Repair Kit | 1 | Heal 5 to a fighter. | Heal [HEAL 5] to a fighter. | [HEAL] | 5 | ok |
| Plated Armor | 1 | Equip: this fighter takes 2 less from all attacks for the rest of the match. | Guard [BLK 2] on this fighter. | [BLK] Guard | 5 | ok |
| Reinforced Plating | 1 | Equip: the first time this fighter would break a block this match, it absorbs 2 more. | First time this fighter's Block overflows, Block [BLK 2] more. | [BLK] Block | 9 |  **meaning-risk** |
| Suppress | 2 | Target enemy deals 3 less this turn. | Weaken 3 on one enemy. | Weaken | 5 | ok |
| Taunt | 1 | All enemy attacks this turn must target this fighter. | Redirect enemy single-target attacks to this fighter. | — | 7 |  **meaning-risk** |
| Hold Position | 1 | Both your fighters take 2 less from all attacks this turn. | Guard [BLK 2] on both fighters. | [BLK] Guard | 5 | ok |
| Medpack | 1 | Heal 8 to a fighter. Once per match. | Heal [HEAL 8] to a fighter. | [HEAL] | 5 | ok |
| Anchor Down | 4 | Deal 4 to one enemy; this fighter blocks the next 8 damage next turn. Once per match. | Deal [DMG 4] to one enemy; Block [BLK 8] next turn. | [DMG] [BLK] Block | 9 | ok |

**Flag notes:**
- **Rifle Burst** (meaning-risk): Inventory error, not text: the engine (rift_protocol.html:1492-1493) has two distinct copies — one deals 4, one deals 5 ('Deal 5 to one enemy.'). cards_unique.json silently merged them as copies:2 amount:4. The 5-damage copy needs its own printed text 'Deal [DMG 5] to one enemy.' or an intentional design unification.
- **Bulwark** (meaning-risk): Engine counters per HIT, not per attacker, and fires even on fully-blocked/zero-damage hits — the locked Riposte reminder text ('Enemies who attack this fighter take N back') still under-states this. Also: the riposte pool is pierceable, shares the 17 absorb cap, and does NOT count as a Block for Reinforced Plating despite being written 'Block'. Glossary/reminder must own these or the compression loses them.
- **Retaliate** (meaning-risk): Same per-hit / zero-damage-hit Riposte nuances as Bulwark, plus the T2 timing gap: enemy T1 attacks resolve before this exists and are neither blocked nor countered. The tier chip (frame, 0 words) is the only signal of that gap — acceptable only if the tier UI teaches 'arms at its tier'.
- **Battle Surge** (meaning-risk): Rider target reads 'that fighter' (repeat-the-noun-phrase rule) but that phrase is not in the locked five-target list; repeating 'a fighter' would wrongly imply a second choice. Engine truths (buff is first single-target attack only, never AoE, dies end of turn; no-second-attack stacking rule; +1 is per hit and skips burn/counter damage) all live in the Empower/Expose reminders per the locked vocabulary.
- **Reinforced Plating** (meaning-risk): Engine excludes riposte pools: overflowing Bulwark/Retaliate (the Aegis's own most common 'Block' cards) never triggers it — only true block pools (Dig In, Anchor Down's shield) do. Also never triggers vs Pierce, and the once-per-match is consumed even on a partial 1-point absorb. Printed 'Block' therefore over-promises unless the glossary carves out riposte pools — or the engine is fixed to include them. Flagging to design per the engine-is-truth rule.
- **Taunt** (meaning-risk): Deviates from the vocabulary's sample bespoke line 'All enemy attacks must target this fighter.' because that line is engine-false: AoE attacks are never redirected (computeAttack's aoe path skips resolveTarget) and non-attack cards are never redirected. Uses the sanctioned verb Redirect. Redirect-ends-on-death and Taunt-beats-Cover live in reminder text.

