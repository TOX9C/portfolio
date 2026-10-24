/* ============================================================
   Site behaviour: boot sequence, HUD, dossier, terminal,
   reveal observer, clocks. No framework.
   ============================================================ */

import { PROJECTS, PROJECT_BY_ID, resolveProject, TERMINAL_COMMANDS } from './data.js';

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

  // Fast. The badge is a status indicator, not a performance — every 130ms
  // step added up to a visible pause on a slow machine, and the hero was
  // readable the whole time.
  const STEP = 70;

  return new Promise((resolve) => {
    let i = 0;
    const tick = () => {
      log.textContent = steps[i];
      fill.style.width = `${((i + 1) / steps.length) * 100}%`;
      i++;
      if (i < steps.length) setTimeout(tick, STEP);
      else setTimeout(() => {
        overlay.classList.add('done');
        resolve();
      }, 120);
    };
    setTimeout(tick, 30);
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

/* ---------- manifest ---------- */

// The hero manifest is the portfolio's table of contents: the names, the real
// screenshot, and the stack. It is rendered from data.js so it can never drift
// from the 3D map, and it carries the work on phones where the 3D billboards
// are too small to read.
function manifest({ onOpen, onHover }) {
  const list = $('#legend-list');
  if (!list) return;

  list.innerHTML = '';
  PROJECTS.forEach((p) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.project = p.id;
    // The manifest card is a 170px-wide crop. Loading the full screenshot
    // for it pulled ~2.7MB of images into the hero; the thumb is ~7KB.
    const thumb = p.images[0].src.replace('assets/projects/', 'assets/projects/thumbs/');
    btn.innerHTML = `
      <span class="legend-shot"><img src="${thumb}" alt="${p.images[0].alt}" loading="lazy" width="480" height="270"></span>
      <span class="legend-text">
        <span class="legend-head">
          <span class="legend-key">${p.index}</span>
          <span class="legend-proof" aria-hidden="true">${p.stats[0].value}</span>
        </span>
        <span class="legend-name">${p.name}</span>
        <span class="legend-tag">${p.tag}</span>
        <span class="legend-stack">${p.stack.slice(0, 3).join(' · ')}</span>
      </span>`;
    btn.addEventListener('click', () => onOpen?.(p.id));
    btn.addEventListener('mouseenter', () => onHover?.(p.id));
    btn.addEventListener('mouseleave', () => onHover?.(null));
    btn.addEventListener('focus', () => onHover?.(p.id));
    btn.addEventListener('blur', () => onHover?.(null));
    li.appendChild(btn);
    list.appendChild(li);
  });
}

/* ---------- modal plumbing ---------- */

// Shared by the dossier drawer and the mobile menu: make the rest of the page
// inert while a modal is open, and keep Tab inside it.
const MODAL_FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])';

function trapFocus(panel, event) {
  if (event.key !== 'Tab') return;
  const items = $$(MODAL_FOCUSABLE, panel).filter((el) => el.offsetParent !== null);
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  const active = document.activeElement;
  if (!panel.contains(active)) {
    event.preventDefault();
    (event.shiftKey ? last : first).focus();
  } else if (event.shiftKey && active === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

// Hide the page behind a modal from assistive tech and from the tab order.
// The mobile menu lives inside `.hud`, so the header must stay out of this list
// when the menu is the modal — otherwise the menu would inert itself.
//
// `inert` is inherited, so an exempt subtree cannot live inside an inerted
// container. When `exempt` is given, the container is left alone and its
// children are inerted one by one, skipping the exempt branch. The terminal's
// section (#shell) is exempt while a dossier is open: the terminal is a
// second door into the same dossiers and has to stay usable.
function setBackgroundInert(inert, { keepHeader = false, exempt = [] } = {}) {
  const targets = keepHeader ? [$('#main'), $('.footer')] : [$('#main'), $('.hud'), $('.footer')];
  if (!inert) {
    targets.forEach((el) => el?.removeAttribute('inert'));
    // The per-child inerting below needs a matching cleanup.
    $$('[data-inerted]', document).forEach((el) => el.removeAttribute('inert'));
    $$('[data-inerted]', document).forEach((el) => el.removeAttribute('data-inerted'));
    return;
  }
  if (!exempt.length) {
    targets.forEach((el) => el?.setAttribute('inert', ''));
    return;
  }
  targets.forEach((el) => {
    if (!el) return;
    if (exempt.some((keep) => keep && el.contains(keep))) {
      [...el.children].forEach((child) => {
        if (exempt.some((keep) => keep && child.contains(keep))) return;
        child.setAttribute('inert', '');
        child.setAttribute('data-inerted', '');
      });
    } else {
      el.setAttribute('inert', '');
    }
  });
}

/* ---------- reveal + nav ---------- */

function reveals() {
  // The hero manifest is above-the-fold content on most screens. Hiding it
  // behind a scroll reveal removed the portfolio's table of contents from
  // the first screen entirely on shorter viewports.
  const targets = $$('.section-head, .rack, .lab-unit, .profile-lede, .profile-facts, .profile-card, .terminal, .channel-list a');
  targets.forEach((el) => el.classList.add('rv'));

  const show = (el) => {
    el.classList.add('in');
    io.unobserve(el);
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) show(entry.target);
      });
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.08 }
  );
  targets.forEach((el) => io.observe(el));

  // A jump straight to a section left it blank: the reveal never fired for
  // the content the user was sent to. Anything inside the viewport at load
  // is already seen, so reveal it immediately.
  const revealVisible = () => {
    targets.forEach((el) => {
      if (el.classList.contains('in')) return;
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) show(el);
    });
  };
  revealVisible();
  window.addEventListener('load', revealVisible);
  // Hash navigation lands after the browser's own scroll.
  window.addEventListener('hashchange', () => setTimeout(revealVisible, 120));

  const sections = $$('main section[id]');
  const navLinks = $$('.hud-nav a');
  // A band-based observer never fires for the last section: the viewport
  // middle only reaches it when there is more page below, and there is not.
  // Pick the section whose top is closest to the reading line instead.
  const setActive = (id) => {
    navLinks.forEach((link) => {
      const isActive = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('active', isActive);
      // The active state was a class only. Screen readers get no signal.
      if (isActive) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  };

  // Clicking a nav link highlights the target right away instead of waiting
  // for the smooth scroll to cross the reading line — during a long glide the
  // HUD otherwise kept pointing at the section the visitor just left.
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const id = link.getAttribute('href')?.slice(1);
      if (id) setActive(id);
    });
  });

  let spyTicking = false;
  const updateSpy = () => {
    spyTicking = false;
    const line = window.scrollY + window.innerHeight * 0.35;
    let current = sections[0];
    for (const section of sections) {
      if (section.offsetTop <= line) current = section;
      else break;
    }
    // At the very bottom, the last section wins even if it is short.
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 2) {
      current = sections[sections.length - 1];
    }
    if (current) setActive(current.id);
  };
  window.addEventListener('scroll', () => {
    if (spyTicking) return;
    spyTicking = true;
    requestAnimationFrame(updateSpy);
  }, { passive: true });
  window.addEventListener('resize', updateSpy, { passive: true });
  updateSpy();
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

  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

  // On desktop this is a plain navigation landmark. On a phone it becomes a
  // full-screen modal menu — and only then. It used to carry
  // role="dialog" aria-modal="true" permanently, so assistive tech was told
  // the whole page was inert even while the nav was a visible inline list.
  const setModal = (on) => {
    if (on) {
      nav.setAttribute('role', 'dialog');
      nav.setAttribute('aria-modal', 'true');
      nav.setAttribute('aria-label', 'Menu');
    } else {
      nav.removeAttribute('role');
      nav.removeAttribute('aria-modal');
      nav.setAttribute('aria-label', 'Primary');
    }
  };

  const close = () => {
    if (!isOpen()) return;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    nav.classList.remove('open');
    document.body.classList.remove('is-locked');
    setBackgroundInert(false, { keepHeader: true });
    setModal(false);
    toggle.focus();
  };

  toggle.addEventListener('click', () => {
    const open = isOpen();
    toggle.setAttribute('aria-expanded', String(!open));
    toggle.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
    nav.classList.toggle('open', !open);
    document.body.classList.toggle('is-locked', !open);
    setBackgroundInert(!open, { keepHeader: true });
    setModal(!open);
    // The panel flips to `visible` on the next frame, so focus has to wait for it.
    if (!open) requestAnimationFrame(() => $$('a', nav)[0]?.focus());
  });

  $$('a', nav).forEach((link) => link.addEventListener('click', close));
  // Tapping the dark area outside the menu closed nothing — the page stayed
  // scroll-locked and the menu stayed open, so the only way out was a link
  // or Escape. The menu panel is the whole viewport, so "outside" means
  // anywhere that is not a link.
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) return;
    close();
  });
  document.addEventListener('keydown', (e) => {
    if (!isOpen()) return;
    if (e.key === 'Escape') close();
    else trapFocus(nav, e);
  });
}

/* ---------- dossier ---------- */

function dossier({ atlas: initialAtlas }) {
  const panel = $('#dossier');
  const closeBtn = $('#dossier-close');
  const scrim = $('#dossier-scrim');
  let atlas = initialAtlas;
  let lastFocus = null;

  const fill = (project) => {
    $('#dossier-index').textContent = `SYS-${project.index}`;
    $('#dossier-title').textContent = project.name;
    $('#dossier-tag').textContent = project.tag;

    const image = $('#dossier-image');
    const [first, ...rest] = project.images;
    image.src = first.src;
    image.alt = first.alt;
    image.loading = 'lazy';
    $('#dossier-caption').textContent = first.alt;

    const thumbs = $('#dossier-thumbs');
    thumbs.innerHTML = '';
    project.images.forEach((img, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('aria-current', String(i === 0));
      btn.setAttribute('aria-label', `Show image ${i + 1} of ${project.name}`);
      // The strip is 60px tall. The full screenshot is a wasted download here.
      const thumb = img.src.replace('assets/projects/', 'assets/projects/thumbs/');
      btn.innerHTML = `<img src="${thumb}" alt="${img.alt}" loading="lazy" width="480" height="270">`;
      btn.addEventListener('click', () => {
        // Only the image actually shown is fetched at full size.
        image.src = img.src;
        image.alt = img.alt;
        $('#dossier-caption').textContent = img.alt;
        $$('button', thumbs).forEach((b, bi) => b.setAttribute('aria-current', String(bi === i)));
      });
      thumbs.appendChild(btn);
    });

    $('#dossier-desc').innerHTML = project.desc
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // What the system actually does, broken out — one paragraph plus a tech
    // list reads like filler; a capability list reads like a case study.
    $('#dossier-features').innerHTML = (project.features || [])
      .map((f) => `<li><i aria-hidden="true"></i>${f}</li>`)
      .join('');

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
    document.body.classList.add('dossier-open');
    // The terminal stays live — it is a second door into the same dossiers.
    setBackgroundInert(true, { exempt: [$('#shell')] });
    if (scrim) scrim.hidden = false;
    // Only take focus if it is not already somewhere usable. Stealing focus
    // from the terminal field made the next command land on the close
    // button and vanish — and the trailing Enter closed the drawer.
    const active = document.activeElement;
    if (!panel.contains(active) && active !== $('#terminal-field')) closeBtn.focus();
    atlas?.focus(id);
  };

  const close = () => {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
    document.body.classList.remove('dossier-open');
    setBackgroundInert(false);
    if (scrim) scrim.hidden = true;
    // Return focus to where it was, but only if that element is still
    // focusable — restoring focus to a detached node silently drops it.
    if (lastFocus instanceof HTMLElement && lastFocus.isConnected) {
      lastFocus.focus();
    }
  };

  closeBtn.addEventListener('click', close);
  scrim?.addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (!panel.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.target !== $('#terminal-field')) trapFocus(panel, e);
  });

  return {
    open,
    close,
    // The atlas is created after this panel (the Three.js import is deferred),
    // so the panel needs a way to receive it.
    setAtlas(next) { atlas = next; }
  };
}

/* ---------- terminal ---------- */

function terminal({ openDossier } = {}) {
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
  write('', 't-dim');
  write('SYS  NAME                TYPE', 't-ok');
  PROJECTS.forEach((p) => {
    write(`${p.index}  ${p.name.padEnd(20, ' ')} ${p.tag}`, 't-dim');
  });
  write('', 't-dim');
  write('run "help" for commands · "dossier 1" to inspect one', 't-hi');

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

    // `dossier <id>` opens the same panel the map does — the terminal and the
    // atlas are two doors into the same seven projects.
    const [verb, arg] = cmd.split(/\s+/);
    if (verb === 'dossier') {
      const project = resolveProject(arg);
      if (!project) {
        write(`unknown system: ${arg || '(none)'}. try: dossier 1, dossier athenas, dossier football`, 't-amber');
        return;
      }
      write(`opening ${project.name.toLowerCase()} dossier...`, 't-ok');
      openDossier?.(project.id);
      return;
    }

    const entry = TERMINAL_COMMANDS[cmd];
    if (!entry) {
      write(`command not found: ${cmd}. try "help"`, 't-amber');
      return;
    }
    entry.lines.forEach((line) => {
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
  const dossierPanel = dossier({ atlas });

  function openDossier(id) {
    dossierPanel.open(id);
  }

  manifest({
    onOpen: openDossier,
    onHover: (id) => atlas?.setHover(id)
  });

  // A visible way into the dossiers from the hero copy. The button promises
  // "a dossier" — opening one arbitrary project broke that promise, so it
  // opens a picker of all seven instead.
  const picker = $('#stage-picker');
  const pickerList = $('#stage-picker-list');
  const pickerBtn = $('#stage-open-dossier');
  if (picker && pickerList && pickerBtn) {
    pickerList.innerHTML = PROJECTS.map((p) => `
      <li><button type="button" data-project="${p.id}">
        <b>${p.index}</b><span>${p.name}</span><i aria-hidden="true">↗</i>
      </button></li>`).join('');
    const setPicker = (open) => {
      picker.hidden = !open;
      pickerBtn.setAttribute('aria-expanded', String(open));
    };
    pickerBtn.addEventListener('click', () => setPicker(picker.hidden));
    pickerList.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-project]');
      if (!btn) return;
      setPicker(false);
      openDossier(btn.dataset.project);
    });
    document.addEventListener('click', (e) => {
      if (picker.hidden) return;
      if (picker.contains(e.target) || pickerBtn.contains(e.target)) return;
      setPicker(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !picker.hidden) {
        setPicker(false);
        pickerBtn.focus();
      }
    });
  }

  terminal({ openDossier });

  // The manifest, the terminal and the dossiers are wired up before the 3D
  // atlas loads. Three.js is ~380KB and its import blocks the main thread;
  // awaiting it first left the whole page inert for seconds on a slow
  // machine. The site now works while the diorama is still assembling.
  const canvas = $('#atlas-canvas');
  const loadAtlas = async () => {
    try {
      const { createAtlas } = await import('./atlas.js');
      if (!canvas || !window.WebGLRenderingContext) throw new Error('no webgl');
      atlas = createAtlas(canvas, {
        onSelect: (id) => openDossier(id),
        onHover: (id) => atlas?.setHover(id)
      });
      dossierPanel.setAtlas(atlas);
    } catch (error) {
      console.warn('atlas unavailable:', error);
      const fallback = $('.stage-fallback');
      if (fallback) fallback.style.display = 'flex';
    }
    await boot();
    // expose for smoke checks
    window.__atlas = { projects: PROJECTS, dossier: dossierPanel, atlas };
  };

  // Yield first so the first paint lands before the import starts.
  requestAnimationFrame(() => requestAnimationFrame(loadAtlas));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
