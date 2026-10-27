# Rosa's Shed — IVAR layout viewer

A browser 3D viewer (Vite + three.js, plain ES modules, no framework) that compares
IKEA IVAR shelving layouts for the **wall 1 end** of Rosa's shed, a textile/fiber-art
studio. Kenny Phillips owns the project; Rosa is the client.

## Run it

```
npm install
npm run dev      # http://localhost:5173  (#A … #F in the URL opens a layout)
npm run check    # prints fit checks for every layout; exits 1 on any conflict
npm run build    # static site in dist/
```

Run `npm run check` after editing anything in `src/data/`.

## The design brief (don't break these)

- The room is 231″ × 133½″ inside, with 93″ walls. Walls 1 and 3 are the short ends.
  Walls 2 and 4 are the long walls.
- Shelving lives at the **wall 1 end**. Runs may sit on wall 1, on walls 2 and 4
  (perpendicular to wall 1), or stand free as a peninsula off wall 1.
- Runs on walls 2 and 4 **must stop before the first door or window on that wall**.
  `limitFor(wallId)` in `src/data/room.js` computes that line from the openings.
  A peninsula must stay behind the nearer of the two lines.
- Shelf contents should read as a **textile artist's studio**: mostly wool skeins
  and yarn, plus fiber materials and tools. That means skeins, yarn cones, baskets of
  yarn balls and roving, and jars of needles, hooks and spindles.
  Don't use books, generic boxes or fabric bolts.
- Wall 3 is a blank, full-height wall.

## Room geometry, coordinates and units

Everything is in **inches**. three.js world axes:

| axis | meaning |
|---|---|
| x | along walls 2/4, 0 at wall 1's inside face → 231 at wall 3 |
| z | along wall 1, 0 at wall 4's inside face → 133.5 at wall 2 |
| y | up |

Openings, measured from wall 1 (source of truth: `src/data/room.js`):

| wall | opening | from → to | sill → head |
|---|---|---|---|
| 4 (z=0) | door | 52.31 → 100.45 | 0 → 92 |
| 4 | window | 115.31 → 145.31 | 24.26 → 61.55 |
| 2 (z=133.5) | window | 39.71 → 73.26 | 30.08 → 78.55 |
| 2 | door | 140.0 → 188.0 | 0 → 92 |

So the limit lines are **52.31″ on wall 4** (the door) and **39.71″ on wall 2** (the window).

### Where these numbers came from

These numbers come from `reference/Rosas Shed - V2.skp`, read with `tools/extract_skp.py`
(output in `reference/extracted-geometry.json`). After that, two review notes from
Rosa and Kenny were applied:

1. Walls 2 and 4 are flipped end-for-end compared with the file. Each opening's
   `from` and `to` values were mirrored (231 − x).
2. Wall 3's small window from the file was removed.

If the SketchUp model changes, re-run the extractor. Then update `room.js` by hand,
keeping those two corrections unless told otherwise.

## Code map

```
src/
  data/room.js       room size, walls, openings, limitFor()
  data/ivar.js       IVAR catalog sizes + bay() helper + runLength()
  data/layouts.js    the A–F layout options (edit/add layouts here)
  lib/analyze.js     clearance checks + parts list (pure, no three.js)
  lib/format.js      ftin(): inches → 4′-4⅜″
  scene/setup.js     renderer, camera presets, lights, OrbitControls
  scene/room.js      floor/walls/openings/labels + red limit planes
  scene/ivar.js      buildRun(): side units, shelves, cabinets, drawers, folding table
  scene/contents.js  wool/yarn/tool props (seeded RNG, toggled as a group)
  scene/labels.js    canvas-sprite text labels
  main.js            UI glue: option list, sidebar, toolbar
tools/
  check-layouts.mjs  CLI fit check (npm run check)
  extract_skp.py     heuristic .skp geometry extractor
reference/
  standalone-viewer.html  the original single-file Claude artifact (r128, CDN)
  screenshots/, sketchup-preview.png
```

## IVAR model assumptions

- The side unit is 1½″ thick. A wide bay has a 32″ clear span (33″ shelf), and a
  narrow bay has a 16″ span (17″ shelf). This matches IKEA's listed overall widths:
  35″ for one section, 68½″ for two and 102″ for three.
- Depths are 11¾″ (shallow) or 19⅝″ (deep). Heights are 49″, 70½″ or 89″.
- The cabinet is 33″ tall and the drawer is 7⅛″ tall.
- The folding table opens to 35⅞″ deep, which is about 24″ past a shallow unit.
- Prices aren't modeled; only counts are.

## Adding a layout

Add an object to `LAYOUTS` in `src/data/layouts.js`:

```js
{ key: 'G', name: '…', tag: 'one-line summary', desc: 'sidebar paragraph',
  runs: [
    { wall: 1, start: 7, depth: DEPTH.shallow, H: 89,
      bays: [ bay('W', 89, { cab: true }), bay('N', 89, { fill: ['tools'] }) ] },
    { wall: 4, start: DEPTH.shallow, depth: DEPTH.shallow, H: 70.5, bays: [ bay('W', 70.5) ] },
  ] }
```

Notes:

- For wall 1, `start` is measured along z from wall 4.
- For walls 2, 4 and the peninsula, `start` is measured along x from wall 1. It's
  usually the depth of the wall 1 run, so the side run butts against it.
- Then run `npm run check`.

## Ideas / next steps Kenny may ask for

- Let the user drag or resize runs in the viewer, with live fit checks.
- Show the door swing arc (the hinge side is unknown; ask before assuming it).
- Add IKEA prices and a total, plus a shopping list export.
- Add the gable/roof from the SketchUp file (the `high wall 1/2` and `triangle`
  definitions).
- Add a GLTF export of the chosen layout so it can go back into SketchUp.
- Deploy `dist/` somewhere static (Netlify, GitHub Pages, Vercel).

## Conventions

- Plain JS ES modules. Keep `data/` and `lib/` free of three.js so they stay testable.
- Use inches everywhere internally. Format for display with `ftin()`.
- Keep the visual style: the pine wood texture, the muted palette in `style.css`,
  and the Familjen Grotesk / Atkinson Hyperlegible / JetBrains Mono fonts. Keep
  dark mode working.
