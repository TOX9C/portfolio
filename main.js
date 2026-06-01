/* ── NAV SCROLL ── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', scrollY > 50);
}, { passive: true });

/* ── HERO ENTRANCE ── */
(function heroEntrance() {
  const els = document.querySelectorAll('.rev-hero');
  els.forEach((el, i) => {
    el.style.transitionDelay = (i * 150) + 'ms';
    setTimeout(() => el.classList.add('in'), 100);
  });
})();

/* ── SCROLL REVEAL ── */
const revealIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      revealIO.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.rev').forEach(el => revealIO.observe(el));

/* ── COUNT-UP STATS ── */
function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function countUp(el, target, suffix, isDecimal) {
  const dur = 1400;
  const start = performance.now();
  (function frame(now) {
    const p = Math.min((now - start) / dur, 1);
    const val = easeOutExpo(p) * target;
    el.textContent = (isDecimal ? val.toFixed(2) : Math.round(val)) + suffix;
    if (p < 1) requestAnimationFrame(frame);
  })(performance.now());
}

function scrambleText(el, text) {
  const chars = '!<>-_\\/[]{}=+*^?#@$%&~';
  const queue = [];
  for (let i = 0; i < text.length; i++) {
    const st = Math.floor(Math.random() * 14);
    queue.push({ to: text[i], start: st, end: st + Math.floor(Math.random() * 10) + 4 });
  }
  let f = 0;
  (function update() {
    let out = '';
    let done = 0;
    for (let i = 0; i < queue.length; i++) {
      const { to, start, end } = queue[i];
      if (f >= end) { done++; out += to; }
      else if (f >= start) { out += chars[Math.floor(Math.random() * chars.length)]; }
      else { out += ' '; }
    }
    el.textContent = out;
    if (done < queue.length) { f++; requestAnimationFrame(update); }
  })();
}

const statsIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const cnt = el.dataset.count;
    const suf = el.dataset.suffix || '';
    const txt = el.dataset.text;
    const dec = el.dataset.decimal === 'true';
    if (cnt) countUp(el, parseFloat(cnt), suf, dec);
    else if (txt) scrambleText(el, txt);
    statsIO.unobserve(el);
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num').forEach(el => statsIO.observe(el));

/* ── SPOTIFY MINI-PLAYER ── */
let spotifyTimer = null;
let currentTrackDuration = 0;
let currentElapsed = 0;

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m + ':' + (s < 10 ? '0' : '') + s;
}

function updateProgress() {
  if (currentTrackDuration <= 0) return;
  currentElapsed = (currentElapsed + 1) % (currentTrackDuration + 1);
  const bar = document.getElementById('spot-progress-fill');
  const currentEl = document.getElementById('spot-current');
  if (bar) bar.style.width = (currentElapsed / currentTrackDuration * 100) + '%';
  if (currentEl) currentEl.textContent = formatTime(currentElapsed);
}

let currentTrackId = null;

async function fetchSpotify() {
  try {
    const res = await fetch('/api/spotify');
    if (!res.ok) return;
    const data = await res.json();
    const widget = document.getElementById('spotify-widget');
    const albumImg = document.getElementById('spot-img');
    const trackEl = document.getElementById('spot-track');
    const artistEl = document.getElementById('spot-artist');
    const status = document.getElementById('spot-status');
    const totalEl = document.getElementById('spot-total');
    const link = document.getElementById('spot-link');

    // Only update text if track changed
    const newTrackId = data.id;
    if (newTrackId !== currentTrackId) {
      currentTrackId = newTrackId;
      currentTrackDuration = data.duration || 180;
      currentElapsed = data.elapsed || 0;

      if (albumImg && data.albumArt) {
        albumImg.src = data.albumArt;
        albumImg.style.display = 'block';
      } else if (albumImg) {
        albumImg.style.display = 'none';
      }
      if (trackEl) trackEl.textContent = data.title;
      if (artistEl) artistEl.textContent = data.artist;
      if (status) status.textContent = data.isPlaying ? 'Spotify · Now playing' : 'Spotify · Paused';
      if (totalEl) totalEl.textContent = formatTime(currentTrackDuration);
      if (link && data.spotifyUrl) link.href = `https://open.spotify.com/track/${data.id}`;

      // Update embed
      const embed = document.getElementById('spotify-embed');
      if (embed && data.id) embed.src = data.spotifyUrl;
    }
  } catch (_) {
    // Keep current state if error
  }
}

// Initial fetch
fetchSpotify();

// Update track every 30 seconds
setInterval(fetchSpotify, 30000);

// Progress timer (1 second intervals)
spotifyTimer = setInterval(updateProgress, 1000);

/* ── COMMAND PALETTE ── */
const overlay = document.getElementById('palette-overlay');
const palette = document.getElementById('palette');
const palInput = document.getElementById('palette-input');
const palOutput = document.getElementById('palette-output');
let paletteOpen = false;

function openPalette() {
  if (paletteOpen) return;
  paletteOpen = true;
  overlay.classList.add('open');
  palInput.value = '';
  palOutput.innerHTML = '';
  setTimeout(() => palInput.focus(), 50);
}

function closePalette() {
  if (!paletteOpen) return;
  paletteOpen = false;
  overlay.classList.remove('open');
  palInput.blur();
}

function palPrint(text, cls) {
  const d = document.createElement('div');
  d.className = 'pal-line' + (cls ? ' ' + cls : '');
  d.textContent = text;
  palOutput.appendChild(d);
  palOutput.scrollTop = palOutput.scrollHeight;
}

function palPrintH(html, cls) {
  const d = document.createElement('div');
  d.className = 'pal-line' + (cls ? ' ' + cls : '');
  d.innerHTML = html;
  palOutput.appendChild(d);
  palOutput.scrollTop = palOutput.scrollHeight;
}

const COMMANDS = {
  help() {
    palPrint('');
    palPrint('Commands:', 'hi');
    const cmds = [
      ['whoami', 'About Abdurrahman'],
      ['projects', 'All projects'],
      ['skills', 'Tech stack'],
      ['homelab', 'Infrastructure status'],
      ['spotify', 'Now playing'],
      ['neofetch', 'System info'],
      ['contact', 'Contact info'],
      ['clear', 'Clear output'],
    ];
    cmds.forEach(([c, d]) => {
      palPrintH('  <span style="color:var(--accent);display:inline-block;min-width:160px">' + c + '</span><span style="color:var(--text-2)">' + d + '</span>');
    });
    palPrint('');
  },
  whoami() {
    palPrint('');
    palPrint('Abdurrahman (tox9c)', 'hi');
    palPrint('3rd-year Engineering · Cybersecurity & Cloud Computing');
    palPrint('NTU, Iraq · Part-time IT at TAQA');
    palPrint('Builds apps, trains models, runs a homelab.');
    palPrint('');
  },
  projects() {
    palPrint('');
    const projects = [
      '01  Athenas Core         Agentic multi-agent IDE (Rust/Tauri)',
      '02  OsSecurity           Real-time ransomware detector',
      '03  E-Commerce           Full-stack store (Next.js, Prisma)',
      '04  Football Predictor   ML model — 58.77% accuracy',
      '05  Social Media         Real-time platform (Socket.io)',
      '06  CashPilot            Personal finance tracker',
      '07  PriceHawk            Price tracking tool',
    ];
    projects.forEach(l => palPrint(l));
    palPrint('');
  },
  skills() {
    palPrint('');
    const skills = [
      ['Frontend', 'Next.js · React · TypeScript · Tailwind'],
      ['Backend ', 'Node.js · Express · PostgreSQL · Prisma'],
      ['AI / ML ', 'Python · XGBoost · Data analysis'],
      ['Systems ', 'Rust · Tauri · OS security'],
      ['Infra   ', 'Tailscale · Pi-hole · Jellyfin · Docker'],
    ];
    skills.forEach(([k, v]) => {
      palPrintH('  <span style="color:var(--text-2)">' + k + ' ─── </span>' + v);
    });
    palPrint('');
  },
  homelab() {
    palPrint('');
    palPrint('Services:', 'hi');
    palPrint('');
    const services = [
      '  ● Jellyfin     ONLINE   Self-hosted media server',
      '  ● Pi-hole      ONLINE   DNS ad blocker (network-wide)',
      '  ● Tailscale    ONLINE   Mesh VPN — access from anywhere',
    ];
    services.forEach(l => palPrint(l, 'ok'));
    palPrint('');
    palPrint('All running 24/7 on own hardware.', 'dim');
    palPrint('');
  },
  spotify() {
    palPrint('');
    palPrint('Now playing:', 'hi');
    const track = document.getElementById('spot-track').textContent;
    const artist = document.getElementById('spot-artist').textContent;
    palPrint('  ' + track);
    palPrint('  ' + artist, 'dim');
    palPrint('');
  },
  contact() {
    palPrint('');
    palPrint('Contact:', 'hi');
    palPrint('  Email  → hello@tox9c.dev');
    palPrint('  GitHub → github.com/TOX9C');
    palPrint('  X      → x.com/tox9c');
    palPrint('');
  },
  neofetch() {
    palPrint('');
    palPrintH('  <span style="color:var(--accent)"> ████████╗ ██████╗ ██╗  ██╗   </span> <span style="color:var(--text)">tox9c</span><span style="color:var(--text-2)">@terrain</span>');
    palPrintH('  <span style="color:var(--accent)">    ██╔══╝██╔═══██╗╚██╗██╔╝   </span> <span style="color:var(--text-2)">────────────────</span>');
    palPrintH('  <span style="color:var(--accent)">    ██║   ██║   ██║ ╚███╔╝    </span> OS: terrainOS v3.0');
    palPrintH('  <span style="color:var(--accent)">    ██║   ██║   ██║ ██╔██╗    </span> Stack: Next.js / Rust / Python');
    palPrintH('  <span style="color:var(--accent)">    ██║   ╚██████╔╝██╔╝ ██╗   </span> Homelab: Jellyfin · Pi-hole · Tailscale');
    palPrintH('  <span style="color:var(--accent)">    ╚═╝    ╚═════╝ ╚═╝  ╚═╝   </span> AI: 58.77% match prediction');
    palPrintH('                                ML: XGBoost · CatBoost · LightGBM');
    palPrintH('                                Status: <span style="color:var(--accent)">Available for hire</span>');
    palPrint('');
  },
  clear() {
    palOutput.innerHTML = '';
  },
};

function runCommand(raw) {
  const low = raw.toLowerCase().trim();
  if (!low) return;
  palPrint('> ' + raw, 'cmd');
  if (COMMANDS[low]) {
    COMMANDS[low]();
  } else if (low === 'sudo rm -rf /') {
    palPrint('');
    palPrint('nice try.', 'err');
    palPrint('');
  } else {
    palPrint("command not found: " + raw + " — try 'help'", 'err');
    palPrint('');
  }
}

palInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const val = palInput.value.trim();
    if (val) runCommand(val);
    palInput.value = '';
  }
  if (e.key === 'Escape') {
    closePalette();
  }
});

overlay.addEventListener('click', e => {
  if (e.target === overlay) closePalette();
});

document.addEventListener('keydown', e => {
  if (paletteOpen && e.key === 'Escape') {
    closePalette();
    return;
  }
  if (e.key === '/' && !paletteOpen) {
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    e.preventDefault();
    openPalette();
    return;
  }
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    if (paletteOpen) closePalette();
    else openPalette();
  }
});
