#!/bin/bash

# Define input file
ROOT_ENV_FILE=".env"

# Login to Vault
echo "Logging into Vault..."
hcp auth login
if [ $? -ne 0 ]; then
echo "Failed to login to Vault. Please check your credentials."
exit 1
fi

hcp profile init

# Check if .env file exists and exit if it doesn't
if [ ! -f "$ROOT_ENV_FILE" ]; then
    echo "Error: $ROOT_ENV_FILE not found."
    exit 1
fi

# Fetch all existing secret keys and delete them
echo "Fetching and deleting all existing secrets..."
SECRET_KEYS=$(hcp vault-secrets secrets list --format=json --app=humane-society | grep -Eo '"([^"]*)"\s*:\s*"([^"]*)"' | sed -E 's/^"([^"]*)"\s*:\s*"([^"]*)"$/\1=\2/' | grep '^\(name=\|"name":\)'| grep -v "@" | sed 's/^"name": "\(.*\)"$/\1/; s/^name=\(.*\)$/\1/')

for secret_key in $SECRET_KEYS; do
    echo "Deleting secret with name $secret_key"
    hcp vault-secrets secrets delete "$secret_key" --app=humane-society || echo "Failed to delete secret $secret_key."
    echo ""
done

# Read the secrets from the .env file and create them
while IFS='=' read -r key value; do
    if [ -n "$key" ] && [ -n "$value" ]; then
        # Create the secret with the new value
        echo -n "$value" | hcp vault-secrets secrets create "$key" --app=humane-society --data-file=- || echo "Failed to create secret for $key."
        echo ""
    fi
done < "$ROOT_ENV_FILE"

echo "Secrets from $ROOT_ENV_FILE have been sent to Vault."

### Repeat process for /frontend/.env file
FRONTEND_ENV_FILE="./frontend/.env"

if [ ! -f "$FRONTEND_ENV_FILE" ]; then
    echo "Error: $FRONTEND_ENV_FILE not found."
    exit 1
fi

echo "Fetching and deleting all existing secrets..."
SECRET_KEYS_FRONTEND=$(hcp vault-secrets secrets list --format=json --app=humane-society-frontend | grep -Eo '"([^"]*)"\s*:\s*"([^"]*)"' | sed -E 's/^"([^"]*)"\s*:\s*"([^"]*)"$/\1=\2/' | grep '^\(name=\|"name":\)'| grep -v "@" | sed 's/^"name": "\(.*\)"$/\1/; s/^name=\(.*\)$/\1/')

for secret_key in $SECRET_KEYS_FRONTEND; do
    echo "Deleting secret with name $secret_key"
    hcp vault-secrets secrets delete "$secret_key" --app=humane-society-frontend || echo "Failed to delete secret $secret_key."
    echo ""
done

while IFS='=' read -r key value; do
    if [ -n "$key" ] && [ -n "$value" ]; then
        # Create the secret with the new value
        echo -n "$value" | hcp vault-secrets secrets create "$key" --app=humane-society-frontend --data-file=- || echo "Failed to create secret for $key."
        echo ""
    fi
done < "$FRONTEND_ENV_FILE"

echo "Secrets from $FRONTEND_ENV_FILE have been sent to Vault."