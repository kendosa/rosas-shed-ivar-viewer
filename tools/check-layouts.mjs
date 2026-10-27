// Run with: npm run check
// Prints every layout's clearance checks and exits non-zero if any run conflicts
// with a door/window line. Handy for Claude Code to verify edits to layouts.js.
import { LAYOUTS } from '../src/data/layouts.js';
import { analyze } from '../src/lib/analyze.js';

let failed = 0;
for (const lay of LAYOUTS) {
  const { checks } = analyze(lay);
  console.log(`\n${lay.key}. ${lay.name}`);
  for (const [ok, text] of checks) {
    const tag = ok === 'info' ? 'NOTE    ' : ok ? 'FITS    ' : 'CONFLICT';
    if (ok === false) failed++;
    console.log(`  ${tag} ${text}`);
  }
}
console.log(failed ? `\n${failed} conflict(s).` : '\nAll layouts fit.');
process.exit(failed ? 1 : 0);
