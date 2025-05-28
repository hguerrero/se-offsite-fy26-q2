# Lab 00: Configure Kong Event Gateway in Konnect

This comprehensive guide walks you through setting up a Kong Event Gateway environment with control plane and data plane components in Kong Konnect. This configuration will serve as the foundation for subsequent labs.

## Prerequisites
- Kong Konnect account with admin privileges
- Web browser
- Docker Desktop v4.39 or higher
- 8GB available RAM
- jq installed

## Architecture Overview
Before proceeding with the setup, understand the key components:
- **Control Plane**: Manages configuration and policy
- **Data Plane**: Handles event traffic and enforces policies
- **Personal Access Token (PAT)**: Authenticates data plane nodes

## Steps

### 1. Create Control Plane

1. Access [Kong Konnect](https://cloud.konghq.com) and log in
2. In the left sidebar, select "Gateway Manager"
3. Click "New gateway" (top right)
4. Choose "Native Event Proxy" type
5. Name your control plane (e.g., "kafka-cp")
6. Click "Next Step"
7. Select "Close" - **Note**: Manual data plane configuration follows
8. Confirm control plane appears in Gateway Manager

### 2. Get Control Plane ID

1. Click your control plane name in Gateway Manager
2. Locate and copy the control plane ID
3. Store this ID securely - you'll need it for data plane configuration

### 3. Generate Personal Access Token (PAT)

1. Click your profile icon (top right)
2. Select "Personal Access Tokens"
3. Click "Generate Token"
4. Provide a descriptive name (e.g., "kafka-workshop-token")
5. Set appropriate expiration (recommended: 30 days for workshops)
6. Click "Generate"
7. **IMPORTANT**: Copy and securely store the token - it's shown only once
8. Validate your token with:
   ```bash
   curl -X GET https://us.api.konghq.com/v0/event-gateway/control-planes \
   -H "Authorization: Bearer <your-pat>" -s | jq ".data[] | select(.config.cluster_type == 'CLUSTER_TYPE_KAFKA_NATIVE_EVENT_PROXY')"
   ```
   Expected response: JSON listing your control plane

### 4. Deploy Data Plane

1. Launch the data plane container:
   ```bash
   docker run -d --name knep-konnect \
   --network host \
   -e KONNECT_API_HOSTNAME="us.api.konghq.com" \
   -e KONNECT_CONTROL_PLANE_ID="<your-control-plane-id>" \
   -e KONNECT_API_TOKEN="<your-pat>" \
   kong/kong-native-event-proxy:latest
   ```
   Replace placeholders with your actual values.

2. Verify deployment:
   ```bash
   docker logs knep-konnect
   ```
   Expected: Initial warning about missing Konnect configuration (normal at this stage)

### 5. Verify Control Plane Connection

1. In Konnect, go to "Gateway Manager"
2. Select your control plane
3. Click "View data plane nodes"
4. Status should show "Connected"
5. **Note**: An error icon is expected until virtual clusters are configured

✅ Success! Your Kong Event Gateway environment is ready for the next labs.

## Troubleshooting Guide

If issues arise, follow these steps:

1. **Connectivity Issues**
   - Verify network connectivity
   - Ensure Docker has sufficient resources
   - Check firewall settings

2. **Authentication Problems**
   - Confirm PAT hasn't expired
   - Verify control plane ID accuracy
   - Check for copy/paste errors in credentials

3. **Container Issues**
   - Inspect container logs:
     ```bash
     docker logs knep-konnect
     ```
   - Enable debug logging:
     ```bash
     docker run ... -e KNEP__OBSERVABILITY__LOG_FLAGS="debug,knep=debug" ...
     ```

4. **Health Checks**
   - Verify container status:
     ```bash
     docker ps -a | grep knep-konnect
     ```
   - Check resource usage:
     ```bash
     docker stats knep-konnect
     ```

Need more help? Contact your workshop instructor.
