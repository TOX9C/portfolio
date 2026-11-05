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
- **University President Award, 2025** — awarded by Prof. Dr. Aliaa Abbas
  Ali Al-Attar (Arabic: علياء عباس علي العطار), President of Northern
  Technical University, for academic work. Confirmed against NTU's own site,
  which names her as President across multiple official pages. **The year is
  the user's "last year" (2025) — correct it if the award was in a different
  cycle.**

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
- **Superseded 2026-11-03:** these counts were right when written and are
  now stale, because pushing the fixes below moved three of them. The site
  no longer hardcodes them — it fetches each repo's commit count and last
  commit month from the GitHub API on load, cached six hours, with the
  values in `data.js` as the offline fallback. **Keep the fallbacks
  current anyway**, since they are what a visitor sees when the API is
  rate-limited or unreachable. As of this writing:
  Athenas Core 486 (was 476), E-Commerce 19 (was 17), Social 27,
  CashPilot 9, PriceHawk 13, OsSecurity 24, Football Predictor 18.
- Athenas Core: 9 published releases, latest v3.5.3 (Oct 24 2026).
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

**Re-verified 2026-11-03 (round 8, scores 7 / 7 / 8):** the reviewers
converged on two things — the commit counts, and the tab order.

- **The commit counts had already drifted.** Pushing the round-5 and
  round-7 fixes moved three of the seven repos, so the cards were quoting
  stale numbers: Athenas Core is **486** not 476, E-Commerce **19** not 17,
  PriceHawk **13** not 12, Football Predictor **18** not 15 (last commit
  Nov 2026, not Aug). Corrected, and they are now **fetched from the GitHub
  API on load** with a six-hour cache and a static fallback, so they cannot
  drift again. The card and the dossier share the value.
- **The hero's tab order was wrong.** `.stage-canvas` came before
  `.stage-copy` in the DOM, so the first seven tab stops were atlas
  buttons that do not exist until Three.js loads and whose order changes
  with the camera. Copy is first in the DOM now; grid placement keeps the
  two columns in the same place.
- **The proof row hid its own qualifiers on phones** — "Live store" with no
  "Orders open". Restored.
- **Dead CSS removed:** two `.stage-chips span` rules inside
  `@media (max-width:640px)` where `.stage-chips` is `display:none`.
- Reviewer scores are still short of the bar: the recurring criticism is
  that the dossiers state outcomes but not depth, and that the seven
  systems are not scannable as one-line outcomes without opening the atlas.

**Re-verified 2026-11-04 (rounds 9–13, scores 7.5 / 8 / 7 / 7.5 / 8):**
the reviewers' claims table came back all-PASS — commit counts exact,
OsSecurity 17/4/3 exact, 52.8% vs 45.2% matching the README, both deploys
live. What they kept returning to was structure and legibility.

- **Depth in the dossiers.** Two reviewers said the dossiers state outcomes
  and never depth. Every project now carries the one line its numbers
  cannot: the football model's published 52.8% is *lower* than the 58.77%
  it replaced because the old pipeline leaked same-match statistics;
  OsSecurity reads I/O rates from `/proc` and plants decoy files, and
  ships a safe fake-ransomware harness to test itself; Athenas Core's
  oldest commit is an import, not the start of a build. Where a repo has no
  depth to show (no tests, no CI), nothing is claimed.
- **The seven systems are readable in the first screen.** The hero came
  down from 772px to 685px, and the manifest head carries the seven names
  in one line, rendered from `data.js`. Previously no card row could fit
  above the fold at 900px.
- **The map is no longer in the tab order twice.** Each project had a
  focusable landmark *and* a card, and the landmark's tabindex flipped with
  the camera. The map is presentational now; tab stops went 45 → 38.
- **The manifest broke its own readability rule on phones.** A 158px
  auto-fit floor produced 168px cards at 390px — narrower than the 178px
  the same rule calls unreadable. Floor is 200px.
- **The smallest type carried the checkable numbers** (stat badge 10.2px,
  source links 10.5px). Both are 11.5px.
- **In-flight, not yet done:** reviewers still describe the atlas as
  friction for a fast scan and note that no claim has external validation
  (stars, users, independent review) — that is a property of the work, not
  the site.

**Re-verified 2026-11-05 (rounds 14–18, scores 8 / 8 / 8 / 7.5):** every
claims table came back PASS. The reviewers' remaining complaints were
structural, and three are now fixed.

- **The headline claimed a job title he does not hold.** "CYBERSECURITY &
  CLOUD ENGINEER." on a third-year student, in the largest type on a site
  that prints its own corrections. Now "ENGINEERING." — the field, not the
  title. The role line above it carries the year and the institution.
  **If the user prefers the original, this is a one-word revert.**
- **The hero was a wall of type.** Two bands of stats and proof links
  became one; the "Open a dossier" control and its picker dialog were
  removed (the manifest cards and the seven-name index already cover it).
  Hero copy went 772px → 608px, and the manifest's first card row moved
  from y=957 to y=785 at 1440×900.
- **"914 tests in CI" had no door.** The Athenas dossier links the CI
  workflow now. Green on `main`, 179 runs.
- **`aria-current` was hardcoded** on "Projects" and corrected only by JS;
  a failed module left assistive tech told a page had been navigated to.
  The observer owns it now and sets `page`, not `true`.
- Reviewer scores are consistently 7.5–8. The gap to 9 is now about scale
  of evidence (9–27 commits per repo, 0–1 stars, no external users) rather
  than anything wrong with the site.

**Re-verified 2026-11-05 (rounds 20–23, scores 8 / 8 / 7 / 8 / 8):** claims
tables came back PASS or "unchecked with a door". Fixes:

- **Two card "stats" were not numbers** — Social's "WS / websocket DMs" and
  OsSecurity's "OS / file monitoring" sat beside Athenas Core's real "914
  tests in CI". They are 7 Prisma models and 7 Python modules now, both
  countable from the repos. All seven cards now lead with a number or a
  deployed state.
- **`aria-current` was on the dossier image thumbnails.** Those are toggles
  in an image picker, not links in a navigation set; `aria-pressed` now.
- **The seven-name line cleared the phone fold** (y=840 of 844) after the
  hero chips lost their long labels.
- **OsSecurity gained a Contributors link.** A reviewer read the capital O
  in `ZezOok` as a zero and filed it as a typo; the link settles it and
  makes the 17-of-24 split checkable from the card.

**Answered, not changed:** a reviewer noted GitHub's contributors endpoint
sums to 472 for athenas-core while the card says 487. Both are right — 487
is every commit on the default branch (confirmed: page 487 is the repo's
root commit, 0 parents), 472 is only the commits whose author email maps to
a GitHub account. The card uses the former via the `Link` header.

**Deliberate, for the record:** the 3D map is pointer-only — its landmark
buttons carry `aria-hidden` and `tabindex="-1"`. Two earlier reviewers
flagged the opposite problem (every project appearing twice in the tab
order, in a set whose order changed with the camera). The projects stay
keyboard-reachable through the manifest cards and the seven-name line, and
the hero CTA leads to that list. This is the standard split for a canvas
visualisation with equivalent content alongside it; it is a choice, not an
oversight.

**Re-verified 2026-11-05 (rounds 24–28, scores 8 / 8 / 9 / 8 / 8):** the
first 9. A hiring-manager reviewer reproduced all seven commit counts
exactly (including 487 by fetching the last page and landing on the
root commit), the 17-of-24 split, and the 52.8% figure. Defects found and
fixed:

- **The dossier's image picker lost its selected state** — the JS moved
  from `aria-current` to `aria-pressed` but the CSS still matched the old
  attribute, so all seven thumbnails sat at the same opacity and nothing
  showed which image was on screen. A regression this branch introduced.
- **`role="dialog"` was on an `<aside>`.** axe flags it only while the
  panel is open (closed, the element is `aria-hidden` and the rule does not
  apply), so it sat in "incomplete" for several rounds. It is a `<div>` now.
- **The seven-name line was 11.8px on phones**, under this file's own 13px
  floor, on the one line naming the whole set. 12.8px.
- **Card stats that were not numbers** — "24/7 ALERTS", "1 DASHBOARD",
  "REAL-TIME", "ELO" — replaced with counts from the repos or dropped.
- **The atlas fallback blamed JavaScript** when the WebGL context was what
  failed. It says the 3D atlas could not start, which is true either way.
- **The contact section's availability dot was invisible**: 0×0 and
  transparent, because its geometry lived under `.profile-status`, a class
  the profile card no longer uses. Found by auditing the stylesheet for
  selectors that match nothing — every class selector in the file now
  matches something.
- **The résumé PDF build was racy** — sometimes two pages, when the capture
  beat the local fonts. `--run-all-compositor-stages-before-draw`; see the
  command below.
- **"Awarded by the university president" is out of the profile prose.** It
  has no object, year or competition, so it read as padding in a paragraph
  of specific claims. It stays in the profile card and the résumé.
  **The user can make this a real credential** by supplying what it was
  awarded for, when, and by whom.

**Fixed outside this repo:** the PriceHawk deploy claimed "9+ major
retailers" and listed nine stores while its scraper supports five — the
card was right and the deploy was overclaiming. Deploy now lists the five
its code handles and reads the count from that list; the unpaid pricing
tiers are labelled illustrative.

**Re-verified 2026-11-05 (rounds 29–31, scores 8 / 8 / 8):** three more
findings, all precision rather than polish:

- **"914 tests in CI" was not quite true.** `ci.yml` runs
  `cargo test --workspace --exclude athena-terminal` — that crate's tests
  need a real terminal and are skipped on GitHub-hosted runners, which the
  workflow explains. 45 of the 914 never run in CI. The card says "914
  rust tests" and the feature line states the exclusion.
- **The ownership line had a seam.** "OsSecurity was a team build; the rest
  are mine" — Athenas Core's contributor list carries a `claude` account
  (6 commits) and TESTPERSONAL (1). The copy now says solo work with a few
  commits authored by a tooling or test account.
- **`aria-label` on a roleless `div`** (`.profile-id`) — prohibited and
  ignored. `role="group"` now.
- **The HUD clock was invalid and self-erasing.** `<time datetime="">` is
  not a valid value, and its content has to be a valid time string when the
  attribute is absent; and because the script assigned `textContent`, the
  `<em>local</em>` inside it was wiped on the first tick — the readout lost
  its own label after one second. The label sits outside the `<time>` now
  and the script fills in a real ISO timestamp.
- **A card stack line was clipped mid-word** ("POSTGRES" for PostgreSQL) by
  the overflow rather than wrapping. `overflow-wrap:anywhere`, four lines.
- **The "Live store" proof link said "Orders open"**, which does not tell a
  stranger whose store it is. "Built by TOX9C" now, and the store's own
  footer carries an authorship line linking back to GitHub.

**Re-verified 2026-11-05 (rounds 32–33, score 8):** one finding worth the
effort — the commit counts were the only claim on the page a visitor could
watch go wrong, and three of the stored values had already drifted (my own
commits moved E-Commerce to 20, PriceHawk to 14, Football Predictor to 19).
Fixed on both sides:

- The stored values are current.
- A line under the manifest head states provenance: **"commit counts
  fetched live from GitHub"** in accent when every repo answered, or
  **"commit counts as of 5 Nov 2026 — GitHub did not answer"** in faint
  otherwise. A partial answer counts as stored, because that is what the
  visitor would be reading. `STATS_AS_OF` in `data.js` is the one date to
  update.
- Verified by aborting `api.github.com`: blocked, the as-of line shows and
  the stored counts render; restored, the line reads live and every count
  matches the API exactly.

Also: the seven names are now written into the markup as well as into
`data.js`, so a module that throws before it runs cannot leave the page's
central claim blank (a JS-enabled browser never shows the `<noscript>`
list). The tooling-account nuance moved from the contact paragraph to the
Athenas dossier, beside the count it qualifies — in the contact line it
read as a pre-emptive excuse.

**Checked and dismissed:** a reviewer reported a second email address on
the athenas-core deploy. It does not appear there, or in the app UI — the
string survives only in an internal audit document describing where it
used to be.

**Re-verified 2026-11-05 (rounds 34–36, scores 8.5 / 8 / 8):** three
defects, one of them a keyboard trap that had been there for rounds.

- **The mobile menu locked its own close button out of the tab cycle.**
  `trapFocus` was wired to `.hud-nav`; the 44px toggle — whose label flips to
  "Close menu" — is a sibling of the nav inside the header, so a keyboard
  visitor could open the menu and then not Tab to the control that closes it.
  The trap covers the header now; tabbing the open menu cycles Stack / Lab /
  Profile / Contact / menu-toggle / brand / Projects.
- **`role="dialog"` was set on the `<nav>` while the menu was open.**
  `<nav>` maps to the navigation landmark, so overriding it is invalid — and
  axe only reports it while the menu is open, which is why it survived
  several audits. It is the disclosure pattern now: `aria-expanded` +
  `aria-controls` on the toggle, inert background, focus trap, Escape, and
  the navigation landmark intact.
- **The seven names now lead the hero band** instead of trailing it. They sat
  last, under the counts and the proof links, at y=660 desktop / y=844 mobile
  — flush with the fold edge, which is why reviewers kept reading the first
  screen as not carrying them. Now y=540 / y=672.

**Known and deliberate:** `<link rel="canonical">` points at
`tox9c.github.io/portfolio/`, which currently serves the *older* build —
including the 58.77% figure this branch corrected. The tag is right for the
deploy target; the old page is what needs replacing. **Merging this branch
is the fix.** Until then, a crawler sent to the canonical lands on the less
honest version.

**Re-verified 2026-11-05 (rounds 36–37, scores 8 / 8 / 8):** all claims
PASS, including the 472-vs-487 reconciliation ("my 472 reproduces the
documented gap rather than contradicting the card").

- **The headline renamed the degree.** It read "CYBERSECURITY & CLOUD
  ENGINEERING"; six lines elsewhere and the résumé say "Cybersecurity &
  Cloud Computing". It got there in two steps — "ENGINEER" was a job title
  he does not hold, the fix made it "ENGINEERING", which was accurate as a
  field but invented a second name for the degree. It says "COMPUTING." now.
- **The mobile first screen now fits.** The proof row had been landing at
  y=831 against an 844 fold with its third link clipped. Four changes: the
  lede lost its opening sentence (the role line above already says it); the
  stat chips run side by side (45px instead of 62); the names sit after the
  proof links, since at that width they wrap to two lines and were pushing
  the links off; and the small margins tightened. Now actions 550, chips
  655, proof 714–782, names 795–845 — nothing clipped at 320/360/390/430.
- **The phone had no stated card affordance.** `.legend-head p{display:none}`
  hid the only sentence saying the cards open dossiers. A short version
  rides the heading row now, hidden at desktop width.

**Process note:** one commit message in this round claimed a fix that was
never made. Caught on review and corrected in the next commit. The lesson
worth keeping: verify the claim against the file, not against the intent.

## Regenerating the résumé PDF

```bash
/usr/bin/python3 -m http.server 8151 &
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless \
  --disable-gpu --no-sandbox --run-all-compositor-stages-before-draw \
  --print-to-pdf=Abdurrahman-Resume.pdf --no-pdf-header-footer \
  --virtual-time-budget=25000 http://127.0.0.1:8151/resume.html
```

The `--run-all-compositor-stages-before-draw` flag is not optional: without
it the capture sometimes lands before the local fonts load, the fallback
metrics reflow the page and the résumé comes out at two pages instead of
one. `--virtual-time-budget` needs to be generous for the same reason.

## Personality signals worth keeping
- ~~Interactive terminal with commands (help, whoami, projects, …)~~ — the
  old site had one; this design replaced it with the atlas + dossier, and
  the command table had no consumer left. Removed 2026-11-05 as dead code
  (`TERMINAL_COMMANDS`, `resolveProject`, 95 lines).
- Live Baghdad clock + page session uptime
- ~~Marquee: "systems that think / security first / self-hosted / …"~~ — the
  old site ran this as a scrolling strip; this design has no marquee, and the
  wording now lives in the lede and the résumé tagline ("Builds systems that
  think.") rather than in a ticker.
- Git-flavored project presentation (commit/staging metaphors)
- Fonts shipped locally (assets/fonts/, no network fetch): **Pixelify Sans**
  (display), **Sora** (body), **JetBrains Mono** (labels). The old site used
  Archivo Variable; this design does not.
- 12 project screenshots in assets/projects/ — real shots, use them or better real ones, never stock
