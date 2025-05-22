# API Key Management

The Leaderboard API includes a comprehensive API key management system for securing access to the API. This document outlines the setup, usage, and management of API keys.

## Overview

API keys are used in conjunction with JWT tokens for secure authentication. The flow is:

1. Create an API key (admin operation)
2. Use the API key and secret with the challenge-response authentication to get a JWT token
3. Use the JWT token to access protected resources

## Admin API Key

Before using the API, you need to create at least one admin API key that can be used to manage other API keys.

### Creating the First Admin Key

Run the provided script to create your first admin API key:

```bash
node ./scripts/create-admin-key.js "My Admin Key"
```

This will output an API key and secret. **Store these securely** as the secret cannot be retrieved later.

Example output:
```
=== ADMIN API KEY CREATED SUCCESSFULLY ===
⚠️  IMPORTANT: Save this information securely. The secret will not be displayed again! ⚠️

Name: My Admin Key
API Key: 3a7c4f8d2e1b5a9c6d8e2f1a3b5c7d9e
Secret: 7d2c9f5a3e8b1d4c6a7e2b5d8f1c9a3e4b6d2c5f8a9e1b3d7c4f6a2
Created: 2023-05-21T08:15:30.123Z

Use this key for managing other API keys and administrative tasks.
```

### Using an Admin API Key

You can test your API key with the provided script:

```bash
node ./scripts/use-admin-key.js <api-key> <secret>
```

This demonstrates the authentication flow and makes a test request to list all API keys.

## API Endpoints for API Key Management

The following endpoints are available for managing API keys. All these endpoints require JWT authentication.

### Create API Key
- **URL**: `/admin/api-keys`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "name": "New API Key"
  }
  ```
- **Response**:
  ```json
  {
    "_id": "60d5e6a1a2a7c655b8c23e1b",
    "key": "3a7c4f8d2e1b5a9c6d8e2f1a3b5c7d9e",
    "secret": "7d2c9f5a3e8b1d4c6a7e2b5d8f1c9a3e4b6d2c5f8a9e1b3d7c4f6a2",
    "name": "New API Key",
    "createdAt": "2023-05-21T08:15:30.123Z",
    "enabled": true
  }
  ```

### List All API Keys
- **URL**: `/admin/api-keys`
- **Method**: `GET`
- **Response**:
  ```json
  [
    {
      "_id": "60d5e6a1a2a7c655b8c23e1b",
      "key": "3a7c4f8d2e1b5a9c6d8e2f1a3b5c7d9e",
      "name": "New API Key",
      "createdAt": "2023-05-21T08:15:30.123Z",
      "lastUsed": "2023-05-21T09:30:45.678Z",
      "enabled": true
    }
  ]
  ```
  Note: The secret is not returned when listing API keys.

### Get Single API Key
- **URL**: `/admin/api-keys/:key`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "_id": "60d5e6a1a2a7c655b8c23e1b",
    "key": "3a7c4f8d2e1b5a9c6d8e2f1a3b5c7d9e",
    "name": "New API Key",
    "createdAt": "2023-05-21T08:15:30.123Z",
    "lastUsed": "2023-05-21T09:30:45.678Z",
    "enabled": true
  }
  ```
  Note: The secret is not returned.

### Disable API Key
- **URL**: `/admin/api-keys/:key/disable`
- **Method**: `PATCH`
- **Response**:
  ```json
  {
    "message": "API key disabled successfully"
  }
  ```

### Delete API Key
- **URL**: `/admin/api-keys/:key`
- **Method**: `DELETE`
- **Response**:
  ```json
  {
    "message": "API key deleted successfully"
  }
  ```

## Authentication with API Keys

Once you have an API key, you can use it to obtain a JWT token. See the [JWT Authentication documentation](jwt-auth.md) for details on the authentication flow.

## Security Considerations

- Store API keys and secrets securely
- Rotate API keys periodically
- Use unique API keys for different applications or services
- Monitor API key usage
- Disable unused API keys
