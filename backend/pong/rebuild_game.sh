#!/usr/bin/env bash
echo "[rebuild:pong] bundling pong.ts -> src/pong/pong.js"
npx esbuild src/pong.ts --bundle --format=esm --platform=browser --outfile=src/pong/pong.js
echo "[rebuild:pong] done"