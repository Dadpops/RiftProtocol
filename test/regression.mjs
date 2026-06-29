/* Extended regression suite — special-handler edge cases and the fixes that came
   out of the adversarial verification pass. Complements the 12 spec assertions.
   Run:  node test/regression.mjs                                              */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(__dirname, '..', 'rift_protocol.html'), 'utf8');
(0, eval)(html.match(/<script id="gf-core">([\s\S]*?)<\/script>/)[1]);
const GF = globalThis.GF;
const DL = GF.DECKLISTS;
const card = (cls, name, i) => DL[cls].filter(c => c.name === name)[i || 0];
// synthetic attack fixture (decoupled from deck composition)
const A = (name, speed, amount, extra) => Object.assign({ cls:'Test', name, type:'Attack', aim:'enemy', kind:'attack', speed, amount }, extra || {});

let pass = 0, fail = 0;
function check(name, fn) {
  try { const r = fn(); console.log('  PASS  ' + name + (r ? '  [' + r + ']' : '')); pass++; }
  catch (e) { console.log('  FAIL  ' + name + '  -> ' + e.message); fail++; }
}
const assert = (c, m) => { if (!c) throw new Error(m || 'assert'); };
function state(clsA, clsB) {
  const s = { rng: GF.makeRng(99), round: 1, over: false, result: null, log: [],
    sides: [
      { name: 'A', fighters: [GF.makeFighter('A1', clsA[0]), GF.makeFighter('A2', clsA[1])] },
      { name: 'B', fighters: [GF.makeFighter('B1', clsB[0]), GF.makeFighter('B2', clsB[1])] },
    ] };
  GF.startOfTurn(s); return s;
}
const P = (c, caster, target) => ({ card: c, caster, target, owner: caster });

console.log('=== DECK INTEGRITY ===');
check('Every class has exactly 20 cards', () => {
  const bad = Object.keys(DL).filter(c => DL[c].length !== 20).map(c => `${c}=${DL[c].length}`);
  assert(bad.length === 0, `expected 20 each, got ${bad.join(', ')}`);
  return Object.keys(DL).map(c => `${c} ${DL[c].length}`).join(' · ');
});

console.log('=== SPECIAL-HANDLER EDGE CASES ===');

check('Taunt redirects attack to taunter', () => {
  const s = state(['Soldier','Soldier'], ['Warden','Soldier']);
  const atk = s.sides[0].fighters[0], taunter = s.sides[1].fighters[0], other = s.sides[1].fighters[1];
  GF.resolveTurn(s, [P(A('Heavy Hit',4,9), atk, other)], [P(card('Warden','Taunt'), taunter, taunter)]);
  assert(taunter.hp === 11 && other.hp === 20, `taunter=${taunter.hp} other=${other.hp}`);
  return `taunter=${taunter.hp} other=${other.hp}`;
});
check('Divine shield stops pierce', () => {
  const s = state(['Cleric','Soldier'], ['Soldier','Soldier']);
  const cleric = s.sides[0].fighters[0], atk = s.sides[1].fighters[0];
  GF.resolveTurn(s, [P(card('Cleric','Divine Intervention'), cleric, cleric)], [P(card('Soldier','Piercing Round'), atk, cleric)]);
  assert(cleric.hp === 20, `cleric=${cleric.hp}`); return `cleric=${cleric.hp}`;
});
check('AoE hits both enemies', () => {
  const s = state(['Arcanist','Soldier'], ['Soldier','Soldier']);
  const c = s.sides[0].fighters[0], e1 = s.sides[1].fighters[0], e2 = s.sides[1].fighters[1];
  GF.resolveTurn(s, [P(card('Arcanist','Meteor Splash'), c, null)], []);
  assert(e1.hp === 15 && e2.hp === 15, `${e1.hp}/${e2.hp}`); return `${e1.hp}/${e2.hp}`;
});
check('Drain deals 3 + heals caster 3', () => {
  const s = state(['Arcanist','Soldier'], ['Soldier','Soldier']);
  const c = s.sides[0].fighters[0]; c.hp = 10; const t = s.sides[1].fighters[0];
  GF.resolveTurn(s, [P(card('Arcanist','Drain'), c, t)], []);
  assert(t.hp === 17 && c.hp === 13, `t=${t.hp} c=${c.hp}`); return `t=${t.hp} c=${c.hp}`;
});
check('Sundown scales with caster HP', () => {
  const s = state(['Drifter','Soldier'], ['Soldier','Soldier']);
  const c = s.sides[0].fighters[0]; c.hp = 8; const t = s.sides[1].fighters[0];
  GF.resolveTurn(s, [P(card('Drifter','Sundown'), c, t)], []);
  assert(t.hp === 10, `t=${t.hp}`); return `t=${t.hp}`;
});
check('Pierce respects reduction, ignores pool', () => {
  const s = state(['Soldier','Soldier'], ['Arcanist','Soldier']);
  const atk = s.sides[0].fighters[0], def = s.sides[1].fighters[0];
  GF.resolveTurn(s, [P(card('Soldier','Piercing Round'), atk, def)], [P(card('Arcanist','Blink'), def, def)]);
  assert(def.hp === 19, `def=${def.hp}`); return `def=${def.hp}`;
});
check('Suppress reduces enemy outgoing', () => {
  const s = state(['Warden','Soldier'], ['Soldier','Soldier']);
  const w = s.sides[0].fighters[0], e = s.sides[1].fighters[0], me = s.sides[0].fighters[1];
  GF.resolveTurn(s, [P(card('Warden','Suppress'), w, e)], [P(A('Heavy Hit',4,9), e, me)]);
  assert(me.hp === 14, `me=${me.hp}`); return `me=${me.hp}`;
});

console.log('\n=== FIXES FROM ADVERSARIAL AUDIT ===');

// FIX 1: stacked block pools must NOT fully cover an 18 burst (spec §3 invariant)
check('Two Brace (20 pool) still leaks an 18 burst', () => {
  const s = state(['Soldier','Soldier'], ['Soldier','Soldier']);
  const a1 = s.sides[0].fighters[0], a2 = s.sides[0].fighters[1], def = s.sides[1].fighters[0];
  GF.resolveTurn(s,
    [P(A('Heavy Hit',4,9), a1, def), P(A('Heavy Hit',4,9), a2, def)],
    [P(card('Soldier','Brace',0), def, def), P(card('Soldier','Brace',1), def, def)]);   // two 10-blocks = 20 pool
  assert(def.hp < 20 && def.alive, `18 must leak through stacked blocks, got ${def.hp}`);
  assert(def.hp === 19, `expected absorb 17, leak 1 -> 19, got ${def.hp}`);
  return `def=${def.hp} (leaked ${20 - def.hp})`;
});

// FIX 2: Reinforced Plating absorbs 2 more the first time a bulwark breaks
check('Reinforced Plating adds +2 on bulwark break', () => {
  const s = state(['Soldier','Soldier'], ['Warden','Soldier']);
  const a1 = s.sides[0].fighters[0], a2 = s.sides[0].fighters[1], def = s.sides[1].fighters[0];
  def.reinforced = true; // as if Reinforced Plating equipped a prior turn
  // a 10-block vs 9 + 6 = 15: pool absorbs 10, reinforced absorbs 2 more -> 3 to HP
  GF.resolveTurn(s,
    [P(A('Heavy Hit',4,9), a1, def), P(A('Slash',3,6), a2, def)],
    [P(card('Soldier','Brace',0), def, def)]);
  assert(def.hp === 17, `expected 12 absorbed (10+2), 3 to HP -> 17, got ${def.hp}`);
  return `def=${def.hp}`;
});

// FIX 3: Sacrifice never kills the donor
check('Sacrifice cannot drop donor below 1', () => {
  const s = state(['Cleric','Soldier'], ['Soldier','Soldier']);
  const caster = s.sides[0].fighters[0], recip = s.sides[0].fighters[0], donor = s.sides[0].fighters[1];
  recip.hp = 3; donor.hp = 5;   // moves from higher-HP donor to lower-HP recipient
  GF.resolveTurn(s, [P(card('Cleric','Sacrifice'), caster, null)], []);
  assert(donor.alive && donor.hp >= 1, `donor must survive, got hp=${donor.hp} alive=${donor.alive}`);
  assert(donor.hp === 1 && recip.hp === 7, `expected donor 1 / recip 7 (moved 4), got donor=${donor.hp} recip=${recip.hp}`);
  return `donor=${donor.hp} recip=${recip.hp}`;
});

// FIX 4: Double Tap +1 on focus fire, not on a stale prior-turn chip
check('Double Tap +1 on focus fire, plain otherwise', () => {
  // focus: Double Tap + another attack on the same enemy -> 4
  let s = state(['Scout','Soldier'], ['Soldier','Soldier']);
  let sc = s.sides[0].fighters[0], ally = s.sides[0].fighters[1], e = s.sides[1].fighters[0];
  GF.resolveTurn(s, [P(card('Scout','Double Tap'), sc, e), P(A('Jab',2,3), ally, e)], []);
  assert(e.hp === 13, `focus: 4(DT)+3(jab)=7 -> 13, got ${e.hp}`);
  // no focus, full-HP target -> Double Tap deals 3
  s = state(['Scout','Soldier'], ['Soldier','Soldier']);
  sc = s.sides[0].fighters[0]; e = s.sides[1].fighters[0];
  GF.resolveTurn(s, [P(card('Scout','Double Tap'), sc, e)], []);
  assert(e.hp === 17, `solo Double Tap on full HP = 3 -> 17, got ${e.hp}`);
  return 'focus=4, solo=3';
});

// FIX 5: Counter-Sniper fires only ONE counter across the whole turn
check('Counter-Sniper counters once across tiers', () => {
  const s = state(['Soldier','Soldier'], ['Scout','Soldier']);
  const a1 = s.sides[0].fighters[0], a2 = s.sides[0].fighters[1], def = s.sides[1].fighters[0];
  // a1 hits at T2 (Quick Jab), a2 hits at T4 (Heavy Swing) -> only one should be countered
  GF.resolveTurn(s,
    [P(A('Jab',2,3), a1, def), P(A('Heavy Hit',4,9), a2, def)],
    [P(card('Scout','Counter-Sniper'), def, def)]);
  const countered = [a1, a2].filter(f => f.hp < 20).length;
  assert(countered === 1, `exactly one counter across tiers, got ${countered}`);
  return `countered=${countered}`;
});

// FIX 6: an attack buff does not over-apply across an AoE's targets
check('Attack buff does not boost AoE per-target', () => {
  const s = state(['Drifter','Soldier'], ['Soldier','Soldier']);
  const d = s.sides[0].fighters[0], ally = s.sides[0].fighters[1];
  const e1 = s.sides[1].fighters[0], e2 = s.sides[1].fighters[1];
  // Adrenaline (+3) on the Drifter, who then plays Both Barrels (AoE 5 to both)
  GF.resolveTurn(s, [P(card('Soldier','Adrenaline',0), d, d), P(card('Drifter','Both Barrels'), d, null)], []);
  assert(e1.hp === 15 && e2.hp === 15, `AoE should be symmetric 5/5 (buff NOT applied) -> 15/15, got ${e1.hp}/${e2.hp}`);
  return `${e1.hp}/${e2.hp}`;
});

console.log('\n=== UPDATE ROUND: ENERGY RAMP + INTERRUPT-ON-KILL ===');

// Energy RAMPS by round (3/4/6/8/10); validatePicks gates against the round's budget
check('Energy ramp: round-gated affordability', () => {
  const s = state(['Soldier','Soldier'], ['Soldier','Soldier']);
  const f = s.sides[0].fighters[0], g = s.sides[0].fighters[1], e = s.sides[1].fighters[0];
  const P2 = (c, ca, t) => ({ card: c, caster: ca, target: t, owner: ca });
  assert([1,2,3,4,5].map(r=>{ s.round=r; return GF.energyBudget(s, s.sides[0]); }).join() === '3,4,6,8,10',
    'ramp should be 3,4,6,8,10');
  const t3t2 = [P2(card('Soldier','Breach Slash',0), f, e), P2(A('Jab',2,3), g, e)]; // 5 energy
  s.round = 1; assert(!GF.validatePicks(s,0,t3t2).ok, 'round 1 (3e) should reject a 5-energy play');
  s.round = 3; assert(GF.validatePicks(s,0,t3t2).ok,  'round 3 (6e) should allow a 5-energy play');
  s.round = 5; // two T4 (10) affordable at round 5
  assert(GF.validatePicks(s,0,[P2(A('Heavy Hit',4,9),f,e), P2(A('Heavy Hit',4,9),g,e)]).ok,
    'round 5 (10e) should allow two T4');
  assert(GF.energyCost(card('Soldier','Brace',0))===1 && GF.energyCost(A('Heavy Hit',4,9))===5, 'T1=1, T4=5 costs');
  return 'ramp 3/4/6/8/10 enforced';
});

// Interrupt on kill: a fighter killed in an earlier tier does NOT fire its later card
check('Interrupt on kill cancels the dead fighter\'s later card', () => {
  const s = state(['Soldier','Soldier'], ['Soldier','Soldier']);
  const a1 = s.sides[0].fighters[0], b1 = s.sides[1].fighters[0];
  a1.hp = 3;
  const P2 = (c, ca, t) => ({ card: c, caster: ca, target: t, owner: ca });
  // B kills a1 with a T2 Quick Jab; a1's T4 Heavy Swing must be cancelled
  const log = GF.resolveTurn(s,
    [P2(A('Heavy Hit',4,9), a1, b1)],
    [P2(A('Jab',2,3), b1, a1)]);
  assert(!a1.alive, `a1 should be dead, hp=${a1.hp}`);
  assert(b1.hp === 20, `b1 should be untouched (Heavy Swing cancelled), got ${b1.hp}`);
  assert(log.some(e => /CANCELLED/.test(e.text)), 'log should show the cancelled card');
  return 'cancelled, b1=20';
});

// Same-tier kills are NOT interrupted (damage computed before deaths)
check('Same-tier attacks both land despite mutual kill', () => {
  const s = state(['Soldier','Soldier'], ['Soldier','Soldier']);
  const a = s.sides[0].fighters[0], b = s.sides[1].fighters[0];
  a.hp = 6; b.hp = 6;
  const P2 = (c, ca, t) => ({ card: c, caster: ca, target: t, owner: ca });
  GF.resolveTurn(s, [P2(A('Slash',3,6), a, b)], [P2(A('Slash',3,6), b, a)]);
  assert(!a.alive && !b.alive, `both T3s same tier should land -> both dead, got a=${a.alive} b=${b.alive}`);
  return 'both dead';
});

console.log('\n=== BALANCE PASS: BURN / FIRAGA SPLASH / PER-CLASS HP ===');

// Fire: 3 now + 2 burn at the start of the target's next turn
check('Fire deals 3 + 2 burn next turn', () => {
  const s = state(['Arcanist','Soldier'], ['Soldier','Soldier']);
  const caster = s.sides[0].fighters[0], e = s.sides[1].fighters[0];
  GF.resolveTurn(s, [P(card('Arcanist','Fire',0), caster, e)], []);
  assert(e.hp === 17 && e.pending.burn === 2, `Fire should do 3 + queue 2 burn, got hp=${e.hp} burn=${e.pending.burn}`);
  GF.startOfTurn(s);   // burn ticks
  assert(e.hp === 15 && e.pending.burn === 0, `burn should tick for 2 -> 15, got hp=${e.hp} burn=${e.pending.burn}`);
  return 'hit 3, burn 2 → 15';
});

// Cataclysm: 9 to target + 3 splash to the other enemy
check('Cataclysm hits target 9 + 3 splash to other', () => {
  const s = state(['Arcanist','Soldier'], ['Soldier','Soldier']);
  const caster = s.sides[0].fighters[0], e0 = s.sides[1].fighters[0], e1 = s.sides[1].fighters[1];
  GF.resolveTurn(s, [P(card('Arcanist','Cataclysm'), caster, e0)], []);
  assert(e0.hp === 11 && e1.hp === 17, `Cataclysm 9 to target + 3 splash, got ${e0.hp}/${e1.hp}`);
  return `${e0.hp}/${e1.hp}`;
});

// Per-class HP from the durability table
check('Per-class starting HP', () => {
  const st = GF.newMatch({seed:1, sideA:{name:'A',classes:['Warden','Arcanist']}, sideB:{name:'B',classes:['Cleric','Drifter']}});
  const more = GF.newMatch({seed:2, sideA:{name:'A',classes:['Soldier','Scout']}, sideB:{name:'B',classes:['Cleric','Drifter']}});
  const hp = {}; for(const s2 of [st,more]) for(const sd of s2.sides) for(const f of sd.fighters) hp[f.className] = f.maxHp;
  assert(hp.Warden===17 && hp.Cleric===17 && hp.Drifter===17 && hp.Soldier===15 && hp.Scout===15 && hp.Arcanist===15,
    `class HP wrong: ${JSON.stringify(hp)}`);
  return `Warden ${hp.Warden} / Cleric ${hp.Cleric} / Drifter ${hp.Drifter} / Soldier ${hp.Soldier} / Scout/Arc 15`;
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
