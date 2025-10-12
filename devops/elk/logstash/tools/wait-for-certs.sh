#!/usr/bin/env sh
set -e
D=/usr/share/logstash/certs
for i in $(seq 1 60); do
  [ -f "$D/ca/ca.crt" ] && [ -f "$D/logstash/logstash.crt" ] && [ -f "$D/logstash/logstash.key" ] && exit 0
  echo "waiting for certs in $D..."
  sleep 2
done
echo "certs not found"; exit 1
