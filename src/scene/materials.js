import * as THREE from 'three';

// Procedural pine grain so there are no image assets to manage.
function woodTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#dcbb8c';
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 70; i++) {
    const y = Math.random() * 256;
    g.strokeStyle = `rgba(${(150 + Math.random() * 40) | 0},${(100 + Math.random() * 30) | 0},${(55 + Math.random() * 20) | 0},${0.08 + Math.random() * 0.15})`;
    g.lineWidth = 0.6 + Math.random() * 1.8;
    g.beginPath();
    g.moveTo(0, y);
    for (let x = 0; x <= 256; x += 16) g.lineTo(x, y + Math.sin(x / 40 + i) * 2.5);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const wood = woodTexture();
const std = (o) => new THREE.MeshStandardMaterial(o);

export const MAT = {
  pine: std({ map: wood, roughness: 0.75 }),
  pineDark: std({ map: wood, roughness: 0.7, color: 0xe6d2b5 }),
  knob: std({ color: 0x8a6b45, roughness: 0.5 }),
  wall: std({ color: 0xeeece6, roughness: 0.95 }),
  wallEdge: std({ color: 0xc9c5bb, roughness: 0.9 }),
  floor: std({ color: 0xcdbfa6, roughness: 0.9 }),
  window: std({ color: 0x7fb3d9, transparent: true, opacity: 0.45, roughness: 0.1 }),
  door: std({ color: 0x8e9aa6, roughness: 0.6 }),
  limit: new THREE.MeshBasicMaterial({ color: 0xc9503a, transparent: true, opacity: 0.13, side: THREE.DoubleSide, depthWrite: false }),
  limitLine: new THREE.MeshBasicMaterial({ color: 0xc9503a }),
  wicker: std({ color: 0xb08a58, roughness: 1 }),
  jar: std({ color: 0xcfe3ea, transparent: true, opacity: 0.35, roughness: 0.05 }),
  steel: std({ color: 0x9aa0a6, metalness: 0.6, roughness: 0.35 }),
};

// Cached solid colors (yarn, roving, etc.)
const cache = new Map();
export function solid(hex) {
  if (!cache.has(hex)) cache.set(hex, std({ color: hex, roughness: 0.95 }));
  return cache.get(hex);
}

// Box with its min corner at (x,y,z) — easier to reason about than center-positioned boxes.
export function box(w, h, d, mat, x, y, z, shadow = true) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x + w / 2, y + h / 2, z + d / 2);
  m.castShadow = m.receiveShadow = shadow;
  return m;
}

// Any geometry, positioned by its center.
export function mesh(geo, mat, x, y, z) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  return m;
}
