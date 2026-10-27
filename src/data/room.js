// Rosa's Shed V2 — interior geometry, in inches.
//
// Source: "reference/Rosas Shed - V2.skp" (parsed with tools/extract_skp.py),
// then adjusted per Rosa/Kenny's review:
//   • Walls 2 and 4 are flipped end-for-end relative to the file.
//   • Wall 3 is a blank full-height wall (the file had a small window there).
//
// WORLD COORDINATES (three.js, Y up)
//   x : along the long walls, 0 at the inside face of WALL 1, 231 at WALL 3
//   z : along wall 1, 0 at the inside face of WALL 4, 133.5 at WALL 2
//   y : up from the floor
//
// Opening spans are measured along x from wall 1 (for side walls).

export const ROOM = {
  name: "Rosa's Shed V2",
  length: 231,      // wall 1 → wall 3 (19'-3")
  width: 133.5,     // wall 4 → wall 2 (11'-1 1/2")
  height: 93,       // wall height (7'-9")
  wallThickness: 3.5,
};

// Each wall: where it sits and which way is "outside".
//   axis 'x' walls run along x (the long walls); 'z' walls run along z (the ends).
export const WALLS = {
  1: { label: 'Wall 1', axis: 'z', at: 0,            outward: -1, openings: [] },
  3: { label: 'Wall 3', axis: 'z', at: ROOM.length,  outward: +1, openings: [] },
  4: { label: 'Wall 4', axis: 'x', at: 0,            outward: -1, openings: [
       { type: 'door',   from: 52.31,  to: 100.45, sill: 0,     head: 92 },
       { type: 'window', from: 115.31, to: 145.31, sill: 24.26, head: 61.55 },
     ] },
  2: { label: 'Wall 2', axis: 'x', at: ROOM.width,   outward: +1, openings: [
       { type: 'window', from: 39.71,  to: 73.26,  sill: 30.08, head: 78.55 },
       { type: 'door',   from: 140.0,  to: 188.0,  sill: 0,     head: 92 },
     ] },
};

// The rule for this project: anything built against wall 2 or wall 4
// (perpendicular to wall 1) must stop before the first opening on that wall.
export function limitFor(wallId) {
  const w = WALLS[wallId];
  if (!w || w.axis !== 'x' || !w.openings.length) return Infinity;
  const first = [...w.openings].sort((a, b) => a.from - b.from)[0];
  return first.from;
}
export function firstOpening(wallId) {
  const w = WALLS[wallId];
  return [...w.openings].sort((a, b) => a.from - b.from)[0];
}
// A freestanding peninsula off wall 1 must stay behind the nearer of the two lines.
export const PENINSULA_LIMIT = Math.min(limitFor(2), limitFor(4));
