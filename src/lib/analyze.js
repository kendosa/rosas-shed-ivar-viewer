// Clearance checks + parts list for a layout. Pure functions — no three.js.
import { ROOM, WALLS, limitFor, firstOpening, PENINSULA_LIMIT } from '../data/room.js';
import { runLength, SHELF_LABEL, DEPTH } from '../data/ivar.js';
import { ftin, depthLabel, heightLabel } from './format.js';

export function runName(r) {
  return r.wall === 'peninsula' ? 'Peninsula' : WALLS[r.wall].label;
}

/** @returns {{checks:[ok:boolean|'info', text:string][], runs:[name,text][], parts:Record<string,number>}} */
export function analyze(layout) {
  const checks = [], runs = [], parts = {};
  const add = (k, n = 1) => (parts[k] = (parts[k] || 0) + n);

  for (const r of layout.runs) {
    const len = runLength(r.bays);
    const end = r.start + len;
    runs.push([runName(r), `${r.bays.length} section${r.bays.length > 1 ? 's' : ''} · ${ftin(len)} long · ${depthLabel(r.depth)} deep · ${heightLabel(r.H)} tall`]);

    add(`Side unit ${depthLabel(r.depth)} × ${heightLabel(r.H)}`, r.bays.length + 1);
    for (const b of r.bays) for (const it of b.items) {
      if (it.t === 'shelf') add(`Shelf ${SHELF_LABEL[b.w]} × ${depthLabel(r.depth)}`);
      if (it.t === 'cab') add(`Cabinet with doors ${depthLabel(r.depth)} deep`);
      if (it.t === 'drawer') add(`Drawer ${depthLabel(r.depth)} deep`);
      if (it.t === 'table') add('Folding table 31½″');
    }
    add('OBSERVATÖR cross-brace');

    if (r.wall === 1) {
      checks.push([end <= ROOM.width, `Wall 1 run is ${ftin(len)} of the ${ftin(ROOM.width)} wall`]);
    } else if (r.wall === 2 || r.wall === 4) {
      const lim = limitFor(r.wall), op = firstOpening(r.wall);
      const what = op.type === 'door' ? 'door opening' : 'window';
      checks.push([end <= lim, end <= lim
        ? `${WALLS[r.wall].label} run ends at ${ftin(end)} from wall 1, ${ftin(lim - end)} before the ${what}`
        : `${WALLS[r.wall].label} run ends at ${ftin(end)}, ${ftin(end - lim)} past the ${what}`]);
    } else if (r.wall === 'peninsula') {
      checks.push([end <= PENINSULA_LIMIT, `Peninsula projects ${ftin(end)} into the room (limit ${ftin(PENINSULA_LIMIT)})`]);
      // aisle = half the room width minus half the peninsula minus a shallow wall run
      const aisle = ROOM.width / 2 - r.depth / 2 - DEPTH.shallow;
      checks.push(['info', `Aisles either side: about ${ftin(aisle)} wide`]);
    }
  }
  if (layout.runs.some((r) => r.bays.some((b) => b.items.some((i) => i.t === 'table')))) {
    checks.push(['info', 'Folding table opens 24″ past the shelf front at ~30″ high']);
  }
  return { checks, runs, parts };
}
