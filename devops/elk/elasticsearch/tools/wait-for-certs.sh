#!/usr/bin/env sh

set -eu
CERT_DIR=/usr/share/elasticsearch/config/certs
need() {
  f="$1"; i=0
  while [ ! -f "$f" ]; do
    i=$((i+1)); [ $i -gt 120 ] && echo "missing $f" && exit 1
    echo "waiting for $f..."; sleep 1
  done
}
need "$CERT_DIR/ca/ca.crt"
need "$CERT_DIR/es01/es01.crt"
need "$CERT_DIR/es01/es01.key"

