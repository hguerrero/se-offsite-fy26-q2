# Environment Setup

This guide provides instructions for setting up the workshop environment using Docker Compose.

## Prerequisites

- Docker v4.39 or higher
- 8GB RAM available for containers
- Port availability: 8180, 9092-9094

## Setup Instructions

1. Start the environment:
   ```bash
   docker compose up -d
   ```

2. Verify all services are running:
   ```bash
   docker compose ps
   ```
   You should see the following services:
   - kafka1 (port 9092)
   - kafka2 (port 9093) 
   - kafka3 (port 9094)
   - keycloak (port 8180)

3. Access Keycloak admin console:
   - URL: http://localhost:8180
   - Username: admin
   - Password: admin

4. Verify realm and client configuration:
   - Login to the admin console
   - Navigate to "Realms" in the left sidebar
   - Confirm "kafka-realm" is listed and select it
   - Go to "Clients" section
   - Verify "kafka-client" exists with:
     - Client authentication: ON
     - Service accounts enabled: ON
     - Standard flow enabled: ON

## Environment Details

### Kafka Cluster
- 3-node Kafka cluster using KRaft (no ZooKeeper)
- Broker endpoints:
  - localhost:9092
  - localhost:9093 
  - localhost:9094

### Keycloak
- Pre-configured realm: kafka-realm
- Test user:
  - Username: kafka
  - Password: kafka
- Client:
  - Client ID: kafka-client
  - Client Secret: secret123

## Troubleshooting

If you encounter issues:

1. Check container logs:
   ```bash
   docker compose logs [service-name]
   ```

2. Ensure ports are not in use:
   ```bash
   netstat -an | grep -E '8180|909[2-4]'
   ```

3. Reset environment:
   ```bash
   docker compose down
   docker compose up -d
   ```

## Cleanup

To stop and remove all containers:
```bash
docker compose down
```
