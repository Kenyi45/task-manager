/**
 * API Module - Legacy Compatibility Layer
 * Mantiene compatibilidad con el código existente mientras se migra a la nueva arquitectura
 * Principio de Responsabilidad Única (SRP): Solo exporta funciones de compatibilidad
 */

import { ServiceFactory } from './factories/ServiceFactory';
import { Task, TaskCreate, TaskUpdate, PaginatedResponse, AuthTokens, LoginCredentials } from '@/types';
import { API_CONFIG, AUTH_CONFIG } from '@/lib/config';

// Instancia del servicio de tareas
const taskService = ServiceFactory.getTaskService();

/**
 * Tipos legacy para compatibilidad
 */
export interface TaskListResponse {
  results: Task[];
  count: number;
  next: string | null;
  previous: string | null;
}

// Re-exportar tipos para compatibilidad
export type { Task, TaskCreate };

/**
 * Funciones legacy para compatibilidad con código existente
 */

export const getTasks = async (page: number = 1): Promise<TaskListResponse> => {
  const result = await taskService.getTasks();
  return result;
};

export const getTask = async (id: number): Promise<Task> => {
  return await taskService.getTask(id);
};

export const createTask = async (data: TaskCreate): Promise<Task> => {
  return await taskService.createTask(data);
};

export const updateTask = async (id: number, data: TaskUpdate): Promise<Task> => {
  return await taskService.updateTask(id, data);
};

export const deleteTask = async (id: number): Promise<void> => {
  return await taskService.deleteTask(id);
};

/**
 * Funciones de autenticación legacy usando configuración
 */
export const login = async (credentials: LoginCredentials): Promise<AuthTokens> => {
  const apiService = ServiceFactory.getApiService();
  
  try {
    const response = await apiService.post<AuthTokens>(API_CONFIG.ENDPOINTS.LOGIN!, credentials);
    
    if (response.data.access && response.data.refresh) {
      apiService.setAuthToken(response.data.access);
      localStorage.setItem(AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY!, response.data.refresh);
    }
    
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Error de autenticación');
  }
};

export const logout = async () => {
  const apiService = ServiceFactory.getApiService();
  apiService.removeAuthToken();
};

// Función para verificar si el usuario está autenticado usando configuración
export const isAuthenticated = (): boolean => {
  if (typeof window !== 'undefined') {
    return !!localStorage.getItem(AUTH_CONFIG.TOKEN_STORAGE_KEY!);
  }
  return false;
}; 