import { Server as SocketServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';

let io: SocketServer | null = null;

export const initSocket = (server: HttpServer) => {
  io = new SocketServer(server, {
    cors: {
      origin: '*', // Adjust to specific frontend URL in production
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    },
  });

  // Authentication Middleware
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      (socket as any).user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    
    // Join tenant room
    if (user?.tenantId) {
      socket.join(`tenant:${user.tenantId}`);
    }
    
    // Join user-specific room
    if (user?.id) {
      socket.join(`user:${user.id}`);
    }

    // Role-specific rooms
    if (user?.role && user?.tenantId) {
      socket.join(`role:${user.tenantId}:${user.role}`);
    }

    socket.on('join_class', (classId: string) => {
      socket.join(`class:${classId}`);
    });

    socket.on('leave_class', (classId: string) => {
      socket.leave(`class:${classId}`);
    });

    socket.on('disconnect', () => {
      // Handle disconnects
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized!');
  }
  return io;
};

// Helper methods for Academic Operations

export const notifyTimetableUpdate = (tenantId: string, classId: string, payload: any) => {
  if (io) {
    io.to(`class:${classId}`).emit('timetable_updated', payload);
    // Also notify school admins
    io.to(`role:${tenantId}:SCHOOL_ADMIN`).emit('timetable_updated', payload);
  }
};

export const notifyLessonPlanUpdate = (tenantId: string, teacherId: string, payload: any) => {
  if (io) {
    io.to(`user:${teacherId}`).emit('lesson_plan_updated', payload);
    io.to(`role:${tenantId}:SCHOOL_ADMIN`).emit('lesson_plan_updated', payload);
  }
};
