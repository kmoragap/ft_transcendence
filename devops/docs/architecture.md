# Architecture Overview

## Logging & Observability (ELK Stack)

The project includes an Elastic Stack (Elasticsearch, Logstash, Kibana) for centralized log aggregation, search, and visualization.

### Components
- **Elasticsearch**: Single-node development cluster (image `docker.elastic.co/elasticsearch/elasticsearch:8.15.1`). Config in `devops/elk/elasticsearch/conf/elasticsearch.yml`.
- **Logstash**: Will collect/parse logs (pipeline configs under `devops/elk/logstash/pipeline/`).
- **Kibana**: UI for exploring logs and dashboards.

### Local Development Choices
- Security (xpack) disabled for simplicity (NOT for production).
- Small JVM heap: 512m (`ES_JAVA_OPTS=-Xms512m -Xmx512m`).
- Memory lock enabled in compose to prevent swapping.



