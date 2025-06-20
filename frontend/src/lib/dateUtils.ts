/**
 * Date Utilities for Lima, Peru timezone
 * Utilidades centralizadas para manejo de fechas en zona horaria de Lima, Perú
 */

import { TIMEZONE_CONFIG } from '@/lib/config';

// Configuración de zona horaria desde variables de entorno
export const LIMA_TIMEZONE = TIMEZONE_CONFIG.TIMEZONE;
export const LIMA_LOCALE = TIMEZONE_CONFIG.LOCALE;

/**
 * Formatea una fecha para mostrar en zona horaria configurada
 */
export const formatDateLima = (
  dateString: string,
  options: Intl.DateTimeFormatOptions = {}
): string => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: LIMA_TIMEZONE,
    ...options
  };

  return new Date(dateString).toLocaleDateString(LIMA_LOCALE, defaultOptions);
};

/**
 * Formatea una fecha completa para mostrar en zona horaria configurada
 */
export const formatFullDateLima = (dateString: string): string => {
  return formatDateLima(dateString, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formatea solo la fecha (sin hora) en zona horaria configurada
 */
export const formatDateOnlyLima = (dateString: string): string => {
  return formatDateLima(dateString, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Formatea solo la hora en zona horaria configurada
 */
export const formatTimeOnlyLima = (dateString: string): string => {
  return formatDateLima(dateString, {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Calcula el tiempo transcurrido desde una fecha en zona horaria configurada
 */
export const getTimeAgoLima = (dateString: string): string => {
  const now = new Date();
  const taskDate = new Date(dateString);
  
  // Convertir ambas fechas a zona horaria configurada para comparación precisa
  const nowLima = new Date(now.toLocaleString('en-US', { timeZone: LIMA_TIMEZONE }));
  const taskDateLima = new Date(taskDate.toLocaleString('en-US', { timeZone: LIMA_TIMEZONE }));
  
  const diffInMs = nowLima.getTime() - taskDateLima.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);

  if (diffInMonths > 0) {
    return `hace ${diffInMonths} mes${diffInMonths > 1 ? 'es' : ''}`;
  } else if (diffInWeeks > 0) {
    return `hace ${diffInWeeks} semana${diffInWeeks > 1 ? 's' : ''}`;
  } else if (diffInDays > 0) {
    return `hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
  } else if (diffInHours > 0) {
    return `hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
  } else if (diffInMinutes > 0) {
    return `hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
  } else {
    return 'hace unos momentos';
  }
};

/**
 * Verifica si una fecha es de hoy en zona horaria configurada
 */
export const isToday = (dateString: string): boolean => {
  const today = new Date();
  const date = new Date(dateString);
  
  const todayLima = formatDateOnlyLima(today.toISOString());
  const dateLima = formatDateOnlyLima(date.toISOString());
  
  return todayLima === dateLima;
};

/**
 * Verifica si una fecha es de ayer en zona horaria configurada
 */
export const isYesterday = (dateString: string): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const date = new Date(dateString);
  
  const yesterdayLima = formatDateOnlyLima(yesterday.toISOString());
  const dateLima = formatDateOnlyLima(date.toISOString());
  
  return yesterdayLima === dateLima;
};

/**
 * Verifica si una fecha es reciente (últimas 24 horas) en zona horaria configurada
 */
export const isRecent = (dateString: string): boolean => {
  const now = new Date();
  const date = new Date(dateString);
  
  const nowLima = new Date(now.toLocaleString('en-US', { timeZone: LIMA_TIMEZONE }));
  const dateLima = new Date(date.toLocaleString('en-US', { timeZone: LIMA_TIMEZONE }));
  
  const diffInHours = (nowLima.getTime() - dateLima.getTime()) / (1000 * 60 * 60);
  
  return diffInHours <= 24;
};

/**
 * Obtiene la fecha y hora actual en zona horaria configurada
 */
export const getCurrentDateTimeLima = (): Date => {
  return new Date(new Date().toLocaleString('en-US', { timeZone: LIMA_TIMEZONE }));
};

/**
 * Formatea una fecha de manera inteligente según qué tan reciente sea
 */
export const formatSmartDateLima = (dateString: string): string => {
  if (isToday(dateString)) {
    return `Hoy a las ${formatTimeOnlyLima(dateString)}`;
  } else if (isYesterday(dateString)) {
    return `Ayer a las ${formatTimeOnlyLima(dateString)}`;
  } else if (isRecent(dateString)) {
    return getTimeAgoLima(dateString);
  } else {
    return formatDateLima(dateString);
  }
}; 