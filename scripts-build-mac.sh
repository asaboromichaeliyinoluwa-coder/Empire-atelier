#!/usr/bin/env bash
# Builds the no-install Mac package: official Node 22 for Apple silicon and Intel, the built app,
# and the bundled server. Run after `npm run build && npm run build:server`.
set -euo pipefail
VERSION=v22.22.0
OUT=portable-mac/empire-atelier-mac
rm -rf portable-mac && mkdir -p "$OUT/runtime"
tmp=$(mktemp -d)
curl -sfL -o "$tmp/SHASUMS256.txt" "https://nodejs.org/dist/$VERSION/SHASUMS256.txt"
for arch in arm64 x64; do
  f="node-$VERSION-darwin-$arch.tar.gz"
  [ -f "${NODE_CACHE:-/nonexistent}/$f" ] && cp "$NODE_CACHE/$f" "$tmp/" || curl -sfL -o "$tmp/$f" "https://nodejs.org/dist/$VERSION/$f"
  (cd "$tmp" && grep " $f\$" SHASUMS256.txt | sha256sum -c -)
  tar -xzf "$tmp/$f" -C "$tmp" "node-$VERSION-darwin-$arch/bin/node" "node-$VERSION-darwin-$arch/LICENSE"
  cp "$tmp/node-$VERSION-darwin-$arch/bin/node" "$OUT/runtime/node-$arch"
  cp "$tmp/node-$VERSION-darwin-$arch/LICENSE" "$OUT/runtime/NODE-LICENSE.txt"
done
cp -r dist "$OUT/dist"
cp server-dist/server.mjs "$OUT/server.mjs"
cp .env.example "$OUT/.env.example"

cat > "$OUT/start.command" <<'SH'
#!/bin/bash
# Empire Atelier for Mac: double-click, or run `bash start.command` in Terminal.
cd "$(dirname "$0")"
[ -f .env ] || cp .env.example .env
# Files from a downloaded zip are flagged by macOS; clear the flag for this folder only.
xattr -dr com.apple.quarantine . 2>/dev/null
NODE=runtime/node-arm64
[ "$(uname -m)" = "x86_64" ] && NODE=runtime/node-x64
chmod +x runtime/node-* 2>/dev/null
PORT=$(grep -E '^PORT=' .env | cut -d= -f2 | tr -d '\r ')
PORT=${PORT:-1010}
echo
echo "  Empire Atelier is starting on http://localhost:$PORT"
echo "  Keep this window open. Close it (or press Ctrl+C) to stop the app."
echo
(sleep 2; open "http://localhost:$PORT") &
"$NODE" server.mjs
echo
echo "  The app stopped. If you see an error above, send a screenshot."
read -r -p "  Press Enter to close." _
SH
chmod +x "$OUT/start.command" "$OUT/runtime/node-arm64" "$OUT/runtime/node-x64"

cat > "$OUT/READ-ME-FIRST.txt" <<'TXT'
EMPIRE ATELIER for Mac (nothing to install)

1. Double-click the zip in Downloads. It unpacks to an "empire-atelier-mac" folder.
2. Open Terminal (Cmd+Space, type Terminal, press Return) and paste:

     bash ~/Downloads/empire-atelier-mac/start.command

   (If you moved the folder, drag start.command into the Terminal window after typing "bash ".)
3. Your browser opens http://localhost:1010. Keep the Terminal window open while you use the app;
   press Ctrl+C or close it to stop.

After the first run you can also just double-click start.command.

Optional keys (open the ".env" file in TextEdit, paste, save, restart). ".env" is hidden in Finder:
press Cmd+Shift+. to show hidden files.
  YOUCAM_API_KEY=     photo-real try-on and the AI clothes changer (yce.perfectcorp.com)
  ANTHROPIC_API_KEY=  Claude-powered AI stylist chat (console.anthropic.com)

Port 1010 busy? Change PORT=1010 in .env to another number, e.g. 1020.
TXT
(cd portable-mac && rm -f ../empire-atelier-mac.zip && zip -qr -9 ../empire-atelier-mac.zip empire-atelier-mac)
ls -la empire-atelier-mac.zip
