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


# set -e
# D=/usr/share/elasticsearch/config/certs
# for i in $(seq 1 60); do
#   [ -f "$D/ca/ca.crt" ] && [ -f "$D/es01/es01.crt" ] && [ -f "$D/es01/es01.key" ] && exit 0
#   echo "waiting for certs in $D..."
#   sleep 2
# done
# echo "certs not found"; exit 1
