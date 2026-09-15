#!/usr/bin/env bash
# Capture preview screenshots for things.html.
#
# Shots are taken at 2x the display width so they stay sharp on retina, then
# converted to AVIF with a WebP fallback. Re-run this when a site changes;
# the browser chrome around each shot is drawn in CSS, not baked in here.
#
# Usage: tools/capture-previews.sh [slug ...]   (no args = all)

set -uo pipefail
cd "$(dirname "$0")/.."
OUT=previews
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
# A 1440x900 CSS viewport is an ordinary laptop, so layouts break the way a
# visitor would see them. --force-device-scale-factor=2 gives a retina capture.
W=1440; H=900
# Pages whose content arrives after load (map tiles, canvas animation) cannot be
# captured by headless Chrome, which shoots on the load event and races them.
# Those are listed in SLOW and shot from a real browser instead.
SLOW="vasutterkep bankito-animation"

# slug|url
TARGETS='
ovikreta|https://igazolasovikreta.app.jazzrabbit.eu
vasutterkep|https://vasutterkep.hu
monday|https://monnndayyy.com
nyarilud|https://nyarilud.hu
framerfejleszto|https://framerfejleszto.hu
almosgaleotti|https://almosgaleotti.com
snake|https://snake.app.jazzrabbit.eu
moralmachine|https://moralmachine.app.jazzrabbit.eu
holiday-scheduler|https://csongrave.app.jazzrabbit.eu
telegramtometatrader|https://telegramtometatrader.com
bankito-animation|https://lukacsaron.github.io/bankito22-animation/
spellbook|https://spellbook.app.jazzrabbit.eu
banding|https://banding.app.jazzrabbit.eu
kaleidoscope|https://kaleidoscope.app.jazzrabbit.eu
'

mkdir -p "$OUT" .cache/shots
want=("$@")
matches() { [ ${#want[@]} -eq 0 ] && return 0; for w in "${want[@]}"; do [ "$w" = "$1" ] && return 0; done; return 1; }

printf '%s\n' "$TARGETS" | while IFS='|' read -r slug url; do
  [ -z "$slug" ] && continue
  matches "$slug" || continue
  png=".cache/shots/${slug}.png"
  # swiftshader gives headless a working WebGL stack; --disable-gpu kills it.
  # A page that animates forever never exhausts its virtual time budget and
  # Chrome hangs, so every capture gets a hard wall-clock deadline.
  "$CHROME" --headless=new --use-angle=swiftshader --enable-unsafe-swiftshader \
    --hide-scrollbars --no-sandbox \
    --force-device-scale-factor=2 --window-size="${W},${H}" \
    --virtual-time-budget=12000 --screenshot="$png" "$url" >/dev/null 2>&1 &
  pid=$!
  for _ in $(seq 1 45); do kill -0 "$pid" 2>/dev/null || break; sleep 1; done
  kill -9 "$pid" 2>/dev/null; wait "$pid" 2>/dev/null

  if [ ! -s "$png" ]; then echo "FAIL  $slug"; continue; fi
  # ffmpeg here has neither a webp nor a usable avif encoder; use the real ones
  sips --resampleWidth 1280 "$png" --out "$png.1280.png" >/dev/null 2>&1
  avifenc -q 62 -s 6 "$png.1280.png" "$OUT/${slug}.avif" >/dev/null 2>&1
  cwebp -quiet -q 82 "$png.1280.png" -o "$OUT/${slug}.webp" >/dev/null 2>&1
  rm -f "$png.1280.png"
  printf 'ok    %-22s avif=%-7s webp=%s\n' "$slug" \
    "$(du -h "$OUT/${slug}.avif" 2>/dev/null | cut -f1)" \
    "$(du -h "$OUT/${slug}.webp" 2>/dev/null | cut -f1)"
done
