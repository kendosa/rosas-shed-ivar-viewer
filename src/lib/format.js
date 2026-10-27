// Inches → architectural feet-inches, rounded to 1/8".  ftin(52.31) → "4′-4⅜″"
const FRACS = { 1: '⅛', 2: '¼', 3: '⅜', 4: '½', 5: '⅝', 6: '¾', 7: '⅞' };

export function ftin(v) {
  const sign = v < 0 ? '-' : '';
  v = Math.abs(v);
  let ft = Math.floor(v / 12 + 1e-9);
  let eighths = Math.round((v - ft * 12) * 8);
  if (eighths === 96) { ft++; eighths = 0; }
  const whole = Math.floor(eighths / 8), fr = eighths % 8;
  const inches = (whole || !fr ? whole : '') + (fr ? FRACS[fr] : '');
  return sign + (ft ? ft + '′-' : '') + inches + '″';
}

export const depthLabel = (d) => (d < 15 ? '11¾″' : '19⅝″');
export const heightLabel = (h) => (h >= 89 ? '89″' : h >= 70 ? '70½″' : '49″');
