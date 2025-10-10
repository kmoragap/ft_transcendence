# DevOps Architecture

## Logging & Observability (ELK Stack)

Complete log aggregation and monitoring solution using Elastic Stack 8.15.1 with automated setup and initialization.

### Architecture Flow
```
Docker Containers → GELF Logging Driver → Logstash → Elasticsearch → Kibana
```

### Core Components

#### Elasticsearch (es01)
- **Image**: `docker.elastic.co/elasticsearch/elasticsearch:8.15.1`
- **Role**: Single-node development cluster for log storage and search
- **Configuration**: `devops/elk/elasticsearch/conf/elasticsearch.yml`
- **Features**:
  - Daily log indices: `logs-YYYY.MM.dd`
  - SSL enabled with auto-generated certificates
  - Memory optimization: 512MB heap (`ES_JAVA_HEAP=-Xms512m -Xmx512m`)
  - Memory lock enabled to prevent swapping

#### Logstash Pipeline
- **Image**: `docker.elastic.co/logstash/logstash:8.15.1`
- **Role**: Log processing, parsing, and enrichment
- **Configuration**: `devops/elk/logstash/pipeline/logstash.conf`
- **Processing**:
  - **Input**: GELF protocol on port 12201 from Docker containers
  - **Filters**: 
    - JSON parsing of Docker log messages
    - Docker metadata extraction (container names, hosts, facilities)
    - Service name mapping for better organization
  - **Output**: Elasticsearch with SSL authentication + stdout debugging
- **Memory**: 256MB heap (`LOGSTASH_JAVA_HEAP=-Xms256m -Xmx256m`)

#### Kibana Dashboard
- **Image**: `docker.elastic.co/kibana/kibana:8.15.1`
- **Role**: Log visualization, search interface, and analytics
- **Access**: Port 5601 for web interface
- **Features**:
  - Real-time log monitoring and search
  - Custom dashboards and visualizations
  - Index pattern management

### Setup and Initialization Containers

#### es-setup (Certificate Generation)
- **Image**: `docker.elastic.co/elasticsearch/elasticsearch:8.15.1`
- **Role**: One-time SSL certificate generation for the ELK stack
- **Function**:
  - Generates CA certificate and private key
  - Creates SSL certificates for Elasticsearch nodes
  - Sets up certificate bundle for inter-service communication
  - **Output**: Certificates stored in `certs` volume
- **Lifecycle**: Runs once, exits after certificate generation

#### es-init (User Management)
- **Image**: `docker.elastic.co/elasticsearch/elasticsearch:8.15.1`
- **Role**: Elasticsearch user and password initialization
- **Dependencies**: Requires `es01` to be healthy and `es-setup` to be completed
- **Function**:
  - Waits for Elasticsearch cluster to be ready
  - Sets up built-in user passwords:
    - `elastic`: Superuser (password from `ES_PASSWORD`)
    - `kibana_system`: Kibana service user (password from `KIBANA_SYSTEM_PASSWORD`)
    - `logstash_writer`: Logstash ingestion user (password from `LOGSTASH_WRITER_PASSWORD`)
  - Verifies user creation and authentication
- **Lifecycle**: Runs once after es01 startup, exits after user setup

### Service Dependencies and Startup Order

```
1. es-setup (generates certificates) → exits
2. es01 (waits for certificates) → starts and becomes healthy
3. es-init (waits for es01 health) → configures users → exits
4. kibana (waits for es01 health) → starts
5. logstash (waits for es01 health) → starts
```

### Security Implementation

#### SSL/TLS Configuration
- **Certificate Authority**: Auto-generated CA for development
- **Service Certificates**: Individual certificates for each Elasticsearch node
- **Logstash SSL**: Configured to validate Elasticsearch certificates
- **Certificate Location**: `/usr/share/elasticsearch/config/certs/` in containers

#### Authentication & Authorization
- **Built-in Users**:
  - `elastic`: Full cluster access for administration
  - `kibana_system`: Limited access for Kibana service operations
  - `logstash_writer`: Write-only access for log ingestion
- **Password Management**: Environment variables in `.env` file
- **SSL Verification**: Enabled between Logstash and Elasticsearch

### Development Configuration

#### Log Processing Pipeline
```
Application Containers (GELF logging) 
    ↓
Logstash (port 12201)
    ↓ (parse & enrich)
Elasticsearch (https://es01:9200)
    ↓ (store & index)
Kibana (port 5601) - visualization
```

#### Volume Management
- **certs**: Shared SSL certificates between all ELK services
- **esdata01**: Persistent Elasticsearch data storage
- **Application logs**: Streamed via GELF, no persistent storage needed

#### environmental variables are needed

### Debugging and Monitoring

#### Real-time Log Monitoring
- **Logstash stdout**: Shows processed logs in console for debugging
- **Container logs**: `docker compose logs -f logstash` for pipeline monitoring
- **Kibana interface**: Web-based log exploration and search

#### Health Checks
- **es01**: HTTP health endpoint monitoring
- **Automatic retries**: Services wait for dependencies with health checks
- **Startup verification**: es-init validates user creation before exiting
