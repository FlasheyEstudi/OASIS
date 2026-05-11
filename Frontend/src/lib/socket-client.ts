
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    // Use env var if set, otherwise auto-detect the current host
    // This makes WebSockets work when accessing via LAN IP (e.g. 192.168.1.x:3000)
    // SAFELY ENABLE SOCKETS ON MOBILE/TUNNELS USING POLLING
    const isTunnelOrMobile = typeof window !== 'undefined' && 
       (window.location.hostname.includes('tunnelmole') || 
        window.location.hostname.includes('loca.lt') ||
        /Android|iPhone|iPad/i.test(navigator.userAgent));

    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 
      (typeof window !== 'undefined'
        ? `${window.location.protocol}//${window.location.hostname}:3002`
        : 'http://localhost:3002')

    socket = io(SOCKET_URL, {
      path: '/api/socket',
      transports: isTunnelOrMobile ? ['polling'] : ['websocket', 'polling'],
      autoConnect: false,
      reconnectionAttempts: 5,
      timeout: 5000,
      withCredentials: true
    });
    
    socket.on('connect', () => {
      console.log('Connected to Oasis Real-time Server');
    });
    
    socket.on('disconnect', () => {
      console.log('Disconnected from Oasis Real-time Server');
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
