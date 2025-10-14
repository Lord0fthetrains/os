#!/bin/bash

# Linux Dashboard Diagnostic Script
echo "=========================================="
echo "Linux Dashboard Diagnostic Script"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "ERROR: docker-compose.yml not found. Please run this script from the dashboard directory."
    exit 1
fi

echo "1. Checking Docker containers status..."
docker-compose ps

echo ""
echo "2. Checking container logs (last 20 lines)..."
echo "--- Backend logs ---"
docker-compose logs --tail=20 backend

echo ""
echo "--- Frontend logs ---"
docker-compose logs --tail=20 frontend

echo ""
echo "3. Testing API endpoints..."
echo "Testing backend health check..."
curl -s http://localhost:5000/api/health || echo "Backend health check failed"

echo ""
echo "Testing system stats API..."
curl -s http://localhost:5000/api/system/stats | head -c 200 || echo "System stats API failed"

echo ""
echo "4. Checking network connectivity..."
echo "Backend container IP:"
docker inspect linux-dashboard-backend | grep IPAddress || echo "Backend container not found"

echo ""
echo "5. Checking if services are accessible..."
echo "Frontend accessible:"
curl -s -o /dev/null -w "%{http_code}" http://localhost:3200 || echo "Frontend not accessible"

echo ""
echo "Backend accessible:"
curl -s -o /dev/null -w "%{http_code}" http://localhost:5000 || echo "Backend not accessible"

echo ""
echo "6. Checking Docker container resource usage..."
docker stats --no-stream linux-dashboard-backend linux-dashboard-frontend 2>/dev/null || echo "Could not get container stats"

echo ""
echo "=========================================="
echo "Diagnostic complete!"
echo "=========================================="
