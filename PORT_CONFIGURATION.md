# Port Configuration Summary

## 🚀 **Linux Dashboard Port Configuration**

### **External Access Ports (User-Facing)**
- **Frontend Dashboard**: `3200` - Main dashboard interface
- **Backend API**: `3200/api/` - All API calls go through nginx proxy

### **Internal Container Ports (Docker)**
- **Frontend Container**: `3000` (internal) → `3200` (external)
- **Backend Container**: `5200` (internal) → Not directly exposed
- **Nginx Proxy**: `3000` (internal) → `3200` (external)

### **Port Mapping Flow**
```
User → http://YOUR_IP:3200
  ↓
Nginx (port 3000 internal) → Frontend (port 3000 internal)
  ↓
Nginx → Backend (port 5200 internal) for /api/ and /socket.io/
```

### **Configuration Files**

#### **docker-compose.yml**
- Frontend: `"3200:3000"` (external:internal)
- Backend: No external port (accessed via nginx)
- Backend PORT: `5200`
- Frontend URL: `http://localhost:3200`

#### **nginx.conf**
- Listen: `3000` (internal)
- API Proxy: `http://backend:5200/`
- WebSocket Proxy: `http://backend:5200/`

#### **Backend (server.ts)**
- Default PORT: `5200`
- CORS Origin: `http://localhost:3200`
- Socket.IO Origin: `http://localhost:3200`

#### **Frontend (vite.config.ts)**
- Dev Server: `3000` (internal)
- Production: Served via nginx

### **Environment Variables**
```env
PORT=5200
FRONTEND_URL=http://localhost:3200
```

### **API Endpoints**
- Health Check: `http://YOUR_IP:3200/api/health`
- System Stats: `http://YOUR_IP:3200/api/system/stats`
- Docker API: `http://YOUR_IP:3200/api/docker/`
- Widgets API: `http://YOUR_IP:3200/api/widgets/`
- Update API: `http://YOUR_IP:3200/api/update/`

### **WebSocket**
- Connection: `http://YOUR_IP:3200/socket.io/`
- Events: `system:stats`, `docker:containers`, `docker:stats`

### **Troubleshooting**
- Frontend not loading: Check port 3200
- API calls failing: Check nginx proxy to backend:5200
- WebSocket not connecting: Check Socket.IO CORS settings
- Backend not starting: Check port 5200 availability
