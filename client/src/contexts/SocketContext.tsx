
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../features/auth/authContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, isConnected: false });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { tenantSubdomain } = useAuth();

  useEffect(() => {
    // We connect to the backend only when we know the tenant
    if (!tenantSubdomain) return;

    // Use current hostname and point to backend port, or use relative path if proxied
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    // Determine the tenantId from the API or local storage.
    // For simplicity, we just pass tenantSubdomain. 
    // The backend should map tenantSubdomain to tenantId or we send both.
    const newSocket = io(API_URL, {
      query: { tenantSubdomain },
      transports: ['websocket'],
      withCredentials: true
    });

    setSocket(newSocket);

    newSocket.on('connect', () => setIsConnected(true));
    newSocket.on('disconnect', () => setIsConnected(false));

    return () => {
      newSocket.close();
    };
  }, [tenantSubdomain]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

