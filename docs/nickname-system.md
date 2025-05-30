# Nickname System

The Leaderboard API includes a nickname management system that allows users to create unique, short identifiers for their accounts.

## Overview

The nickname system provides:

- Creation of unique 10-character nicknames
- Association of nicknames with user IDs
- Generation of short 6-digit hashes for convenient reference
- Lookup by nickname, hash, or user ID

## Nickname Format

- Nicknames must be **exactly 10 characters**
- Only alphanumeric characters, hyphens, and underscores are allowed (`A-Za-z0-9_-`)
- Nicknames are unique across the entire system

## API Endpoints

### Create a Nickname

```
POST /nickname
```

**Request Body**:
```json
{
  "nickname": "user-name1",
  "UID": "123e4567-e89b-42d3-a456-556642440000"
}
```

**Response** (201 Created):
```json
{
  "nickname": "user-name1",
  "UID": "123e4567-e89b-42d3-a456-556642440000",
  "hash": "123456",
  "created": true
}
```

**Errors**:
- `400 Bad Request`: Invalid nickname format or UID
- `409 Conflict`: Nickname already taken or UID already has a nickname

### Get Nickname by Hash

```
GET /nickname/123456
```

**Response** (200 OK):
```json
{
  "nickname": "user-name1",
  "UID": "123e4567-e89b-42d3-a456-556642440000",
  "hash": "123456"
}
```

**Errors**:
- `404 Not Found`: Nickname with the specified hash doesn't exist

### Get Nickname by User ID

```
GET /nickname/uid/123e4567-e89b-42d3-a456-556642440000
```

**Response** (200 OK):
```json
{
  "nickname": "user-name1",
  "UID": "123e4567-e89b-42d3-a456-556642440000",
  "hash": "123456"
}
```

**Errors**:
- `404 Not Found`: No nickname exists for the specified UID

## Security Considerations

- Only the nickname creation endpoint requires API key authentication
- Nickname lookups are public to facilitate display of nickname information
- Each user (UID) can have only one nickname
- Nicknames cannot be modified once created (prevents nickname squatting)
- UUIDs must be valid v4 format
