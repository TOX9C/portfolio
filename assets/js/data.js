/* Verified project + site content. Facts come from CONTENT.md (source of truth). */

export const PROJECTS = [
  {
    id: 'athenas',
    index: '01',
    name: 'Athenas Core',
    tag: 'multi-agent desktop IDE',
    desc: 'Desktop IDE where parallel AI agents analyse, review and reason about code in dedicated workspaces. Multi-provider LLM support with MCP.',
    // This dossier used to be a screenshot and a component count. A
    // reviewer's note was that the portfolio reads as a gallery rather than
    // evidence of engineering — the CI, the test suite and the release
    // pipeline were all one click away and none of it was on the page. The
    // numbers below are the ones a technical reader actually weighs.
    features: [
      'Parallel agents in dedicated workspaces',
      'Multi-provider LLM support over MCP',
      '914 Rust tests and 48 end-to-end specs, run in CI on every push',
      '166 IPC commands across 163 Dioxus components',
      '9 tagged releases, signed macOS build, Homebrew cask'
    ],
    stats: [
      { value: '914', label: 'tests in CI' },
      { value: '9', label: 'tagged releases' }
    ],
    // The counts above are the only headline numbers on this site that
    // nothing outside the repo can confirm, so the repo commands that
    // produce them are printed alongside them.
    evidence: "grep -rhoE '#\\[(tokio::)?test\\]' --include=*.rs . | wc -l → 914 · grep -rhoE '#\\[tauri::command\\]' src-tauri/src | wc -l → 166",
    repo: 'TOX9C/athenas-core',
    shipped: { last: 'Nov 2026', commits: 486 },
    stack: ['Rust', 'Tauri 2', 'Dioxus', 'MCP', 'multi-agent'],
    images: [
      { src: 'assets/projects/athenas-workspace.webp', alt: 'Athenas Core multi-agent workspace' },
      { src: 'assets/projects/athenas-agent.webp', alt: 'Athenas Core agent panel' },
      { src: 'assets/projects/athenas-pixel-art.webp', alt: 'Athenas Core pixel-art owl mascot' }
    ],
    links: [
      { label: 'Visit site', href: 'https://tox9c.github.io/athenas-core/', primary: true },
      { label: 'Source', href: 'https://github.com/TOX9C/athenas-core' }
    ],
    hue: '#54E1FF',
    landmark: 'owl'
  },
  {
    id: 'commerce',
    index: '02',
    name: 'E-Commerce',
    tag: 'live store · taking orders',
    desc: 'Full store: catalog, cart, checkout, order management and an admin dashboard. Deployed live and taking orders.',
    features: [
      'Catalog, cart and checkout end to end',
      'Order management with an admin dashboard',
      'Deployed live and taking orders'
    ],
    stats: [
      { value: 'LIVE', label: 'deployed store' },
      { value: '5', label: 'store surfaces' }
    ],
    repo: 'TOX9C/ecommerce',
    shipped: { last: 'Oct 2026', commits: 19 },
    stack: ['Next.js 16', 'TypeScript', 'PostgreSQL', 'Prisma'],
    images: [
      { src: 'assets/projects/ecommerce-landing.webp', alt: 'E-commerce landing page' },
      { src: 'assets/projects/ecommerce-products.webp', alt: 'E-commerce product catalog' }
    ],
    links: [
      { label: 'Visit store', href: 'https://ecommerce-ten-flame-39.vercel.app', primary: true },
      { label: 'Source', href: 'https://github.com/TOX9C/ecommerce' }
    ],
    hue: '#9FD8FF',
    landmark: 'store'
  },
  {
    id: 'social',
    index: '03',
    name: 'Social',
    tag: 'real-time social platform',
    desc: 'Real-time social platform: posts, feeds, profiles, notifications and direct messages over WebSockets.',
    features: [
      'Posts and feeds with user profiles',
      'Notifications and direct messages',
      'Real-time transport over WebSockets'
    ],
    stats: [
      { value: 'WS', label: 'websocket DMs' },
      { value: '5', label: 'core surfaces' }
    ],
    repo: 'TOX9C/social-media',
    shipped: { last: 'Nov 2025', commits: 27 },
    stack: ['React 19', 'socket.io', 'Express', 'Prisma'],
    images: [
      { src: 'assets/projects/social-home.webp', alt: 'Social platform home feed' },
      { src: 'assets/projects/social-messages.webp', alt: 'Social platform direct messages' }
    ],
    links: [{ label: 'Source', href: 'https://github.com/TOX9C/social-media', primary: true }],
    hue: '#7CF2E0',
    landmark: 'antenna'
  },
  {
    id: 'cashpilot',
    index: '04',
    name: 'CashPilot',
    tag: 'personal finance dashboard',
    desc: 'Personal finance in one dashboard: accounts, transactions, budgets and savings goals.',
    features: [
      'Accounts and transaction history',
      'Budgets and savings goals',
      'Four finance modules in one dashboard'
    ],
    stats: [
      { value: '4', label: 'finance modules' },
      { value: '1', label: 'dashboard' }
    ],
    repo: 'TOX9C/cashPilot',
    shipped: { last: 'Dec 2025', commits: 9 },
    stack: ['React 19', 'Express 5', 'Prisma', 'PostgreSQL'],
    images: [
      { src: 'assets/projects/cashpilot-dashboard.webp', alt: 'CashPilot finance dashboard' },
      { src: 'assets/projects/cashpilot-goals.webp', alt: 'CashPilot savings goals' }
    ],
    links: [{ label: 'Source', href: 'https://github.com/TOX9C/cashPilot', primary: true }],
    hue: '#8FD6FF',
    landmark: 'vault'
  },
  {
    id: 'pricehawk',
    index: '05',
    name: 'PriceHawk',
    tag: 'cross-store price tracker · deployed',
    // The scraper module declares five stores (AMAZON, WALMART, TARGET,
    // BESTBUY, EBAY). The card said three and named a set that included
    // eBay but not Target or Best Buy; the live deploy says "9+ major
    // retailers", which the code does not support. Five is what the code
    // does, so five is what the card says.
    desc: 'Price tracker across Amazon, Walmart, Target, Best Buy and eBay with history charts and price alerts.',
    features: [
      'Tracks Amazon, Walmart, Target, Best Buy and eBay',
      'Price history charts per product',
      'Alerts when a tracked price drops'
    ],
    stats: [
      { value: '5', label: 'stores tracked' },
      { value: '24/7', label: 'alerts' }
    ],
    repo: 'TOX9C/price-tracker',
    shipped: { last: 'Nov 2026', commits: 13 },
    stack: ['price history', 'charts', 'alerts'],
    images: [
      { src: 'assets/projects/pricehawk-landing.webp', alt: 'PriceHawk tracking a product with price history' }
    ],
    links: [
      { label: 'Visit live', href: 'https://pricehawk-theta.vercel.app', primary: true },
      { label: 'Source', href: 'https://github.com/TOX9C/price-tracker' }
    ],
    hue: '#54E1FF',
    landmark: 'radar'
  },
  {
    id: 'ossecurity',
    index: '06',
    name: 'OsSecurity',
    tag: 'OS-level ransomware detector',
    desc: 'Ransomware detector: OS-level file monitoring with real-time encryption alerts.',
    // The only landmark on this map that was not built alone. GitHub's own
    // contributor list puts 7 of the repo's 24 commits under other people,
    // so the card says so rather than letting the site's "sole author"
    // framing imply otherwise. Team work is a stronger signal than a solo
    // claim nobody can check.
    credit: 'Built with theflash1211 and ZezOok · 17 of 24 commits mine',
    features: [
      'OS-level file system monitoring',
      'Encryption behaviour detection',
      'Real-time alerts the moment files change'
    ],
    stats: [
      { value: 'OS', label: 'file monitoring' },
      { value: 'REAL-TIME', label: 'encryption alerts' }
    ],
    repo: 'TOX9C/OsSecurity',
    shipped: { last: 'Apr 2026', commits: 24 },
    stack: ['OS-level monitoring', 'encryption detection', 'alerts'],
    images: [
      { src: 'assets/projects/ossecurity-terminal.webp', alt: 'OsSecurity terminal output' }
    ],
    links: [{ label: 'Source', href: 'https://github.com/TOX9C/OsSecurity', primary: true }],
    hue: '#7CF2E0',
    landmark: 'shield'
  },
  {
    id: 'football',
    index: '07',
    name: 'Football Predictor',
    tag: 'XGBoost · live ELO rankings',
    desc: 'XGBoost match-outcome model on pre-match ELO, form and head-to-head features only. 52.8% on held-out matches against a 45.2% always-home baseline.',
    features: [
      'XGBoost match outcome model',
      '52.8% on 2,892 held-out matches vs 45.2% baseline',
      'Live ELO rankings'
    ],
    stats: [
      { value: '52.8%', label: 'held-out accuracy' },
      { value: 'ELO', label: 'live rankings' }
    ],
    repo: 'TOX9C/football-predictor',
    shipped: { last: 'Nov 2026', commits: 18 },
    stack: ['Python', 'XGBoost'],
    images: [
      { src: 'assets/projects/football-predictor-ui.webp', alt: 'Football predictor interface' }
    ],
    links: [{ label: 'Source', href: 'https://github.com/TOX9C/football-predictor', primary: true }],
    hue: '#8FD6FF',
    landmark: 'pitch'
  }
];

export const PROJECT_BY_ID = Object.fromEntries(PROJECTS.map((p) => [p.id, p]));

/* Resolve a project from whatever the visitor typed. The terminal used to
   accept only the exact id, so "dossier 01", "dossier athenas-core" and
   "dossier E-Commerce" all failed even though every other command worked. */
export function resolveProject(input) {
  if (!input) return null;
  const q = String(input).trim().toLowerCase();
  if (!q) return null;

  // Exact id first.
  if (PROJECT_BY_ID[q]) return PROJECT_BY_ID[q];

  // Index number: 1, 01, 7, 07.
  const asIndex = Number(q.replace(/^sys[-\s]?/, '').replace(/^0+(?=\d)/, ''));
  if (Number.isInteger(asIndex) && asIndex >= 1 && asIndex <= PROJECTS.length) {
    return PROJECTS[asIndex - 1];
  }

  // Name and common spellings, ignoring case, spaces, hyphens and underscores.
  const key = (s) => s.toLowerCase().replace(/[\s\-_]+/g, '');
  const target = key(q);
  const byName = PROJECTS.find((p) => key(p.name) === target);
  if (byName) return byName;

  // Substring match, so "football" finds "Football Predictor".
  const partial = PROJECTS.find((p) => key(p.name).includes(target));
  if (partial) return partial;

  // A few obvious aliases people reach for.
  const ALIASES = {
    ide: 'athenas', store: 'commerce', shop: 'commerce', ecommerce: 'commerce',
    social: 'social', cash: 'cashpilot', finance: 'cashpilot', price: 'pricehawk',
    prices: 'pricehawk', tracker: 'pricehawk', security: 'ossecurity',
    ransomware: 'ossecurity', football: 'football', predictor: 'football'
  };
  const alias = ALIASES[target];
  return alias ? PROJECT_BY_ID[alias] : null;
}

export const TERMINAL_COMMANDS = {
  help: {
    lines: [
      'available commands:',
      '  whoami      identity & credentials',
      '  projects    seven shipped systems',
      '  dossier     open one system  (dossier 1 | dossier athenas | dossier football)',
      '  skills      the stack',
      '  lab         home server services',
      '  contact     channels',
      '  hire        same as contact',
      '  clear       wipe this log'
    ]
  },
  whoami: {
    lines: [
      'abdurrahman (tox9c)',
      '3rd-year B.Eng — Cybersecurity & Cloud Computing, NTU (Iraq)',
      'part-time IT at TAQA — weekdays',
      'awarded by the university president',
      'status: open to internships & junior roles'
    ]
  },
  projects: {
    lines: [
      ...PROJECTS.map((p) => `  ${p.index}  ${p.name.padEnd(20, ' ')} ${p.tag}`),
      '→ inspect one: dossier athenas'
    ]
  },
  skills: {
    lines: [
      'frontend   Next.js / React / TypeScript / Tailwind',
      'backend    Node.js / Express / PostgreSQL / Prisma',
      'ai+systems Python / XGBoost / Rust / Tauri',
      'infra      Docker / Tailscale / Pi-hole / Jellyfin'
    ]
  },
  lab: {
    lines: [
      'Jellyfin  — media server, self-hosted streaming, zero subscriptions  [running]',
      'Pi-hole   — network-wide DNS ad blocker                               [running]',
      'Tailscale — mesh VPN, secure access from anywhere                     [running]'
    ]
  },
  contact: {
    lines: [
      'github   https://github.com/TOX9C',
      'linkedin https://www.linkedin.com/in/tox9c',
      'x        https://x.com/tox9c',
      'discord  tox9c_  (handle — add me in the app)',
      'email    abdulrahmansafah@gmail.com'
    ]
  }
};

TERMINAL_COMMANDS.hire = TERMINAL_COMMANDS.contact;
