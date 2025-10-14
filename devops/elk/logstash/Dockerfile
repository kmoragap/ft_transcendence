
ARG STACK_VERSION=8.15.1
FROM docker.elastic.co/logstash/logstash:${STACK_VERSION}

COPY conf/logstash.yml        /usr/share/logstash/config/logstash.yml
COPY conf/pipelines.yml       /usr/share/logstash/config/pipelines.yml
COPY pipeline/                /usr/share/logstash/pipeline/

COPY --chown=logstash:0 tools/wait-for-certs.sh /usr/local/bin/wait-for-certs
RUN chmod 0755 /usr/local/bin/wait-for-certs

USER root
RUN chown -R logstash:0 /usr/share/logstash/config /usr/share/logstash/pipeline
USER logstash

