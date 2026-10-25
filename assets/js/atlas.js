/* ============================================================
   The atlas: a voxel diorama of the portfolio.
   Seven landmarks on a floating island. Drag to orbit,
   hover to highlight, click to open the dossier.
   ============================================================ */

import * as THREE from '../vendor/three.module.min.js';
import { PROJECTS } from './data.js';

const VOXEL = 1;

const PALETTE = {
  /* The first pass was tuned on a bright screen and read as dark gray
     masses on the page's near-black ground — pixel-sampling measured a
     median luminance of 17/255 for the whole diorama. The structures are
     the centerpiece, not the void around them, so every base tone is
     lifted and the lights pushed until the models pop against #05070E. */
  base: 0x18213a,
  baseEdge: 0x2a3a5e,
  ground: 0x1f2c48,
  grass: 0x27506a,
  stone: 0x3a4a70,
  glass: 0x54e1ff,
  amber: 0xffb65c,
  magenta: 0xff5c9a,
  green: 0x7cf29b,
  white: 0xeaf1ff
};

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- tiny voxel helpers ---------- */

function voxel(color, x, y, z, size = VOXEL) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(size, size, size),
    new THREE.MeshLambertMaterial({ color })
  );
  mesh.position.set(x, y, z);
  return mesh;
}

function box(color, w, h, d, x, y, z, emissive = 0) {
  const material = new THREE.MeshLambertMaterial({
    color,
    emissive: emissive ? color : 0x000000,
    emissiveIntensity: emissive
  });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  return mesh;
}

/* ---------- island ---------- */

function buildIsland(group) {
  // Collected so setGround can retint the whole terrain for a theme.
  const groundMats = [];
  const groundMat = (color) => {
    const m = new THREE.MeshLambertMaterial({ color });
    groundMats.push(m);
    return m;
  };
  group.userData.groundMats = groundMats;

  const top = new THREE.Mesh(
    new THREE.BoxGeometry(24, 1.6, 17),
    groundMat(PALETTE.base)
  );
  top.position.y = -0.8;
  group.add(top);

  // soil rim
  const rim = new THREE.Mesh(
    new THREE.BoxGeometry(25, 0.6, 18),
    groundMat(PALETTE.baseEdge)
  );
  rim.position.y = -0.3;
  group.add(rim);

  // grass tiles with a deterministic scattered pattern
  let seed = 7;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let i = 0; i < 58; i++) {
    const x = -10.5 + rand() * 21;
    const z = -7 + rand() * 14;
    const h = 0.18 + rand() * 0.24;
    const tile = new THREE.Mesh(
      new THREE.BoxGeometry(0.9 + rand() * 1.5, h, 0.9 + rand() * 1.5),
      groundMat(rand() > 0.72 ? PALETTE.grass : PALETTE.ground)
    );
    tile.position.set(x, h / 2, z);
    tile.rotation.y = Math.round(rand() * 4) * (Math.PI / 2);
    group.add(tile);
  }

  // underside crystals — depth below the island
  for (let i = 0; i < 26; i++) {
    const x = -10 + rand() * 20;
    const z = -6.5 + rand() * 13;
    const depth = 0.8 + rand() * 2.4;
    const shard = new THREE.Mesh(
      new THREE.ConeGeometry(0.34 + rand() * 0.3, depth, 4),
      groundMat(0x101a2e)
    );
    shard.position.set(x, -1.6 - depth / 2, z);
    shard.rotation.y = rand() * Math.PI;
    group.add(shard);
  }
}

/* ---------- landmarks ---------- */

// A billboard carrying the project's real screenshot, so the map itself shows the
// work instead of abstract shapes. Two crossed planes keep it readable from any
// orbit angle without needing a per-frame billboard shader.
//
// Size matters: at 2.6 world units the screenshot rendered ~65 CSS px wide —
// a grey rectangle you could not read. At 4.6 it is legible at rest, and it
// scales up further on hover/focus so the detail is always reachable.
const SCREEN_W = 4.6;
const SCREEN_H = 2.88;
const SCREEN_POST = 0.55;
const SCREEN_HOVER_SCALE = 1.35;

// Height each landmark's own geometry reaches, so the screenshot billboard can
// be mounted just above it and the label anchor just above that.
const LANDMARK_TOP = { owl: 4.4, store: 3.1, antenna: 5.6, vault: 3.3, radar: 3.4, shield: 3.5, pitch: 2.1 };

const screenTop = (landmark) =>
  (LANDMARK_TOP[landmark] ?? 3.2) + SCREEN_POST + SCREEN_H + 0.24;

function buildScreen(project, color) {
  const group = new THREE.Group();
  const W = SCREEN_W;
  const H = SCREEN_H;

  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(W + 0.24, H + 0.24, 0.12),
    new THREE.MeshLambertMaterial({ color: 0x1a2540 })
  );
  group.add(frame);

  const texture = new THREE.TextureLoader().load(project.images[0].src, (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.minFilter = THREE.LinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.generateMipmaps = false;
    t.needsUpdate = true;
  });
  const screenMat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });

  const a = new THREE.Mesh(new THREE.PlaneGeometry(W, H), screenMat);
  a.position.z = 0.07;
  group.add(a);
  const b = new THREE.Mesh(new THREE.PlaneGeometry(W, H), screenMat);
  b.rotation.y = Math.PI / 2;
  b.position.x = 0.07;
  group.add(b);

  // A lit strip along the top edge keeps the screen reading as hardware.
  const strip = new THREE.Mesh(
    new THREE.BoxGeometry(W + 0.24, 0.07, 0.14),
    new THREE.MeshBasicMaterial({ color })
  );
  strip.position.y = H / 2 + 0.12;
  group.add(strip);

  // Post drops from the screen's bottom edge. The group is later positioned so
  // the post lands exactly on the model's top.
  const bottom = -H / 2 - 0.12;
  const post = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, SCREEN_POST, 0.1),
    new THREE.MeshLambertMaterial({ color: 0x1a2540 })
  );
  post.position.y = bottom - SCREEN_POST / 2;
  group.add(post);

  return group;
}

function buildLandmark(project, color) {
  const g = new THREE.Group();
  const mat = new THREE.MeshLambertMaterial({ color });
  const glow = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.16 });

  const add = (mesh) => g.add(mesh);

  switch (project.landmark) {
    case 'owl': {
      // Athenas — the owl mascot, rebuilt in voxels
      const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.8, 1.6), mat);
      body.position.y = 2.6;
      add(body);
      add(voxel(0x111a2b, -0.6, 3.6, 0.85));
      add(voxel(0x111a2b, 0.6, 3.6, 0.85));
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x54e1ff });
      const eyeGeo = new THREE.BoxGeometry(0.5, 0.5, 0.3);
      const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
      eyeL.position.set(-0.55, 3.75, 0.86);
      const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
      eyeR.position.set(0.55, 3.75, 0.86);
      add(eyeL, eyeR);
      add(voxel(0xeaf1ff, 0, 3.05, 0.9, 0.4));
      const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2, 1.4), mat);
      wingL.position.set(-1.6, 2.4, 0);
      wingL.rotation.z = 0.2;
      const wingR = wingL.clone();
      wingR.position.x = 1.6;
      wingR.rotation.z = -0.2;
      add(wingL, wingR);
      add(voxel(0x1a2540, -0.6, 1.1, 0.3, 0.5));
      add(voxel(0x1a2540, 0.6, 1.1, 0.3, 0.5));
      const halo = new THREE.Mesh(new THREE.TorusGeometry(1.9, 0.12, 6, 16), glow);
      halo.rotation.x = Math.PI / 2;
      halo.position.y = 4.4;
      add(halo);
      g.userData.spin = halo;
      break;
    }
    case 'store': {
      // E-Commerce — shop block with striped awning
      add(box(0x24314e, 4, 2.4, 3, 0, 1.2, 0));
      add(box(color, 4.2, 0.4, 3.2, 0, 2.6, 0, 0.35));
      for (let i = 0; i < 5; i++) {
        const awn = box(i % 2 ? 0xfaf3e0 : color, 0.8, 0.35, 3.4, -1.6 + i * 0.8, 2.15, 0.2);
        awn.rotation.x = -0.18;
        add(awn);
      }
      add(box(0x0c1120, 1.1, 1.6, 0.2, 0, 0.8, 1.55));
      add(box(color, 0.7, 0.7, 0.16, 1.2, 1.4, 1.6, 0.6));
      const sign = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.35, 0.16), new THREE.MeshBasicMaterial({ color }));
      sign.position.set(0, 3.1, 0);
      add(sign);
      g.userData.spin = sign;
      break;
    }
    case 'antenna': {
      // Social — realtime tower with pulsing rings
      add(box(0x1b2540, 0.6, 5.2, 0.6, 0, 2.6, 0));
      add(box(color, 3.4, 0.4, 0.5, 0, 4.6, 0, 0.5));
      add(box(color, 0.5, 0.4, 3.4, 0, 4.0, 0, 0.4));
      const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5 });
      for (let i = 0; i < 3; i++) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(1.1 + i * 0.75, 0.07, 5, 20), ringMat.clone());
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 5.4;
        ring.userData.phase = i * 0.7;
        add(ring);
        g.userData.rings = g.userData.rings || [];
        g.userData.rings.push(ring);
      }
      add(voxel(0x7cf29b, 0, 5.9, 0, 0.5));
      break;
    }
    case 'vault': {
      // CashPilot — safe with a dial
      add(box(0x223050, 3.2, 3.2, 2.4, 0, 1.6, 0));
      add(box(color, 2.6, 2.6, 0.2, 0, 1.6, 1.25, 0.18));
      const dial = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.16, 6, 16), new THREE.MeshBasicMaterial({ color }));
      dial.position.set(0, 1.7, 1.4);
      add(dial);
      const bar = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.14, 0.14), new THREE.MeshBasicMaterial({ color }));
      bar.position.set(0, 1.7, 1.5);
      bar.rotation.z = 0.5;
      add(bar);
      add(box(0x1a2540, 3.6, 0.3, 2.8, 0, 3.35, 0));
      g.userData.spin = dial;
      break;
    }
    case 'radar': {
      // PriceHawk — tracking dish
      const dish = new THREE.Mesh(
        new THREE.SphereGeometry(1.5, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2.4),
        new THREE.MeshLambertMaterial({ color, side: THREE.DoubleSide })
      );
      dish.position.y = 2.6;
      dish.rotation.x = Math.PI;
      add(dish);
      add(box(0x223050, 0.5, 2.6, 0.5, 0, 1.3, 0));
      add(box(0x1a2540, 2.2, 0.3, 1.6, 0, 0.15, 0));
      const sweep = new THREE.Mesh(
        new THREE.RingGeometry(1.5, 1.9, 24, 1, 0, Math.PI / 2),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3, side: THREE.DoubleSide })
      );
      sweep.rotation.x = -Math.PI / 2;
      sweep.position.y = 0.45;
      add(sweep);
      g.userData.spin = sweep;
      break;
    }
    case 'shield': {
      // OsSecurity — guardian shield
      add(box(0x1b2540, 0.5, 3.4, 0.5, 0, 1.7, 0));
      const shieldShape = new THREE.Shape();
      shieldShape.moveTo(-1.4, 0.9);
      shieldShape.lineTo(1.4, 0.9);
      shieldShape.lineTo(1.4, -0.4);
      shieldShape.quadraticCurveTo(1.2, -1.7, 0, -2.2);
      shieldShape.quadraticCurveTo(-1.2, -1.7, -1.4, -0.4);
      shieldShape.closePath();
      const shield = new THREE.Mesh(
        new THREE.ExtrudeGeometry(shieldShape, { depth: 0.4, bevelEnabled: false }),
        new THREE.MeshLambertMaterial({ color })
      );
      shield.position.set(0, 3.3, 0.25);
      add(shield);
      const lock = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.1, 6, 14), new THREE.MeshBasicMaterial({ color: 0x7cf29b }));
      lock.position.set(0, 1.6, 0.3);
      add(lock);
      g.userData.spin = shield;
      break;
    }
    default: {
      // Football Predictor — tiny pitch with goal + scoreboard
      add(box(0x1c3a4a, 5, 0.3, 3.4, 0, 0.15, 0));
      for (let i = 0; i < 5; i++) {
        add(box(0x2a3550, 0.08, 0.05, 3.2, -2 + i, 0.33, 0));
      }
      add(box(0x2a3550, 0.12, 1.1, 2.4, -2.5, 0.85, 0));
      add(box(0x2a3550, 0.12, 1.1, 2.4, 2.5, 0.85, 0));
      const ball = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshBasicMaterial({ color }));
      ball.position.set(0, 0.7, 0);
      add(ball);
      const board = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.7, 0.2), new THREE.MeshBasicMaterial({ color }));
      board.position.set(0, 2.1, -1.2);
      add(board);
      add(box(0x1b2540, 0.25, 1.6, 0.25, -1, 0.9, -1.2));
      add(box(0x1b2540, 0.25, 1.6, 0.25, 1, 0.9, -1.2));
      g.userData.spin = ball;
    }
  }

  // ground pad under each landmark
  const pad = new THREE.Mesh(
    new THREE.CylinderGeometry(3.1, 3.3, 0.16, 16),
    new THREE.MeshLambertMaterial({ color: 0x101a2e })
  );
  pad.position.y = 0.08;
  g.add(pad);

  // The project's real screenshot, raised above the model on a post.
  const base = LANDMARK_TOP[project.landmark] ?? 3.2;
  const screen = buildScreen(project, color);
  // Screen centre sits one post-length above the model's top.
  screen.position.set(0, base + SCREEN_POST + SCREEN_H / 2 + 0.12, 0);
  g.add(screen);
  g.userData.screen = screen;

  const halo = new THREE.Mesh(
    new THREE.RingGeometry(3.2, 3.45, 32),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.2, side: THREE.DoubleSide })
  );
  halo.rotation.x = -Math.PI / 2;
  halo.position.y = 0.16;
  g.add(halo);
  g.userData.halo = halo;

  g.userData.color = color;
  return g;
}

/* ---------- scene ---------- */

export function createAtlas(canvas, { onSelect, onHover } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth || 800, canvas.clientHeight || 600, false);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05070e, 0.018);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
  camera.position.set(0, 12, 26);

  scene.add(new THREE.HemisphereLight(0x9fd8ff, 0x0a0f1c, 1.55));
  const key = new THREE.DirectionalLight(0xffffff, 1.25);
  key.position.set(10, 18, 12);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x54e1ff, 0.9);
  rim.position.set(-12, 6, -10);
  scene.add(rim);
  const fill = new THREE.PointLight(0x9fd8ff, 16, 46);
  fill.position.set(6, 4, 10);
  scene.add(fill);

  const world = new THREE.Group();
  scene.add(world);
  buildIsland(world);

  // stars
  const starCount = 420;
  const positions = new Float32Array(starCount * 3);
  let seed = 99;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let i = 0; i < starCount; i++) {
    positions[i * 3] = (rand() - 0.5) * 150;
    positions[i * 3 + 1] = rand() * 70 - 12;
    positions[i * 3 + 2] = (rand() - 0.5) * 150;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const stars = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({ color: 0x8c9abb, size: 0.28, transparent: true, opacity: 0.4 })
  );
  scene.add(stars);

  // landmarks
  const layout = [
    [-7.4, 0, -4.4],
    [0, 0, -6.4],
    [7.4, 0, -4.4],
    [-7.4, 0, 3.6],
    [0, 0, 5.8],
    [7.4, 0, 3.6],
    [0, 0, 0]
  ];
  const landmarks = [];
  PROJECTS.forEach((project, i) => {
    const color = new THREE.Color(project.hue).getHex();
    const group = buildLandmark(project, color);
    group.position.set(layout[i][0], 0.2, layout[i][2]);
    group.userData.project = project;
    world.add(group);
    landmarks.push(group);
  });

  // labels
  const labelRoot = document.createElement('div');
  labelRoot.className = 'atlas-labels';
  canvas.parentElement.appendChild(labelRoot);

  const labels = landmarks.map((group) => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'atlas-label';
    el.dataset.project = group.userData.project.id;
    // The visible chip can be demoted to a bare number on a phone, which
    // leaves a screen reader announcing "03" with no project name.
    el.setAttribute('aria-label', `Open ${group.userData.project.name} dossier`);
    el.innerHTML = `<span class="atlas-label-name">${group.userData.project.name}</span>`;
    // Open on pointerdown, not click. The label is rewritten every frame to
    // follow the orbiting camera, so by the time a `click` fires the element
    // has moved out from under the pointer and the browser cancels the
    // click — roughly a third of landmark taps did nothing. Pointerdown
    // fires while the label is still under the finger.
    el.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      e.preventDefault();
      e.stopPropagation();
      onSelect?.(group.userData.project.id);
    });
    // Keyboard users still need a click path — Enter/Space on a button fires
    // a `click` with no pointerdown before it.
    el.addEventListener('click', (e) => {
      if (e.detail === 0) onSelect?.(group.userData.project.id);
    });
    labelRoot.appendChild(el);
    return { el, group, w: 0, keyW: 0 };
  });

  // Cache label widths so the render loop can declutter without forcing layout.
  // Re-measured on resize: the narrow/wide class changes the label's width.
  const cacheLabelWidths = () => {
    for (const l of labels) {
      l.w = l.el.offsetWidth;
      l.keyW = (l.el.querySelector('.atlas-label-key')?.offsetWidth || 0) + 18;
    }
  };
  requestAnimationFrame(cacheLabelWidths);

  /* ---------- interaction ---------- */

  // Points that must stay inside the frame: the island corners and the label
  // anchor height above each landmark.
  const FIT_POINTS = [];
  for (const group of landmarks) {
    const p = group.position;
    FIT_POINTS.push(new THREE.Vector3(p.x, 0, p.z));
  }
  const ISLAND_HALF_W = 12;
  const ISLAND_HALF_D = 8.5;
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      FIT_POINTS.push(new THREE.Vector3(sx * ISLAND_HALF_W, 0, sz * ISLAND_HALF_D));
    }
  }

  const TARGET = new THREE.Vector3(0, 1.6, 0);
  const _v = new THREE.Vector3();

  const placeCamera = (d, az, pol) => {
    const sinP = Math.sin(pol);
    camera.position.set(d * sinP * Math.sin(az), d * Math.cos(pol) + 2, d * sinP * Math.cos(az));
    camera.lookAt(TARGET);
  };

  // Smallest camera distance that keeps every fit point inside the frame.
  // Binary search against three.js's own projection — no hand-derived frustum math.
  const fitDistance = (az, pol) => {
    const inside = (d) => {
      placeCamera(d, az, pol);
      camera.updateMatrixWorld(true);
      for (const p of FIT_POINTS) {
        _v.copy(p).project(camera);
        if (Math.abs(_v.x) > 0.9 || Math.abs(_v.y) > 0.9) return false;
      }
      // Label anchors must clear the top edge too.
      for (const group of landmarks) {
        _v.set(group.position.x, group.userData.labelY ?? 4.6, group.position.z).project(camera);
        if (Math.abs(_v.x) > 0.9 || Math.abs(_v.y) > 0.9) return false;
      }
      return true;
    };
    if (inside(18)) return 18;
    let lo = 18;
    let hi = 160;
    if (!inside(hi)) return hi;
    for (let i = 0; i < 22; i++) {
      const mid = (lo + hi) / 2;
      if (inside(mid)) hi = mid;
      else lo = mid;
    }
    return hi;
  };

  // The island is 24 wide x 17 deep. On a portrait viewport the long axis must run
  // vertically on screen, so view it from the side instead of across its width.
  const homeCamera = () => {
    const a = camera.aspect || 1;
    return a < 0.95 ? { azimuth: Math.PI / 2, polar: 0.78 } : { azimuth: 0.28, polar: 0.82 };
  };

  let userAdjusted = false;
  let baseDistance = 46;
  let zoom = 1;
  // Phone-width layout: no billboard screens, smaller/fainter halos.
  let compact = false;
  const home = { azimuth: 0.28, polar: 0.82 };
  let targetAzimuth = home.azimuth;
  let targetPolar = home.polar;
  let targetDistance = 46;
  let azimuth = targetAzimuth;
  let polar = targetPolar;
  let distance = targetDistance;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let pointerMoved = false;

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let hovered = null;
  // Set when something other than camera motion changes the labels — a hover
  // swap, a resize, a viewport-class change. The frame loop uses it to skip
  // the expensive declutter when the camera has settled.
  let labelsDirty = true;

  const onPointerDown = (e) => {
    dragging = true;
    pointerMoved = false;
    lastX = e.clientX;
    lastY = e.clientY;
    canvas.classList.add('dragging');
    canvas.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    if (dragging) {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      if (Math.abs(dx) + Math.abs(dy) > 3) pointerMoved = true;
      targetAzimuth -= dx * 0.006;
      targetPolar = Math.max(0.42, Math.min(1.42, targetPolar - dy * 0.004));
      userAdjusted = true;
      lastX = e.clientX;
      lastY = e.clientY;
      return;
    }

    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(landmarks, true);
    let hit = null;
    for (const h of hits) {
      let node = h.object;
      while (node && !node.userData.project) node = node.parent;
      if (node) { hit = node; break; }
    }
    const next = hit ? hit.userData.project.id : null;
    if (next !== hovered) {
      hovered = next;
      labelsDirty = true;
      canvas.style.cursor = hovered ? 'pointer' : 'grab';
      onHover?.(hovered);
    }
  };

  const onPointerUp = (e) => {
    dragging = false;
    canvas.classList.remove('dragging');
    canvas.releasePointerCapture?.(e.pointerId);
    if (!pointerMoved) {
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(landmarks, true);
      for (const h of hits) {
        let node = h.object;
        while (node && !node.userData.project) node = node.parent;
        if (node) { onSelect?.(node.userData.project.id); break; }
      }
    }
  };

  // A touch scroll cancels the pointer — that must never count as a tap.
  const onPointerCancel = (e) => {
    dragging = false;
    pointerMoved = true;
    canvas.classList.remove('dragging');
    canvas.releasePointerCapture?.(e.pointerId);
  };

  // Zoom is opt-in (ctrl/⌘ + wheel) so the diorama never traps page scroll.
  const onWheel = (e) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    zoom = Math.max(0.6, Math.min(1.5, zoom - e.deltaY * 0.0012));
    userAdjusted = true;
  };

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerCancel);
  canvas.addEventListener('pointerleave', () => { hovered = null; onHover?.(null); });
  canvas.addEventListener('wheel', onWheel, { passive: false });
  /* ---------- resize ---------- */

  const resize = () => {
    const w = canvas.clientWidth || 800;
    const h = canvas.clientHeight || 600;
    renderer.setSize(w, h, false);
    const prevAspect = camera.aspect;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (!userAdjusted) {
      const h0 = homeCamera();
      targetAzimuth = h0.azimuth;
      targetPolar = h0.polar;
    }
    // A major aspect change (rotation / breakpoint) invalidates the current framing.
    if (prevAspect && Math.abs(prevAspect - camera.aspect) > 0.35) {
      userAdjusted = false;
      const h0 = homeCamera();
      targetAzimuth = h0.azimuth;
      targetPolar = h0.polar;
      zoom = 1;
    }
    // On a phone the diorama is small enough that billboard screens become
    // unreadable clutter and collide with the label chips. Drop them there and
    // let the manifest below carry the same information. This must run before
    // `fitDistance`, which reads the label anchor heights.
    compact = w < 560;
    for (const group of landmarks) {
      const screen = group.userData.screen;
      if (screen) screen.visible = !compact;
      // The halos read as huge concentric circles on a phone because the camera
      // pulls back to fit the whole island. Shrink and fade them there.
      const halo = group.userData.halo;
      if (halo) {
        halo.scale.setScalar(compact ? 0.52 : 1);
        halo.material.opacity = compact ? 0.1 : 0.2;
      }
      // Without screens the models sit lower, so labels anchor lower too.
      group.userData.labelY = compact
        ? (LANDMARK_TOP[group.userData.project.landmark] ?? 3.2) + 0.6
        : screenTop(group.userData.project.landmark) + 1.1;
    }

    baseDistance = fitDistance(targetAzimuth, targetPolar);
    if (!dragging) distance = targetDistance = baseDistance * zoom;
    // The narrow/wide class and the camera framing both changed.
    cacheLabelWidths();
    labelsDirty = true;
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();

  /* ---------- loop ---------- */

  const projected = new THREE.Vector3();
  let last = performance.now();
  let raf = 0;
  let elapsed = 0;

  // The diorama only burns GPU while it is actually on screen and the tab is
  // visible. Off-screen it stops entirely.
  let onScreen = true;
  let tabVisible = true;
  let live = false;

  const startLoop = () => {
    if (raf || !onScreen || !tabVisible) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };
  const stopLoop = () => {
    if (!raf) return;
    cancelAnimationFrame(raf);
    raf = 0;
  };

  const frame = (now) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    elapsed += dt;
    // The static placeholder retires on the first real frame, not at setup:
    // retiring it early left the panel blank when WebGL built but the first
    // frame had not landed yet.
    if (!live) {
      live = true;
      canvas.parentElement?.classList.add('atlas-live');
    }

    const ease = reducedMotion ? 1 : 1 - Math.pow(0.0016, dt);
    const prevAzimuth = azimuth;
    const prevPolar = polar;
    const prevDistance = distance;
    azimuth += (targetAzimuth - azimuth) * ease;
    polar += (targetPolar - polar) * ease;
    const wanted = baseDistance * zoom;
    targetDistance += (wanted - targetDistance) * ease;
    distance += (targetDistance - distance) * ease;

    placeCamera(distance, azimuth, polar);

    // Reduced motion: the scene must hold still, not drift. The idle sway is
    // removed entirely — every label is a stationary target. The diorama
    // still lives through the spinning rings, drifting stars and hover
    // billboards; what it no longer does is move the things people tap.
    if (!reducedMotion) {
      stars.rotation.y = elapsed * 0.006;
    }

    for (const group of landmarks) {
      const spin = group.userData.spin;
      if (spin && !reducedMotion) {
        if (spin.geometry.type === 'RingGeometry') spin.rotation.z = elapsed * 0.9;
        else spin.rotation.y = elapsed * 0.8;
      }
      if (group.userData.rings && !reducedMotion) {
        group.userData.rings.forEach((ring, i) => {
          const t = (elapsed * 0.8 + ring.userData.phase) % 2.4;
          ring.scale.setScalar(0.6 + t * 0.8);
          ring.material.opacity = Math.max(0, 0.55 - t * 0.22);
        });
      }
      // The hovered landmark's billboard grows so its screenshot can actually be
      // read. This is the payoff interaction: hover to inspect, click to open.
      const screen = group.userData.screen;
      if (screen) {
        const wanted = group.userData.project.id === hovered ? SCREEN_HOVER_SCALE : 1;
        const s = group.userData.screenScale ?? 1;
        const next = reducedMotion ? wanted : s + (wanted - s) * (1 - Math.pow(0.002, dt));
        group.userData.screenScale = next;
        screen.scale.setScalar(next);
      }
    }

    renderer.render(scene, camera);

    // project labels to screen space
    const rect = canvas.getBoundingClientRect();
    // The camera eases toward its target, so it is almost always "moving" by a
    // fraction of a pixel. The declutter below is the expensive part — it
    // measures every label and nudges them apart — and it only needs to run
    // when a label would actually change position. Below this threshold the
    // camera has settled and the previous layout still holds.
    const cameraMoved =
      Math.abs(prevAzimuth - azimuth) > 0.0006 ||
      Math.abs(prevPolar - polar) > 0.0006 ||
      Math.abs(prevDistance - distance) > 0.01 ||
      labelsDirty;

    for (const l of labels) {
      const { el, group } = l;
      projected.set(0, group.userData.labelY ?? screenTop(group.userData.project.landmark) + 1.1, 0);
      group.localToWorld(projected);
      projected.project(camera);
      const x = (projected.x * 0.5 + 0.5) * rect.width;
      const y = (-projected.y * 0.5 + 0.5) * rect.height;
      const visible = projected.z < 1;
      // Off-canvas landmarks are not merely invisible — they are still
      // buttons, so Tab walked into invisible map furniture before reaching
      // the hero copy. Take them out of the tab order.
      const onScreen = visible && x > -40 && x < rect.width + 40 && y > -20 && y < rect.height + 20;
      l.x = x;
      l.y = y;
      l.visible = visible;
      l.onScreen = onScreen;
      if (!cameraMoved) continue;
      el.style.transform = `translate(-50%,-100%) translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
      el.style.opacity = onScreen ? '1' : '0';
      el.style.pointerEvents = onScreen ? 'auto' : 'none';
      el.tabIndex = onScreen ? 0 : -1;
      el.setAttribute('aria-hidden', String(!onScreen));
    }

    // Declutter: on narrow canvases the full names cover the models and collide.
    // Phones get a numbered chip only — the manifest directly below carries the
    // number-to-name mapping, so no information is lost. A label is never dropped.
    const narrow = rect.width < 560;
    const placed = [];
    // A small margin so labels that merely touch do not read as overlapping.
    const PAD = 3;
    // True when the candidate box [l,r] x [t,b] clears every placed box.
    const fits = (l, r, t, b) =>
      !placed.some((p) =>
        r > p.l - PAD &&
        l < p.r + PAD &&
        b > p.t - PAD &&
        t < p.b + PAD
      );
    // Wide labels claim their spot first — otherwise "Football Predictor"
    // arrives last, has nowhere to go, and gets demoted to a bare number.
    const order = [...labels].sort((a, b) => {
      if (a.onScreen !== b.onScreen) return a.onScreen ? -1 : 1;
      return (b.w || 0) - (a.w || 0);
    });
    for (const l of order) {
      if (!l.onScreen) {
        l.el.classList.remove('compact', 'tight');
        l.el.style.opacity = '0';
        l.el.style.pointerEvents = 'none';
        l.el.tabIndex = -1;
        l.el.setAttribute('aria-hidden', 'true');
        continue;
      }
      // Start from the full label (name included) and measure it as rendered —
      // the cached width was taken before the narrow-viewport class applied.
      l.el.classList.toggle('tight', narrow);
      l.el.classList.remove('compact');
      // Read the size once per frame, not inside the nudge loop. Reading
      // offsetWidth there forced a layout on every candidate position, which
      // starved the main thread and stalled the page's CSS transitions.
      let w = l.el.offsetWidth;
      let h = l.el.offsetHeight;
      let y = l.y;

      if (!fits(l.x - w / 2, l.x + w / 2, y - h, y)) {
        // Nudge upward until clear, then downward if we ran out of room above.
        let found = false;
        for (let dy = 0; dy <= 150; dy += 4) {
          const up = l.y - dy;
          if (up - h > 4 && fits(l.x - w / 2, l.x + w / 2, up - h, up)) { y = up; found = true; break; }
          const down = l.y + dy;
          if (down < rect.height - 4 && fits(l.x - w / 2, l.x + w / 2, down - h, down)) { y = down; found = true; break; }
        }
        if (!found) {
          // Last resort: drop the name, keep the numbered chip.
          l.el.classList.add('compact');
          w = l.el.offsetWidth;
          h = l.el.offsetHeight;
          y = Math.max(h + 4, Math.min(l.y, rect.height - 6));
        }
      }
      l.el.style.transform = `translate(-50%,-100%) translate(${l.x.toFixed(1)}px,${y.toFixed(1)}px)`;
      l.el.style.opacity = '1';
      l.el.style.pointerEvents = 'auto';
      // Record the box the label actually occupies. The element is anchored at
      // its bottom edge (translate -100% Y), so it occupies [y-h, y].
      placed.push({ l: l.x - w / 2, r: l.x + w / 2, t: y - h, b: y });
      l.finalY = y;
      l.finalW = w;
    }
    labelsDirty = false;
  };

  // Stop rendering when the atlas scrolls out of view or the tab is hidden.
  const visibility = new IntersectionObserver(
    ([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) startLoop();
      else stopLoop();
    },
    { threshold: 0 }
  );
  visibility.observe(canvas);

  const onVisibilityChange = () => {
    tabVisible = document.visibilityState === 'visible';
    if (tabVisible) startLoop();
    else stopLoop();
  };
  document.addEventListener('visibilitychange', onVisibilityChange);

  startLoop();

  return {
    focus(id) {
      const group = landmarks.find((l) => l.userData.project.id === id);
      if (!group) return;
      const angle = Math.atan2(group.position.x, group.position.z);
      targetAzimuth = angle;
      userAdjusted = true;
      zoom = 0.78;
      targetPolar = 0.86;
      startLoop();
    },
    setHover(id) {
      for (const group of landmarks) {
        const active = group.userData.project.id === id;
        const halo = group.userData.halo;
        halo.material.opacity = active ? 0.7 : (compact ? 0.1 : 0.2);
        group.scale.setScalar(active ? 1.12 : 1);
      }
    },
    // Theme support: the island terrain, fog and lights retint to match the
    // page ground. Light themes get a brighter terrain, stronger key light
    // and no stars; dark themes keep the night sky.
    setGround(hex) {
      const light = new THREE.Color(hex).getHSL({}).l > 0.5;
      const TERRAIN = light
        ? { base: 0xd8c9a8, edge: 0xbfae8c, tile: 0xc4b28e, grass: 0x9fb06a, fog: hex }
        : { base: PALETTE.base, edge: PALETTE.baseEdge, tile: PALETTE.ground, grass: PALETTE.grass, fog: hex };
      const mats = world.userData.groundMats || [];
      if (mats.length) {
        mats[0].color.set(TERRAIN.base);
        if (mats[1]) mats[1].color.set(TERRAIN.edge);
        for (let i = 2; i < mats.length; i++) {
          // tiles alternate grass/ground; shards keep a deep tone
          mats[i].color.set(i % 3 === 0 ? TERRAIN.grass : TERRAIN.tile);
        }
      }
      scene.fog.color.set(TERRAIN.fog);
      key.intensity = light ? 1.6 : 1.25;
      rim.intensity = light ? 0.4 : 0.9;
      stars.material.opacity = light ? 0 : 0.4;
      renderer.setClearColor(hex, 0);
      startLoop();
    },
    // Called when a dossier closes. The camera had glided toward that
    // landmark and stayed there, which left the map zoomed into one spot
    // with some landmarks off-canvas. Return to the home framing — but
    // snapped, not glided: a glide declutters the labels for its whole
    // duration and a click aimed during it lands on a moving target.
    release() {
      const h0 = homeCamera();
      userAdjusted = false;
      zoom = 1;
      targetAzimuth = azimuth = h0.azimuth;
      targetPolar = polar = h0.polar;
      const d0 = fitDistance(h0.azimuth, h0.polar);
      baseDistance = d0;
      targetDistance = distance = d0 * zoom;
      // No labelsDirty: the snap does not move the labels, and forcing a
      // declutter pass briefly flips every label to aria-hidden — a keyboard
      // user tabbing back to the map in that instant found nothing.
      startLoop();
    },
    destroy() {
      cancelAnimationFrame(raf);
      observer.disconnect();
      visibility.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerCancel);
      canvas.removeEventListener('wheel', onWheel);
      labelRoot.remove();
      renderer.dispose();
    }
  };
}
