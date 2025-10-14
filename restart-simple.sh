#!/bin/bash

# Simple restart script for Linux Dashboard
set -e

echo "=========================================="
echo "Linux Dashboard Simple Restart"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "ERROR: docker-compose.yml not found. Please run this script from the dashboard directory."
    exit 1
fi

echo "Stopping all services..."
docker-compose down

echo "Force removing dashboard containers only..."
docker-compose rm -f
docker container rm -f linux-dashboard-backend linux-dashboard-frontend 2>/dev/null || true

echo "Cleaning up dashboard networks..."
docker network rm linux-dashboard_dashboard-network 2>/dev/null || true

echo "Building and starting services..."
docker-compose up -d --build

echo "Checking service status..."
docker-compose ps

# Get access information
MAIN_IP=$(hostname -I | awk '{print $1}')
FRONTEND_PORT=$(grep -o '"[0-9]*:3000"' docker-compose.yml | grep -o '[0-9]*' | head -1)

if [ -z "$FRONTEND_PORT" ]; then
    FRONTEND_PORT="3200"
fi

echo "=========================================="
echo "Dashboard restarted successfully!"
echo "=========================================="
echo "Access your dashboard at:"
echo "  Local:  http://localhost:${FRONTEND_PORT}"
echo "  Network: http://${MAIN_IP}:${FRONTEND_PORT}"
echo "  Backend API: http://${MAIN_IP}:5000"
echo "=========================================="
