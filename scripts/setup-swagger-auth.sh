#!/bin/bash
# filepath: /Users/marconvcm/Development/leaderboard-api/scripts/setup-swagger-auth.sh

# Default values
DEFAULT_USERNAME="admin"
DEFAULT_PASSWORD="apidocs"

# Get input from user or use defaults
read -p "Enter Swagger username [$DEFAULT_USERNAME]: " USERNAME
USERNAME=${USERNAME:-$DEFAULT_USERNAME}

read -sp "Enter Swagger password [$DEFAULT_PASSWORD]: " PASSWORD
PASSWORD=${PASSWORD:-$DEFAULT_PASSWORD}
echo

# Update .env file if it exists
ENV_FILE="/Users/marconvcm/Development/leaderboard-api/.env"
if [ -f "$ENV_FILE" ]; then
  # Check if variables already exist in .env file
  if grep -q "SWAGGER_USERNAME" "$ENV_FILE"; then
    # Replace existing variables
    sed -i '' "s/SWAGGER_USERNAME=.*/SWAGGER_USERNAME=$USERNAME/" "$ENV_FILE"
    sed -i '' "s/SWAGGER_PASSWORD=.*/SWAGGER_PASSWORD=$PASSWORD/" "$ENV_FILE"
  else
    # Add new variables
    echo "SWAGGER_USERNAME=$USERNAME" >> "$ENV_FILE"
    echo "SWAGGER_PASSWORD=$PASSWORD" >> "$ENV_FILE"
  fi
  echo "Updated Swagger credentials in .env file"
else
  # Create new .env file
  echo "SWAGGER_USERNAME=$USERNAME" > "$ENV_FILE"
  echo "SWAGGER_PASSWORD=$PASSWORD" >> "$ENV_FILE"
  echo "Created .env file with Swagger credentials"
fi

# Generate a basic auth string for documentation
BASIC_AUTH=$(echo -n "$USERNAME:$PASSWORD" | base64)

echo
echo "Swagger UI is now protected with basic authentication"
echo
echo "Access with these credentials:"
echo "  Username: $USERNAME"
echo "  Password: $PASSWORD"
echo
echo "For cURL, use: -H 'Authorization: Basic $BASIC_AUTH'"
echo
