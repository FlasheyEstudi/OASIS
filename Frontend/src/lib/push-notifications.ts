/**
 * Oasis Aura - Sistema de Notificaciones Push
 * Maneja la solicitud de permisos y el registro de tokens FCM.
 */

import apiClient from "@/lib/api-client";

export const requestPushPermission = async (): Promise<string | null> => {
  if (!("Notification" in window)) {
    console.warn("Este navegador no soporta notificaciones de escritorio");
    return null;
  }

  // Primero verificamos el estado actual
  if (Notification.permission === "granted") {
    return getFCMToken();
  }

  // Si no se ha denegado, solicitamos permiso
  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      return getFCMToken();
    }
  }

  return null;
};

const getFCMToken = async (): Promise<string | null> => {
  // Aquí iría la lógica real de Firebase Messaging
  // firebase.messaging().getToken()
  console.log("Simulando obtención de token FCM...");
  const mockToken = "fcm_token_" + Math.random().toString(36).substring(7);
  
  // Registrar el token en el servidor
  await registerDeviceToken(mockToken);
  
  return mockToken;
};

export const registerDeviceToken = async (token: string) => {
  try {
    await apiClient.post("/notifications/register-device", { 
      token,
      platform: "web",
      userAgent: navigator.userAgent
    });
    localStorage.setItem("oasis_push_token", token);
  } catch (error) {
    console.error("Error al registrar el dispositivo para push:", error);
  }
};

/**
 * Muestra un modal de 'pre-permiso' antes de disparar el prompt del navegador.
 * Esto mejora la tasa de conversión de suscripciones.
 */
export const showPushIntroModal = (onAccept: () => void) => {
  // Lógica para mostrar un modal UI personalizado.
  // Podría disparar un evento global o usar un store.
  console.log("Mostrando modal intro de notificaciones...");
};
