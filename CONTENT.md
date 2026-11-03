# CONTENT.md — Source of Truth (DO NOT ALTER FACTS)

Every fact, name, number, and link on the site MUST come from this file.
The redesign may change presentation freely; it may NEVER invent, drop, or
distort the facts below. No lorem ipsum, no placeholder stats, no fake claims.

## Identity
- Name: Abdurrahman, handle **tox9c**
- Email: abdulrahmansafah@gmail.com
- Location: Iraq (Asia/Baghdad, UTC+3) — "based in Iraq, working worldwide"
- Tagline: "Builds systems that think."
- Status: **Open to internships & junior roles**
- Awarded by the university president

## Credentials
- 3rd-year B.Eng, Cybersecurity & Cloud Computing, NTU (Iraq)
- Part-time IT at TAQA (one of the largest companies in Iraq), weekdays

## Projects (7 shipped — all must appear or be reachable)

| # | Project | One-liner (facts only) | Stack | Links | Screenshots available |
|---|---------|------------------------|-------|-------|----------------------|
| 1 | Athenas Core | Desktop IDE where parallel AI agents analyse, review and reason about code in dedicated workspaces. 476 commits, 914 Rust tests + 48 e2e specs in CI, 9 tagged releases with a signed macOS build and Homebrew cask, 166 IPC commands, 163 components, multi-provider LLM support. | Rust / Tauri 2 / Dioxus / MCP / multi-agent | github.com/TOX9C/athenas-core | athenas-workspace.png, athenas-agent.png, athenas-pixel-art.png |
| 2 | E-Commerce | Full store: catalog, cart, checkout, order management, admin dashboard. Deployed live, taking orders. | Next.js 16 / TypeScript / PostgreSQL / Prisma | LIVE: ecommerce-ten-flame-39.vercel.app | ecommerce-landing.jpg, ecommerce-products.jpg |
| 3 | Social | Real-time social platform: posts, feeds, profiles, notifications, DMs over WebSockets. | React 19 / socket.io / Express / Prisma | github.com/TOX9C/social-media | social-home.png, social-messages.png |
| 4 | CashPilot | Personal finance: accounts, transactions, budgets, savings goals in one dashboard. | React 19 / Express 5 / Prisma / PostgreSQL | github.com/TOX9C/cashPilot | cashpilot-dashboard.jpg, cashpilot-goals.jpg |
| 5 | PriceHawk | Price tracker across Amazon, Walmart & eBay with history charts and alerts. | — | github.com/TOX9C/price-tracker | pricehawk-landing.png |
| 6 | OsSecurity | Ransomware detector: OS-level file monitoring, real-time encryption alerts. | — | github.com/TOX9C/OsSecurity | ossecurity-terminal.png |
| 7 | Football Predictor | XGBoost match-outcome model on pre-match ELO, form and head-to-head features only. **52.8% accuracy on 2,892 held-out matches** (2022-23 & 2023-24 seasons), vs a 45.2% always-home baseline; live ELO rankings. | Python / XGBoost | github.com/TOX9C/football-predictor | football-predictor-ui.png |

Git short-hashes used as decoration on the old site (a14e0c1, 9c3d7f2,
5fb21a8, 2e8a04b, 04f9e1d, 0b71c3a, 8d5a1e9) are presentation, not facts.

## Skills stack
- Frontend: Next.js / React / TypeScript / Tailwind
- Backend: Node.js / Express / PostgreSQL / Prisma
- AI / systems: Python / XGBoost / Rust / Tauri
- Infra: Docker / Tailscale / Pi-hole / Jellyfin

## Homelab ("why rent infrastructure when you can run your own?")
- Jellyfin — media server, self-hosted streaming, zero subscriptions — running
- Pi-hole — network-wide DNS ad blocker — running
- Tailscale — mesh VPN, secure access from anywhere — running

## About (verbatim source material)
"I've trained machine learning models, built a ransomware detector from
scratch, and shipped a multi-agent IDE written in Rust. I also work part-time
in IT at TAQA. Away from the editor I run a home server with Jellyfin,
Pi-hole, and Tailscale: my own little cloud. Awarded by the university
president."

## Links (exact)
- GitHub: https://github.com/TOX9C
- LinkedIn: https://www.linkedin.com/in/tox9c
- X: https://x.com/tox9c
- Discord: https://discord.com/users/tox9c_
- Email: mailto:abdulrahmansafah@gmail.com

## Honest-numbers policy
The old site showed real numbers only: 7 projects shipped, 3 homelab
services, model accuracy 58.77%. Keep this principle — every metric
displayed must be verifiable. Never round up, never invent.

**Corrected 2026-10-30:** the old 58.77% figure was a *validation* score
from a 74-feature model that included leakage (same-match shot counts and
full-dataset league rates). It was never a held-out test score — the
report's own test column was empty. That pipeline was deleted in the
August 2026 rebuild. Re-running the rebuilt pipeline's clean, temporally-
safe features over four leagues gives **52.8% on 2,892 held-out matches**
(2022-23 and 2023-24 seasons) against a 45.2% always-home baseline on the
same test set. The site states 52.8% and names the baseline and sample
size.

**Re-verified 2026-10-30 (round 5):** the 52.8% was still not reproducible
from the shipped code. Three defects, all now fixed in the football repo:

1. The pipeline cache key hashed only the raw CSV files, not the requested
   league set — so `--leagues pl ll bl sa` silently reused a one-league
   dataset and reported 47.6% on 760 matches.
2. The training script applied balanced class weights plus a 1.5x draw
   boost. That made the model call 48.4% of matches a draw against a true
   rate of 25.3% and dropped accuracy to **44.2% — below the 45.2%
   baseline the claim is measured against**. Weights are now uniform.
3. `training_log.txt` was written by a script that no longer existed
   (`src/run_extended_training.py`); it claimed a 500-trial search that
   "completed" in four seconds and left its accuracy section empty.

The shipped command now reproduces the published figure:

    python -m src.train --model xgboost --leagues pl ll bl sa
    Test Accuracy: 52.8%   (2,892 held-out matches, 45.19% baseline)

Across seeds 42/7/13/101/2024 accuracy ranges 52.35% - 53.04% (mean
52.71%). `tests/test_accuracy.py` pins the accuracy, the match count and
the baseline. The repo's README, `training_log.txt`, the GitHub repo
description, the site and the résumé PDF all now carry the same 52.8% /
45.2% / 2,892 figures.

**Other figures re-checked against the live repos (2026-10-30):**
- Athenas Core: **476 commits**, not 600. 9 published releases, latest
  v3.5.3 (Oct 24 2026).
- Other six repo commit counts confirmed exact: E-Commerce 17, Social 27,
  CashPilot 9, PriceHawk 12, OsSecurity 24, Football Predictor 15.
- Athenas Core: **166 registered Tauri IPC commands** (157 unconditional,
  9 behind the on-by-default `voice`/`relay` features) and **163
  `#[component]` functions** across 80 component files — not "78 IPC
  commands, 85+ components".
- Tailwind is genuinely used by E-Commerce, Social and CashPilot
  (`tailwind.config.ts` / `.js` in each frontend), so the stack rack's
  "shipped on" list holds.
- The live store's footer still carried template placeholder contact
  details ("123 Commerce Street", "hello@store.com"). **Fixed 2026-10-30:**
  the ecommerce repo is now cloned locally and its footer states the truth
  — a demo storefront for a portfolio project, Baghdad, Iraq, reachable at
  the owner's real email. The fake phone row was removed rather than
  replaced with another invented number. Committed upstream as `cca7a29`
  (the live site is a Vercel deploy and needs a push to go live).

**Re-verified 2026-10-31 (round 6):** a hiring-manager reviewer with no
prior context spent a dozen API calls checking the site's own claims and
found four soft spots. All four are fixed:

- **OsSecurity was not built alone, and the site implied it was.** GitHub's
  contributor list: TOX9C 17, `theflash1211` 4, `ZezOok` 3 — 29% of the
  repo's 24 commits belong to two other people. The contact section said
  "the person who built all seven systems on this map". The card now names
  the collaborators and the contact copy says OsSecurity was a team build.
- **PriceHawk's store count was wrong, and the site hid its live deploy.**
  The scraper module declares five stores (AMAZON, WALMART, TARGET,
  BESTBUY, EBAY). The card said three and named a set that dropped Target
  and Best Buy; the live deploy says "9+ major retailers", which the code
  does not support. The card now says five, names them, and links
  `pricehawk-theta.vercel.app` — a complete live product the site was not
  linking at all, while claiming "one deployed live". It is two now.
- **The homelab panel faked live telemetry.** "3/3 online" and
  "uptime 112d 06h" were static strings in the markup — nothing polls the
  box. It is now labelled a manual readout with the date it was taken
  (25 Oct 2026, per `git log -S "112d 06h"`).
- **The one unverifiable number sat in the verifiable row.** The hero chips
  held "1 university president award" — a bare count, beside metrics that
  are all checkable. The chips are now 7 landmarks / 2 live deploys /
  3 homelab services, all verifiable. The award stays in the profile card
  as a credential, which is what it is.

Also fixed: an orphaned `</div>` after the skip link, and the "166 IPC /
160+" counts now print the repo command that produces them
(`grep -rhoE '#[tauri::command]' src-tauri/src | wc -l` → 166; 163
`#[component]` functions across 80 files).

**Open, needs a decision:** `<link rel="canonical">` points at
`tox9c.github.io/portfolio/`, which is correct as this repo's Pages URL —
but the live `main` branch still serves the OLD design with 58.77% / 78 IPC
/ 85+ components. Two public pages of the same person disagree on two
flagship metrics until this branch is merged and deployed. The canonical
tag is right; the old page needs replacing.

**Security note (not the portfolio's, but linked from it):**
`price-tracker/pricehawk-web/src/lib/scrapers/index.ts` shipped a
hardcoded ScraperAPI key as a fallback —
`process.env.SCRAPER_API_KEY || "0c3ff4…"` — in a public repo.
**Fixed 2026-11-03** (commit `6b12eea`): the fallback is gone and the
scraper now throws if the variable is unset. **The key itself still needs
rotating in the ScraperAPI dashboard** and the new value setting in Vercel
— it is in the git history, so it is compromised regardless of the commit.

**Re-verified 2026-11-03 (round 7):** two reviewers (7.0 and 7.5) both went
for the links first and found the same class of problem — the linked
artifacts did not back the claims, mostly because fixes were committed
locally and never pushed.

- **The marquee claim's repo contradicted it.** The football-predictor
  README opened with "⚠️ Total rebuild in progress" and stated no accuracy
  at all. The number was reproducible (the fix from round 5 was in a local
  commit), but the public README had never been pushed. Now pushed and
  re-run: `Test Accuracy: 52.8%`, support 2,892 (D 733 / L 852 / W 1307);
  1307/2892 = 45.19% baseline, so +7.5pp holds.
- **Two repo homepage URLs were dead.** `ecommerce-beige-beta-79` and
  `social-media-mu-flame` both return 404. The store's homepage now points
  at `ecommerce-ten-flame-39` (which serves) and social-media's is cleared.
- **A third live deploy was hidden.** `tox9c.github.io/athenas-core/` is a
  real product page with downloads and releases; the site claimed "two
  deploys running live". It is three, and the Athenas site is linked.
- **The dossier lacked engineering evidence.** Added: 914 Rust tests +
  48 e2e specs in CI, 9 tagged releases, signed macOS build, Homebrew cask.
  (Reproduce with `grep -rhoE '#\[(tokio::)?test\]' --include=*.rs . | wc -l`.)
- **Reply to "476 commits vs the API's 461":** the contributors endpoint
  undercounts — it only counts commits whose author is linked to a GitHub
  account. Commits on `main` number 476 (page 476 = 1 commit, 477 = empty),
  which is what the card says. Kept.

**Fixed from the same round:** mobile hero reflow (the diorama was at
y=730 on an 844px screen; identity and the full map are now above the
fold), the dead Discord link (needs the numeric id — it is a handle now),
a missing semicolon that dropped `.dossier`'s box-shadow, and the 10.2px
provenance type raised to 12.5px.

## Personality signals worth keeping
- Interactive terminal with real commands: help, whoami, projects, skills, lab, contact, hire (alias of contact), clear
- Live Baghdad clock + page session uptime
- Marquee voice: "systems that think / security first / self-hosted / real-time / rust on the desktop"
- Git-flavored project presentation (commit/staging metaphors)
- Fonts shipped locally: Archivo Variable, JetBrainsMono Variable (assets/fonts/)
- 12 project screenshots in assets/projects/ — real shots, use them or better real ones, never stock
