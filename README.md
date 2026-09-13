# iamaron.com

Source for [iamaron.com](https://iamaron.com), my personal site.

## What it is

Three pages.

`index.html` covers how I got from festival communications to selling AI software: [LogiNet](https://loginet.com/) and [22.design](https://22.design/) now, and before that Bánkitó Festival, Auróra, field production for Vice and Al Jazeera, a print-on-demand startup that failed, and a stint touring with an organist. A sticky profile column on the left, a scrolling bento grid of cards on the right, collapsing to one column on mobile.

`things.html` is an index of twenty-three things I built or organised between 2017 and 2026, grouped by theme rather than by date: public tools, client sites, festival work, small automations, video series, and press. Editorial rows with a year gutter instead of a bento grid, because there are no images on that page and empty cards look thin.

`barents-spektakel.html` archives a piece I wrote for PHENOM in 2019 about volunteering at Barents Spektakel in Kirkenes, with its 15 photographs mirrored locally so the page does not rot when someone reorganises a CMS. English translation by default, the Hungarian as published behind the language switch.

## Build

There is no build. `index.html`, `styles.css`, and the media sit next to each other and nginx serves them.

```bash
python3 -m http.server 8000
```

```bash
docker build -t iamaron .
docker run -p 8080:80 iamaron
```

Deployed through Coolify from the Dockerfile.

## Things in here worth stealing

- **Connected-dots canvas background.** Particles drift, link to neighbours within 150px with a gradient line, and push away from the cursor. Density scales with viewport area, so a phone does not render 400 nodes.
- **Waving favicon.** Seven SVG data-URI frames of 👋 swapped every 100ms, restarting every three seconds.
- **Person JSON-LD** covering roles, employers, and past organisations, so search engines get the career without parsing prose.
- **Endorsement card stack** and achievement tickers, both CSS-only.
- **Year gutter** on `things.html`. The structural device is real data rather than invented `01 / 02 / 03` numbering, since a list of projects is an index, not a sequence. The episode lists inside it *are* sequences, so those are numbered.
- **Two-file translation** rather than one page toggling hidden copies: no JS, no flash of the wrong language, and `hreflang` lets both versions get indexed.

## Files

```
index.html                 the main page, its JSON-LD, and the inline scripts
things.html                index of everything I've built or organised
barents-spektakel.html     the PHENOM piece, translated
barents-spektakel.hu.html  the same piece, as originally published
styles.css                 shared tokens, buttons, bento grid
things.css                 the index layout
article.css                the article layout
article.js                 particles + gallery lightbox, shared by both article pages
linkedin-header.html       a separate 1584×396 banner I render and screenshot
aron.jpg / aron.mp4 / opengraph.png
photos/ logos/
photos/barents/            15 originals, with 1600px display copies in display/
```

Every page is listed individually in the `Dockerfile`, so a new one needs a `COPY` line or it 404s in production.

## Copy

The last commit was a pass to strip AI writing tells out of the copy. If a sentence here reads like it came out of a model, it slipped through.

## License

Code is MIT. Photographs, text, and my face are not.
