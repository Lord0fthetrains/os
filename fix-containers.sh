#!/bin/bash

# Quick fix for Linux Dashboard container conflicts only
echo "Fixing Linux Dashboard container conflicts..."

echo "Stopping dashboard containers only..."
docker stop linux-dashboard-backend linux-dashboard-frontend 2>/dev/null || true

echo "Removing dashboard containers only..."
docker rm -f linux-dashboard-backend linux-dashboard-frontend 2>/dev/null || true

echo "Cleaning up dashboard networks only..."
docker network rm linux-dashboard_dashboard-network 2>/dev/null || true

echo "Starting dashboard services..."
docker-compose up -d --build

echo "Checking dashboard status..."
docker-compose ps

echo "Done! Your Linux Dashboard should now be running."
echo "Note: Other Docker containers were left untouched."
