import React, { createContext, useContext, useEffect, useState } from "react";
// import { Transaction } from "@/types";

interface SocketContextType {
  isConnected: boolean;
  // lastMessage: Transaction | null;
  recentBundles: any[];
  connect: () => void;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

const SOCKET_URL = import.meta.env.VITE_WS_URL;

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [isConnected, setIsConnected] = useState(false);
  // @ts-ignore
  const [recentBundles, setRecentBundles] = useState<any[]>([]);

  const connect = () => {
    console.log("socket url", SOCKET_URL);
    const socket = new WebSocket(SOCKET_URL);
    socket.onopen = () => {
      console.log("connected to server");
    };
    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      const data = JSON.parse(msg.data);
      console.log("message from server!!!", data);
      setRecentBundles((prev) => [data, ...prev].slice(0, 5));
    };
  };

  const disconnect = () => {
    setIsConnected(false);
  };

  useEffect(() => {
    console.log("connecting to socket");
    connect();

    return () => {
      disconnect();
    };
  }, []);

  const value = {
    isConnected,
    // lastMessage,
    recentBundles,
    connect,
    disconnect,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
