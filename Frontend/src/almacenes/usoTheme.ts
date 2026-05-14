import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "light",
      resolvedTheme: "light",

      setTheme: (theme: Theme) => {
        const html = document.documentElement;
        
        // 1. Aplicar clase de transición
        html.classList.add("theme-transition");
        
        // 2. Determinar tema resuelto
        let resolved: "light" | "dark";
        if (theme === "system") {
          resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        } else {
          resolved = theme;
        }

        // 3. Aplicar al DOM
        if (resolved === "dark") {
          html.classList.add("dark");
        } else {
          html.classList.remove("dark");
        }

        // 4. Actualizar estado
        set({ theme, resolvedTheme: resolved });

        // 5. Limpiar transición
        setTimeout(() => {
          html.classList.remove("theme-transition");
        }, 400);
      },

      initTheme: () => {
        const storedTheme = get().theme;
        
        const applyTheme = (theme: Theme) => {
          const html = document.documentElement;
          let resolved: "light" | "dark";
          
          if (theme === "system") {
            resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
          } else {
            resolved = theme;
          }

          if (resolved === "dark") {
            html.classList.add("dark");
          } else {
            html.classList.remove("dark");
          }
          
          set({ resolvedTheme: resolved });
        };

        applyTheme(storedTheme);

        // Listener para cambios del sistema
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = () => {
          if (get().theme === "system") {
            applyTheme("system");
          }
        };

        mediaQuery.addEventListener("change", handler);
      },
    }),
    {
      name: "oasis-theme",
    }
  )
);
