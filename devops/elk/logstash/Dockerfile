ARG STACK_VERSION=8.15.1
FROM docker.elastic.co/logstash/logstash:${STACK_VERSION}

# Base configs & pipeline
COPY conf/logstash.yml        /usr/share/logstash/config/logstash.yml
COPY conf/pipelines.yml       /usr/share/logstash/config/pipelines.yml
COPY pipeline/                /usr/share/logstash/pipeline/

# ---- Wait-for-certs wrapper setup ----
# Put the wait script in PATH and make it executable
COPY --chown=logstash:0 tools/wait-for-certs.sh /usr/local/bin/wait-for-certs
RUN chmod 0755 /usr/local/bin/wait-for-certs

# Ensure configs are owned by the logstash user
USER root
RUN chown -R logstash:0 /usr/share/logstash/config /usr/share/logstash/pipeline

# Wrap the original entrypoint so we always wait for certs first
RUN printf '%s\n' \
  '#!/usr/bin/env sh' \
  'set -e' \
  '/usr/local/bin/wait-for-certs' \
  'exec /usr/local/bin/docker-entrypoint "$@"' \
  > /usr/local/bin/custom-entrypoint \
  && chmod 0755 /usr/local/bin/custom-entrypoint

USER logstash
ENTRYPOINT ["/usr/local/bin/custom-entrypoint"]         # override entrypoint
CMD ["-f", "/usr/share/logstash/pipeline/logstash.conf"] # default args

