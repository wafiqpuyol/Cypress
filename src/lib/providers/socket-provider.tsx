"use client";

import { useEffect, useState, useContext, createContext, FC } from "react";
import { io } from "socket.io-client"

interface SocketContextInterface {
  isConnected: boolean;
  socket: any | null;
}
interface SocketProviderProps {
  children: React.ReactNode;
}
const SocketContext = createContext<SocketContextInterface>({
  isConnected: false,
  socket: null,
});
export const SocketProvider: FC<SocketProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [socket, setSocket] = useState<null | any>(null);
  useEffect(() => {
    const socketClientInstance = new (io as any)(
      process.env.NEXT_PUBLIC_SITE_URL!,
      {
        path: '/api/socket/io',
        addTrailingSlash: false,
      })
    socketClientInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketClientInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    setSocket(socketClientInstance);

    return () => {
      socketClientInstance.disconnect();
    };

  }, [])
  return (
    <SocketContext.Provider value={{ isConnected, socket }}>{children}</SocketContext.Provider>
  )
};

export const useSocket = () => {
  return useContext(SocketContext);
};
