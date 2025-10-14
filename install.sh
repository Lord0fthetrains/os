#!/bin/bash

# Linux Dashboard Installer
# One-script installer for the Linux monitoring dashboard

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DASHBOARD_DIR="/opt/linux-dashboard"
SERVICE_USER="dashboard"
REPO_URL="https://github.com/Lord0fthetrains/os.git"
BACKUP_DIR="/opt/linux-dashboard-backup"

# Print colored output
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

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_error "This script should not be run as root for security reasons."
        print_status "Please run as a regular user with sudo privileges."
        exit 1
    fi
}

# Detect OS and package manager
detect_os() {
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
    else
        print_error "Cannot detect OS version"
        exit 1
    fi

    print_status "Detected OS: $OS $VER"

    # Set package manager
    if command -v apt-get &> /dev/null; then
        PKG_MANAGER="apt"
    elif command -v yum &> /dev/null; then
        PKG_MANAGER="yum"
    elif command -v dnf &> /dev/null; then
        PKG_MANAGER="dnf"
    elif command -v pacman &> /dev/null; then
        PKG_MANAGER="pacman"
    elif command -v zypper &> /dev/null; then
        PKG_MANAGER="zypper"
    else
        print_error "Unsupported package manager"
        exit 1
    fi

    print_status "Using package manager: $PKG_MANAGER"
}

# Install system dependencies
install_dependencies() {
    print_status "Installing system dependencies..."

    case $PKG_MANAGER in
        apt)
            sudo apt-get update
            sudo apt-get install -y curl wget git build-essential python3 python3-pip
            ;;
        yum)
            sudo yum update -y
            sudo yum install -y curl wget git gcc gcc-c++ make python3 python3-pip
            ;;
        dnf)
            sudo dnf update -y
            sudo dnf install -y curl wget git gcc gcc-c++ make python3 python3-pip
            ;;
        pacman)
            sudo pacman -Syu --noconfirm
            sudo pacman -S --noconfirm curl wget git base-devel python python-pip
            ;;
        zypper)
            sudo zypper refresh
            sudo zypper install -y curl wget git gcc gcc-c++ make python3 python3-pip
            ;;
    esac

    print_success "System dependencies installed"
}

# Install Node.js
install_nodejs() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version | cut -d'v' -f2)
        print_status "Node.js already installed: v$NODE_VERSION"
        
        # Check if version is >= 18
        if [[ $(echo "$NODE_VERSION" | cut -d'.' -f1) -ge 18 ]]; then
            print_success "Node.js version is compatible"
            return
        else
            print_warning "Node.js version is too old, updating..."
        fi
    fi

    print_status "Installing Node.js 18..."

    # Install Node.js using NodeSource repository
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    
    case $PKG_MANAGER in
        apt)
            sudo apt-get install -y nodejs
            ;;
        yum)
            sudo yum install -y nodejs npm
            ;;
        dnf)
            sudo dnf install -y nodejs npm
            ;;
        pacman)
            sudo pacman -S --noconfirm nodejs npm
            ;;
        zypper)
            sudo zypper install -y nodejs18 npm
            ;;
    esac

    print_success "Node.js installed: $(node --version)"
}

# Install Docker
install_docker() {
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
        print_status "Docker already installed: $DOCKER_VERSION"
        return
    fi

    print_status "Installing Docker..."

    # Install Docker using official script
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    rm get-docker.sh

    # Add current user to docker group
    sudo usermod -aG docker $USER

    # Start and enable Docker service
    sudo systemctl start docker
    sudo systemctl enable docker

    print_success "Docker installed: $(docker --version)"
    print_warning "Please log out and log back in for Docker group changes to take effect"
}

# Install Docker Compose
install_docker_compose() {
    if command -v docker-compose &> /dev/null; then
        COMPOSE_VERSION=$(docker-compose --version | cut -d' ' -f3 | cut -d',' -f1)
        print_status "Docker Compose already installed: $COMPOSE_VERSION"
        return
    fi

    print_status "Installing Docker Compose..."

    # Install Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose

    print_success "Docker Compose installed: $(docker-compose --version)"
}

# Create dashboard user
create_user() {
    if id "$SERVICE_USER" &>/dev/null; then
        print_status "User $SERVICE_USER already exists"
    else
        print_status "Creating service user: $SERVICE_USER"
        sudo useradd -r -s /bin/false -d $DASHBOARD_DIR $SERVICE_USER
        print_success "User $SERVICE_USER created"
    fi
}

# Clone and setup project
setup_project() {
    print_status "Setting up project directory..."

    # Create backup if directory exists
    if [[ -d "$DASHBOARD_DIR" ]]; then
        print_warning "Dashboard directory already exists, creating backup..."
        # Remove existing backup if it exists
        if [[ -d "$BACKUP_DIR" ]]; then
            sudo rm -rf $BACKUP_DIR
        fi
        # Create backup with timestamp
        BACKUP_DIR_WITH_TIMESTAMP="${BACKUP_DIR}-$(date +%Y%m%d-%H%M%S)"
        sudo mv $DASHBOARD_DIR $BACKUP_DIR_WITH_TIMESTAMP
        print_status "Backup created at: $BACKUP_DIR_WITH_TIMESTAMP"
    fi

    # Create directory
    sudo mkdir -p $DASHBOARD_DIR
    sudo chown $USER:$USER $DASHBOARD_DIR

    # Clone repository
    print_status "Cloning project from GitHub..."
    cd /tmp
    git clone $REPO_URL linux-dashboard-temp
    cd linux-dashboard-temp
    
    # Copy all files to the target directory
    print_status "Copying project files..."
    cp -r * $DASHBOARD_DIR/
    cp -r .* $DASHBOARD_DIR/ 2>/dev/null || true
    
    # Clean up temporary directory
    cd /
    rm -rf /tmp/linux-dashboard-temp
    
    # Set proper permissions
    sudo chown -R $USER:$USER $DASHBOARD_DIR
    
    print_success "Project files copied to $DASHBOARD_DIR"
}

# Configure environment
configure_environment() {
    print_status "Configuring environment..."

    cd $DASHBOARD_DIR

    # Create .env file
    sudo tee .env > /dev/null << EOF
# Backend Configuration
PORT=5000
FRONTEND_URL=http://localhost:3200

# API Keys (optional - widgets will show error messages if not configured)
OPENWEATHER_API_KEY=
NEWS_API_KEY=

# Docker Configuration
DOCKER_SOCKET_PATH=/var/run/docker.sock
EOF

    # Set proper ownership
    sudo chown $USER:$USER .env

    print_success "Environment configured"
}

# Build and start services
build_and_start() {
    print_status "Building and starting services..."

    cd $DASHBOARD_DIR

    # Check if docker-compose.yml exists
    if [[ ! -f "docker-compose.yml" ]]; then
        print_error "docker-compose.yml not found. Installation may have failed."
        return 1
    fi

    # Start the services
    print_status "Starting Docker containers..."
    docker-compose up -d

    if [[ $? -eq 0 ]]; then
        print_success "Dashboard started successfully!"
        print_status "Access your dashboard at: http://localhost:3200"
        print_status "Backend API at: http://localhost:5000"
        echo ""
        print_status "Useful commands:"
        echo "  View logs: docker-compose logs -f"
        echo "  Stop dashboard: docker-compose down"
        echo "  Restart: docker-compose restart"
    else
        print_error "Failed to start dashboard. Check logs with: docker-compose logs"
    fi
}

# Create systemd service (optional)
create_systemd_service() {
    read -p "Create systemd service for auto-start? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Creating systemd service..."

        sudo tee /etc/systemd/system/linux-dashboard.service > /dev/null << EOF
[Unit]
Description=Linux Dashboard
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$DASHBOARD_DIR
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0
User=$SERVICE_USER
Group=$SERVICE_USER

[Install]
WantedBy=multi-user.target
EOF

        sudo systemctl daemon-reload
        sudo systemctl enable linux-dashboard.service

        print_success "Systemd service created and enabled"
    fi
}

# Main installation function
main() {
    echo "=========================================="
    echo "    Linux Dashboard Installer v1.0.0     "
    echo "=========================================="
    echo ""

    check_root
    detect_os
    install_dependencies
    install_nodejs
    install_docker
    install_docker_compose
    create_user
    setup_project
    configure_environment
    build_and_start
    create_systemd_service

    echo ""
    echo "=========================================="
    print_success "Installation completed!"
    echo "=========================================="
    echo ""
    print_status "Next steps:"
    echo "1. Copy your project files to $DASHBOARD_DIR"
    echo "2. Configure API keys in $DASHBOARD_DIR/.env (optional)"
    echo "3. Start the dashboard:"
    echo "   cd $DASHBOARD_DIR"
    echo "   docker-compose up -d"
    echo ""
    print_status "Access the dashboard at: http://localhost:3000"
    echo ""
    print_status "For support, visit: https://github.com/yourusername/linux-dashboard"
}

# Run main function
main "$@"
