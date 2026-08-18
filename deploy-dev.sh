#!/bin/bash
set -e

# Deploy to development environment
VITE_BASE_URL_API="https://api-dev.smartseaman.com"
VITE_API_URL="https://api-dev.smartseaman.com"
VITE_USE_MOCK="false"

echo "==> Building and deploying [DEVELOPMENT]..."
echo "    API: $VITE_BASE_URL_API"

export VITE_BASE_URL_API
export VITE_API_URL
export VITE_USE_MOCK

docker compose down

docker compose build --no-cache

docker compose up -d

echo "==> Done. App running at http://localhost:10000"
