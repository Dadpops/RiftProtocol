/* Node test harness for RIFT PROTOCOL.
   Extracts the DOM-free <script id="gf-core"> from the HTML, eval's it in global
   scope (the UI script is ignored), then runs the 12 spec assertions and a
   headless crash-test across the whole card pool.
   Run:  node test/run_tests.mjs                                              */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, '..', 'rift_protocol.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const m = html.match(/<script id="gf-core">([\s\S]*?)<\/script>/);
if (!m) { console.error('Could not find <script id="gf-core"> in the HTML.'); process.exit(2); }
(0, eval)(m[1]);                 // indirect eval → global scope; sets globalThis.GF
const GF = globalThis.GF;

console.log('=== 12 SPEC ASSERTIONS ===');
let fail = 0;
const res = GF.runTests((ok, name, extra) => {
  console.log((ok ? '  PASS  ' : '  FAIL  ') + name + (extra ? ('  [' + extra + ']') : ''));
  if (!ok) fail++;
});
console.log(`\n${res.passed}/${res.total} assertions passed`);

function sim(label, n, a, b) {
  const r = GF.simulate(n, a, b);
  console.log(`\n=== ${label}: ${n} matches (${a} vs ${b}) ===`);
  console.log('  results:', JSON.stringify(r.tally), '· avgRounds:', r.avgRounds, '· errors:', r.errors.length);
  if (r.errors.length) console.log('  first errors:', r.errors.slice(0, 5));
  return r.errors.length;
}
let simErrors = 0;
simErrors += sim('HEADLESS', 500, 'random', 'random');
simErrors += sim('HEADLESS', 300, 'heuristic', 'random');
simErrors += sim('HEADLESS', 300, 'heuristic', 'heuristic');

console.log(`\n${fail === 0 && simErrors === 0 ? 'ALL GREEN ✓' : 'FAILURES ✗'}`);
process.exit(fail > 0 || simErrors > 0 ? 1 : 0);
