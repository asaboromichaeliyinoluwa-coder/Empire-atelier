#!/usr/bin/env bash
# Builds the no-server hosted preview into $1 (page: empire-atelier.html).
set -euo pipefail
OUT="${1:?output dir}"
rm -rf dist-artifact
VITE_PACK_EXT=.wasm VITE_TARGET=artifact VITE_MEDIAPIPE_BASE=./mediapipe VITE_MEDIAPIPE_MODEL_EXT=.task.wasm npx vite build --base ./ --outDir dist-artifact >/dev/null
mkdir -p dist-artifact/mediapipe/wasm
cp node_modules/@mediapipe/tasks-vision/wasm/vision_wasm_internal.{js,wasm} dist-artifact/mediapipe/wasm/
curl -sf -o dist-artifact/mediapipe/pose_landmarker.task.wasm https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task
rm -rf "${OUT:?}"; mkdir -p "$OUT"
cp -r dist-artifact/assets dist-artifact/mediapipe dist-artifact/photos dist-artifact/real "$OUT"/
CSS=$(cd dist-artifact && ls assets/*.css); JS=$(cd dist-artifact && ls assets/index-*.js)
{
  echo '<title>Empire Atelier</title>'
  echo '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
  echo '<link href="https://fonts.googleapis.com/css2?family=Gilda+Display&family=Jost:wght@400;500&display=swap" rel="stylesheet">'
  echo '<style>'; cat "dist-artifact/$CSS"; echo '</style>'
  echo '<div id="root"></div>'
  echo "<script type=\"module\" src=\"./$JS\"></script>"
} > "$OUT/empire-atelier.html"
rm "${OUT:?}/${CSS:?}"
# the preview host serves only known file types: photo packs travel as .wasm (opaque binary)
for f in "$OUT"/photos/*.pack; do mv "$f" "${f%.pack}.wasm"; done
