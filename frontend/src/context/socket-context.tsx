import React, { createContext, useContext, useEffect, useState } from 'react';
import { Transaction } from '@/types';

interface SocketContextType {
  isConnected: boolean;
  lastMessage: Transaction | null;
  recentTransactions: Transaction[];
  connect: () => void;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
  initialTransactions: Transaction[];
  url?: string;
}

export const SocketProvider = ({ 
  children, 
  initialTransactions,
  url = 'wss://mock-mev-socket.example' 
}: SocketProviderProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<Transaction | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    initialTransactions.slice(0, 5)
  );

  const connect = () => {
    console.log(`Connecting to WebSocket at ${url}`);
    // In a real application, create an actual WebSocket connection
    // const socket = new WebSocket(url);
    
    // Simulate successful connection
    setTimeout(() => {
      setIsConnected(true);
    }, 500);
  };

  const disconnect = () => {
    console.log('Disconnecting from WebSocket');
    setIsConnected(false);
  };

  useEffect(() => {
    // Connect on component mount
    connect();

    // For demo purposes, simulate receiving transactions periodically
    let interval: NodeJS.Timeout;
    
    if (isConnected) {
      interval = setInterval(() => {
        // Create a new transaction by modifying one of the existing ones
        const randomIndex = Math.floor(Math.random() * initialTransactions.length);
        const baseTx = initialTransactions[randomIndex];
        
        const newTx: Transaction = {
          ...baseTx,
          id: `tx-${Date.now()}`,
          timestamp: Date.now(),
          profit: baseTx.profit * (0.85 + Math.random() * 0.3),
          cost: baseTx.cost * (0.85 + Math.random() * 0.3),
          extra: baseTx.extra * (0.85 + Math.random() * 0.3),
        };
        
        setLastMessage(newTx);
        setRecentTransactions(prev => [newTx, ...prev.slice(0, 4)]);
      }, 8000);
    }

    return () => {
      clearInterval(interval);
      disconnect();
    };
  }, [initialTransactions, isConnected]);

  const value = {
    isConnected,
    lastMessage,
    recentTransactions,
    connect,
    disconnect,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};