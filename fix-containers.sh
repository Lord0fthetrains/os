#!/bin/bash

# Quick fix for container name conflicts
echo "Fixing Docker container conflicts..."

echo "Stopping all containers..."
docker stop linux-dashboard-backend linux-dashboard-frontend 2>/dev/null || true

echo "Removing conflicting containers..."
docker rm -f linux-dashboard-backend linux-dashboard-frontend 2>/dev/null || true

echo "Cleaning up networks..."
docker network rm linux-dashboard_dashboard-network 2>/dev/null || true

echo "Starting services..."
docker-compose up -d --build

echo "Checking status..."
docker-compose ps

echo "Done! Your dashboard should now be running."
