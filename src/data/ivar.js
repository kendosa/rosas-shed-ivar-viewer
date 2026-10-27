// IKEA IVAR system — US catalog sizes (inches), from
// https://www.ikea.com/us/en/cat/ivar-system-11703/ (checked Oct 2026).
//
// Overall widths IKEA lists: 1 section 35", 2 sections 68 1/2", 3 sections 102".
// That fits a model of 1 1/2" side units with a 32" clear span per wide bay,
// so each added wide bay is +33 1/2" and each narrow bay (17" shelf) is +17 1/2".

export const DEPTH = { shallow: 11.75, deep: 19.625 };   // side unit depths
export const HEIGHTS = [49, 70.5, 89];                    // side unit heights
export const POST = 1.5;                                  // side unit thickness
export const SPAN = { W: 32, N: 16 };                     // clear span: W = 33" shelf, N = 17" shelf
export const SHELF_LABEL = { W: '33″', N: '17″' };

export const CABINET_HEIGHT = 33;        // IVAR cabinet with doors, 31 x 12 (or 20) x 33
export const DRAWER_HEIGHT = 7.125;      // IVAR drawer, 31 1/2 x 11 3/4 (or 19 5/8) x 7 1/8
export const FOLDING_TABLE_DEPTH = 35.875; // folding table opens to 35 7/8" deep

export const bayWidth = (w) => SPAN[w] + POST;
export const runLength = (sections) => POST + sections.reduce((a, s) => a + bayWidth(s.w), 0);

// Default shelf heights (top of floor → underside of shelf) per side unit height.
export const defaultShelves = (H) =>
  H >= 89 ? [3, 20, 37, 54, 71, 87] : H >= 70 ? [3, 20, 37, 54, 69] : [3, 25, 47];

// What sits on each shelf (purely visual — see src/scene/contents.js):
//   'skeins'  stacked twisted hanks of wool
//   'cones'   upright yarn cones
//   'baskets' wicker baskets of yarn balls and roving
//   'tools'   jars of needles/hooks + drop spindle (auto-used for narrow bays)
export const DEFAULT_FILL = ['skeins', 'baskets', 'skeins', 'cones', 'skeins', 'baskets'];

/**
 * Build one IVAR bay.
 * @param {'W'|'N'} w     wide (33" shelf) or narrow (17" shelf)
 * @param {number}  H     side unit height (49, 70.5, 89)
 * @param {object}  opt
 *   cab:     true → cabinet with doors at the bottom
 *   drawers: [y,...] → drawers at these heights
 *   table:   y → folding table at this height (opens 24" past a shallow unit)
 *   ys:      custom shelf heights
 *   fill:    array of content kinds, cycled over the shelves
 */
export function bay(w, H, opt = {}) {
  let ys = opt.ys || defaultShelves(H);
  const items = [];
  if (opt.cab) {
    items.push({ t: 'cab' });
    ys = ys.filter((y) => y > CABINET_HEIGHT + 1);
    items.push({ t: 'shelf', y: CABINET_HEIGHT + 1 });
  }
  if (opt.drawers) {
    opt.drawers.forEach((y) => items.push({ t: 'drawer', y }));
    ys = ys.filter((y) => !opt.drawers.some((d) => y >= d - 1 && y < d + 8));
  }
  if (opt.table) {
    items.push({ t: 'table', y: opt.table });
    ys = ys.filter((y) => y > opt.table + 20 || y < 4);
  }
  const fill = opt.fill || DEFAULT_FILL;
  ys.forEach((y, i) => items.push({ t: 'shelf', y, fill: fill[i % fill.length] }));
  return { w, items };
}
