import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Camera presets: [position, target] in room inches.
export const VIEWS = {
  corner: [[245, 200, 92], [30, 28, 66]],
  front: [[205, 55, 66.75], [0, 42, 66.75]],
  plan: [[88, 390, 67.5], [88, 0, 66.75]],
};

export function createViewer(host) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 1, 3000);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.maxPolarAngle = Math.PI * 0.495;

  const bg = () => getComputedStyle(document.documentElement).getPropertyValue('--canvas').trim() || '#e9e6df';
  scene.background = new THREE.Color(bg());
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { scene.background = new THREE.Color(bg()); });

  // Lighting (three r155+ uses physical light units, hence the larger intensities)
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb8b2a6, 2.4));
  const sun = new THREE.DirectionalLight(0xfff4e0, 2.2);
  sun.position.set(260, 320, -120);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -200, right: 200, top: 200, bottom: -200, near: 10, far: 900 });
  sun.target.position.set(100, 0, 66);
  scene.add(sun, sun.target);
  const fill = new THREE.DirectionalLight(0xdfe8ff, 0.8);
  fill.position.set(200, 150, 300);
  scene.add(fill);

  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(h, 1);
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(host);
  resize();

  function setView(name) {
    const [p, t] = VIEWS[name];
    camera.position.set(...p);
    controls.target.set(...t);
    controls.update();
  }

  renderer.setAnimationLoop(() => { controls.update(); renderer.render(scene, camera); });
  return { scene, camera, controls, renderer, setView };
}
