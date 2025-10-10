# devops/elk/kibana/Dockerfile
ARG STACK_VERSION=8.15.1
FROM docker.elastic.co/kibana/kibana:${STACK_VERSION}

COPY tools/wait-for-certs.sh /usr/share/kibana/bin/wait-for-certs

USER root
RUN chown kibana:0 /usr/share/kibana/bin/wait-for-certs \
 && chmod 0755 /usr/share/kibana/bin/wait-for-certs
USER kibana

CMD ["sh","-c","/usr/share/kibana/bin/wait-for-certs && /usr/local/bin/kibana-docker"]

