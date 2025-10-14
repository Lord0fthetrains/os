#!/bin/bash

# Linux Dashboard Restart Script
# This script stops, rebuilds, and starts the dashboard

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    print_error "docker-compose.yml not found. Please run this script from the dashboard directory."
    exit 1
fi

print_status "=========================================="
print_status "Linux Dashboard Restart Script v1.0.0"
print_status "=========================================="

# Step 1: Stop all services
print_status "Stopping all services..."
if docker-compose down; then
    print_success "Services stopped successfully"
else
    print_warning "Some services may not have been running"
fi

# Step 2: Clean up dashboard images (optional)
read -p "Do you want to clean up old dashboard images? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Cleaning up old dashboard images..."
    docker image prune -f --filter "label=project=linux-dashboard"
    print_success "Dashboard image cleanup completed"
fi

# Step 3: Clean up dashboard containers only
print_status "Cleaning up dashboard containers only..."
docker-compose rm -f
docker container rm -f linux-dashboard-backend linux-dashboard-frontend 2>/dev/null || true
docker network rm linux-dashboard_dashboard-network 2>/dev/null || true

# Step 4: Build and start services
print_status "Building and starting services..."
if docker-compose up -d --build; then
    print_success "Services built and started successfully"
else
    print_error "Failed to build or start services"
    exit 1
fi

# Step 5: Show status
print_status "Checking service status..."
docker-compose ps

# Step 6: Get access information
print_status "Getting access information..."
MAIN_IP=$(hostname -I | awk '{print $1}')
FRONTEND_PORT=$(grep -o '"[0-9]*:3000"' docker-compose.yml | grep -o '[0-9]*' | head -1)

if [ -z "$FRONTEND_PORT" ]; then
    FRONTEND_PORT="3200"
fi

print_status "=========================================="
print_success "Dashboard restarted successfully!"
print_status "=========================================="
print_status "Access your dashboard at:"
print_status "  Local:  http://localhost:${FRONTEND_PORT}"
print_status "  Network: http://${MAIN_IP}:${FRONTEND_PORT}"
print_status "  Backend API: http://${MAIN_IP}:5200"
print_status "=========================================="

# Step 6: Show logs (optional)
read -p "Do you want to view the logs? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Showing logs (press Ctrl+C to exit)..."
    docker-compose logs -f
fi
