#!/bin/bash

# Docker-specific restart script for Linux Dashboard
# This script handles Docker operations for the dashboard

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

# Function to show help
show_help() {
    echo "Linux Dashboard Docker Management Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  restart     Stop, rebuild, and start all services"
    echo "  stop        Stop all dashboard services"
    echo "  start       Start all dashboard services"
    echo "  build       Build all Docker images"
    echo "  logs        Show logs for all services"
    echo "  logs-backend Show logs for backend only"
    echo "  logs-frontend Show logs for frontend only"
    echo "  status      Show status of all containers"
    echo "  clean       Clean up old containers and images"
    echo "  shell-backend Open shell in backend container"
    echo "  shell-frontend Open shell in frontend container"
    echo "  help        Show this help message"
    echo ""
}

# Function to restart services
restart_services() {
    print_status "=========================================="
    print_status "Restarting Linux Dashboard Services"
    print_status "=========================================="
    
    # Stop services
    print_status "Stopping services..."
    docker-compose down
    print_success "Services stopped"
    
    # Clean up dashboard containers only
    print_status "Cleaning up dashboard containers only..."
    docker-compose rm -f
    docker container rm -f linux-dashboard-backend linux-dashboard-frontend 2>/dev/null || true
    docker network rm linux-dashboard_dashboard-network 2>/dev/null || true
    
    # Build and start
    print_status "Building and starting services..."
    docker-compose up -d --build
    print_success "Services restarted"
    
    # Show status
    show_status
}

# Function to stop services
stop_services() {
    print_status "Stopping all dashboard services..."
    docker-compose down
    print_success "All services stopped"
}

# Function to start services
start_services() {
    print_status "Starting all dashboard services..."
    docker-compose up -d
    print_success "All services started"
    show_status
}

# Function to build images
build_images() {
    print_status "Building Docker images..."
    docker-compose build
    print_success "Images built successfully"
}

# Function to show logs
show_logs() {
    print_status "Showing logs for all services (press Ctrl+C to exit)..."
    docker-compose logs -f
}

# Function to show backend logs
show_backend_logs() {
    print_status "Showing backend logs (press Ctrl+C to exit)..."
    docker-compose logs -f backend
}

# Function to show frontend logs
show_frontend_logs() {
    print_status "Showing frontend logs (press Ctrl+C to exit)..."
    docker-compose logs -f frontend
}

# Function to show status
show_status() {
    print_status "Container status:"
    docker-compose ps
    
    # Get access information
    MAIN_IP=$(hostname -I | awk '{print $1}')
    FRONTEND_PORT=$(grep -o '"[0-9]*:3000"' docker-compose.yml | grep -o '[0-9]*' | head -1)
    
    if [ -z "$FRONTEND_PORT" ]; then
        FRONTEND_PORT="3200"
    fi
    
    echo ""
    print_status "Access URLs:"
    print_status "  Local:  http://localhost:${FRONTEND_PORT}"
    print_status "  Network: http://${MAIN_IP}:${FRONTEND_PORT}"
    print_status "  Backend API: http://${MAIN_IP}:5000"
}

# Function to clean up
clean_up() {
    print_status "Cleaning up old containers and images..."
    
    # Remove stopped containers
    docker container prune -f
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused volumes
    docker volume prune -f
    
    # Remove unused networks
    docker network prune -f
    
    print_success "Cleanup completed"
}

# Function to open backend shell
shell_backend() {
    print_status "Opening shell in backend container..."
    docker-compose exec backend sh
}

# Function to open frontend shell
shell_frontend() {
    print_status "Opening shell in frontend container..."
    docker-compose exec frontend sh
}

# Main script logic
case "${1:-restart}" in
    "restart")
        restart_services
        ;;
    "stop")
        stop_services
        ;;
    "start")
        start_services
        ;;
    "build")
        build_images
        ;;
    "logs")
        show_logs
        ;;
    "logs-backend")
        show_backend_logs
        ;;
    "logs-frontend")
        show_frontend_logs
        ;;
    "status")
        show_status
        ;;
    "clean")
        clean_up
        ;;
    "shell-backend")
        shell_backend
        ;;
    "shell-frontend")
        shell_frontend
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
