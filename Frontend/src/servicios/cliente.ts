import axios from "axios";

// Configuración base de la API de OASIS
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1/";

export const clienteApi = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para inyectar el token de acceso
clienteApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const authStorage = localStorage.getItem("oasis-auth");
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        const token = parsed.state?.accessToken;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          // console.log("[API] Token inyectado:", token.substring(0, 10) + "...");
        }
      } catch (e) {
        console.error("[API] Error al leer tokens del localStorage:", e);
      }
    }
  }
  return config;
});

// Interceptor para manejar la rotación automática de tokens (JWT)
clienteApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si recibimos un 401 y no hemos reintentado aún
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const authStorage = localStorage.getItem("oasis-auth");
        if (!authStorage) throw new Error("Sin sesión en storage");

        const parsed = JSON.parse(authStorage);
        const refreshToken = parsed.state?.refreshToken;

        if (!refreshToken) throw new Error("Sin refresh token disponible");

        console.log("[API] Intentando refrescar token...");

        // Intentar refrescar el token (usando axios plano para evitar interceptores infinitos)
        const res = await axios.post(`${API_URL}auth/refresh`, { refreshToken });
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = res.data.data;

        // Actualizar localStorage manualmente para la persistencia de Zustand
        localStorage.setItem("oasis-auth", JSON.stringify({
          state: { 
            ...parsed.state, 
            accessToken: newAccessToken, 
            refreshToken: newRefreshToken 
          },
          version: parsed.version || 0
        }));

        console.log("[API] Token refrescado con éxito.");

        // Reintentar la petición original con el nuevo token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axios(originalRequest);
      } catch (refreshError: any) {
        console.warn("[API] El refresco de token falló:", refreshError.message);
        // Si el refresco falla de verdad, solo entonces limpiamos y redirigimos
        if (typeof window !== "undefined" && !originalRequest.url.includes('/auth/login')) {
          localStorage.removeItem("oasis-auth");
          window.location.href = "/acceso/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
