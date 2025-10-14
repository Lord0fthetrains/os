#!/bin/bash

# Quick fix for backend port issue
echo "Fixing backend port from 5000 to 5200..."

echo "Stopping containers..."
docker-compose down

echo "Rebuilding containers with new port configuration..."
docker-compose up -d --build

echo "Checking backend port..."
sleep 5
docker-compose logs backend | grep "Server running on port" | tail -1

echo "Checking container status..."
docker-compose ps

echo "Done! Backend should now be running on port 5200."
