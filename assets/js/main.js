/* ============================================================
   Site behaviour: HUD, dossier,
   reveal observer, clocks. No framework.
   ============================================================ */

import { PROJECTS, PROJECT_BY_ID } from './data.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- clocks ---------- */

function clocks() {
  const clock = $('#clock');
  // Only #uptime-footer exists; #uptime was left over from a copy of the
  // site that showed a session timer in two places.
  const uptimeEls = [$('#uptime-footer')];
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
      <span class="legend-shot"><img src="${thumb}" alt="${p.images[0].alt}" loading="lazy" width="480" height="270">
        <span class="legend-index" aria-hidden="true">${p.index}</span>
      </span>
      <span class="legend-text">
        <span class="legend-card-head">
          <span class="legend-proof">${p.stats[0].value}<span class="legend-proof-label">${p.stats[0].label}</span></span>
        </span>
        <span class="legend-name">${p.name}</span>
        <span class="legend-tag">${p.tag}</span>
        <span class="legend-stack">${p.stack.slice(0, 3).join(' · ')}</span>
        <span class="legend-shipped">last commit ${p.shipped.last} · ${p.shipped.commits} commits</span>
      </span>`;
    // The source link lives on the card, not only in the drawer. Seven
    // landmarks that only reveal their source after a click is seven claims
    // a reviewer has to take on trust.
    const links = document.createElement('div');
    links.className = 'legend-links';
    links.innerHTML = p.links.map((l) =>
      `<a href="${l.href}" target="_blank" rel="noopener noreferrer">${l.label}<span aria-hidden="true">↗</span></a>`
    ).join('');

    // Hover on the whole card, so the link row also lights up the map sign.
    li.addEventListener('mouseenter', () => onHover?.(p.id));
    li.addEventListener('mouseleave', () => onHover?.(null));
    btn.addEventListener('click', () => onOpen?.(p.id));
    btn.addEventListener('focus', () => onHover?.(p.id));
    btn.addEventListener('blur', () => onHover?.(null));
      li.append(btn, links);
    list.appendChild(li);
  });

  // The seven names in one line, above the cards. Rendered from the same
  // source as everything else so it cannot drift from what is listed below.
  const indexLine = $('#legend-index-line');
  if (indexLine) indexLine.textContent = PROJECTS.map((p) => p.name).join(' · ');

  refreshRepoStats();
}

/* ---------- live repo stats ---------- */

// The commit count and last-commit month are the only two figures on this page
// that go stale on their own — every push to any of the seven repos changes
// them, and three of them were already wrong by the time a reviewer checked.
// They are re-read from the GitHub API on load and cached for six hours so the
// page does not spend seven unauthenticated requests per view (the limit is 60
// per hour per IP). If the API is unreachable or rate-limited the static
// values from data.js stand, which is why those still have to be kept honest.
const STATS_KEY = 'tox9c.repoStats.v1';
const STATS_TTL = 6 * 60 * 60 * 1000;

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const monthYear = (iso) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};

// GitHub returns the total commit count only as the page number of the
// `rel="last"` link on a one-per-page response.
async function repoStat(fullName) {
  const res = await fetch(`https://api.github.com/repos/${fullName}/commits?per_page=1`, {
    headers: { Accept: 'application/vnd.github+json' }
  });
  if (!res.ok) throw new Error(String(res.status));
  const rel = /[?&]page=(\d+)>;\s*rel="last"/.exec(res.headers.get('link') || '');
  const [latest] = await res.json();
  return {
    commits: rel ? Number(rel[1]) : 1,
    last: latest?.commit?.committer?.date ? monthYear(latest.commit.committer.date) : null
  };
}

async function refreshRepoStats() {
  let cached = null;
  try { cached = JSON.parse(localStorage.getItem(STATS_KEY) || 'null'); } catch { /* private mode */ }

  if (cached && Date.now() - cached.at < STATS_TTL) return applyStats(cached.repos);

  const repos = {};
  await Promise.all(PROJECTS.filter((p) => p.repo).map(async (p) => {
    try { repos[p.id] = await repoStat(p.repo); } catch { /* keep the static value */ }
  }));
  if (!Object.keys(repos).length) return;

  applyStats(repos);
  try { localStorage.setItem(STATS_KEY, JSON.stringify({ at: Date.now(), repos })); } catch { /* ignore */ }
}

function applyStats(repos) {
  PROJECTS.forEach((p) => {
    const live = repos[p.id];
    if (!live) return;
    // Keep data.js in step so the dossier, which reads from PROJECTS, agrees
    // with the card the visitor just read.
    if (live.commits) p.shipped.commits = live.commits;
    if (live.last) p.shipped.last = live.last;
    const line = $(`.legend-list li button[data-project="${p.id}"] .legend-shipped`);
    if (line) line.textContent = `last commit ${p.shipped.last} · ${p.shipped.commits} commits`;
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
// children are inerted one by one, skipping the exempt branch.
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
  const targets = $$('.section-head, .rack, .lab-unit, .profile-lede, .profile-facts, .profile-card, .channel-list a');
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
      // "page" rather than "true": the nav points at sections of one page,
      // and "page" is the token that says so.
      if (isActive) link.setAttribute('aria-current', 'page');
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

    $('#dossier-shipped').textContent =
      `last commit ${project.shipped.last} · ${project.shipped.commits} commits on GitHub`;

    // Shown only when a project has something to declare that the rest of
    // the card cannot: OsSecurity was built with other people, and Athenas
    // Core's two headline counts come from a repo command. Attribution and
    // evidence nobody can see are the same as neither.
    const note = $('#dossier-credit');
    const noteText = project.credit || project.evidence || '';
    note.hidden = !noteText;
    note.textContent = noteText.trim();

    // The one line that says what the card's numbers cannot: why a count is
    // low, or what the score cost. A reviewer's note was that the dossiers
    // stated outcomes and never depth.
    const depth = $('#dossier-depth');
    depth.hidden = !project.depth;
    depth.textContent = project.depth || '';

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
    setBackgroundInert(true);
    if (scrim) scrim.hidden = false;
    // Only take focus if it is not already somewhere usable.
    const active = document.activeElement;
    if (!panel.contains(active)) closeBtn.focus();
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
    // The atlas glided toward this project's landmark while the drawer was
    // open; leave the map where the visitor left it rather than mid-glide.
    atlas?.release();
  };

  closeBtn.addEventListener('click', close);
  scrim?.addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (!panel.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else trapFocus(panel, e);
  });

  return {
    open,
    close,
    // The atlas is created after this panel (the Three.js import is deferred),
    // so the panel needs a way to receive it.
    setAtlas(next) { atlas = next; }
  };
}

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

  // The manifest and the dossiers are wired up before the 3D
  // atlas loads. Three.js is ~380KB and its import blocks the main thread;
  // awaiting it first left the whole page inert for seconds on a slow
  // machine. The site now works while the diorama is still assembling.
  const canvas = $('#atlas-canvas');

  // The map's hint is the only instruction the diorama gives. It stays up
  // until the visitor actually touches the map, then gets out of the way —
  // a first-time visitor was reading the diorama as wallpaper.
  const hint = $('#atlas-hint');
  if (hint && canvas) {
    const dismissHint = () => {
      hint.classList.add('is-done');
      canvas.removeEventListener('pointerdown', dismissHint);
      canvas.removeEventListener('wheel', dismissHint);
    };
    canvas.addEventListener('pointerdown', dismissHint);
    canvas.addEventListener('wheel', dismissHint, { passive: true });
  }

  const loadAtlas = async () => {
    try {
      const { createAtlas } = await import('./atlas.js');
      if (!canvas || !window.WebGLRenderingContext) throw new Error('no webgl');
      atlas = createAtlas(canvas, {
        onSelect: (id) => openDossier(id),
        onHover: (id) => atlas?.setHover(id)
      });
      dossierPanel.setAtlas(atlas);
      // The site is the pixel theme: a bright cream page, so the diorama's
      // terrain, fog and lights are retinted for a light ground at build.
      atlas.setGround(0xf2e9d8);
    } catch (error) {
      console.warn('atlas unavailable:', error);
      const fallback = $('.stage-fallback');
      if (fallback) fallback.style.display = 'flex';
    }
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
