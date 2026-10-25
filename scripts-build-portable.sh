#!/usr/bin/env bash
# Builds the no-install Windows package: node.exe + the built app + a bundled server.
# Run `npm run portable`. Set NODE_EXE to reuse a node.exe you already have; otherwise the
# official Node 22 Windows build is downloaded and checked against nodejs.org's SHA-256 list.
set -euo pipefail
VERSION=v22.22.0
OUT=portable/empire-atelier
rm -rf portable && mkdir -p "$OUT/runtime"

if [ -z "${NODE_EXE:-}" ]; then
  tmp=$(mktemp -d)
  curl -sfL -o "$tmp/node.zip" "https://nodejs.org/dist/$VERSION/node-$VERSION-win-x64.zip"
  curl -sfL -o "$tmp/SHASUMS256.txt" "https://nodejs.org/dist/$VERSION/SHASUMS256.txt"
  (cd "$tmp" && grep " node-$VERSION-win-x64.zip\$" SHASUMS256.txt | sed "s/node-$VERSION-win-x64.zip/node.zip/" | sha256sum -c -)
  unzip -q -j "$tmp/node.zip" "node-$VERSION-win-x64/node.exe" "node-$VERSION-win-x64/LICENSE" -d "$tmp"
  NODE_EXE="$tmp/node.exe"; cp "$tmp/LICENSE" "$OUT/runtime/NODE-LICENSE.txt"
fi
cp "$NODE_EXE" "$OUT/runtime/node.exe"
[ -n "${NODE_LICENSE:-}" ] && cp "$NODE_LICENSE" "$OUT/runtime/NODE-LICENSE.txt"

cp -r dist "$OUT/dist"
cp server-dist/server.mjs "$OUT/server.mjs"
cp .env.example "$OUT/.env.example"

cat > "$OUT/start.bat" <<'BAT'
@echo off
title Empire Atelier
cd /d "%~dp0"
if exist .env goto run
if exist .env.example copy /y .env.example .env >nul
:run
echo.
echo  Empire Atelier is starting on http://localhost:1010
echo  Keep this window open. Close it to stop the app.
echo.
start "" http://localhost:1010
"%~dp0runtime\node.exe" server.mjs
echo.
echo  The app stopped. If you see an error above, send a screenshot.
pause
BAT

cat > "$OUT/READ-ME-FIRST.txt" <<'TXT'
EMPIRE ATELIER - run it on your Windows computer (nothing to install)

1. Right-click the zip > Extract All. Open the extracted "empire-atelier" folder.
2. Double-click start.bat. If Windows shows "Windows protected your PC",
   click "More info" > "Run anyway". If the firewall asks, click Allow.
3. Your browser opens http://localhost:1010. Keep the black window open while you use the app;
   close it to stop.

Optional keys (open the ".env" file in Notepad after the first start, paste, save, restart):
  YOUCAM_API_KEY=     photo-real try-on and the AI clothes changer (yce.perfectcorp.com)
  ANTHROPIC_API_KEY=  Claude-powered AI stylist chat (console.anthropic.com)
Without keys the app runs in preview mode: try-on is drawn on your photo on the device and the
built-in stylist answers the chat.

Port 1010 busy? Change PORT=1010 in .env to another number, e.g. 1020.
TXT
sed -i 's/$/\r/' "$OUT/start.bat" "$OUT/READ-ME-FIRST.txt" "$OUT/.env.example"
(cd portable && rm -f ../empire-atelier-portable-windows.zip && zip -qr -9 ../empire-atelier-portable-windows.zip empire-atelier)
ls -la empire-atelier-portable-windows.zip
