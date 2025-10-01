#!/bin/bash

# Login to Vault
echo "Logging into Vault..."
hcp auth login
if [ $? -ne 0 ]; then
echo "Failed to login to Vault. Please check your credentials."
exit 1
fi

hcp profile init

# Define input file
ROOT_ENV_FILE=".env"

# Check if .env file exists and delete it if it does
if [ -f "$ROOT_ENV_FILE" ]; then
    rm "$ROOT_ENV_FILE"
fi

# Fetch all secret keys (in application "humane-society") from Vault
SECRET_KEYS=$(hcp vault-secrets secrets list --app=humane-society --format=json | grep -Eo '"([^"]*)"\s*:\s*"([^"]*)"' | sed -E 's/"([^"]+)": "([^"]+)"/\1=\2/g' | grep "^name=" | grep -v "@" | sed 's/^name=//')

if [ $? -ne 0 ] || [ -z "$SECRET_KEYS" ]; then
    echo "Failed to retrieve secret keys from Vault."
    exit 1
fi

# Iterate over each secret key and fetch the secret value
for key in $SECRET_KEYS; do
    SECRET_VALUE=$(hcp vault-secrets secrets open $key | grep "Value:" | sed -E 's/Value:\s*(.*)/\1/; s/^[[:space:]]+|[[:space:]]+$//g' 2>/dev/null)

    if [ $? -ne 0 ] || [ -z "$SECRET_VALUE" ]; then
        echo "Failed to retrieve secret for key $key. Skipping."
        continue
    fi

    # Append the secret key-value pair to the .env file
    echo "$key=$SECRET_VALUE" >> $ROOT_ENV_FILE
done

echo ".env file has been created/updated successfully."

### Repeat process for /frontend/.env file
FRONTEND_ENV_FILE="./frontend/.env"

if [ -f "$FRONTEND_ENV_FILE" ]; then
    rm "$FRONTEND_ENV_FILE"
fi

SECRET_KEYS_FRONTEND=$(hcp vault-secrets secrets list --app=humane-society-frontend --format=json | grep -Eo '"([^"]*)"\s*:\s*"([^"]*)"' | sed -E 's/"([^"]+)": "([^"]+)"/\1=\2/g' | grep "^name=" | grep -v "@" | sed 's/^name=//')

if [ $? -ne 0 ] || [ -z "$SECRET_KEYS_FRONTEND" ]; then
    echo "Failed to retrieve secret keys from Vault."
    exit 1
fi

for key in $SECRET_KEYS_FRONTEND; do
    SECRET_VALUE=$(hcp vault-secrets secrets open $key --app=humane-society-frontend | grep "Value:" | sed -E 's/Value:\s*(.*)/\1/; s/^[[:space:]]+|[[:space:]]+$//g' 2>/dev/null)

    if [ $? -ne 0 ] || [ -z "$SECRET_VALUE" ]; then
        echo "Failed to retrieve secret for key $key. Skipping."
        continue
    fi

    # Append the secret key-value pair to the .env file
    echo "$key=$SECRET_VALUE" >> $FRONTEND_ENV_FILE
done

echo "/frontend/.env file has been created/updated successfully."