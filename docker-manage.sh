#!/bin/bash

# Simple Docker management commands for Linux Dashboard
# Quick commands for common Docker operations

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Quick restart (most common use case)
if [ "$1" = "restart" ] || [ "$1" = "" ]; then
    print_info "Quick restart: stop → build → start"
    docker-compose down
    docker-compose up -d --build
    print_success "Dashboard restarted!"
    docker-compose ps
    exit 0
fi

# Other quick commands
case "$1" in
    "stop")
        print_info "Stopping dashboard..."
        docker-compose down
        print_success "Dashboard stopped"
        ;;
    "start")
        print_info "Starting dashboard..."
        docker-compose up -d
        print_success "Dashboard started"
        docker-compose ps
        ;;
    "build")
        print_info "Building dashboard..."
        docker-compose build
        print_success "Dashboard built"
        ;;
    "logs")
        print_info "Showing logs..."
        docker-compose logs -f
        ;;
    "status")
        docker-compose ps
        ;;
    *)
        echo "Usage: $0 [restart|stop|start|build|logs|status]"
        echo "  restart - Stop, build, and start (default)"
        echo "  stop    - Stop all services"
        echo "  start   - Start all services"
        echo "  build   - Build Docker images"
        echo "  logs    - Show logs"
        echo "  status  - Show container status"
        ;;
esac
