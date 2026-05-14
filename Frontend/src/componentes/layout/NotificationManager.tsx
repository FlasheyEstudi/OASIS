"use client";

import React, { useEffect } from "react";
import { useAuthStore } from "@/almacenes/usoAuth";
import apiClient from "@/lib/api-client";

export const NotificationManager = () => {
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('SW registered:', registration);

          // Solicitar permiso
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            // Obtener suscripción (Aquí se integraría con VAPID o FCM)
            // Por ahora simulamos el envío del token al backend
            const subscription = await registration.pushManager.getSubscription();
            
            if (!subscription) {
              // Suscribir si no existe
              // const newSubscription = await registration.pushManager.subscribe({ ... });
              // apiClient.post('/notifications/register-device', { fcmToken: JSON.stringify(newSubscription) });
            }
          }
        } catch (error) {
          console.error('SW registration failed:', error);
        }
      }
    };

    registerServiceWorker();
  }, [user]);

  return null;
};

export default NotificationManager;
