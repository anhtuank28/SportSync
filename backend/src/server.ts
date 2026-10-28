import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Khởi tạo Socket.io Server đồng bộ realtime giữa Người chơi & Chủ sân
export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Chuẩn hóa RESTful Health Check
app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'SportSync (CourtSync OS) API Gateway is running smoothly',
    data: {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
    },
    meta: null,
  });
});

// Socket.io Connection Handler
io.on('connection', (socket) => {
  console.log(`🔌 Client connected to Socket.io: ${socket.id}`);

  socket.on('join_venue', (venueId: string) => {
    socket.join(`venue_${venueId}`);
    console.log(`📡 Socket ${socket.id} joined room: venue_${venueId}`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Global Error Handler Middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('💥 Unhandled Exception:', err);
  res.status(500).json({
    success: false,
    statusCode: 500,
    message: err.message || 'Lỗi máy chủ nội bộ (Internal Server Error)',
    data: null,
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 SportSync Backend Server listening on http://localhost:${PORT}`);
  console.log(`📡 WebSocket Gateway ready on ws://localhost:${PORT}`);
  console.log(`🩺 Health check available at: http://localhost:${PORT}/api/v1/health`);
});

export default app;
