---
name: next-seo-page
description: Build the pending SEO pages for 82-0-challenge.com from the keyword queue. Runs WEEKLY and builds the whole pending batch in one go, not one page per run.
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# Build the pending SEO pages (82-0-challenge)

Project: `/Users/mila/Code/82-0-challenge` · Site: `https://www.82-0-challenge.com`

Unlike the tool sites, this runs **weekly and builds every pending entry in one
batch**. Game keywords go stale fast, and the whole reason this site ranks is
that it gets a page up while the keyword is still new and uncontested.

## What this site is

A browser game: draft five players from NBA history and see whether they could
go 82-0 — a perfect 82-game regular season, which has never actually happened
(the record is 73-9). Multiple game modes, eight languages, ad-monetised.

Its SEO shape is one page per keyword, each embedding the playable game. Look at
`/82-0-lebron` or `/82-0-nba` before writing anything.

## The one rule that matters most

**Only build content pages that reuse an existing `FILTERS` id.**

`src/lib/engine` defines the game variants: `classic`, `cap`, `noMvps`,
`oneFranchise`, `oneDecade`, `randomEra`, `hard`, `eraMode`, `lebron`. Each
carries real game logic — `lebron` pre-places LeBron and removes his other era
cards from the pool; `noMvps` filters by MVP ids; `eraMode` has a matching
branch inside GameMain.

A keyword like "82-0 curry" or "82-0 no dunks" implies a **new** variant. That
needs a FILTERS entry with its own pool predicate, possibly player-data work,
and GameMain changes. **That is code, not content — SKIP it and report it for
manual work.** Do not invent a FILTERS entry.

Everything in the current queue reuses `classic`.

## Workflow

### Step 1: Check the queue is fresh

Read `src/data/seo/page-queue.json`. If there are no `pending` entries, stop and
say so — do not invent keywords.

If asked to refresh the queue first: rebuild it from the newest
`product-dofollow-files/82-0-challenge/trends-*-YYYY-MM-DD.csv`. **If no export
is newer than the one the queue was last built from, STOP and build nothing.**
No new data means no new signal, and inventing keywords is how a queue fills up
with pages nobody searches for.

When rebuilding, collapse word-order variants into one intent. "82-0 nba",
"nba 82-0", "82-0 game nba" and "82-0 nba game" are one page. Also drop bare
co-search terms with no "82-0" in them — Trends returns `wordle`, `retro bowl`,
`cool math games` because the same people search those, not because this site
can rank for them.

### Step 2: For each pending entry, in file order

**2a. Add the content block** to `src/locales/en.json` under `pages.<localeKey>`:

```json
{ "title": "...", "description": "...", "h1": "...", "intro": "...",
  "sections": [ { "h2": "...", "paragraphs": ["...", "..."] } ] }
```

Three sections, two paragraphs each, is the house size. Match the register of
`otherSports` and `nbaMode`: concrete, factual, specific numbers. Real records
only — 73-9 (2015-16 Warriors), 72-10 (1995-96 Bulls), the 1971-72 Lakers' 33
straight. Season lengths: NBA and NHL 82, MLB 162, Premier League 38, NFL 17.
**Never invent a statistic.**

**2b. Create both route files.** Missing the second loses seven locales.

`src/app/<slug>/page.js` — copy `src/app/82-0-nba/page.js`, change the
localeKey, the path in `rootMetadata`, the `VariantGame` id if different, and
the three `RelatedLinks` to pages that genuinely relate.

`src/app/[lang]/<slug>/page.js` — copy `src/app/[lang]/82-0-nba/page.js` and
change the import, component name, localeKey and path.

**2c. Mark the entry** `"status": "done"` with `"created": "YYYY-MM-DD"`.

### Step 3: Once, after the whole batch

```bash
cd /Users/mila/Code/82-0-challenge && npx next build && npx next-sitemap
```

The build must pass. `next-sitemap.config.js` scans `src/app` for directories
containing a `page.js`, so new pages enter the sitemap automatically — **do not
hand-edit that config**. Confirm the URL count grew by 8 per page.

### Step 4: Commit and push

```bash
cd /Users/mila/Code/82-0-challenge && git add . && git commit -m "Add SEO pages: <list> (from Trends <date>)" && git push origin main
```

One commit for the batch.

### Step 5: Report

Pages built with their URLs, entries skipped and why (especially any that needed
a new FILTERS variant), the sitemap URL count before and after.

## Translations

English-only is acceptable and is the current practice — `baseball162`,
`eraMode` and `nbaMode` all ship that way. Each page does
`{ ...en.pages.X, ...(t.pages.X || {}) }`, so an untranslated locale renders the
English text rather than breaking. Do not machine-translate into the other seven
locale files as part of this job; that is a separate pass.

## SEO standards

- Title 30-60 characters, contains the keyword.
- Description 120-160 characters, contains the keyword.
- Exactly one H1 (comes from `h1`), 3 H2s (from `sections`).
- 500+ words of visible text across intro and sections.
- Metadata, canonical and hreflang are all handled by `rootMetadata` /
  `pageMetadata` — do not write them by hand.

## Reference files

- Queue: `src/data/seo/page-queue.json` (read `_rules`)
- Reference pages: `src/app/82-0-nba/page.js`, `src/app/[lang]/82-0-nba/page.js`
- Content: `src/locales/en.json` under `pages`
- Game variants: `src/lib/engine` (`FILTERS`)
- Metadata helpers: `src/lib/pageMeta.js`
- Auto-derived, do not hand-edit: `next-sitemap.config.js`
- Keyword exports: `/Users/mila/code/product-dofollow-files/82-0-challenge/`
