#!/usr/bin/env bash
# Regenerates the CV PDF from src/cv-medium.html, using headless Chrome.
#
# Usage:
#   ./build.sh
#
# Edit the HTML/CSS in src/cv-medium.html, then re-run this script. The PDF goes in
# out/ (git-ignored) and is copied to ../static/cv.pdf, which is the CV linked from
# the site.

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

render "cv-medium.html" "Caitlin Wilks - CV.pdf"
cp "$OUT/Caitlin Wilks - CV.pdf" "$DIR/../static/cv.pdf"
echo "Copied the CV to static/cv.pdf"

echo "Done."
