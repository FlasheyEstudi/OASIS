import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/almacenes/usoAuth";
import { useSocketStore } from "@/almacenes/usoSocket";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3002";
const SOCKET_PATH = "/api/socket";

class SocketService {
  private socket: Socket | null = null;
  private reconnectionAttempts = 0;

  connect() {
    const token = useAuthStore.getState().accessToken;
    const { setConnected, setConnecting, setError } = useSocketStore.getState();
    
    if (!token) return;

    setConnecting(true);

    this.socket = io(SOCKET_URL, {
      path: SOCKET_PATH,
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    this.socket.on("connect", () => {
      console.log("[Socket] Conectado exitosamente");
      setConnected(true);
      setError(null);
      this.reconnectionAttempts = 0;
    });

    this.socket.on("disconnect", (reason) => {
      console.log("[Socket] Desconectado:", reason);
      setConnected(false);
    });

    this.socket.on("connect_error", (error: Error) => {
      this.reconnectionAttempts++;
      // Silenciar errores en UI, solo loggear en consola
      console.error(`[Socket] Intento ${this.reconnectionAttempts} fallido:`, error.message);
      
      if (this.reconnectionAttempts >= 3) {
        setError("Error de conexión persistente");
        // Nota: Solo se muestra toast si la UI está escuchando este error del store
      }
    });

    // EVENTOS DE NEGOCIO
    this.socket.on("order:status_changed", (data: any) => {
      window.dispatchEvent(new CustomEvent("oasis:order_update", { detail: data }));
    });

    this.socket.on("delivery:locationUpdate", (data: any) => {
      window.dispatchEvent(new CustomEvent("oasis:location_update", { detail: data }));
    });

    this.socket.on("chat:new_message", (data: any) => {
      window.dispatchEvent(new CustomEvent("oasis:new_message", { detail: data }));
    });

    this.socket.on("notification:new", (data: any) => {
      window.dispatchEvent(new CustomEvent("oasis:new_notification", { detail: data }));
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (!this.socket) this.connect();
    this.socket?.on(event, callback);
  }

  off(event: string) {
    this.socket?.off(event);
  }

  emit(event: string, data: any) {
    if (!this.socket) this.connect();
    this.socket?.emit(event, data);
  }
}

export const socketService = new SocketService();
export default socketService;
