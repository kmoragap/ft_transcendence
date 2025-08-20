#!/usr/bin/env bash
set -euo pipefail
echo "[prepare:pong] bundling pong.ts -> public/pong/pong.js"

# In the container:
# - /app       => your frontend (bind-mounted from ./frontend)
# - /workspace => repo root (bind-mounted from .)
FRONTEND_DIR="/app"
BACKEND_PONG_DIR="/workspace/backend/pong/src"

OUT_DIR="$FRONTEND_DIR/public/pong"
mkdir -p "$OUT_DIR"

# 1) Bundle TS -> JS
npx esbuild "$BACKEND_PONG_DIR/pong.ts" \
  --bundle --format=esm --platform=browser \
  --outfile="$OUT_DIR/pong.js"

# 2) HTML: copy partner's or create a minimal one
if [ -f "$BACKEND_PONG_DIR/pong.html" ]; then
  cp "$BACKEND_PONG_DIR/pong.html" "$FRONTEND_DIR/public/pong.html"
  # swap any TS script tag with our built JS
  sed -i -E 's#<script[^>]+src="[^"]*pong\.ts"[^>]*></script>#<script type="module" src="/pong/pong.js"></script>#' \
    "$FRONTEND_DIR/public/pong.html" || true
else
  cat > "$FRONTEND_DIR/public/pong.html" <<'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
    <title>Pong</title>
    <style>
      html,body{margin:0;height:100%;background:#000;overflow:hidden}
      #app{width:100%;height:100%;position:relative}
      #hud{position:absolute;left:0;right:0;top:0;display:flex;justify-content:space-between;padding:.5rem;color:#fff;font:600 14px/1.2 system-ui}
      textarea{width:3rem;background:transparent;border:0;color:#66fcf1;font-weight:700;resize:none}
      canvas{display:block;width:100%;height:100%}
    </style>
  </head>
  <body>
    <div id="app">
      <div id="hud">
        <div>P1: <textarea id="p1score" readonly>0</textarea></div>
        <div>P2: <textarea id="p2score" readonly>0</textarea></div>
      </div>
      <canvas id="board"></canvas>
    </div>
    <script type="module" src="/pong/pong.js"></script>
  </body>
</html>
EOF
fi

echo "[prepare:pong] done"