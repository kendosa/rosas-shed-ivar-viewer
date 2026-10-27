import * as THREE from 'three';

// Billboard text label (always faces the camera, drawn on top).
// size = height in inches (world units).
export function label(text, { size = 6, bg = 'rgba(34,37,43,0.86)', fg = '#fff' } = {}) {
  const c = document.createElement('canvas');
  const g = c.getContext('2d');
  const fs = 44;
  const font = `700 ${fs}px "Familjen Grotesk", Arial, sans-serif`;
  g.font = font;
  const w = Math.ceil(g.measureText(text).width) + 36;
  c.width = w;
  c.height = fs + 28;
  g.font = font;
  g.fillStyle = bg;
  const r = 12;
  g.beginPath();
  g.moveTo(r, 0);
  g.arcTo(w, 0, w, c.height, r);
  g.arcTo(w, c.height, 0, c.height, r);
  g.arcTo(0, c.height, 0, 0, r);
  g.arcTo(0, 0, w, 0, r);
  g.fill();
  g.fillStyle = fg;
  g.textBaseline = 'middle';
  g.fillText(text, 18, c.height / 2 + 2);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  const k = size / c.height;
  s.scale.set(w * k, c.height * k, 1);
  s.renderOrder = 10;
  return s;
}
