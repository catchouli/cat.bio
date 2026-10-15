#!/usr/bin/env bash
# Regenerates the CV PDFs from the HTML sources in src/, using headless Chrome.
#
# Usage:
#   ./build.sh              # rebuild all three PDFs
#   ./build.sh medium       # rebuild just one: full | medium | concise
#
# Edit the HTML/CSS in src/cv-*.html, then re-run this script. The PDFs go in out/
# (git-ignored). cv-medium.html is the main version: it's also copied to
# ../static/cv.pdf, which is the CV linked from the site.

set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT="$DIR/out"
mkdir -p "$OUT"

find_chrome() {
  local candidates=(
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    "/Applications/Chromium.app/Contents/MacOS/Chromium"
    "google-chrome"
    "chromium"
    "chromium-browser"
  )
  for c in "${candidates[@]}"; do
    if [ -x "$c" ]; then
      echo "$c"; return 0
    fi
    if command -v "$c" >/dev/null 2>&1; then
      command -v "$c"; return 0
    fi
  done
  return 1
}

CHROME="$(find_chrome)" || {
  echo "Could not find Google Chrome or Chromium." >&2
  echo "Install Google Chrome, or edit find_chrome() in this script to point at your browser." >&2
  exit 1
}

render() {
  local src="$1" out="$2"
  echo "Rendering $out ..."
  "$CHROME" --headless --disable-gpu --no-pdf-header-footer \
    --print-to-pdf="$OUT/$out" \
    "file://$DIR/src/$src" >/dev/null 2>&1
}

TARGET="${1:-all}"

case "$TARGET" in
  full)
    render "cv-full.html" "Caitlin Wilks - CV (Full).pdf"
    ;;
  medium)
    render "cv-medium.html" "Caitlin Wilks - CV (Medium).pdf"
    ;;
  concise)
    render "cv-concise.html" "Caitlin Wilks - CV (Concise).pdf"
    ;;
  all)
    render "cv-full.html" "Caitlin Wilks - CV (Full).pdf"
    render "cv-medium.html" "Caitlin Wilks - CV (Medium).pdf"
    render "cv-concise.html" "Caitlin Wilks - CV (Concise).pdf"
    ;;
  *)
    echo "Unknown target: $TARGET (use: full | medium | concise | all)" >&2
    exit 1
    ;;
esac

if [ -f "$OUT/Caitlin Wilks - CV (Medium).pdf" ] && [[ "$TARGET" == medium || "$TARGET" == all ]]; then
  cp "$OUT/Caitlin Wilks - CV (Medium).pdf" "$DIR/../static/cv.pdf"
  echo "Copied the Medium CV to static/cv.pdf"
fi

echo "Done."
