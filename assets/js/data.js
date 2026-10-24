/* Verified project + site content. Facts come from CONTENT.md (source of truth). */

export const PROJECTS = [
  {
    id: 'athenas',
    index: '01',
    name: 'Athenas Core',
    tag: 'multi-agent desktop IDE',
    desc: 'Desktop IDE where parallel AI agents analyse, review and reason about code in dedicated workspaces. Multi-provider LLM support with MCP.',
    stats: [
      { value: '78', label: 'IPC commands' },
      { value: '85+', label: 'components' }
    ],
    stack: ['Rust', 'Tauri 2', 'Dioxus', 'MCP', 'multi-agent'],
    images: [
      { src: 'assets/projects/athenas-workspace.png', alt: 'Athenas Core multi-agent workspace' },
      { src: 'assets/projects/athenas-agent.png', alt: 'Athenas Core agent panel' },
      { src: 'assets/projects/athenas-pixel-art.png', alt: 'Athenas Core pixel-art owl mascot' }
    ],
    links: [{ label: 'Source', href: 'https://github.com/TOX9C/athenas-core', primary: true }],
    hue: '#54E1FF',
    landmark: 'owl'
  },
  {
    id: 'commerce',
    index: '02',
    name: 'E-Commerce',
    tag: 'live store · taking orders',
    desc: 'Full store: catalog, cart, checkout, order management and an admin dashboard. Deployed live and taking orders.',
    stats: [
      { value: 'LIVE', label: 'deployed store' },
      { value: '5', label: 'store surfaces' }
    ],
    stack: ['Next.js 16', 'TypeScript', 'PostgreSQL', 'Prisma'],
    images: [
      { src: 'assets/projects/ecommerce-landing.jpg', alt: 'E-commerce landing page' },
      { src: 'assets/projects/ecommerce-products.jpg', alt: 'E-commerce product catalog' }
    ],
    links: [
      { label: 'Visit store', href: 'https://ecommerce-ten-flame-39.vercel.app', primary: true },
      { label: 'Source', href: 'https://github.com/TOX9C/ecommerce' }
    ],
    hue: '#FFB65C',
    landmark: 'store'
  },
  {
    id: 'social',
    index: '03',
    name: 'Social',
    tag: 'real-time social platform',
    desc: 'Real-time social platform: posts, feeds, profiles, notifications and direct messages over WebSockets.',
    stats: [
      { value: 'WS', label: 'websocket DMs' },
      { value: '5', label: 'core surfaces' }
    ],
    stack: ['React 19', 'socket.io', 'Express', 'Prisma'],
    images: [
      { src: 'assets/projects/social-home.png', alt: 'Social platform home feed' },
      { src: 'assets/projects/social-messages.png', alt: 'Social platform direct messages' }
    ],
    links: [{ label: 'Source', href: 'https://github.com/TOX9C/social-media', primary: true }],
    hue: '#FF5C9A',
    landmark: 'antenna'
  },
  {
    id: 'cashpilot',
    index: '04',
    name: 'CashPilot',
    tag: 'personal finance dashboard',
    desc: 'Personal finance in one dashboard: accounts, transactions, budgets and savings goals.',
    stats: [
      { value: '4', label: 'finance modules' },
      { value: '1', label: 'dashboard' }
    ],
    stack: ['React 19', 'Express 5', 'Prisma', 'PostgreSQL'],
    images: [
      { src: 'assets/projects/cashpilot-dashboard.jpg', alt: 'CashPilot finance dashboard' },
      { src: 'assets/projects/cashpilot-goals.jpg', alt: 'CashPilot savings goals' }
    ],
    links: [{ label: 'Source', href: 'https://github.com/TOX9C/cashPilot', primary: true }],
    hue: '#7CF29B',
    landmark: 'vault'
  },
  {
    id: 'pricehawk',
    index: '05',
    name: 'PriceHawk',
    tag: 'cross-store price tracker',
    desc: 'Price tracker across Amazon, Walmart and eBay with history charts and price alerts.',
    stats: [
      { value: '3', label: 'stores tracked' },
      { value: '24/7', label: 'alerts' }
    ],
    stack: ['price history', 'charts', 'alerts'],
    images: [
      { src: 'assets/projects/pricehawk-landing.png', alt: 'PriceHawk landing page' }
    ],
    links: [{ label: 'Source', href: 'https://github.com/TOX9C/price-tracker', primary: true }],
    hue: '#54E1FF',
    landmark: 'radar'
  },
  {
    id: 'ossecurity',
    index: '06',
    name: 'OsSecurity',
    tag: 'OS-level ransomware detector',
    desc: 'Ransomware detector: OS-level file monitoring with real-time encryption alerts.',
    stats: [
      { value: 'OS', label: 'file monitoring' },
      { value: 'REAL-TIME', label: 'encryption alerts' }
    ],
    stack: ['OS-level monitoring', 'encryption detection', 'alerts'],
    images: [
      { src: 'assets/projects/ossecurity-terminal.png', alt: 'OsSecurity terminal output' }
    ],
    links: [{ label: 'Source', href: 'https://github.com/TOX9C/OsSecurity', primary: true }],
    hue: '#FF5C9A',
    landmark: 'shield'
  },
  {
    id: 'football',
    index: '07',
    name: 'Football Predictor',
    tag: 'XGBoost · live ELO rankings',
    desc: 'XGBoost model with 58.77% accuracy that beats bookmaker baselines, plus live ELO rankings.',
    stats: [
      { value: '58.77%', label: 'model accuracy' },
      { value: 'ELO', label: 'live rankings' }
    ],
    stack: ['Python', 'XGBoost'],
    images: [
      { src: 'assets/projects/football-predictor-ui.png', alt: 'Football predictor interface' }
    ],
    links: [{ label: 'Source', href: 'https://github.com/TOX9C/football-predictor', primary: true }],
    hue: '#7CF29B',
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
      'discord  https://discord.com/users/tox9c_',
      'email    abdulrahmansafah@gmail.com'
    ]
  }
};

TERMINAL_COMMANDS.hire = TERMINAL_COMMANDS.contact;
