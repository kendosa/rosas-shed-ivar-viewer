// Visual shelf contents for a textile / fiber artist: wool skeins, yarn cones,
// wicker baskets of yarn balls & roving, and tool jars. Purely decorative —
// nothing here affects fit checks or the parts list.
import * as THREE from 'three';
import { MAT, box, mesh, solid } from './materials.js';

// Hand-dyed wool palette
export const YARN = [0x8a3b3b, 0xc9763e, 0xd9b44a, 0x6f8a4e, 0x3f6f7a, 0x2e4a7d, 0x6b4f7d, 0xb85c7a, 0xe9e2d0, 0xa89a86, 0x5a4a3c, 0xd8cfc0];

// Seeded RNG so each layout looks the same every time it's shown.
let seed = 1;
export const reseed = (s) => { seed = s; };
const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const yarn = () => YARN[(rnd() * YARN.length) | 0];

/**
 * Populate one shelf.
 * @param {THREE.Group} cg  group to add to (toggled by "Wool & tools")
 * @param {number} x0 left edge of the bay (local run coords)
 * @param {number} span clear width of the bay
 * @param {number} y shelf height
 * @param {number} D unit depth
 * @param {string} kind 'skeins' | 'cones' | 'baskets' | 'tools'
 */
export function fillShelf(cg, x0, span, y, D, kind) {
  const top = y + 0.9;
  if (kind === 'baskets' && span < 20) kind = 'tools';

  if (kind === 'skeins') {
    // twisted hanks lying front-to-back, stacked in a pyramid
    const r = 1.5, len = Math.min(10, D - 2), pitch = 2 * r + 0.3;
    const n = Math.floor((span - 1) / pitch);
    for (let layer = 0; layer < 3; layer++) {
      const cnt = n - layer;
      if (cnt < 1) break;
      const off = x0 + (span - cnt * pitch) / 2 + r + layer * (r + 0.15);
      for (let i = 0; i < cnt; i++) {
        const col = yarn();
        const sk = mesh(new THREE.CylinderGeometry(r, r, len, 10), solid(col), off + i * pitch, top + r + layer * (2 * r - 0.6), D / 2);
        sk.rotation.x = Math.PI / 2;
        cg.add(sk);
        cg.add(mesh(new THREE.TorusGeometry(r * 0.55, r * 0.35, 6, 10), solid(col), sk.position.x, sk.position.y, D / 2 + len / 2 - 0.3));
      }
    }
  } else if (kind === 'cones') {
    for (let x = x0 + 2.6; x < x0 + span - 2.4; x += 5.2) {
      cg.add(mesh(new THREE.CylinderGeometry(1.1, 2.4, 7.5, 14), solid(yarn()), x, top + 3.75, D * 0.35));
      cg.add(mesh(new THREE.CylinderGeometry(0.45, 0.7, 8.2, 8), solid(0xe8dcc4), x, top + 4.1, D * 0.35));
      if (D > 14) cg.add(mesh(new THREE.CylinderGeometry(1.1, 2.4, 7.5, 14), solid(yarn()), x, top + 3.75, D * 0.75));
    }
  } else if (kind === 'baskets') {
    const bw = span > 20 ? (span - 2.4) / 2 : span - 1.6;
    for (let x = x0 + 0.8; x + bw <= x0 + span - 0.4; x += bw + 0.8) {
      const bd = D - 2.5, bh = 7;
      cg.add(box(bw, 0.5, bd, MAT.wicker, x, top, 1.2));
      cg.add(box(bw, bh, 0.5, MAT.wicker, x, top, 1.2));
      cg.add(box(bw, bh, 0.5, MAT.wicker, x, top, 1.2 + bd - 0.5));
      cg.add(box(0.5, bh, bd, MAT.wicker, x, top, 1.2));
      cg.add(box(0.5, bh, bd, MAT.wicker, x + bw - 0.5, top, 1.2));
      const nb = Math.max(2, Math.floor(bw / 4.6));
      for (let i = 0; i < nb; i++) {
        const rr = 2 + rnd() * 0.5;
        const roving = rnd() < 0.3;
        const ball = mesh(new THREE.SphereGeometry(rr, 12, 10),
          solid(roving ? (rnd() < 0.5 ? 0xf1ece2 : 0x9c9389) : yarn()),
          x + 1.2 + rr + (i * (bw - 2.4 - 2 * rr)) / Math.max(1, nb - 1), top + bh - 0.6 + rnd() * 0.8, 1.2 + bd * (0.35 + rnd() * 0.3));
        if (roving) ball.scale.set(1.5, 0.8, 1.1);
        cg.add(ball);
      }
    }
  } else if (kind === 'tools') {
    const cx = x0 + span / 2, zc = D / 2;
    cg.add(mesh(new THREE.CylinderGeometry(2.2, 2.2, 6, 16), MAT.jar, cx - 3.6, top + 3, zc));
    for (let i = 0; i < 7; i++) {
      const n = mesh(new THREE.CylinderGeometry(0.15, 0.15, 12, 6), solid(i % 2 ? 0xc9a46a : 0x7a5a3a), cx - 3.6 + (rnd() - 0.5) * 2.5, top + 6, zc + (rnd() - 0.5) * 2.5);
      n.rotation.z = (rnd() - 0.5) * 0.35;
      cg.add(n);
    }
    cg.add(mesh(new THREE.CylinderGeometry(2, 2, 0.6, 20), MAT.pineDark, cx + 3.2, top + 5, zc)); // spindle whorl
    cg.add(mesh(new THREE.CylinderGeometry(0.25, 0.25, 10, 6), MAT.pine, cx + 3.2, top + 5, zc));
    cg.add(mesh(new THREE.SphereGeometry(1.6, 12, 10), solid(yarn()), cx + 3.2, top + 2, zc));
  }
}

/** Things set out on an opened folding table: project bag, yarn ball, shears. */
export function tableTop(cg, x0, span, y, D) {
  cg.add(box(12, 0.6, 9, solid(0xd9cdb6), x0 + span / 2 - 13, y + 1, D + 3));
  cg.add(mesh(new THREE.SphereGeometry(2.4, 14, 12), solid(0x8a3b3b), x0 + span / 2 + 6, y + 3.4, D + 8));
  cg.add(box(0.8, 0.4, 7, MAT.steel, x0 + span / 2 - 3, y + 1, D + 14));
  cg.add(box(0.8, 0.4, 7, MAT.steel, x0 + span / 2 - 2, y + 1.4, D + 14));
}
