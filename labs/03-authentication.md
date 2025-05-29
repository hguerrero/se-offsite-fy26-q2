# Lab 03: Authentication Mediation with Kong Event Gateway

This lab demonstrates how to implement advanced authentication mediation using Kong Event Gateway, enabling both secure JWT-based and anonymous access to your Kafka clusters.

## Overview

The setup provides:

- Dual authentication configurations
- Anonymous access on port 19092
- JWT-authenticated access on port 29092
- Authentication mediation between clients and Kafka

![auth-mediation](images/auth-mediation.jpg)

## Configuration Details

The following configuration demonstrates two virtual clusters with different authentication methods:

```yaml
backend_clusters:
  - name: kafka-localhost
    bootstrap_servers:
      - kafka1:9092
      - kafka2:9092
      - kafka3:9092

listeners:
  port:
    - listen_address: 0.0.0.0
      listen_port_start: 19092
      advertised_host: localhost

virtual_clusters:
  - name: team-a
    authentication:
      - type: sasl_oauth_bearer
        sasl_oauth_bearer:
          jwks:
            endpoint: http://keycloak:8080/realms/kafka-realm/protocol/openid-connect/certs
            timeout: "1s"
        mediation:
          type: anonymous
    backend_cluster_name: kafka-localhost
    route_by:
      type: port
      port:
        min_broker_id: 1
    rewrite_ids:
      type: prefix
    topic_rewrite:
      type: prefix
      prefix:
        value: a-
  - name: team-b
    authentication:
      - type: anonymous
        mediation:
          type: anonymous
    backend_cluster_name: kafka-localhost
    route_by:
      type: port
      port:
        offset: 10000
        min_broker_id: 1
    rewrite_ids:
      type: prefix
    topic_rewrite:
      type: prefix
      prefix:
        value: b-
```

### Configuration Breakdown

1. **Team-A Virtual Cluster (JWT-authenticated)**:

   - Uses SASL OAuth Bearer authentication
   - Integrates with Keycloak for JWT validation
   - Listens on default port (19092)

2. **Team-B Virtual Cluster (Anonymous)**:
   - Allows anonymous access
   - Listens on offset port (29092)

## Testing the Configuration

Restart the data plane container to apply the new configuration:

```bash
docker restart knep-konnect
```

Test both authentication methods using `kafkactl`:

1. Anonymous access (Team-B):

   ```bash
   # Configure kafkactl for anonymous access
   kafkactl config use-context team-b

   # Create and verify topic
   kafkactl create topic test-topic
   kafkactl list topics

   # Produce test message
   kafkactl produce test-topic --value="Hello World"

   # Consume to verify
   kafkactl consume test-topic --from-beginning
   ```

2. JWT-authenticated access (Team-A):

   ```bash
   # Switch context and attempt to create topic
   kafkactl config use-context team-a
   kafkactl create topic secure-topic
   ```

   You should see an error since JWT authentication is required. If you want to validate JWT authentication, you can follow the **optional** steps in the next section.

## (Optional) Test with Apache Kafka shell scripts

1. Download the latest Kafka 3.x distribution from the [Kafka website](https://kafka.apache.org/downloads)

2. Unzip the file and navigate to the `bin` directory

3. Create a config file for JWT authentication

   ```bash
   cat <<EOF > kafka-client.properties
   security.protocol=SASL_PLAINTEXT
   sasl.mechanism=OAUTHBEARER
   sasl.jaas.config=org.apache.kafka.common.security.oauthbearer.OAuthBearerLoginModule required \\
       clientId="kafka-client" \\
       clientSecret="secret123" ;
   sasl.login.callback.handler.class=org.apache.kafka.common.security.oauthbearer.secured.OAuthBearerLoginCallbackHandler
   sasl.oauthbearer.token.endpoint.url=http://localhost:8180/realms/kafka-realm/protocol/openid-connect/token
   EOF
   ```

4. Test JWT-authenticated access

   ```bash
   ./kafka-topics.sh --list --bootstrap-server localhost:19092 --command-config kafka-client.properties
   ```

   Should see information on the token expriation and all topics visible to team-a
