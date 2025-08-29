#!/usr/bin/env bash
echo "[rebuild:pong] bundling pong.ts -> frontend/public/pong/pong.js"
npx esbuild src/pong.ts --bundle --format=esm --platform=browser --outfile=../../frontend/public/pong/pong.js && cp src/pong.html ../../frontend/public/pong.html
echo "[rebuild:pong] done"