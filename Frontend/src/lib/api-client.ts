import axios from "axios";
import { useAuthStore } from "@/almacenes/usoAuth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de Petición: Añadir Token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Respuesta: Manejar Refresh Token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 y no hemos reintentado ya
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) throw new Error("No refresh token available");

        // Intentar refrescar token
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        // Actualizar store
        useAuthStore.getState().login({
          user: useAuthStore.getState().user!,
          accessToken,
          refreshToken: newRefreshToken,
        });

        // Reintentar petición original
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Si el refresh falla, cerrar sesión
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    // Retry on 500, 502, 503 (max 1 retry)
    const retryStatuses = [500, 502, 503];
    if (error.response && retryStatuses.includes(error.response.status) && !originalRequest._isRetry) {
      originalRequest._isRetry = true;
      return apiClient(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
