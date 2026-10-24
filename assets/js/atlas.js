/* ============================================================
   The atlas: a voxel diorama of the portfolio.
   Seven landmarks on a floating island. Drag to orbit,
   hover to highlight, click to open the dossier.
   ============================================================ */

import * as THREE from '../vendor/three.module.min.js';
import { PROJECTS } from './data.js';

const VOXEL = 1;

const PALETTE = {
  base: 0x0c1120,
  baseEdge: 0x1a2540,
  ground: 0x141d33,
  grass: 0x1c3a4a,
  stone: 0x27334f,
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
  const top = new THREE.Mesh(
    new THREE.BoxGeometry(24, 1.6, 17),
    new THREE.MeshLambertMaterial({ color: PALETTE.base })
  );
  top.position.y = -0.8;
  group.add(top);

  // soil rim
  const rim = new THREE.Mesh(
    new THREE.BoxGeometry(25, 0.6, 18),
    new THREE.MeshLambertMaterial({ color: PALETTE.baseEdge })
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
      new THREE.MeshLambertMaterial({
        color: rand() > 0.72 ? PALETTE.grass : PALETTE.ground
      })
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
      new THREE.MeshLambertMaterial({ color: 0x101a2e })
    );
    shard.position.set(x, -1.6 - depth / 2, z);
    shard.rotation.y = rand() * Math.PI;
    group.add(shard);
  }
}

/* ---------- landmarks ---------- */

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
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffd166 });
      const eyeGeo = new THREE.BoxGeometry(0.5, 0.5, 0.3);
      const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
      eyeL.position.set(-0.55, 3.75, 0.86);
      const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
      eyeR.position.set(0.55, 3.75, 0.86);
      add(eyeL, eyeR);
      add(voxel(0xffb65c, 0, 3.05, 0.9, 0.4));
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

  scene.add(new THREE.HemisphereLight(0x9fd8ff, 0x0a0f1c, 1.35));
  const key = new THREE.DirectionalLight(0xffffff, 1.15);
  key.position.set(10, 18, 12);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x54e1ff, 0.75);
  rim.position.set(-12, 6, -10);
  scene.add(rim);
  const warm = new THREE.PointLight(0xffb65c, 28, 46);
  warm.position.set(6, 4, 10);
  scene.add(warm);

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
    new THREE.PointsMaterial({ color: 0x8c9abb, size: 0.32, transparent: true, opacity: 0.65 })
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
    el.innerHTML = `<span class="atlas-label-key">${group.userData.project.index}</span><span class="atlas-label-name">${group.userData.project.name}</span>`;
    el.addEventListener('click', () => onSelect?.(group.userData.project.id));
    labelRoot.appendChild(el);
    return { el, group, w: 0, keyW: 0 };
  });

  // Cache label widths once so the render loop can declutter without forcing layout.
  requestAnimationFrame(() => {
    for (const l of labels) {
      l.w = l.el.offsetWidth;
      l.keyW = (l.el.querySelector('.atlas-label-key')?.offsetWidth || 0) + 18;
    }
  });

  /* ---------- interaction ---------- */

  // Points that must stay inside the frame: the island corners and the label
  // anchor height above each landmark.
  const FIT_POINTS = [];
  for (const group of landmarks) {
    const p = group.position;
    FIT_POINTS.push(new THREE.Vector3(p.x, 0, p.z));
    FIT_POINTS.push(new THREE.Vector3(p.x, 4.6, p.z));
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

  const onWheel = (e) => {
    e.preventDefault();
    zoom = Math.max(0.6, Math.min(1.5, zoom - e.deltaY * 0.0012));
    userAdjusted = true;
  };

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);
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
    baseDistance = fitDistance(targetAzimuth, targetPolar);
    if (!dragging) distance = targetDistance = baseDistance * zoom;
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();

  /* ---------- loop ---------- */

  const projected = new THREE.Vector3();
  let last = performance.now();
  let raf = 0;
  let elapsed = 0;

  const frame = (now) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    elapsed += dt;

    const ease = reducedMotion ? 1 : 1 - Math.pow(0.0016, dt);
    azimuth += (targetAzimuth - azimuth) * ease;
    polar += (targetPolar - polar) * ease;
    const wanted = baseDistance * zoom;
    targetDistance += (wanted - targetDistance) * ease;
    distance += (targetDistance - distance) * ease;

    placeCamera(distance, azimuth, polar);

    world.rotation.y = Math.sin(elapsed * 0.08) * 0.06;
    stars.rotation.y = elapsed * 0.006;

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
    }

    renderer.render(scene, camera);

    // project labels to screen space
    const rect = canvas.getBoundingClientRect();
    const placed = [];
    for (const l of labels) {
      const { el, group } = l;
      projected.set(0, 4.6, 0);
      group.localToWorld(projected);
      projected.project(camera);
      const x = (projected.x * 0.5 + 0.5) * rect.width;
      const y = (-projected.y * 0.5 + 0.5) * rect.height;
      const visible = projected.z < 1;
      el.style.transform = `translate(-50%,-100%) translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
      el.style.opacity = visible ? '1' : '0';
      el.style.pointerEvents = visible ? 'auto' : 'none';
      l.x = x;
      l.y = y;
      l.visible = visible;
    }

    // Declutter: on narrow canvases the full names collide. Try full width, fall back
    // to a numbered chip, then nudge vertically. A label is never dropped — every
    // landmark stays identifiable.
    const narrow = rect.width < 560;
    const h = 22;
    const fits = (l, r, t, b) => !placed.some((p) => r > p.l && l < p.r && t < p.b && b > p.t);
    for (const l of labels) {
      if (!l.visible) {
        l.el.classList.remove('compact');
        l.el.style.opacity = '0';
        l.el.style.pointerEvents = 'none';
        continue;
      }
      let w = l.w;
      let y = l.y;
      if (!fits(l.x - w / 2, l.x + w / 2, y - h, y)) {
        if (narrow) {
          w = l.keyW;
          l.el.classList.add('compact');
        }
        // Nudge upward until clear, then downward if we ran out of room above.
        let found = false;
        for (let dy = 0; dy <= 90; dy += 6) {
          const up = l.y - dy;
          if (up - h > 4 && fits(l.x - w / 2, l.x + w / 2, up - h, up)) { y = up; found = true; break; }
          const down = l.y + dy;
          if (down < rect.height - 4 && fits(l.x - w / 2, l.x + w / 2, down - h, down)) { y = down; found = true; break; }
        }
        if (!found) {
          // Last resort: keep the chip and push it to the top edge.
          w = l.keyW;
          l.el.classList.add('compact');
          y = Math.max(h + 4, Math.min(l.y, rect.height - 6));
        }
      } else {
        l.el.classList.remove('compact');
      }
      l.el.style.transform = `translate(-50%,-100%) translate(${l.x.toFixed(1)}px,${y.toFixed(1)}px)`;
      l.el.style.opacity = '1';
      l.el.style.pointerEvents = 'auto';
      placed.push({ l: l.x - w / 2, r: l.x + w / 2, t: y - h, b: y });
    }
  };

  raf = requestAnimationFrame(frame);

  return {
    focus(id) {
      const group = landmarks.find((l) => l.userData.project.id === id);
      if (!group) return;
      const angle = Math.atan2(group.position.x, group.position.z);
      targetAzimuth = angle;
      userAdjusted = true;
      zoom = 0.78;
      targetPolar = 0.86;
    },
    setHover(id) {
      for (const group of landmarks) {
        const active = group.userData.project.id === id;
        group.userData.halo.material.opacity = active ? 0.7 : 0.2;
        group.scale.setScalar(active ? 1.12 : 1);
      }
    },
    destroy() {
      cancelAnimationFrame(raf);
      observer.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('wheel', onWheel);
      labelRoot.remove();
      renderer.dispose();
    }
  };
}
