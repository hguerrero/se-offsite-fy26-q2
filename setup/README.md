# Environment Setup

This guide provides instructions for setting up the workshop environment using Docker Compose.

## Prerequisites

- Docker v4.39 or higher
- 8GB RAM available for containers
- Port availability: 8080, 8180, 9092-9094, 9192-9292
- jq installed
- Kong Konnect Enterprise account. If you don’t have a Konnect account, you can get started quickly with the [onboarding wizard.](https://konghq.com/products/kong-konnect/register?utm_medium=referral&utm_source=docs)
- Install kafkactl. You’ll need it to interact with Kafka clusters.

## Setup Instructions

1. The following Konnect items are required to complete this workshop:
   Personal access token (PAT): Create a new personal access token by opening the Konnect PAT page and selecting Generate Token.

1. Set the personal access token as an environment variable:

   ```bash
   export KONNECT_TOKEN='YOUR KONNECT TOKEN'
   ```

1. Create a Control Plane in Konnect. Use the Konnect API to create a new `CLUSTER_TYPE_KAFKA_NATIVE_EVENT_PROXY` Control Plane:

   ```bash
   export KONNECT_CONTROL_PLANE_ID=$(
      curl -X POST "https://us.api.konghq.com/v2/control-planes" \
      -H "Authorization: Bearer $KONNECT_TOKEN" \
      --json '{
         "name": "KNEP Workshop",
         "cluster_type": "CLUSTER_TYPE_KAFKA_NATIVE_EVENT_PROXY"
      }' -s | jq -r '.id'
   )
   ```

1. Navigate to the `/setup` directory:

   ```bash
   cd setup
   ```

1. Create an .env file with the following command:

   ```bash
   cat <<'EOF' > knep.env
   KONNECT_API_TOKEN=${KONNECT_TOKEN}
   KONNECT_API_HOSTNAME=us.api.konghq.com
   KONNECT_CONTROL_PLANE_ID=${KONNECT_CONTROL_PLANE_ID}
   EOF
   ```

1. Start the environment with a local Kafka cluster and the Kong Native Event Proxy (KNEP):

   ```bash
   docker compose up -d
   ```

1. Verify all services are running:

   ```bash
   docker compose ps
   ```

   You should see the following services:

   - kafka1 (port 9092)
   - kafka2 (port 9093)
   - kafka3 (port 9094)
   - keycloak (port 8180)
   - knep-konnect (port 8080)

1. Access Keycloak admin console:

   - URL: http://localhost:8180
   - Username: admin
   - Password: admin

1. Verify realm and client configuration:
   - Login to the admin console
   - Navigate to "Manage realms" in the left sidebar
   - Confirm "kafka-realm" is listed and select it
   - Go to "Clients" section
   - Verify "kafka-client" exists with:
     - Client authentication: ON
     - Service accounts roles: checked

## Environment Details

### Kafka Cluster

- 3-node Kafka cluster using KRaft (no ZooKeeper)

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
