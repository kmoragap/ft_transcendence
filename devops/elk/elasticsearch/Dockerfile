ARG STACK_VERSION
FROM docker.elastic.co/elasticsearch/elasticsearch:${STACK_VERSION}

COPY conf/elasticsearch.yml /usr/share/elasticsearch/config/elasticsearch.yml

USER root
COPY tools/wait-for-certs.sh /usr/local/bin/wait-for-certs
RUN set -euo pipefail; \
    tr -d '\r' < /usr/local/bin/wait-for-certs > /usr/local/bin/wait-for-certs.tmp; \
    mv /usr/local/bin/wait-for-certs.tmp /usr/local/bin/wait-for-certs; \
    chown root:root /usr/local/bin/wait-for-certs; \
    chmod 0755 /usr/local/bin/wait-for-certs

USER elasticsearch
