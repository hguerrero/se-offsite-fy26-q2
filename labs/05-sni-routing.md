# Lab 05: SNI-Based Routing with TLS

This lab demonstrates how to configure Kong Event Gateway to use Server Name Indication (SNI) for routing instead of port-based routing, providing enhanced security and flexibility.

## Overview

The setup provides:

- TLS encryption for Kafka connections
- SNI-based routing using domain names
- Transparent topic prefixing
- Simplified client configuration with domain names

<!-- ![sni-routing](images/sni-routing.jpg) -->

## Configuration Details

The snippet below demonstrates SNI-based routing configuration:

```yaml
backend_clusters:
  - bootstrap_servers:
      - kafka1:9092
      - kafka2:9093
      - kafka3:9094
    name: kafka-localhost
listeners:
  port:
    - advertised_host: localhost
      listen_address: 0.0.0.0
      listen_port_start: 19092
  sni:
    - cert:
        file:
          path: /var/tls/tls.crt
        type: file
      key:
        file:
          path: /var/tls/tls.key
        type: file
      listen_address: 0.0.0.0
      listen_port: 8443
      sni_suffix: .127-0-0-1.sslip.io
virtual_clusters:
  - authentication:
      - mediation:
          type: anonymous
        sasl_oauth_bearer:
          jwks:
            endpoint: >-
              http://keycloak:8080/realms/kafka-realm/protocol/openid-connect/certs
            timeout: 1s
        type: sasl_oauth_bearer
    backend_cluster_name: kafka-localhost
    name: team-a
    rewrite_ids:
      type: prefix
    route_by:
      port:
        min_broker_id: 1
      type: port
    topic_rewrite:
      prefix:
        value: a-
      type: prefix
  - authentication:
      - mediation:
          type: anonymous
        type: anonymous
    backend_cluster_name: kafka-localhost
    consume_policies:
      - policies:
          - policy:
              decrypt:
                decrypt:
                  - type: value
                failure:
                  mode: error
                key_sources:
                  - key_source:
                      name: inline-key
                      static:
                        - id: static://key-0
                          key:
                            bytes:
                              value: 7oMACUhuRn+Aq3aEylG87w==
                            type: bytes
                      type: static
                    type: key_source
              name: decrypt
              type: decrypt
            type: policy
    name: team-b
    produce_policies:
      - policies:
          - policy:
              encrypt:
                encrypt:
                  - id: static://key-0
                    type: value
                failure:
                  mode: error
                key_sources:
                  - key_source:
                      name: inline-key
                      static:
                        - id: static://key-0
                          key:
                            bytes:
                              value: 7oMACUhuRn+Aq3aEylG87w==
                            type: bytes
                      type: static
                    type: key_source
              name: encrypt
              type: encrypt
            type: policy
    rewrite_ids:
      type: prefix
    route_by:
      type: sni
    topic_rewrite:
      prefix:
        value: b-
      type: prefix
```

Key configuration points:

- SNI listener on port 8443 with TLS certificate and key
- Domain suffix `.127-0-0-1.sslip.io` for SNI routing
- Topic prefixing with "b-" for team-b
- Message encryption/decryption policies maintained from previous lab

## Apply Configuration

1. Go to the [Konnect web console](https://cloud.konghq.com)
2. Select your control plane
3. Click "Configuration"
4. Click "Edit configuration"
5. Replace or update the configuration with the SNI listener and virtual cluster settings
6. Click "Save"

## Testing SNI Routing

Restart the data plane container to apply the new configuration:

```bash
docker restart knep-konnect
```

### Update kafkactl Configuration

Add an SNI context to your `.kafkactl.yml` file:

```yaml
contexts:
  sni:
    brokers:
      - bootstrap.team-b.127-0-0-1.sslip.io:8443
    tls:
      enabled: true
      ca: setup/config/certs/ca.crt
      insecure: true
```

### Test with kafkactl

1. Switch to the SNI context:

   ```bash
   kafkactl config use-context sni
   ```

2. List topics:

   ```bash
   kafkactl get topics
   ```

3. Produce a message:

   ```bash
   echo "SNI routed message" | kafkactl produce test-topic
   ```

4. Consume the message:

   ```bash
   kafkactl consume test-topic --from-beginning
   ```

## Advantages of SNI Routing

- **Enhanced Security**: All traffic is encrypted with TLS
- **Simplified Routing**: Use domain names instead of port numbers
- **Scalability**: Support for multiple virtual clusters without port conflicts
- **Compatibility**: Works with standard Kafka clients that support TLS
- **Flexibility**: Can combine with other authentication methods

## Troubleshooting

Common issues:

1. Certificate validation errors:
   - Ensure the CA certificate is properly configured in the client
   - Check certificate expiration dates
   - Verify hostname matches the certificate's Subject Alternative Name

2. Connection failures:
   - Confirm the SNI suffix is correctly configured
   - Verify the TLS certificate and key paths are correct
   - Check that port 8443 is accessible

3. Client configuration:
   - Ensure TLS is enabled in the client configuration
   - Verify the broker address uses the correct domain format
   - Check that the CA certificate is properly referenced

## Next Steps

- Combine SNI routing with OAuth authentication
- Implement more advanced policies
- Configure multiple SNI domains for different teams
