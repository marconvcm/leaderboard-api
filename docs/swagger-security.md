# API Documentation Security

The Swagger API documentation at `/docs` is now protected with basic authentication.

## Default Credentials
- Username: `admin`
- Password: `apidocs`

## Setting Custom Credentials

### Option 1: Environment Variables
Set these environment variables:
```bash
SWAGGER_USERNAME=your_custom_username
SWAGGER_PASSWORD=your_custom_password
```

### Option 2: Use the Setup Script
We provide a convenient script to set up credentials:

```bash
./scripts/setup-swagger-auth.sh
```

This script will:
1. Ask for your desired username and password
2. Update your .env file with these credentials
3. Generate the required Authorization header for cURL requests

## Accessing the Documentation

### Via Browser
When you navigate to `/docs`, the browser will prompt you for credentials.

### Via cURL
```bash
curl -u username:password http://localhost:3000/docs
```

Or with the Authorization header:
```bash
curl -H "Authorization: Basic $(echo -n 'username:password' | base64)" http://localhost:3000/docs
```
