# Island nav and writing feed

Date: 2026-10-03
Status: approved in conversation, awaiting spec review

## Goal

Two additions to iamaron.com:

1. A floating navigation component ("the Island") on every page, linking home, Things I built, Things I wrote, and a way to get in touch. It should be the most striking piece of UI on the site, not a utility bar.
2. A new feed page, `writing.html`, listing writing by Aron and press written about him, kept visibly apart.

## Constraints

- No build step, no framework. Hand-written HTML, CSS and vanilla JS next to the existing files, served by nginx.
- Every new file needs a `COPY` line in the `Dockerfile` or it 404s in production.
- Reuse existing tokens in `styles.css` (`--color-*`, `--shadow-*`) and the `gradient-1x` accent classes. Fonts stay Inter and Bricolage Grotesque, plus one addition: Instrument Serif, used only for press mastheads.
- New copy follows the site's anti-AI-writing rule (see README, "Copy").
- Respect `prefers-reduced-motion`.

## Pages in scope

| Page | Today | After |
|---|---|---|
| `index.html` | dot rail + `things-fab` pill | dot rail stays; `things-fab` removed; Island added |
| `things.html` | topbar (`← Aron Lukacs`, GitHub) | topbar removed; Island added; Press section links to feed |
| `barents-spektakel.html` | topbar (`← Things`, lang switch) | back link removed, lang switch kept; Island with progress ring |
| `barents-spektakel.hu.html` | same | same |
| `minner-ux-tippek.html` | topbar (`← Things`) | topbar removed; Island with progress ring |
| `writing.html` | does not exist | new; Island added |

`linkedin-header.html` is a render target, not a page. It gets no Island.

## 1. The Island

### Markup (static, in every page)

Each page carries the same plain nav before `</body>`, so navigation works without JS and is crawlable:

```html
<nav class="island" aria-label="Site">
  <a class="island-home" href="/"><img src="aron.jpg" alt="" width="28" height="28"><span>Aron</span></a>
  <a class="island-link" href="things.html" data-panel="built">Built <sup>39</sup></a>
  <a class="island-link" href="writing.html" data-panel="wrote">Wrote</a>
  <a class="island-talk" href="mailto:aron.lukacs@gmail.com">Talk</a>
</nav>
```

- The current page's link gets `aria-current="page"`, written by hand in each file.
- On `index.html`, `Talk` gets `data-calendly`. `island.js` intercepts the click and calls `#open-calendly`'s `.click()`, which reuses the existing GSAP modal code unchanged. The `mailto:` stays as the no-JS fallback.
- "Wrote" carries no count: a number mixing Aron's pieces with press about him would mislead.

### Look

- Fixed, bottom centre, `bottom: max(16px, env(safe-area-inset-bottom))`.
- Dark frosted glass: charcoal (`--color-text`) at roughly 82% opacity, `backdrop-filter: blur(16px) saturate(1.4)`, 1px light inner border, `--shadow-lg`.
- Pill radius, white text, Inter 500 at 14px. The `sup` count is set smaller in the secondary colour.
- The active item shows a 5px gradient dot underneath, using the `gradient-1b` colours.
- z-index sits above the bento grid and dot rail, below the Calendly modal and the article lightbox.

### Panels (JS-enhanced, fine pointers only)

`island.js` builds two panels and inserts them inside the nav, above the link row. All panel content lives in one data object at the top of `island.js`, the single place to edit counts or swap previews.

- **Built panel**: three preview images fanned at -6°, 0° and 6° (`previews/vasutterkep.webp`, `previews/ovikreta.webp`, `previews/snake.webp`; AVIF via `<picture>`), plus the text "39 things, 2012–2026" and an arrow link to `things.html`.
- **Wrote panel**: the two "by me" covers as small thumbnails with their titles, then the line "13 pieces written about me", then the three newest outlet names, then an arrow link to `writing.html`.

Behaviour:

- **Morph**: the pill and panel are one element. Opening animates its width and height (a CSS grid `grid-template-rows: 0fr → 1fr` transition plus a width transition), so the pill appears to stretch upward. The link row does not move.
- **Open**: `pointerenter` on a `data-panel` link, after a 120ms intent delay, or `focus` on that link (no delay).
- **Switch**: moving between Built and Wrote while open cross-fades the panel content without closing.
- **Close**: `pointerleave` from the whole nav (200ms grace), `Escape` (focus returns to the trigger link), or a click outside.
- **Touch**: panels are only enabled under `(hover: hover) and (pointer: fine)`. On touch, links just navigate.
- **ARIA**: trigger links get `aria-expanded` and `aria-controls`; each panel is a labelled region. Links inside panels are reachable with Tab.

### Scroll collapse

- Collapse runs only after `scrollY > 200` and only while scrolling down, with a 6px hysteresis so trackpad jitter doesn't flicker it. The pill shrinks to the avatar alone (other items fade out and their width transitions to 0).
- Any upward scroll, hover, or keyboard focus inside the nav expands it again.
- The nav never collapses while a panel is open.
- Uses a passive scroll listener with `requestAnimationFrame` throttling.

### Reading progress ring (article pages)

- Opt in with `<nav class="island" data-progress>`.
- An SVG circle around the avatar with `stroke-dasharray`/`stroke-dashoffset` tracks scroll through `.article-body`, from 0 to 100%.
- The stroke uses the gradient accent. Under reduced motion it still updates, just without the transition easing.

### Reduced motion

Under `prefers-reduced-motion: reduce`, the morph, collapse and fan run with no transition: state changes are instant and the fanned previews are not rotated.

### Removals

- Delete `.things-fab` markup from `index.html` and its CSS from `styles.css`, including the mobile rules.
- Delete `.topbar` markup from `things.html` and the two article templates. The `.topbar` CSS in `things.css` and `article.css` stays only as far as the Barents pages still need it: the lang switch moves into a small `.article-lang` block at the top of `.article-header`.
- The `index.html` dot rail stays. On mobile it is already hidden, and on desktop it sits on the right edge, clear of the Island.

## 2. Writing feed: `writing.html` + `writing.css`

### Head

- Title "Things I wrote | Aron Lukacs", meta description, canonical, and OG/Twitter tags following the pattern of `things.html`.
- Favicon ✍️. Particle canvas and script copied from `things.html`, to match its background.
- JSON-LD `CollectionPage` whose `hasPart` lists the two articles as `Article`.

### Hero

- H1: "Things I wrote, and a few written <em class="intro-accent gradient-1a">about me</em>"
- A lead paragraph of two or three sentences, saying the first two are Aron's and the rest are other people's record of things he ran, and that press links go to where the pieces were published.
- Filter chips: `All`, `By me`, `About me`, then a divider, then `EN`, `HU`. These are `<button aria-pressed>` elements. The type chips are mutually exclusive, and the language chips toggle as a separate filter. A few lines of inline JS set `hidden` on non-matching items using `data-kind` and `data-lang` attributes. Without JS the chips are hidden (`.js` class on `<html>`), and everything shows.
- If a filter combination matches nothing, a quiet "Nothing in that combination." line appears.

### By me

Two large cards, in a two-column grid on desktop and one column below 760px:

| | Barents Spektakel | Minner |
|---|---|---|
| Image | `photos/barents/display/2019-03-04_12-38-11_130604.jpg` | `photos/minner/ux-tipp-minner-konverzio.{avif,webp}` |
| Kicker | PHENOM · February 2019 | MINNER · October 2024 |
| Title | We went to the coldest festival in the world | 10+1 UX tipp a konverziód növeléséhez karácsony előtt |
| Lang | EN + HU (two links) | HU |
| Reading time | computed from the article word count at 220 wpm, hard-coded | same |
| Link | `barents-spektakel.html` (+ `.hu.html`) | `minner-ux-tippek.html` |

The whole card is clickable via a stretched link on the title. On hover the image scales 1.03 and the card lifts with `--shadow-lg`.

### About me: clippings wall

A responsive grid: `repeat(auto-fill, minmax(240px, 1fr))`, with `grid-auto-flow: dense`.

Each clipping is an `<a>` opening in a new tab with `rel="noopener noreferrer"`, and contains:

- **Masthead**: the outlet name in Instrument Serif, with a hairline rule under it. Type only, no logos.
- **Headline**: the real published headline, in its original language, with `lang` set.
- **Context line**: one short English line saying what it's about (e.g. "on Égboltkép's Shark Tank deal").
- **Footer**: year · language tag · ↗.

Paper treatment: an off-white fill slightly warmer than `--color-card`, a faint shadow, and a rotation picked by `:nth-child` from a set of -1.5°, 0.8°, -0.6°, 1.2°. On hover or focus it rotates to 0, lifts 4px and gets a deeper shadow. Under reduced motion there is no rotation at all.

Entries come from the existing press links on `index.html` and `things.html`:

| Outlet | Subject | Year | Lang | URL |
|---|---|---|---|---|
| Forbes.hu | Égboltkép Shark Tank deal | 2020 | HU | forbes.hu/uzlet/balogh-petya-tulnyerte-magat-capak-kozott-lukacs-aron-egboltkep/ |
| RTL | the pitch | 2020 | HU | rtl.hu/capakkozott/2020/04/27/ime-a-vallalkozo-aki-lehozza-a-csillagokat-az-egrol |
| RTL | Balogh Péter on the deal | 2020 | HU | rtl.hu/capakkozott/2020/04/29/balogh-peter-nem-az-egboltkepbe-hanem-aronba-szalltam-be |
| RTL | what happened after | 2021 | HU | rtl.hu/capakkozott/2021/04/09/sikersztori-mi-tortent-az-egboltkeppel-a-befektetes-utan |
| Hello Biznisz | Shark Tank episode recap | 2020 | HU | hellobiznisz.telekom.hu/capak-kozott-1-adas-osszefoglalo |
| Contextus | BUSH 2019 interview | 2019 | HU | contextus.hu/budapest-showcase-hub-bush-2019-fellepok-interju/ |
| Phenom | Sound of Silence charity concert | 2018 | HU | phenom.hu/vannak-dolgok-amik-ugyanazt-jelentik-… |
| Magyar Narancs | Auróra interview | from page | HU | magyarnarancs.hu/lokal/mindent-meg-fogunk-tenni-lukacs-aron-aurora-105042/ |
| Index | Auróra closure order | 2017 | HU | index.hu/belfold/2017/06/28/azonnali_hatallyal_bezarjak_az_aurorat/ |
| HVG | Auróra | 2014 | HU | hvg.hu/itthon/20141222_Elszabadult_az_Aurora |
| InfoRádió | Nem maradunk csendben | 2017 | HU | infostart.hu/belfold/2017/04/15/elkezdodott-a-tuntetes-a-szabadsag-teren |
| 24.hu | Nem maradunk csendben, live | 2017 | HU | 24.hu/belfold/2017/04/15/mar-bemelegit-a-zajos-tuntetes-… |
| Dívány | BiTS labo.fr | 2013 | HU | divany.hu/offline/2013/10/25/avantgard_kreaciokba_bujtatna_az_utolso_halandot_a_bits_labo/ |

The clippings are ordered newest first. Each headline and year is fetched from the live URL during implementation and never invented. If a URL is dead or has no readable headline, the clipping uses the subject as its title, and the item is listed for Aron in the final report. Every clipping is HU, so the `EN` chip matches only the Barents card. That is accepted, and the chip is still useful.

The 13 entries above match the "13 pieces written about me" line in the Island panel. If any entry is dropped, update that number in the `island.js` data.

### Footer

Same `page-footer` pattern as `things.html`, with links back to the main page and to Things I built.

## 3. Cross-links and housekeeping

- The articles' former `← Things` link is replaced by the Island, whose `Wrote` item is marked current on article pages.
- The `things.html` Press section aside gets one line: "My own writing, and the full press list, is on <a href="writing.html">the writing page</a>."
- `index.html`: the "Things I've built" bento card stays. The dot rail gets a second external dot, "Things I wrote" → `writing.html`.
- `Dockerfile`: add `COPY` lines for `writing.html`, `writing.css`, `island.css` and `island.js`.
- `README.md`: update the page count, add `writing.html` to "What it is", add the four new files to "Files", and add the Island to "Things in here worth stealing".

## Files

| File | Change |
|---|---|
| `island.css` | new: Island styles, panels, collapse, progress ring |
| `island.js` | new: panel data and builder, open/close, scroll collapse, progress ring, Calendly hook |
| `writing.html` | new: feed page |
| `writing.css` | new: hero chips, by-me cards, clippings wall |
| `index.html` | remove `things-fab`, add Island markup and assets, add dot-rail entry |
| `styles.css` | remove `.things-fab` rules |
| `things.html` | remove topbar, add Island, add Press-aside link |
| `barents-spektakel*.html`, `minner-ux-tippek.html` | remove back link, add Island with `data-progress`, move lang switch |
| `article.css`, `things.css` | trim unused topbar rules, add `.article-lang` |
| `Dockerfile`, `README.md` | as above |

## Verification

There is no test suite. Verification is manual against a local server (`python3 -m http.server 8000`), with Chrome screenshots:

1. All six pages at 1440×900 and 390×844. The Island renders and doesn't cover content, and there is no horizontal scroll.
2. Desktop: hovering Built and Wrote morphs the panel. Switching between them cross-fades. Leaving, Esc and an outside click all close it. Tab reaches every link and focus opens the panel.
3. Scrolling down past 200px collapses the Island, and scrolling up restores it. On article pages the progress ring goes from 0 to 100%.
4. Home page: Talk opens Calendly. Other pages: Talk is a mailto.
5. Feed: each chip combination filters correctly, the empty state appears, and with JS disabled everything shows and the chips are hidden.
6. Reduced motion emulated: no transitions or rotation, and everything still works.
7. Console free of errors on every page.
8. `docker build` succeeds, and the container serves `writing.html`, `island.css` and `island.js`.
