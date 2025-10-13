# Linux Dashboard

A modern, web-based monitoring dashboard for Linux systems with Docker container management and public API integrations. Built with React, Node.js, and TypeScript.

![Linux Dashboard](https://via.placeholder.com/800x400/1e293b/ffffff?text=Linux+Dashboard)

## Features

### 🖥️ System Monitoring
- **Real-time CPU usage** with per-core statistics and temperature monitoring
- **Memory usage** with detailed breakdown (used, cached, free, swap)
- **Disk usage** for all mounted drives with visual indicators
- **Network activity** with upload/download speeds and interface details
- **System information** including uptime, OS details, and load averages

### 🐳 Docker Management
- **Container overview** with status indicators and resource usage
- **Start/stop/restart** containers with one-click actions
- **Live container logs** with streaming support
- **Resource monitoring** per container (CPU, memory, network)
- **Port mapping** and container details

### 🌐 Public API Widgets
- **Weather** - Current conditions and 5-day forecast (OpenWeatherMap)
- **News** - Latest headlines with filtering by category (NewsAPI)
- **Cryptocurrency** - Live prices for major coins (CoinGecko)
- **GitHub** - Repository statistics and activity
- **System Status** - External service monitoring

### 🎨 Dashboard Features
- **Drag-and-drop** widget placement with react-grid-layout
- **Responsive design** that works on desktop, tablet, and mobile
- **Dark/light theme** with system preference detection
- **Layout persistence** - your arrangement is saved locally
- **Real-time updates** via WebSocket connections
- **Modern UI** with Tailwind CSS and smooth animations

## Quick Start

### One-Script Installation

```bash
curl -sSL https://raw.githubusercontent.com/Lord0fthetrains/os/refs/heads/main/install.sh | bash
```

The installer will:
- Detect your Linux distribution
- Install Node.js 18+ and Docker
- Set up the project directory
- Configure environment variables
- Create systemd service (optional)

### Manual Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Lord0fthetrains/os.git
   cd linux-dashboard
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys (optional)
   ```

4. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

5. **Access the dashboard**
   Open http://localhost:3000 in your browser

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Backend Configuration
PORT=5000
FRONTEND_URL=http://localhost:3000

# API Keys (optional)
OPENWEATHER_API_KEY=your_openweather_api_key_here
NEWS_API_KEY=your_news_api_key_here

# Docker Configuration
DOCKER_SOCKET_PATH=/var/run/docker.sock
```

### API Keys Setup

#### Weather Widget (OpenWeatherMap)
1. Sign up at [OpenWeatherMap](https://openweathermap.org/api)
2. Get your free API key
3. Add `OPENWEATHER_API_KEY=your_key_here` to `.env`

#### News Widget (NewsAPI)
1. Sign up at [NewsAPI](https://newsapi.org/)
2. Get your free API key
3. Add `NEWS_API_KEY=your_key_here` to `.env`

#### Crypto Widget (CoinGecko)
- No API key required - uses free public API

## Usage

### Dashboard Layout

- **Drag widgets** by their header to rearrange
- **Resize widgets** by dragging the bottom-right corner
- **Toggle theme** using the sun/moon icon in the header
- **View logs** by clicking the terminal icon on Docker containers

### System Monitoring

The dashboard automatically monitors:
- CPU usage and temperature
- Memory usage and swap
- Disk space on all mounted drives
- Network activity on all interfaces
- System uptime and load averages

### Docker Management

- View all containers with their current status
- Start, stop, or restart containers
- Monitor resource usage per container
- Stream live container logs
- View port mappings and container details

### Widget Configuration

Most widgets can be configured by editing the `WidgetGrid.tsx` file:
- Change weather city: `<WeatherWidget city="New York" />`
- Change news category: `<NewsWidget category="business" />`
- Adjust crypto limit: `<CryptoWidget limit={10} />`

## Development

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- Git

### Backend Development

```bash
cd backend
npm run dev
```

The backend will start on http://localhost:5000

### Frontend Development

```bash
cd frontend
npm run dev
```

The frontend will start on http://localhost:3000

### Building for Production

```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

### Docker Development

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Architecture

### Backend (Node.js + TypeScript)
- **Express.js** REST API server
- **Socket.IO** for real-time communication
- **systeminformation** for system monitoring
- **dockerode** for Docker API integration
- **axios** for external API calls

### Frontend (React + TypeScript)
- **React 18** with hooks and context
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **react-grid-layout** for drag-and-drop
- **Socket.IO client** for real-time updates

### Containerization
- **Docker** containers for both frontend and backend
- **Docker Compose** for orchestration
- **Nginx** reverse proxy for the frontend
- **Health checks** for all services

## API Endpoints

### System Monitoring
- `GET /api/system/stats` - Get current system statistics
- `GET /api/system/cpu-history` - Get CPU usage history
- `GET /api/system/memory-history` - Get memory usage history
- `GET /api/system/disk-usage` - Get disk usage information
- `GET /api/system/network-stats` - Get network statistics

### Docker Management
- `GET /api/docker/containers` - List all containers
- `GET /api/docker/containers/:id/stats` - Get container statistics
- `GET /api/docker/containers/:id/logs` - Get container logs
- `POST /api/docker/containers/:id/start` - Start container
- `POST /api/docker/containers/:id/stop` - Stop container
- `POST /api/docker/containers/:id/restart` - Restart container

### Widget APIs
- `GET /api/widgets/weather?city=London` - Get weather data
- `GET /api/widgets/news?category=technology&limit=10` - Get news data
- `GET /api/widgets/crypto?limit=10` - Get cryptocurrency prices
- `GET /api/widgets/github?username=octocat&limit=5` - Get GitHub repositories
- `GET /api/widgets/status` - Get external service status

## Troubleshooting

### Common Issues

#### Docker Permission Denied
```bash
sudo usermod -aG docker $USER
# Log out and log back in
```

#### Port Already in Use
```bash
# Check what's using port 3000
sudo lsof -i :3000
# Kill the process or change the port in docker-compose.yml
```

#### WebSocket Connection Failed
- Ensure the backend is running on port 5000
- Check firewall settings
- Verify Docker network configuration

#### API Keys Not Working
- Verify API keys are correctly set in `.env`
- Check API key permissions and quotas
- Ensure internet connectivity

### Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# View system logs
journalctl -u linux-dashboard.service -f
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [systeminformation](https://github.com/sebhildebrandt/systeminformation) for system monitoring
- [react-grid-layout](https://github.com/react-grid-layout/react-grid-layout) for drag-and-drop
- [Recharts](https://recharts.org/) for data visualization
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [CasaOS](https://casaos.io/) for inspiration

## Support

- 📖 [Documentation](https://github.com/Lord0fthetrains/os/wiki)
- 🐛 [Report Issues](https://github.com/Lord0fthetrains/os/issues)
- 💬 [Discussions](https://github.com/Lord0fthetrains/os/discussions)
- 📧 [Email Support](mailto:support@example.com)

---

Made with ❤️ for the Linux community
