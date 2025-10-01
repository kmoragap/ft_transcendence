ARG STACK_VERSION
FROM docker.elastic.co/elasticsearch/elasticsearch:${STACK_VERSION}

# (optional) your ES config
COPY conf/elasticsearch.yml /usr/share/elasticsearch/config/elasticsearch.yml

# Become root to place & fix up the helper
USER root
COPY tools/wait-for-certs.sh /usr/local/bin/wait-for-certs
# normalize line endings & set perms (works even if sed -i can't create temp files)
RUN set -euo pipefail; \
    tr -d '\r' < /usr/local/bin/wait-for-certs > /usr/local/bin/wait-for-certs.tmp; \
    mv /usr/local/bin/wait-for-certs.tmp /usr/local/bin/wait-for-certs; \
    chown root:root /usr/local/bin/wait-for-certs; \
    chmod 0755 /usr/local/bin/wait-for-certs

# Back to the default non-root user
USER elasticsearch




# ARG STACK_VERSION
# FROM docker.elastic.co/elasticsearch/elasticsearch:${STACK_VERSION}

# # your existing COPY for elasticsearch.yml here...
# COPY conf/elasticsearch.yml /usr/share/elasticsearch/config/elasticsearch.yml

# # Copy the wait script and make it executable
# COPY --chmod=0755 tools/wait-for-certs.sh /usr/local/bin/wait-for-certs
# # If your Docker doesn't support --chmod, do this instead:
# COPY tools/wait-for-certs.sh /usr/local/bin/wait-for-certs
# RUN sed -i 's/\r$//' /usr/local/bin/wait-for-certs && chmod 0755 /usr/local/bin/wait-for-certs







#FROM docker.elastic.co/elasticsearch/elasticsearch:${STACK_VERSION}
# No custom entrypoint/cmd; let the base image handle it


# FROM docker.elastic.co/elasticsearch/elasticsearch:${STACK_VERSION}

# USER root
# # put your helper in /usr/local/bin
# COPY --chown=1000:0 --chmod=0755 scripts/wait-for-certs.sh /usr/local/bin/wait-for-certs
# # normalize CRLF if the file came from Windows
# RUN sed -i 's/\r$//' /usr/local/bin/wait-for-certs
# USER 1000

# # Keep the base image entrypoint; only override CMD
# # eswrapper is the supported start command
# CMD ["/bin/sh","-lc","/usr/local/bin/wait-for-certs && /usr/local/bin/docker-entrypoint.sh eswrapper"]


