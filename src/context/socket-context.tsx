import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { socket } from '@/lib/socket-client';

interface SocketContextType {
  socket: typeof socket;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context.socket;
};

export const SocketProvider: React.FC<{ children: ReactNode; tableId?: string }> = ({ children, tableId }) => {
  useEffect(() => {
    socket.connect();

    if (tableId) {
      socket.emit('joinRoom', tableId);
    }

    return () => {
      socket.disconnect();
    };
  }, [tableId]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
