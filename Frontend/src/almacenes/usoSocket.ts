import { create } from "zustand";

interface SocketStore {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  setConnected: (connected: boolean) => void;
  setConnecting: (connecting: boolean) => void;
  setError: (error: string | null) => void;
}

export const useSocketStore = create<SocketStore>((set) => ({
  isConnected: false,
  isConnecting: false,
  error: null,
  setConnected: (connected) => set({ isConnected: connected, isConnecting: false }),
  setConnecting: (connecting) => set({ isConnecting: connecting }),
  setError: (error) => set({ error }),
}));
