import crypto from 'crypto';
if (!global.crypto) {
  (global as any).crypto = crypto;
}

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';

import fhirRoutes from './routes/fhir.routes';
import reportRoutes from './routes/report.routes';
import crudRoutes from './routes/crud.routes';

import { connectDB } from './config/db';

dotenv.config();

const app = express();
const server = http.createServer(app);

// ✅ Trust proxy for Render deployment
app.set('trust proxy', 1);

// ✅ Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
  }
});

const PORT = process.env.PORT || 3000;

// ✅ Connect MongoDB
connectDB();

// ✅ Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true
  })
);

app.use(helmet());

app.use(
  express.json({
    limit: '10mb'
  })
);

app.use(morgan('dev'));

// ✅ Socket.IO available in routes/controllers
app.set('io', io);

// =====================================================
// 🚀 ROOT ROUTE
// =====================================================

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🚀 Lab Reports Backend API Running Successfully',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date()
  });
});

// =====================================================
// ❤️ HEALTH CHECK ROUTE
// =====================================================

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

// =====================================================
// 📡 API ROUTES
// =====================================================

app.use('/api/fhir', fhirRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/crud', crudRoutes);

// =====================================================
// 🔔 SOCKET.IO EVENTS
// =====================================================

io.on('connection', (socket) => {
  console.log(`✅ User Connected: ${socket.id}`);

  // Example realtime event
  socket.on('join-report-room', (reportId) => {
    socket.join(reportId);
    console.log(`📄 User joined report room: ${reportId}`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ User Disconnected: ${socket.id}`);
  });
});

// =====================================================
// ❌ 404 ROUTE HANDLER
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '❌ Route Not Found'
  });
});

// =====================================================
// 🚨 GLOBAL ERROR HANDLER
// =====================================================

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error('🔥 ERROR:', err.stack);

    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal Server Error',
      stack:
        process.env.NODE_ENV === 'development'
          ? err.stack
          : undefined
    });
  }
);

// =====================================================
// 🚀 START SERVER
// =====================================================

server.listen(PORT, () => {
  console.log(`🚀 Lab Reports Server running on port ${PORT}`);
});