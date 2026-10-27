// Turns a layout run (data) into IVAR geometry placed in the room.
import * as THREE from 'three';
import { ROOM } from '../data/room.js';
import { POST, SPAN, CABINET_HEIGHT, DRAWER_HEIGHT, FOLDING_TABLE_DEPTH, runLength } from '../data/ivar.js';
import { MAT, box } from './materials.js';
import { fillShelf, tableTop } from './contents.js';

/**
 * @param {object} run  see src/data/layouts.js
 * @returns {{object: THREE.Group, contents: THREE.Group}}
 */
export function buildRun(run) {
  const len = runLength(run.bays), D = run.depth, H = run.H;
  // Local frame: x along the run, z = depth (0 at the wall, D at the front), y up.
  const g = new THREE.Group();
  const contents = new THREE.Group();
  g.add(contents);

  // IVAR side unit: two ladder rails with rungs
  const sideUnit = (x) => {
    g.add(box(POST, H, 1.5, MAT.pine, x, 0, 0));
    g.add(box(POST, H, 1.5, MAT.pine, x, 0, D - 1.5));
    const n = Math.max(2, Math.round(H / 22));
    for (let i = 0; i < n; i++) {
      const y = i === 0 ? 2 : i === n - 1 ? H - 3 : 2 + (i * (H - 5)) / (n - 1);
      g.add(box(POST, 1, D - 3, MAT.pineDark, x, y, 1.5));
    }
  };

  let x = 0;
  sideUnit(0);
  for (const b of run.bays) {
    const span = SPAN[b.w], x0 = x + POST;
    for (const it of b.items) {
      if (it.t === 'shelf') {
        g.add(box(span, 0.9, D - 0.4, MAT.pine, x0, it.y, 0.2));
        if (it.fill) fillShelf(contents, x0, span, it.y, D, it.fill);
      } else if (it.t === 'cab') {
        g.add(box(span, CABINET_HEIGHT, D - 0.6, MAT.pineDark, x0, 0.5, 0.3));
        const dw = span / 2 - 0.3;
        [x0 + 0.2, x0 + span / 2 + 0.1].forEach((dx, i) => {
          g.add(box(dw, CABINET_HEIGHT - 1.5, 0.75, MAT.pine, dx, 1.2, D - 0.8));
          g.add(box(0.8, 3, 0.8, MAT.knob, i ? dx + 1.5 : dx + dw - 2.3, 24, D));
        });
      } else if (it.t === 'drawer') {
        g.add(box(span, DRAWER_HEIGHT, D - 0.6, MAT.pineDark, x0, it.y, 0.3));
        g.add(box(span - 0.4, DRAWER_HEIGHT - 0.5, 0.75, MAT.pine, x0 + 0.2, it.y + 0.25, D - 0.8));
        g.add(box(4, 0.9, 0.9, MAT.knob, x0 + span / 2 - 2, it.y + 4.4, D));
      } else if (it.t === 'table') {
        const ext = FOLDING_TABLE_DEPTH;
        g.add(box(span, 1, ext, MAT.pine, x0, it.y, 0));
        g.add(box(1.2, it.y, 1.2, MAT.pineDark, x0 + 1, 0, ext - 2.2));
        g.add(box(1.2, it.y, 1.2, MAT.pineDark, x0 + span - 2.2, 0, ext - 2.2));
        tableTop(contents, x0, span, it.y, D);
      }
    }
    x += span + POST;
    sideUnit(x - POST);
  }

  // Place the local frame in the room so the back sits on the wall and the front faces in.
  const placed = new THREE.Group();
  placed.add(g);
  const W = ROOM.width;
  switch (run.wall) {
    case 1:           // along z, back at x=0, facing +x. Local x runs from z=start+len down to z=start.
      placed.position.set(0, 0, run.start + len);
      placed.rotation.y = Math.PI / 2;
      break;
    case 4:           // along x, back at z=0, facing +z
      placed.position.set(run.start, 0, 0);
      break;
    case 2:           // along x, back at z=W, facing -z
      placed.position.set(run.start + len, 0, W);
      placed.rotation.y = Math.PI;
      break;
    case 'peninsula': // freestanding, centered between walls 2 and 4, butted to wall 1
      placed.position.set(run.start, 0, W / 2 - D / 2);
      break;
  }
  return { object: placed, contents };
}
