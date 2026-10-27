import * as THREE from 'three';
import { ROOM, WALLS, limitFor, firstOpening } from '../data/room.js';
import { MAT, box } from './materials.js';
import { label } from './labels.js';
import { ftin } from '../lib/format.js';

const BLUE = 'rgba(46,74,125,.9)';
const RED = 'rgba(201,80,58,.92)';

/** Floor + four walls with door/window openings, plus wall labels. */
export function buildRoom() {
  const g = new THREE.Group();
  const { length: L, width: W, height: H, wallThickness: T } = ROOM;

  g.add(box(L + 2 * T, 1, W + 2 * T, MAT.floor, -T, -1, -T));

  for (const [id, wall] of Object.entries(WALLS)) {
    if (wall.axis === 'z') {
      // end walls (1 and 3): solid, full height
      const x = wall.outward < 0 ? wall.at - T : wall.at;
      g.add(box(T, H, W + 2 * T, MAT.wall, x, 0, -T));
      const s = label(wall.label);
      s.position.set(wall.at, H + 9, W / 2);
      g.add(s);
      continue;
    }
    // long walls (2 and 4): split around openings
    const z = wall.outward < 0 ? wall.at - T : wall.at;
    const ops = [...wall.openings].sort((a, b) => a.from - b.from);
    let cur = -T;
    const seg = (a, b, y0, y1) => { if (b - a > 0.01 && y1 - y0 > 0.01) g.add(box(b - a, y1 - y0, T, MAT.wall, a, y0, z)); };
    for (const o of ops) {
      seg(cur, o.from, 0, H);
      seg(o.from, o.to, 0, o.sill);
      seg(o.from, o.to, o.head, H);
      cur = o.to;
      if (o.type === 'window') {
        g.add(box(o.to - o.from, o.head - o.sill, 0.4, MAT.window, o.from, o.sill, z + T / 2 - 0.2, false));
        g.add(box(o.to - o.from, 1, T + 1, MAT.wallEdge, o.from, o.sill - 1, z - 0.5));
      } else {
        // closed door slab, set to the outside face
        g.add(box(o.to - o.from, o.head, 1.5, MAT.door, o.from, 0, wall.outward < 0 ? z : z + T - 1.5));
      }
      const tag = label(o.type === 'door' ? 'Door' : 'Window', { size: 4.5, bg: BLUE });
      tag.position.set((o.from + o.to) / 2, o.type === 'door' ? H - 6 : o.head + 4, wall.at + 2 * wall.outward);
      g.add(tag);
    }
    seg(cur, L + T, 0, H);
    const s = label(wall.label);
    s.position.set(60, H + 8, wall.at + 4 * wall.outward);
    g.add(s);
  }
  return g;
}

/** Translucent red planes marking where runs on walls 2 and 4 must stop. */
export function buildLimits() {
  const g = new THREE.Group();
  const H = ROOM.height;
  for (const id of [2, 4]) {
    const wall = WALLS[id];
    const x = limitFor(id);
    const op = firstOpening(id);
    const zA = wall.at, zB = wall.at - 30 * wall.outward; // 30" strip into the room
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(30, H), MAT.limit);
    plane.rotation.y = Math.PI / 2;
    plane.position.set(x, H / 2, (zA + zB) / 2);
    g.add(plane);
    g.add(box(1.2, 0.3, 30, MAT.limitLine, x - 0.6, 0.05, Math.min(zA, zB), false));
    const s = label(`${op.type === 'door' ? 'Door' : 'Window'} line ${ftin(x)}`, { size: 4.5, bg: RED });
    s.position.set(x, H + 2, wall.at - 10 * wall.outward);
    g.add(s);
  }
  return g;
}
