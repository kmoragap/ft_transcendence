# devops/elk/kibana/Dockerfile
ARG STACK_VERSION=8.15.1
FROM docker.elastic.co/kibana/kibana:${STACK_VERSION}

# put the script where kibana can own it
COPY tools/wait-for-certs.sh /usr/share/kibana/bin/wait-for-certs

# briefly become root to fix ownership & mode, then drop back
USER root
RUN chown kibana:0 /usr/share/kibana/bin/wait-for-certs \
 && chmod 0755 /usr/share/kibana/bin/wait-for-certs
USER kibana

# start only after certs are present
CMD ["sh","-c","/usr/share/kibana/bin/wait-for-certs && /usr/local/bin/kibana-docker"]

