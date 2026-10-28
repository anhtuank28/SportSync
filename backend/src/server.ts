import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import venueRoutes from './modules/venue/venue.routes';
import bookingRoutes from './modules/booking/booking.routes';
import matchmakingRoutes from './modules/matchmaking/matchmaking.routes';
import ownerRoutes from './modules/owner/owner.routes';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './config/swagger';
import { errorHandler } from './middlewares/errorHandler';

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
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
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

// -------------------------------------------------------------
// API MODULE ROUTES (Tuần 1, Tuần 2 & Tuần 3)
// -------------------------------------------------------------
app.use('/api/v1/venues', venueRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/matchmaking', matchmakingRoutes);
app.use('/api/v1/owner', ownerRoutes);
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, () => {
    console.log(`🚀 SportSync Backend Server listening on http://localhost:${PORT}`);
    console.log(`📡 WebSocket Gateway ready on ws://localhost:${PORT}`);
    console.log(`🩺 Health check available at: http://localhost:${PORT}/api/v1/health`);
    console.log(`🏟️ Venues API endpoint at: http://localhost:${PORT}/api/v1/venues`);
    console.log(`⚡ Bookings & VietQR API at: http://localhost:${PORT}/api/v1/bookings`);
    console.log(`🤝 Matchmaking API at: http://localhost:${PORT}/api/v1/matchmaking`);
    console.log(`🏢 CourtSync OS Owner API at: http://localhost:${PORT}/api/v1/owner`);
    console.log(`📚 Swagger OpenAPI Docs at: http://localhost:${PORT}/api/v1/docs`);
  });
}

export default app;
