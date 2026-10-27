// The layout options shown in the viewer. Add, remove or edit entries here.
//
// A layout is a list of RUNS. Each run:
//   wall:   1 | 2 | 4 | 'peninsula'
//   start:  where the run begins, in inches
//             wall 1      → along z, measured from wall 4
//             wall 2 / 4  → along x, measured from wall 1 (usually = depth of the wall 1 run)
//             peninsula   → along x from wall 1; centered between walls 2 and 4
//   depth:  DEPTH.shallow (11 3/4") or DEPTH.deep (19 5/8")
//   H:      side unit height: 49, 70.5 or 89
//   bays:   list of bay(...) — see src/data/ivar.js
//
// Rule checked automatically (src/lib/analyze.js): runs on walls 2 and 4,
// and any peninsula, must end before the first door/window on that wall.

import { DEPTH, bay } from './ivar.js';
const S = DEPTH.shallow, D = DEPTH.deep;

export const LAYOUTS = [
  {
    key: 'A', name: 'Wall 1 library', tag: 'Tall run on wall 1 only, side walls left clear',
    desc: 'Four sections across wall 1 at full 89″ height: a cabinet base for notions, a fold-down work table for winding and blocking, a drawer bay for patterns and a narrow bay for needles, hooks and spindles. Walls 2 and 4 stay open for a pegboard of tools or a skein-drying rack.',
    runs: [
      { wall: 1, start: 7, depth: S, H: 89, bays: [
        bay('W', 89, { cab: true }), bay('W', 89, { table: 30 }), bay('W', 89, { drawers: [3, 11, 19] }), bay('N', 89, { fill: ['baskets'] }),
      ] },
    ],
  },
  {
    key: 'B', name: 'Corner L', tag: 'Wall 1 + wall 4, stops before the door',
    desc: 'Three tall sections on wall 1 wrap the corner into one 70½″ section along wall 4 with drawers. The return ends 5½″ before the door opening, so the doorway stays clear.',
    runs: [
      { wall: 1, start: 0, depth: S, H: 89, bays: [
        bay('W', 89, { fill: ['cones', 'cones', 'skeins', 'skeins', 'baskets', 'baskets'] }), bay('W', 89, { cab: true }), bay('W', 89, { table: 30 }),
      ] },
      { wall: 4, start: S, depth: S, H: 70.5, bays: [bay('W', 70.5, { drawers: [3, 11] })] },
    ],
  },
  {
    key: 'C', name: 'U-wrap', tag: 'All three walls, shallow 11¾″ depth',
    desc: 'A full-width run on wall 1 with returns on both side walls. The wall 4 return is one wide bay that stops 5½″ before the door, and the wall 2 return is a narrow 17″ bay that stops 9″ before the window.',
    runs: [
      { wall: 1, start: 7, depth: S, H: 89, bays: [
        bay('W', 89, { cab: true }), bay('W', 89, { table: 30 }), bay('W', 89, { cab: true }), bay('N', 89, { fill: ['baskets'] }),
      ] },
      { wall: 4, start: S, depth: S, H: 89, bays: [bay('W', 89, { drawers: [3, 11, 19], fill: ['cones', 'skeins', 'skeins', 'cones', 'baskets', 'baskets'] })] },
      { wall: 2, start: S, depth: S, H: 89, bays: [bay('N', 89, { fill: ['baskets', 'baskets', 'skeins', 'skeins', 'baskets', 'baskets'] })] },
    ],
  },
  {
    key: 'D', name: 'Fiber stacks', tag: 'Perpendicular aisles off wall 1',
    desc: 'Shelving runs perpendicular to wall 1: one along each side wall plus a double-sided 19⅝″ deep peninsula down the middle at 49″ so it reads as a landing surface. Aisles are 45″ wide on both sides, and every run stops short of the window on wall 2 and the door on wall 4.',
    runs: [
      { wall: 4, start: 0, depth: S, H: 70.5, bays: [bay('W', 70.5, { fill: ['cones', 'skeins', 'skeins', 'baskets', 'baskets'] })] },
      { wall: 'peninsula', start: 0, depth: D, H: 49, bays: [bay('W', 49, { fill: ['baskets', 'skeins', 'skeins'] })] },
      { wall: 2, start: 0, depth: S, H: 70.5, bays: [bay('W', 70.5, { fill: ['baskets', 'skeins', 'cones', 'skeins', 'baskets'] })] },
    ],
  },
  {
    key: 'E', name: 'Max storage, deep', tag: '19⅝″ deep everywhere it fits',
    desc: 'Deep side units hold raw fleece, roving baskets and a big cone stash. Wall 1 gets four tall sections, and each side wall gets one narrow bay: wall 4 stops 13⅝″ before the door, wall 2 stops 1″ before the window trim. Loses about 8″ of floor depth versus the shallow options.',
    runs: [
      { wall: 1, start: 7, depth: D, H: 89, bays: [
        bay('W', 89, { fill: ['cones', 'cones', 'cones', 'skeins', 'baskets', 'baskets'] }), bay('W', 89, { cab: true }), bay('W', 89, { drawers: [3, 11, 19] }), bay('N', 89, { fill: ['baskets'] }),
      ] },
      { wall: 4, start: D, depth: D, H: 89, bays: [bay('N', 89, { drawers: [3, 11], fill: ['cones', 'skeins', 'baskets', 'baskets'] })] },
      { wall: 2, start: D, depth: D, H: 89, bays: [bay('N', 89, { fill: ['baskets', 'skeins', 'skeins', 'baskets', 'baskets', 'baskets'] })] },
    ],
  },
  {
    key: 'F', name: 'Sewing nook', tag: 'Desk bay in the middle, low bay on wall 4',
    desc: 'Wall 1 is tall at both ends with a desk-height folding table in the middle bay for the machine. A 49″ bay on wall 4 gives a landing surface for blocking pieces and sorting skeins, and stops before the door.',
    runs: [
      { wall: 1, start: 15, depth: S, H: 89, bays: [
        bay('W', 89, { fill: ['baskets', 'baskets', 'skeins', 'skeins', 'cones', 'cones'] }), bay('W', 89, { table: 29, ys: [3, 52, 71, 87] }), bay('W', 89, { cab: true }),
      ] },
      { wall: 4, start: S, depth: S, H: 49, bays: [bay('W', 49, { drawers: [3, 11] })] },
    ],
  },
];
