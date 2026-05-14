"use client";

import React, { useEffect } from "react";
import { useThemeStore } from "@/almacenes/usoTheme";

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const initTheme = useThemeStore((state) => state.initTheme);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var theme = localStorage.getItem('oasis-theme');
                var isDark = false;
                
                if (theme) {
                  var parsed = JSON.parse(theme);
                  var themeValue = parsed.state.theme;
                  
                  if (themeValue === 'dark') {
                    isDark = true;
                  } else if (themeValue === 'system') {
                    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  }
                } else {
                  isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                }
                
                if (isDark) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {
                console.error('Theme init error', e);
              }
            })();
          `,
        }}
      />
      {children}
    </>
  );
};

export default ThemeProvider;
