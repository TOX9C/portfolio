/* ============================================================
   Site behaviour: boot sequence, HUD, dossier, terminal,
   reveal observer, clocks. No framework.
   ============================================================ */

import { PROJECTS, PROJECT_BY_ID, TERMINAL_COMMANDS } from './data.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- boot ---------- */

function boot() {
  const overlay = $('#boot');
  const log = $('#boot-log');
  const fill = $('#boot-fill');
  if (!overlay) return Promise.resolve();

  const steps = ['assembling atlas', 'placing landmarks', 'linking systems', 'ready'];
  if (reducedMotion) {
    overlay.classList.add('done');
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    let i = 0;
    const tick = () => {
      log.textContent = steps[i];
      fill.style.width = `${((i + 1) / steps.length) * 100}%`;
      i++;
      if (i < steps.length) setTimeout(tick, 190);
      else setTimeout(() => {
        overlay.classList.add('done');
        resolve();
      }, 260);
    };
    setTimeout(tick, 90);
  });
}

/* ---------- clocks ---------- */

function clocks() {
  const clock = $('#clock');
  const uptimeEls = [$('#uptime'), $('#uptime-footer')];
  const start = Date.now();

  const tick = () => {
    if (clock) {
      const now = new Date();
      clock.textContent = now.toLocaleTimeString('en-GB', {
        timeZone: 'Asia/Baghdad',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      clock.setAttribute('datetime', now.toISOString());
    }
    const s = Math.floor((Date.now() - start) / 1000);
    const hh = String(Math.floor(s / 3600)).padStart(2, '0');
    const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    uptimeEls.forEach((el) => { if (el) el.textContent = `${hh}:${mm}:${ss}`; });
  };
  tick();
  setInterval(tick, 1000);

  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());
}

/* ---------- reveal + nav ---------- */

function reveals() {
  const targets = $$('.section-head, .rack, .lab-unit, .profile-lede, .profile-facts, .profile-card, .terminal, .channel-list a, .stage-legend');
  targets.forEach((el) => el.classList.add('rv'));
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.08 }
  );
  targets.forEach((el) => io.observe(el));

  const sections = $$('main section[id]');
  const navLinks = $$('.hud-nav a');
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: '-45% 0px -50% 0px' }
  );
  sections.forEach((s) => spy.observe(s));
}

function scrollProgress() {
  const fill = $('#scroll-fill');
  if (!fill) return;
  let ticking = false;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    fill.style.transform = `scaleX(${ratio})`;
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }, { passive: true });
  update();
}

/* ---------- mobile nav ---------- */

function mobileNav() {
  const toggle = $('#menu-toggle');
  const nav = $('#hud-nav');
  if (!toggle || !nav) return;

  const close = () => {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    nav.classList.remove('open');
    document.body.classList.remove('is-locked');
  };

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    toggle.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
    nav.classList.toggle('open', !open);
    document.body.classList.toggle('is-locked', !open);
  });

  $$('a', nav).forEach((link) => link.addEventListener('click', close));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
}

/* ---------- dossier ---------- */

function dossier({ atlas }) {
  const panel = $('#dossier');
  const closeBtn = $('#dossier-close');
  let lastFocus = null;

  const fill = (project) => {
    $('#dossier-index').textContent = `SYS-${project.index}`;
    $('#dossier-title').textContent = project.name;
    $('#dossier-tag').textContent = project.tag;

    const image = $('#dossier-image');
    const [first, ...rest] = project.images;
    image.src = first.src;
    image.alt = first.alt;

    const thumbs = $('#dossier-thumbs');
    thumbs.innerHTML = '';
    project.images.forEach((img, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('aria-current', String(i === 0));
      btn.setAttribute('aria-label', `Show image ${i + 1} of ${project.name}`);
      btn.innerHTML = `<img src="${img.src}" alt="${img.alt}" loading="lazy">`;
      btn.addEventListener('click', () => {
        image.src = img.src;
        image.alt = img.alt;
        $$('button', thumbs).forEach((b, bi) => b.setAttribute('aria-current', String(bi === i)));
      });
      thumbs.appendChild(btn);
    });

    $('#dossier-desc').innerHTML = project.desc
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    $('#dossier-stats').innerHTML = project.stats
      .map((s) => `<li><b>${s.value}</b><span>${s.label}</span></li>`)
      .join('');

    $('#dossier-stack').innerHTML = project.stack.map((s) => `<li>${s}</li>`).join('');

    $('#dossier-links').innerHTML = project.links
      .map((l) => `<a href="${l.href}"${l.primary ? ' class="primary"' : ''} target="_blank" rel="noopener noreferrer">${l.label} <span aria-hidden="true">↗</span></a>`)
      .join('');
  };

  const open = (id) => {
    const project = PROJECT_BY_ID[id];
    if (!project) return;
    fill(project);
    lastFocus = document.activeElement;
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    closeBtn.focus();
    atlas?.focus(id);
  };

  const close = () => {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
    if (lastFocus instanceof HTMLElement) lastFocus.focus();
  };

  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('open')) close();
  });

  return { open, close };
}

/* ---------- terminal ---------- */

function terminal() {
  const body = $('#terminal-body');
  const form = $('#terminal-form');
  const field = $('#terminal-field');
  if (!body || !form || !field) return;

  const write = (text, cls = 't-dim') => {
    const line = document.createElement('div');
    line.className = cls;
    line.textContent = text;
    body.appendChild(line);
    body.scrollTop = body.scrollHeight;
  };

  write('Personal Systems Atlas — type "help" for commands.', 't-hi');
  write('7 systems mapped · Baghdad clock live · session online', 't-dim');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const raw = field.value.trim();
    field.value = '';
    if (!raw) return;

    write(raw, 't-cmd');
    const cmd = raw.toLowerCase();

    if (cmd === 'clear') {
      body.innerHTML = '';
      write('log cleared.', 't-dim');
      return;
    }

    const entry = TERMINAL_COMMANDS[cmd];
    if (!entry) {
      write(`command not found: ${cmd}. try "help"`, 't-amber');
      return;
    }
    entry.lines.forEach((line, i) => {
      const cls = line.trim().startsWith('available') ? 't-hi'
        : /\[running\]/.test(line) ? 't-ok'
        : /^ {2}[a-z]/.test(line) ? 't-hi'
        : 't-dim';
      write(line, cls);
    });
  });
}

/* ---------- boot sequence ---------- */

async function init() {
  document.documentElement.classList.remove('no-js');

  clocks();
  reveals();
  scrollProgress();
  mobileNav();

  let atlas = null;
  try {
    const { createAtlas } = await import('./atlas.js');
    const canvas = $('#atlas-canvas');
    if (canvas && window.WebGLRenderingContext) {
      atlas = createAtlas(canvas, {
        onSelect: (id) => openDossier(id),
        onHover: (id) => atlas?.setHover(id)
      });
    }
  } catch (error) {
    console.warn('atlas unavailable:', error);
    const fallback = $('.stage-fallback');
    if (fallback) fallback.style.display = 'flex';
  }

  const dossierPanel = dossier({ atlas });

  function openDossier(id) {
    dossierPanel.open(id);
  }

  // manifest buttons
  $$('.legend-list button').forEach((btn) => {
    btn.addEventListener('click', () => openDossier(btn.dataset.project));
  });

  // highlight legend row on atlas hover
  $$('.legend-list button').forEach((btn) => {
    btn.addEventListener('mouseenter', () => atlas?.setHover(btn.dataset.project));
    btn.addEventListener('mouseleave', () => atlas?.setHover(null));
  });

  terminal();

  await boot();

  const display = $('.display');
  if (display) requestAnimationFrame(() => display.classList.add('go'));

  // expose for smoke checks
  window.__atlas = { projects: PROJECTS, dossier: dossierPanel, atlas };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
