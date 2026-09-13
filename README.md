# iamaron.com

Source for [iamaron.com](https://iamaron.com), my personal site.

## What it is

One long page covering how I got from festival communications to selling AI software: [LogiNet](https://loginet.com/) and [22.design](https://22.design/) now, and before that Bánkitó Festival, Auróra, field production for Vice and Al Jazeera, a print-on-demand startup that failed, and a stint touring with an organist.

A sticky profile column on the left, a scrolling bento grid of cards on the right, collapsing to one column on mobile.

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

## Files

```
index.html          the page, its JSON-LD, and the inline scripts
styles.css
linkedin-header.html  a separate 1584×396 banner I render and screenshot
aron.jpg / aron.mp4 / opengraph.png
photos/ logos/
```

## Copy

The last commit was a pass to strip AI writing tells out of the copy. If a sentence here reads like it came out of a model, it slipped through.

## License

Code is MIT. Photographs, text, and my face are not.
