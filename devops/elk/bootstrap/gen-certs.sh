#!/usr/bin/env sh
set -eu

ES_HOME=${ES_HOME:-/usr/share/elasticsearch}
CERT_DIR="${CERT_DIR:-$ES_HOME/config/certs}"
JAR="${JAR:-$ES_HOME/jdk/bin/jar}" 

log() { printf '%s\n' "$*"; }
ensure_dir() { [ -d "$1" ] || mkdir -p "$1"; }

extract_into_certdir() {
  archive_path="$1"
  ( cd "$CERT_DIR" \
    && if [ -x "$JAR" ]; then
         "$JAR" xf "$(basename "$archive_path")"
       elif command -v unzip >/dev/null 2>&1; then
         unzip -o -q "$archive_path"
       else
         log "[certs] ERROR: neither 'jar' nor 'unzip' available to extract $archive_path"; exit 1
       fi
  )
}

umask 022
ensure_dir "$CERT_DIR"

if [ ! -f "$CERT_DIR/ca/ca.crt" ]; then
  log "[certs] generating CA"
  "$ES_HOME/bin/elasticsearch-certutil" ca --silent --pem -out "$CERT_DIR/ca.zip"
  extract_into_certdir "$CERT_DIR/ca.zip"
fi

if [ ! -f "$CERT_DIR/es01/es01.crt" ]; then
  log "[certs] generating instance certs"
  cat > "$CERT_DIR/instances.yml" <<'EOF'
instances:
  - name: es01
    dns: [ es01, elasticsearch, localhost ]
    ip:  [ 127.0.0.1 ]
  - name: kibana
    dns: [ kibana, localhost ]
    ip:  [ 127.0.0.1 ]
  - name: logstash
    dns: [ logstash, localhost ]
    ip:  [ 127.0.0.1 ]
EOF
  "$ES_HOME/bin/elasticsearch-certutil" cert --silent --pem \
    --in "$CERT_DIR/instances.yml" \
    --out "$CERT_DIR/certs.zip" \
    --ca-cert "$CERT_DIR/ca/ca.crt" \
    --ca-key  "$CERT_DIR/ca/ca.key"
  extract_into_certdir "$CERT_DIR/certs.zip"
fi

echo "[certs] fixing perms"

for s in es01 kibana logstash ca; do
  chown -R 1000:0 "$CERT_DIR/$s" 2>/dev/null || true
done

find "$CERT_DIR" -type d -exec chmod 750 {} \; 2>/dev/null || true

chmod 755 "$CERT_DIR" 2>/dev/null || true
chmod 755 "$CERT_DIR/ca" "$CERT_DIR/logstash" 2>/dev/null || true

chmod 644 "$CERT_DIR/ca/ca.crt" 2>/dev/null || true
find "$CERT_DIR" -type f -name "*.crt" -exec chmod 644 {} \; 2>/dev/null || true
find "$CERT_DIR" -type f -name "*.key" -exec chmod 600 {} \; 2>/dev/null || true

rm -f "$CERT_DIR/ca/ca.key" 2>/dev/null || true

required_files="
$CERT_DIR/ca/ca.crt
$CERT_DIR/es01/es01.crt
$CERT_DIR/es01/es01.key
$CERT_DIR/kibana/kibana.crt
$CERT_DIR/kibana/kibana.key
$CERT_DIR/logstash/logstash.crt
$CERT_DIR/logstash/logstash.key
"
for f in $required_files; do
  if [ ! -f "$f" ]; then
    log "[certs] ERROR: missing $f"
    exit 1
  fi
done

log "[certs] done; contents:"
( cd "$CERT_DIR" && find . -maxdepth 2 -type f -print | sed 's#^\./##' )
