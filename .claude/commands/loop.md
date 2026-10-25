# /loop — Portfolio Redesign Loop

You are the LOOP ORCHESTRATOR. Your job: completely redesign this portfolio
website until three independent reviewer agents are wowed and rate it
≥ 9/10. You have no budget limits and no time pressure — quality is the
only exit condition. Persistence rules (resume tokens, iteration caps,
async behavior) follow $ARGUMENTS if given; otherwise use the defaults
written below.

---

## THE GOAL

A person opens this site and is wowed in the first 3 seconds, trusts it
within 30, and remembers it tomorrow. Target tier: Awwwards Site-of-the-Day
nominee quality — on the level of Bruno Simon, Cyd Stumpel, Thibaud Fellay.
Not a template. Not generic. A signature piece that itself demonstrates
engineering skill.

## INVARIANTS (never negotiable, every iteration)

1. **CONTENT.md is law.** Every fact, number, name, email, and link comes
   from `/CONTENT.md`. Never invent stats, never drop a project, never
   break a link. No lorem ipsum, no stock images, no placeholder copy.
2. **Real screenshots only** from `assets/projects/` (or freshly captured
   real ones of the actual projects — never fake/mockup filler).
3. **Static and deployable**: the final site must run as static files
   (HTML/CSS/JS, any framework you like, but `build` → plain static output).
4. **Accessibility floor**: semantic HTML, keyboard navigable, visible focus,
   `prefers-reduced-motion` fully respected, AA contrast. Wow ≠ hostile.
5. **Performance floor**: Lighthouse performance ≥ 90 on desktop, fonts
   preloaded, images sized/lazy, no console errors or warnings.
6. **Works with JS degraded**: core content (projects, about, contact) must
   be readable if JavaScript fails.
7. **Mobile is co-equal**: 390px viewport is designed, not shrunk.

---

## PHASE 0 — RESEARCH (once, before any code)

1. Study the highest-rated developer portfolios live right now:
   - https://www.awwwards.com/websites/developer-portfolio/ (browse nominees
     + winners, open at least 8 actual sites)
   - https://godly.website, https://land-book.com, https://siteinspire.com,
     https://minimal.gallery
   - X/Twitter: search "portfolio" filtered to design/dev accounts with high
     engagement; Reddit: r/webdev + r/web_design portfolio feedback and
     "roast my portfolio" threads — harvest what gets praised vs. mocked.
2. Write `RESEARCH.md`: for each of ≥ 10 references — URL, one-line wow
   moment, the specific technique that creates it (scroll choreography,
   type treatment, 3D, cursor physics, page transitions…), and whether it
   fits this project. Also list ≥ 10 anti-patterns the community mocks.
3. Write `DESIGN.md`: the creative direction for THIS site — concept,
   type system, color system, motion language, layout grammar, and the ONE
   signature moment people will screenshot. It must be meaningfully distinct
   from the current dark-terminal/brutalist site (that language stays
   available as the terminal section, not the whole identity). Verify every
   planned content block maps to CONTENT.md facts.
4. **Fact audit (mandatory before archive).** Read the entire current
   `index.html` end to end — every tagline, list item, terminal command,
   table row, href. Diff against CONTENT.md: any fact present in
   index.html but absent from CONTENT.md gets ADDED to CONTENT.md now.
   Phase 0 is the only time CONTENT.md may grow. Repeat until the diff is
   empty — after archive, index.html stops being a fact source.
5. **Baseline + archive.** Ensure a clean committed baseline
   (`git add -A; git diff --cached --quiet || git commit -m "pre-loop
   baseline"`; init the repo first if none exists). Then move the old
   `index.html` → `_archive/`. Content now lives in CONTENT.md; the old
   design is history, not a base.

## THE LOOP (repeat until PASS)

### Iteration N

1. **Implement / revise.** Apply this iteration's scope (iteration 1 = full
   build per DESIGN.md; later iterations = the reviewers' ranked fixes).
   Commit before changing anything (`git commit -am "loop: iter N start"`),
   so every state is rollback-able. Never regress an invariant.
2. **Verify.** Serve the built site locally. Drive a real browser:
   screenshot 1440px and 390px viewports at top, mid-page, and bottom;
   click nav links, run the terminal commands, submit nothing fake.
   If your harness has no browser tool, fall back to:
   `npx playwright screenshot --viewport-size=1440,900 <url> shot-d.png` and
   `--viewport-size=390,844 <url> shot-m.png` (add `--full-page`), then
   view the PNGs — rendered review is mandatory, never code-only.
   Confirm: zero console errors, all invariants hold, every link in
   CONTENT.md resolves on-page. Fix what you find before review.
3. **Launch three reviewers in PARALLEL** (separate sub-agents, separate
   contexts, fresh every iteration). They are READ-ONLY critics who must
   open the RENDERED site (screenshots at multiple viewports + scroll
   positions, plus the code) — never edit it. Anti-inflation rules:
   - Each reviewer gets ONLY: its verbatim brief below, CONTENT.md, and
     the local URL/path. NEVER prior reviews, prior scores, LOGBOOK.md,
     or any hint that an exit gate exists. Fresh blind eyes each cycle.
   - Use these briefs verbatim, every iteration, no softening:

   > **REVIEWER A — Awwwards jury member.** You have nominated three SOTD
   > winners this year. Score design originality, typography craft, motion
   > quality, spatial composition, and whether this page has ONE signature
   > moment worth a screenshot. Calibration: 10 = you'd fight the jury for
   > it; 9 = you'd nominate it today with zero fixes left to suggest;
   > 8 = strong work, clearly below nomination; ≤7 = template-tier. Scores
   > of 9-10 are RARE — most excellent sites you review land at 8.
   > Question: "would I nominate this, or scroll past?"

   > **REVIEWER B — Tech recruiter with 200 portfolios in the queue.** You
   > give this one 30 seconds. In that time can you answer: who is this,
   > what stack, best 3 projects, what proof backs each claim, how to
   > contact? Flag every moment of confusion, every unverifiable or
   > fluffy claim, every buried fact. Calibration: 10 = you'd call the
   > candidate before closing the tab; 9 = zero friction, zero doubt;
   > below that, list exactly what cost the points. Evidence or it
   > didn't happen: attach screenshot lines, not vibes.

   > **REVIEWER C — Staff frontend engineer doing a perf + a11y audit.**
   > Check code quality, interaction correctness (terminal, clocks,
   > animations — run them), reduced-motion behavior, semantics, focus
   > order, contrast, mobile at 390px, console cleanliness, asset weight.
   > Calibration: 10 = you'd ship this as your own; 9 = zero audit
   > findings; every finding costs points. Each deduction MUST cite the
   > file/line, console output, or screenshot evidence.

   Gatekeeping sentiment is prohibited: reviewers do not know prior
   scores and must score THIS render on its merits against the
   calibration ladder — never relative to "last time."

4. **Collect strict verdicts.** Each reviewer MUST return exactly:

   ```
   REVIEWER [A|B|C] — iter N
   score: X/10
   wow: yes|no
   wow_moments: [specific things that impressed, or "none"]
   flaws: [ranked, most damaging first, with evidence/screenshot ref]
   fixes: [concrete actions, ordered, specific enough to implement blindly]
   ```

   Write them to `reviews/iter-N/A.md`, `reviews/iter-N/B.md`,
   `reviews/iter-N/C.md`. Reject and re-run any review that is vague
   ("looks nice", "could improve spacing") — demand specificity.

5. **Score gate.** PASS requires ALL of: every score ≥ 9, every `wow: yes`,
   every flaw list empty at 9+ (a 9 with listed flaws is an 8 — reject and
   re-run that review), AND the same gate passed on the previous iteration
   too. Two consecutive clean passes => the loop runs a MINIMUM of two full
   revision-and-review cycles; a lucky first pass can never end it. Loop
   manipulation is forbidden: never tell reviewers their predecessors'
   scores or that a gate depends on them; each review is blind and fresh.

6. **Synthesize.** Merge the three reviews into `LOGBOOK.md` (append):
   iteration #, scores, the deduplicated ranked fix list for round N+1,
   what was attempted vs. what worked. This file is your memory across
   iterations — read it first every round.

7. **Strategy watchdog.** If 3 consecutive iterations fail to raise the
   minimum score, STOP micro-tweaking: re-open RESEARCH.md, pick a bolder
   direction (new layout grammar, new signature moment), and state the
   pivot in LOGBOOK.md before iterating.

## EXIT

- **PASS gate met** → final verification pass, write `LOGBOOK.md` closing
  summary (iterations taken, score trajectory, final screenshots), report.
- **15 iterations without PASS** → freeze: write `STATE.md` with current
  scores, top remaining flaws, and next planned pivot; stop and report.
  Re-invoking `/loop` resumes from STATE.md — the loop persists, it just
  waits for a human glance at the checkpoint.

## FIRST ACTION

Start at Phase 0. Don't ask questions — everything you need is in
CONTENT.md, RESEARCH is on the open web, and the reviewers define quality.
Begin.
