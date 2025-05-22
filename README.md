# Leaderboard API

A secure API for managing game leaderboards with JWT-based authentication.

## Features

- **Secure Authentication**: JWT-based authentication using HMAC challenge-response pattern
- **API Key Management**: Complete system for creating and managing API keys
- **Leaderboard Management**: Store and retrieve scores, manage leaderboards
- **Comprehensive Documentation**: Swagger/OpenAPI documentation
- **Secure by Default**: Rate limiting, CORS, helmet for security headers

## Installation

1. Clone the repository
2. Install dependencies
   ```bash
   npm install
   ```
3. Create a `.env` file (see `.env.example` for required variables)
4. Build the TypeScript code
   ```bash
   npm run build
   ```
5. Create your first admin API key
   ```bash
   node ./scripts/create-admin-key.js "Admin Key"
   ```
   Store the key and secret securely!

## Running the API

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Documentation

Access the Swagger UI at `/docs` when the API is running (protected with basic auth).

## Authentication

The API uses a two-step JWT-based authentication flow:

1. Request a challenge by providing your API key
2. Generate an HMAC of the challenge using your secret
3. Verify the HMAC to receive a JWT token
4. Use the JWT token for authenticated requests

See [JWT Authentication](docs/jwt-auth.md) for more details.

## API Key Management

The API provides endpoints for managing API keys. See [API Key Management](docs/api-key-management.md) for details.

## Testing

Run tests with:
```bash
npm test
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
