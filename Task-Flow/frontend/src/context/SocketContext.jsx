import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { getSocket } from '../services/socket';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children, activeProjectId }) => {
  const { user, isAuthenticated } = useAuth();
  const [activeUsers, setActiveUsers] = useState([]);
  const [typingInfo, setTypingInfo] = useState(null);
  const typingTimeoutRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.disconnect();
      }
      return;
    }

    const socket = getSocket();
    socketRef.current = socket;

    if (!socket.connected) {
      socket.connect();
    }

    // Join active project room if available
    if (activeProjectId) {
      socket.emit('join:project', {
        projectId: activeProjectId,
        user: {
          id: user.id,
          name: user.name,
          avatarUrl: user.avatarUrl
        }
      });
    }

    socket.on('users:active', (users) => {
      setActiveUsers(users || []);
    });

    socket.on('task:typing', ({ taskId, userName }) => {
      setTypingInfo({ taskId, userName });
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setTypingInfo(null);
      }, 3000);
    });

    return () => {
      if (activeProjectId && socket.connected) {
        socket.emit('leave:project', {
          projectId: activeProjectId,
          userId: user.id
        });
      }
      socket.off('users:active');
      socket.off('task:typing');
    };
  }, [isAuthenticated, user, activeProjectId]);

  const emitTyping = (taskId) => {
    if (socketRef.current && activeProjectId && user) {
      socketRef.current.emit('task:typing', {
        projectId: activeProjectId,
        taskId,
        userName: user.name
      });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        activeUsers,
        typingInfo,
        emitTyping
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
