/**
 * Application Configuration
 * Configuración centralizada usando variables de entorno
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  TIMEOUT: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT!),
  ENDPOINTS: {
    LOGIN: process.env.NEXT_PUBLIC_LOGIN_ENDPOINT,
    REFRESH: process.env.NEXT_PUBLIC_REFRESH_ENDPOINT,
    TASKS: process.env.NEXT_PUBLIC_TASKS_ENDPOINT,
  }
};

// Authentication Configuration
export const AUTH_CONFIG = {
  TOKEN_STORAGE_KEY: process.env.NEXT_PUBLIC_TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY: process.env.NEXT_PUBLIC_REFRESH_TOKEN_STORAGE_KEY,
};

// Application Configuration
export const APP_CONFIG = {
  NAME: process.env.NEXT_PUBLIC_APP_NAME,
  VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
  DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
};

// Timezone Configuration
export const TIMEZONE_CONFIG = {
  TIMEZONE: process.env.NEXT_PUBLIC_TIMEZONE,
  LOCALE: process.env.NEXT_PUBLIC_LOCALE,
};

// UI Configuration
export const UI_CONFIG = {
  ITEMS_PER_PAGE: parseInt(process.env.NEXT_PUBLIC_ITEMS_PER_PAGE!),
  ENABLE_ANIMATIONS: process.env.NEXT_PUBLIC_ENABLE_ANIMATIONS,
  THEME: process.env.NEXT_PUBLIC_THEME,
};

// Development Configuration
export const DEV_CONFIG = {
  DEBUG: process.env.NEXT_PUBLIC_DEBUG,
  NODE_ENV: process.env.NODE_ENV,
}; 