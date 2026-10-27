import * as THREE from 'three';
import './style.css';
import { LAYOUTS } from './data/layouts.js';
import { createViewer } from './scene/setup.js';
import { buildRoom, buildLimits } from './scene/room.js';
import { buildRun } from './scene/ivar.js';
import { reseed } from './scene/contents.js';
import { analyze } from './lib/analyze.js';

const $ = (id) => document.getElementById(id);
const viewer = createViewer($('view'));
const { scene, setView } = viewer;

scene.add(buildRoom());
const limits = buildLimits();
scene.add(limits);

const layoutGroup = new THREE.Group();
scene.add(layoutGroup);
let contentGroups = [];

// ---- option list ----
LAYOUTS.forEach((l, i) => {
  const b = document.createElement('button');
  b.className = 'opt';
  b.type = 'button';
  b.id = 'opt-' + l.key;
  b.innerHTML = `<span class="k">${l.key}</span><span><b>${l.name}</b><span>${l.tag}</span></span>`;
  b.addEventListener('click', () => select(i));
  $('opts').appendChild(b);
});

function select(i) {
  const lay = LAYOUTS[i];
  [...$('opts').children].forEach((b, j) => b.setAttribute('aria-pressed', String(j === i)));

  layoutGroup.clear();
  contentGroups = [];
  reseed(7 + i * 13);
  for (const r of lay.runs) {
    const { object, contents } = buildRun(r);
    layoutGroup.add(object);
    contentGroups.push(contents);
  }
  contentGroups.forEach((g) => (g.visible = $('tContents').checked));

  $('optTitle').textContent = `${lay.key}. ${lay.name}`;
  $('optDesc').textContent = lay.desc;
  const a = analyze(lay);
  $('checks').innerHTML = a.checks.map(([ok, t]) => {
    const cls = ok === 'info' ? 'info' : ok ? 'ok' : 'no';
    const txt = ok === 'info' ? 'NOTE' : ok ? 'FITS' : 'CONFLICT';
    return `<li><span class="pill ${cls}">${txt}</span><span>${t}</span></li>`;
  }).join('');
  $('runs').innerHTML = a.runs.map(([n, t]) => `<tr><td class="rn"><b>${n}</b></td><td class="mono">${t}</td></tr>`).join('');
  $('parts').innerHTML = Object.entries(a.parts).map(([k, n]) => `<tr><td>${k}</td><td class="n">${n}</td></tr>`).join('');
  location.hash = lay.key;
}

// ---- toolbar ----
$('vCorner').onclick = () => setView('corner');
$('vFront').onclick = () => setView('front');
$('vPlan').onclick = () => setView('plan');
$('tContents').onchange = (e) => contentGroups.forEach((g) => (g.visible = e.target.checked));
$('tLimits').onchange = (e) => (limits.visible = e.target.checked);

// start on the layout named in the URL hash (#A … #F), else A
const fromHash = LAYOUTS.findIndex((l) => l.key === location.hash.slice(1));
select(fromHash >= 0 ? fromHash : 0);
setView('corner');

// handy for debugging in the browser console
window.studio = { viewer, LAYOUTS, select };
