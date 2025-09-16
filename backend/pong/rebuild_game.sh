#!/usr/bin/env bash
echo "[rebuild:pong] bundling pong.ts -> frontend/public/pong/pong.js"
npx esbuild src/pong.ts --bundle --format=esm --platform=browser --outfile=pong/pong.js
echo "[rebuild:pong] done"