import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('🔌 Đã kết nối Socket.io Realtime:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('❌ Ngắt kết nối Socket.io Realtime');
    });
  }

  return socket;
};

export default getSocket;
