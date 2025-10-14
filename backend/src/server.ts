import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import systemRoutes from './routes/system';
import dockerRoutes from './routes/docker';
import widgetRoutes from './routes/widgets';
import updateRoutes from './routes/update';
import versionRoutes from './routes/version';
import portRoutes from './routes/ports';
import logsRoutes from './routes/logs';
import usersRoutes from './routes/users';
import alertsRoutes from './routes/alerts';
import servicesRoutes from './routes/services';
import { SocketHandler } from './websocket/socketHandler';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3200",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3200",
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/system', systemRoutes);
app.use('/api/docker', dockerRoutes);
app.use('/api/widgets', widgetRoutes);
app.use('/api/update', updateRoutes);
app.use('/api/version', versionRoutes);
app.use('/api/ports', portRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/services', servicesRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Initialize WebSocket handler
const socketHandler = new SocketHandler(io);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5200;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 System monitoring dashboard backend ready`);
  console.log(`🔌 WebSocket server running`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});
