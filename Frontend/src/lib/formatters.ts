/**
 * Oasis Aura — Utilidades de Formateo
 * TODO: Implementar formateadores específicos para salud (ej: IMC, Unidades Médicas)
 */

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
};

export const formatDate = (date: string | Date) => {
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
};

export const formatTime = (time: string) => {
  return time; // TODO: Implementar lógica de 12/24h
};
