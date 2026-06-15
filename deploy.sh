#!/usr/bin/env bash
# Baut Gymify und veröffentlicht den dist-Ordner auf GitHub Pages (gh-pages-Branch).
# Aufruf:  bun run deploy
set -e
cd "$(dirname "$0")"

echo "→ Baue Produktions-Build…"
bun run build

REPO_URL="https://x-access-token:$(gh auth token)@github.com/farelltollmannlacava-sys/gymify.git"

echo "→ Deploye auf gh-pages…"
cd dist
touch .nojekyll                 # GitHub Pages soll die Dateien nicht über Jekyll verarbeiten
git init -q
git checkout -q -b gh-pages
git add -A
git -c user.name="Farell" -c user.email="farelltollmannlacava@gmail.com" commit -q -m "deploy $(date +%Y-%m-%d_%H:%M)"
git push -q -f "$REPO_URL" gh-pages
cd ..
rm -rf dist/.git

echo "✓ Live: https://farelltollmannlacava-sys.github.io/gymify/"
