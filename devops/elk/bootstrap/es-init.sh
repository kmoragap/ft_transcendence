#!/usr/bin/env sh
set -e

CA=/certs/ca/ca.crt
ES_HOST="${ES_HOST:-es01}"                 # use your service name
ES_URL="https://${ES_HOST}:9200"

LOGSTASH_ROLE="${LOGSTASH_ROLE:-logstash_writer}"
LOGSTASH_USE_ILM="${LOGSTASH_USE_ILM:-false}"

wait_for_file() {
  f="$1"; tries="${2:-60}"; i=0
  while [ ! -f "$f" ] && [ $i -lt "$tries" ]; do
    echo "[init] waiting for $f..."
    i=$((i+1)); sleep 1
  done
  [ -f "$f" ] || { echo "[init] ERROR: $f not found"; exit 1; }
}

wait_for_es() {
  tries="${1:-60}"; i=0
  until curl -s --cacert "$CA" "$ES_URL" >/dev/null 2>&1; do
    i=$((i+1))
    [ $i -gt "$tries" ] && { echo "[init] ERROR: ES not reachable at $ES_URL"; exit 1; }
    echo "[init] waiting for ES at $ES_URL..."
    sleep 2
  done
}

json_put() {
  path="$1"; body="$2"
  curl -sS --fail --cacert "$CA" -u "elastic:${ES_PASSWORD}" \
    -H "Content-Type: application/json" -X PUT "$ES_URL$path" -d "$body" >/dev/null
}

json_post() {
  path="$1"; body="$2"
  curl -sS --fail --cacert "$CA" -u "elastic:${ES_PASSWORD}" \
    -H "Content-Type: application/json" -X POST "$ES_URL$path" -d "$body" >/dev/null
}

wait_for_file "$CA"
wait_for_es 60

echo "[init] setting kibana_system password"
# idempotent: POST returns {} on success (ignore if already set)
json_post "/_security/user/kibana_system/_password" "{\"password\":\"${KIBANA_SYSTEM_PASSWORD}\"}" || true

echo "[init] creating/updating role: $LOGSTASH_ROLE"
if [ "$LOGSTASH_USE_ILM" = "true" ]; then
  # Role with ILM/template powers
  ROLE_BODY='{
    "cluster": ["monitor","manage_ilm"],
    "indices": [
      { "names": ["logs-*"], "privileges": ["auto_configure","create_index","create","write","manage_ilm"] }
    ]
  }'
else
  # Minimal role: no ILM/template management
  ROLE_BODY='{
    "cluster": ["monitor"],
    "indices": [
      { "names": ["logs-*"], "privileges": ["auto_configure","create_index","create","write"] }
    ]
  }'
fi
json_put "/_security/role/${LOGSTASH_ROLE}" "$ROLE_BODY"

echo "[init] creating/updating user: ${LOGSTASH_WRITER_USER}"
USER_BODY="{\"password\":\"${LOGSTASH_WRITER_PASSWORD}\",\"roles\":[\"${LOGSTASH_ROLE}\"]}"
json_put "/_security/user/${LOGSTASH_WRITER_USER}" "$USER_BODY" || true

echo "[init] done"



# #!/usr/bin/env sh
# set -e

# CA=/certs/ca/ca.crt
# ES_HOST="${ES_HOST:-elasticsearch}"
# ES_URL="https://${ES_HOST}:9200"

# # Wait for CA file (from es-setup)
# i=0
# while [ ! -f "$CA" ] && [ $i -lt 60 ]; do
#   echo "[init] waiting for CA at $CA..."
#   i=$((i+1))
#   sleep 1
# done
# [ -f "$CA" ] || { echo "[init] CA not found"; exit 1; }

# # Wait for ES HTTPS
# i=0
# until curl -s --cacert "$CA" "$ES_URL" >/dev/null 2>&1; do
#   i=$((i+1))
#   if [ $i -gt 60 ]; then
#     echo "[init] ES not reachable at $ES_URL"
#     exit 1
#   fi
#   echo "[init] waiting for ES at $ES_URL..."
#   sleep 2
# done

# echo "[init] setting kibana_system password"
# curl -s -X POST --cacert "$CA" \
#   -u "elastic:${ES_PASSWORD}" \
#   -H "Content-Type: application/json" \
#   "$ES_URL/_security/user/kibana_system/_password" \
#   -d "{\"password\":\"${KIBANA_SYSTEM_PASSWORD}\"}" >/dev/null

# echo "[init] creating logstash_writer role"
# curl -s -X PUT --cacert "$CA" \
#   -u "elastic:${ES_PASSWORD}" \
#   -H "Content-Type: application/json" \
#   "$ES_URL/_security/role/logstash_writer" \
#   -d '{"cluster":[],"indices":[{"names":["logs-*","filebeat-*","logstash-*"],"privileges":["create_index","write","create","create_doc"]}]}' >/dev/null

# echo "[init] creating logstash writer user"
# curl -s -X POST --cacert "$CA" \
#   -u "elastic:${ES_PASSWORD}" \
#   -H "Content-Type: application/json" \
#   "$ES_URL/_security/user/${LOGSTASH_WRITER_USER}" \
#   -d "{\"password\":\"${LOGSTASH_WRITER_PASSWORD}\",\"roles\":[\"logstash_writer\"],\"enabled\":true}" >/dev/null || true

# echo "[init] done"
