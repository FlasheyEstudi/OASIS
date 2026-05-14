import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'pharmacy_admin' | 'pharmacy_staff' | 'delivery_person' | 'superadmin' | 'receptionist';
  phone?: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (data: { user: User; accessToken: string; refreshToken: string }) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      login: (data) => {
        set({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          isAuthenticated: true,
        });
        // Sync cookies for middleware
        if (typeof document !== "undefined") {
          document.cookie = `oasis_token=${data.accessToken}; path=/; max-age=604800; samesite=lax`;
          document.cookie = `oasis_role=${data.user.role}; path=/; max-age=604800; samesite=lax`;
        }
      },
      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
        if (typeof document !== "undefined") {
          document.cookie = "oasis_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          document.cookie = "oasis_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          window.location.href = "/acceso/login";
        }
      },
      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),
      setToken: (token) =>
        set({ accessToken: token }),
    }),
    {
      name: "oasis-auth",
    }
  )
);
