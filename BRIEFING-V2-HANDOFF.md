# Kory's Daily Briefing v2 — Build Handoff

**To:** Claude running on Kory's PC (Claude Desktop / Claude Code, with local file access)
**From:** A claude.ai session that planned this build and shipped Step 1
**Read this entire document before writing or editing any code.** It replaces the
conversation context you don't have. Do not relitigate decisions listed below;
they were made with Kory and with research he can't easily re-supply.

---

## 1. What this is

Kory's personal site (GitHub Pages, repo `kmclaws/koryclawson`, served from `docs/`)
has a page called Kory's Daily Briefing (`docs/daily-briefing.html`). It is powered
by a Cloudflare Worker that already runs in production:

- **Cron:** 10:30 / 16:30 / 22:30 UTC (5:30a / 11:30a / 5:30p Central daylight time)
- **Pipeline:** Worker fetches ~43 RSS/Atom feeds server-side → an AI "editor pass"
  dedupes, ranks by reader significance, writes 2–3 bullet ledes per desk plus one
  wire sentence → the finished edition is cached as ONE JSON in Workers KV
  (binding `BRIEFING_KV`) → the page makes a single fetch and paints.
- **Routes:** `GET /` serves the latest edition; `GET /refresh` rebuilds on demand
  (optionally guarded by a `REFRESH_KEY` secret, `?key=...`).
- **Budget gate:** Anthropic spend is metered in KV with month-keyed entries,
  hard-stops at **$4.94/month**, auto-resets on the 1st.
- **v0.1 implementation notes:** feed IDs are djb2 hashes of links; editor
  carry-forward expires after 12 h; the RSS/Atom/RDF parser is regex-based with a
  second tag-strip pass after entity decoding (double-encoded HTML); Workers free
  plan (10 ms CPU) — parsing must stay lean, `await`s on fetch don't count as CPU.

**The v2 mission:** upgrade the AI layer to Kory's OpenCode Go plan, expand the
editorial scope to his full 8-desk spec (distilled below from a Copilot prompt he
used to run manually), and redesign the page to executive grade. Your job is to
finish the build, validate it, and hand Kory deploy-ready files plus plain-English
deploy steps. **Kory has no coding experience** — every instruction you give him
must be written for a first-timer, granular, one action per step.

---

## 2. Ground rules — non-negotiable

1. **Zero secrets in artifacts.** The repo is public; anything in `docs/` is scraped
   within minutes. API keys go into **Cloudflare Worker secrets only** (dashboard →
   Settings → Variables and Secrets, or `wrangler secret put`). Never paste a key
   into `worker.js`, any HTML file, this repo, a README, or a chat artifact. Kory's
   OpenCode Go key lives locally in `go.env` on this machine — you may *use* it for
   a local smoke test, but its value must never appear in any file you produce.
   Kory's request to "add API keys" means: walk him through setting Worker secrets.
2. **Brand-word ban.** The literal strings `luxury`, `premium`, `CEO`, and `CIA`
   must not appear anywhere in any delivered file (code, comments, copy, filenames).
   Grep before delivery (gate in §8).
3. **No Pfizer branding** — no Pfizer colors, fonts, assets, or references. This is
   a personal project. Do not use any pfizer-brand skills for it.
4. **The models are editors, not reporters.** DeepSeek/GLM via OpenCode Go have no
   web search. Real-world facts come only from the fetched feeds and data APIs.
   The editor prompt must forbid inventing stories, numbers, or URLs. Every item
   the model outputs must reference a fed-in source link.
5. **The browser never calls an AI endpoint.** All AI calls happen inside the
   Worker. The page fetches one cached JSON. (CORS + key exposure otherwise.)
6. **9Router stays out of production.** It runs at `localhost:20128` on this PC —
   a 5:30am cron cannot reach it and the PC shouldn't need to be awake. It is only
   a local harness for iterating the editor prompt cheaply, if useful.
7. **Single-file deliverables.** One `worker.js`, one `daily-briefing.html`. No
   build tooling, no frameworks, no external JS dependencies on the page.
8. **Lossless behavior on upgrade.** Keep route paths, the KV binding name, the
   cron schedule, the page's existing sessionStorage auth gate, and the Anthropic
   budget-gate mechanics intact unless a change is flagged in the changelog.

---

## 3. Files in hand, files to request

Kory is carrying from the claude.ai session:

- `editor-ai.js` — **Step 1, complete and validated (12/12 mock tests).** The AI
  provider chain, written as a zero-import block to splice into `worker.js`.
- `test-editor-ai.js` — its Node harness (`node test-editor-ai.js`).
- `BRIEFING-V2-HANDOFF.md` — this file.
- Possibly: his original Copilot briefing prompt (.md) and an AI-setup summary
  (.md). Useful reference; §6 already distills the parts that matter. Note the
  setup summary's diagram shows a website calling OpenCode directly — that is
  wrong for production and was corrected (rules 4–5 above).

**Ask Kory for, before coding:**

1. **The production `worker.js`** — source of truth. It is NOT in the GitHub repo.
   Steps for him: dash.cloudflare.com → Workers & Pages → the briefing worker →
   "Edit code" → click in the code → Ctrl+A, Ctrl+C → paste to you / save as a
   file. (If he has the v0.1 files saved locally from the original build and never
   edited the dashboard copy, those work — the dashboard copy is safer.)
2. **The live `docs/daily-briefing.html`** from the repo (needed for Step 3).
3. `wrangler.toml` if he deploys via CLI; if he deploys via the dashboard, skip.

None of the carried files belong in the GitHub repo. `editor-ai.js` gets spliced
into `worker.js` (which deploys to Cloudflare, not GitHub); the harness and this
handoff are local tooling. The only file that ever lands in `docs/` is the
finished `daily-briefing.html`.

---

## 4. Decisions already made — do not relitigate

| Decision | Detail |
|---|---|
| Provider chain | 1) OpenCode Go · `deepseek-v4-pro` → 2) OpenCode Go · `glm-5.2` → 3) Anthropic · `claude-haiku-4-5` (insurance, existing $4.94 gate) → 4) serve last cached edition with a staleness banner. |
| Endpoint | `https://opencode.ai/zen/go/v1/chat/completions`, OpenAI-compatible, bare model ids, `Authorization: Bearer` with the Go key. Model list may drift — verify ids against `https://opencode.ai/zen/go/v1/models` before shipping; if renamed, update `AI_CHAIN` and flag it. |
| Cost posture | Go plan limits are dollar-valued ($12 / rolling 5 h, $30 / wk, $60 / mo). Three editions/day ≈ 1% of that. "Use balance" stays **OFF** in the Zen console so $10/mo is a hard ceiling. Only Anthropic calls meter dollars into the budget gate (`costUSD` from the chain); Go calls meter $0 but log a request count. |
| Editor calls per edition | Three grouped passes for quality and blast-radius isolation: **A)** USA + World + STL/MO, **B)** Markets + Biopharma + Science, **C)** Sports + Extras. A failed group falls back to that group's carry-forward (≤12 h) rather than killing the edition. Collapsing to one mega-call is allowed only if Worker limits force it — flag if so. |
| Market movers | Finnhub free tier has no ranked gainers/losers endpoint. "Notable movers" are derived from what the market-news feeds themselves report. **Flagged deviation** from Kory's original prompt (which asked for a literal top-5 table). |
| Yields / VIX | Reported via news-desk coverage, not a data API, for now. FRED integration is an optional later enhancement — do not build it unprompted. |
| Ground-truth numbers | Index proxies SPY/QQQ/DIA/IWM via Finnhub quotes; BTC + ETH via CoinGecko (keyless). Injected into the model prompt as a verbatim-quote block and rendered on the page as a data strip straight from the JSON — the model never generates a number. |

---

## 5. Step 1 — splice the provider chain into `worker.js`

`editor-ai.js` exports (via a Node-only `module.exports` guard that is inert in the
Worker): `AI_CHAIN`, `runEditorChain(env, opts)`, `callProvider`, `parseModelJSON`.

1. Run the harness first on this machine: `node --check editor-ai.js && node test-editor-ai.js`
   → expect **12 passed, 0 failed**. If Node is missing, install LTS or use any
   available runtime; do not skip.
2. Paste the entire contents of `editor-ai.js` into `worker.js` as a section
   (comment banner included). Strip nothing; the `module.exports` guard is harmless.
3. Replace the v0.1 direct-Haiku call site with `runEditorChain(env, {...})`:
   - `system` / `user`: built per §6.
   - `maxTokens`: size to the group (≈3–5k).
   - `validate`: a shape checker per group (required keys, arrays of items with
     `title`, `link`, `sourceName`; reject otherwise) so a malformed answer falls
     down the chain instead of shipping.
4. Budget gate: charge only `result.costUSD` (nonzero only when
   `providerId === 'anthropic-haiku-4.5'`). Keep the $4.94 stop and month-key reset
   untouched. Add a small month-keyed Go request counter alongside (observability
   only, no gating).
5. Record `providerId` per group into the edition JSON (`editedBy`), so the page
   footer can show which brain edited today's paper.
6. Live smoke (local, allowed): `curl` the `/models` endpoint with the Bearer key
   from `go.env` to confirm the two model ids resolve. Never echo the key into
   output, logs, or files.

---

## 6. Step 2 — the desk map, feeds, ground truth, and date logic

### 6a. Desk map (distilled from Kory's Copilot prompt — this is the editorial spec)

Reader profile for ranking: greater St. Louis resident (Chesterfield / West
County), Arsenal FC first then EPL/UCL, Cardinals/Blues/CITY SC, NFL/NBA/golf,
works in biopharma with an FDA emphasis. Bullets are 1–2 sentences, every item
carries its source link, empty sub-desks say "No major updates," never pad with
old news.

1. **USA News** — top 8–10 across politics/government, economy & markets,
   disasters/severe weather, crime & public safety, science/tech/health,
   other must-know.
2. **World News** — top 8–10 across geopolitics & conflict, international
   politics, disasters & climate, global economy & trade, health & humanitarian,
   crime & security.
3. **St. Louis / Missouri** — local weather + 3-day outlook (Chesterfield/STL,
   include any watches/warnings), local politics & government, crime & safety,
   infrastructure & development, community & events, local business.
4. **Sports** — order matters: **UEFA club competitions first** (EPL/FA Cup/EFL
   news and results; Arsenal-specific block; on UCL matchdays — Tue/Wed, Sep–May —
   UCL is top of the desk with yesterday's results, today's previews, and kickoff
   times in Central time; then the rest of Europe's top-5 leagues). Then American
   pro (NFL, MLB, NBA, NHL, MLS, PGA), college (NCAA football & basketball), and
   an STL block (Cardinals, Blues, CITY SC, Mizzou, SLU).
5. **Wall Street & Markets** — index recap and drivers, futures/pre-market tone,
   volatility read, notable movers *as reported by the feeds* (§4 deviation),
   sector rotation, macro & Fed (yields/dollar/gold/oil via coverage, data
   releases on deck), earnings reported + on deck, M&A/IPOs, big analyst calls,
   brief crypto (BTC/ETH numbers come from the ground-truth block).
6. **Biopharma** — FDA decisions (approvals, CRLs, adcomm outcomes), major Phase
   2/3 readouts, M&A/licensing, notable earnings/restructuring, pipeline/platform
   news, and a vaccine-specific eye (glycoconjugate, mRNA, novel platforms —
   e.g. Vaxcyte, Merck, Moderna coverage).
7. **Publications & Regulatory (7-day window, not 24 h)** — notable new papers/
   preprints in drug discovery, vaccine science, analytical chemistry,
   bioprocessing, novel modalities (ADCs, mRNA, cell/gene, conjugates); new FDA
   guidances / Federal Register notices / ICH / USP updates; high-impact clinical
   pubs; methods & tech (mass spec, SEC-MALS, chromatography, AI/ML in pharma).
   Title + source + 1–2 sentence summary each.
8. **Extras** — one genuinely interesting fun fact (science/history/nature/
   engineering), plus one practice problem using trig, algebra, or calculus
   applied to a real physics/chem/orgo/biochem/engineering scenario; solvable by
   hand in 3–7 minutes; all needed values stated; full worked solution included
   in the JSON but rendered behind a reveal. Must not repeat recent problem
   concepts (see 6e).

**Monday editions:** each news/sports desk leads with a Saturday–Sunday weekend
recap before today's items.

### 6b. Feed audit & additions

Audit the existing FEEDS list in production `worker.js` against the desk map.
Add only what's missing; verify every new URL actually resolves (fetch it once)
before shipping. Likely gaps: Section 7 (PubMed query feeds, Nature, Science,
FDA guidance/press RSS, Federal Register), extra STL locals (KSDK, KMOV, Fox2,
STLPR), sports depth (ESPN, BBC Sport, Sky Sports, Arsenal official), markets
depth (CNBC, MarketWatch). Known v0.1 quirks: Post-Dispatch is bot-walled
(Google News STL query is the backstop); NBC/BBC must be https. Tag each feed
with its desk(s) so grouped editor calls receive only their own pool.

### 6c. Ground-truth numbers block

New Worker fetchers: Finnhub `/quote` for SPY, QQQ, DIA, IWM (secret
`FINNHUB_API_KEY` — Kory has a free key from his Investor HQ project, or mints
one at finnhub.io); CoinGecko simple-price for BTC + ETH (no key). On fetch
failure, the block says so — never let the model fill a gap. The block is passed
to group B's prompt with the instruction "quote these figures verbatim; do not
compute or invent any market number," and is also embedded in the edition JSON
for the page's data strip.

### 6d. Date & edition logic

Computed in the Worker per run (America/Chicago): weekday → Monday recap flag;
UCL matchday flag (Tue/Wed, Sep–May) → sports prompt reorders; edition label
(Morning / Midday / Evening) from the cron hour; header date string
("WEDNESDAY, MAY 6th, 2026" style).

### 6e. Extras anti-repeat memory

KV key holding the last ~14 problems' one-line concept tags (e.g. "first-order
kinetics half-life", "titration curve pH algebra"). Group C's prompt includes
the list with "pick a different scientific concept; similar math is fine."
Append today's tag after a successful build, trim to 14.

### 6f. Edition JSON — bump `schemaVersion: 2`

Sketch (adapt to what v0.1 already has; keep old field names where they still
fit): `{ schemaVersion, generatedAt, editionLabel, headerDate, isMonday,
isUclMatchday, wire, marketData: {...}, desks: [{ id, title, editedBy, lede:
[...], items: [{ title, summary, link, sourceName, subDesk }] }], extras:
{ funFact, problem: { statement, solution, conceptTag } }, meta: { feedsOk,
feedsFailed, goRequestsThisMonth, anthropicSpendThisMonth, stale: bool } }`.
The page must check `schemaVersion` and show a friendly "briefing is being
upgraded" state on mismatch rather than a broken render.

---

## 7. Step 3 — page v2 (`docs/daily-briefing.html`)

Executive Command Board system, same as the rest of Kory's suite:

- **Theme:** dark. Display font Fraunces, body Manrope, numerals/data JetBrains
  Mono (Google Fonts). Palette: royal blue primary, gold and teal accents. Look
  at the v0.1 page and the Marvin app for the exact tokens — reuse, don't invent.
- **Keep:** the sessionStorage auth gate exactly as-is; single fetch to the
  Worker URL; graceful mock/empty state when unreachable.
- **Add:** edition stamp ("Morning Edition — as of 5:30 AM CT") with a staleness
  indicator when `generatedAt` is older than the expected edition or
  `meta.stale`; a cross-desk "Need to Know" top-5 (have the group-A editor pass
  nominate candidates, or synthesize from desk ledes); a sticky desk-rail nav
  (8 desks); the markets data strip rendered from `marketData` only; source link
  on every item; a SOLUTION reveal (`<details>`) for the practice problem;
  Monday recap banner; footer credit line showing `editedBy` provider per
  edition and feed health from `meta`.
- Single file, zero secrets, no external JS. Test rendering against a saved
  sample edition JSON (update or replace `briefing-preview.html` in the same
  offline-mock pattern v0.1 used).

---

## 8. Step 4 — ship gates (all must pass before handing files to Kory)

- [ ] `node --check` on `worker.js` (wrap/strip Worker-only syntax if needed) and
      the editor-ai harness still 12/12.
- [ ] Segmented smoke tests: feed parser on 2–3 real feed samples; grouped
      prompt builder produces sane sizes; shape validators reject a mangled JSON.
- [ ] Forced-failure drill (mock fetch): Go 429 → GLM; both Go down → Haiku with
      cost metered; all three down → previous edition served with `stale: true`
      and the page shows the staleness banner.
- [ ] Budget gate: simulated Anthropic spend crossing $4.94 stops further
      Anthropic calls and the run degrades gracefully.
- [ ] Three-edition render test: morning / midday / evening sample JSONs, plus a
      Monday sample and a UCL-matchday sample, all render correctly in the page.
- [ ] Brand-word grep on every deliverable returns nothing:
      `grep -inE "luxury|premium|\bceo\b|\bcia\b" worker.js docs/daily-briefing.html`
- [ ] Secret scan on every deliverable returns nothing: grep for `sk-`,
      `Bearer [A-Za-z0-9]`, and any substring of keys found in `go.env`.
- [ ] Changelog written: everything v0.2 changes, with **flagged deviations**
      (start from §4's movers + yields items; add any you introduce). No silent
      fixes.
- [ ] Manual test checklist for Kory, plain English.

---

## 9. Deploy sequence (write this out for Kory step-by-step; order matters)

1. **Secrets first** (Cloudflare dashboard → the worker → Settings → Variables
   and Secrets): add `OPENCODE_GO_API_KEY` (from the Zen console at
   opencode.ai/auth — not from a file paste you show on screen) and
   `FINNHUB_API_KEY`. `ANTHROPIC_API_KEY` already exists from v0.1 — leave it.
2. **Deploy the new `worker.js`** (dashboard "Edit code" → replace all → Deploy,
   or `wrangler deploy`).
3. **Seed:** open `https://<worker-url>/refresh` (with `?key=` if set). Confirm
   the returned/served JSON has `schemaVersion: 2` and desks populated.
4. **Then** commit the new `daily-briefing.html` to `docs/` on GitHub (upload →
   replace file → commit). Page before worker = upgrade-state screen, which is
   why the worker goes first.
5. Live checks: page loads in ~1 s; data strip shows real numbers; footer shows
   `go-deepseek-v4-pro` as editor; force a staleness view by temporarily
   pointing at a bogus Worker URL in a local copy if desired.
6. Next morning: confirm the 5:30a CT edition generated on its own; check the
   Zen console usage graph (should be pennies-equivalent within the flat plan)
   and that Anthropic spend stayed $0.

---

## 10. Working with Kory — contract

- **Step-gated:** finish a step, deliver, full stop. Kory says "continue" before
  the next step begins. No silent advancement, no scope creep.
- **Validate before delivery:** syntax checks and smoke tests pass first, every
  time.
- **Changelog with flagged deviations** and a manual test checklist accompany
  every delivered file.
- **Concise prose,** direct and informal, no meta-framing labels ("Expert
  analysis:", "ELI5:"), minimal markdown except checklists.
- **Plain-English instructions** for anything touching a terminal, dashboard, or
  GitHub — assume zero prior experience, one action per step.
- Recommended step order from here: request the two production files (§3) →
  Step 1 splice → Step 2 → Step 3 → Step 4 gates → §9 deploy walkthrough.

## 11. Changelog seed for v0.2

- AI layer: Haiku-only → three-rung chain (Go DeepSeek V4 Pro → Go GLM-5.2 →
  Haiku insurance under the existing $4.94 gate) with timeout, shape-check, and
  stale-cache fallbacks. New Worker secret `OPENCODE_GO_API_KEY`.
- Editorial scope: desk map expanded to the full 8-desk spec incl. STL desk,
  publications/regulatory desk, extras; Monday recap and UCL matchday logic.
- Data: Finnhub + CoinGecko ground-truth block (new secret `FINNHUB_API_KEY`);
  model barred from generating market numbers.
- **Flagged deviation:** movers derived from feed reporting, not a ranked
  gainers/losers table (no free endpoint). **Flagged deviation:** yields/VIX via
  news coverage, not a data API (FRED deferred).
- Page: executive redesign per §7; `schemaVersion: 2` with upgrade-state
  handling.
