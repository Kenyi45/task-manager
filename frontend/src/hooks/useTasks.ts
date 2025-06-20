/**
 * Custom Hook for Task Management
 * Principio de Responsabilidad Única (SRP): Solo maneja estado y operaciones de tareas
 * Principio de Inversión de Dependencias (DIP): Usa abstracciones (servicios)
 */

import { useState, useEffect, useCallback } from 'react';
import { ServiceFactory } from '@/lib/factories/ServiceFactory';
import { Task, TaskCreate, TaskUpdate, ApiError, UseApiState, PaginationParams, PaginatedResponse, PaginationState } from '@/types';

interface UseTasksReturn extends UseApiState<Task[]> {
  pagination: PaginationState;
  createTask: (data: TaskCreate) => Promise<Task>;
  updateTask: (id: number, data: TaskUpdate) => Promise<Task>;
  deleteTask: (id: number) => Promise<void>;
  searchTasks: (query: string) => Promise<Task[]>;
  getTaskStats: () => Promise<{
    total: number;
    recent: number;
    withDescription: number;
    averageWordCount: number;
  }>;
  loadPage: (page: number) => Promise<void>;
  changePageSize: (pageSize: number) => Promise<void>;
  searchWithPagination: (search: string, page?: number) => Promise<void>;
}

export const useTasks = (): UseTasksReturn => {
  const [data, setData] = useState<Task[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    pageSize: 5,
    totalItems: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  });
  const [currentParams, setCurrentParams] = useState<PaginationParams>({
    page: 1,
    pageSize: 5,
  });

  const taskService = ServiceFactory.getTaskService();

  /**
   * Manejo centralizado de errores
   */
  const handleError = useCallback((err: any): ApiError => {
    const errorMessage = err.message || 'Error desconocido';
    return {
      message: errorMessage,
      status: err.status || 500,
      details: err.details || {},
    };
  }, []);

  /**
   * Función auxiliar para actualizar paginación
   */
  const updatePaginationState = useCallback((response: PaginatedResponse<Task>, params: PaginationParams) => {
    const totalPages = Math.ceil(response.count / (params.pageSize || 5));
    setPagination({
      currentPage: params.page || 1,
      pageSize: params.pageSize || 5,
      totalItems: response.count,
      totalPages,
      hasNext: !!response.next,
      hasPrevious: !!response.previous,
    });
  }, []);

  /**
   * Carga tareas con paginación
   */
  const loadTasks = useCallback(async (params?: PaginationParams) => {
    setLoading(true);
    setError(null);
    
    const finalParams = params || currentParams;
    
    try {
      const response = await taskService.getTasks(finalParams);
      setData(response.results);
      updatePaginationState(response, finalParams);
      if (params) {
        setCurrentParams(finalParams);
      }
    } catch (err) {
      setError(handleError(err));
    } finally {
      setLoading(false);
    }
  }, [taskService, handleError, currentParams, updatePaginationState]);

  /**
   * Función de refetch
   */
  const refetch = useCallback(async () => {
    await loadTasks();
  }, [loadTasks]);

  /**
   * Crea una nueva tarea
   */
  const createTask = useCallback(async (taskData: TaskCreate): Promise<Task> => {
    setLoading(true);
    setError(null);

    try {
      const newTask = await taskService.createTask(taskData);
      
      // Actualizar estado local agregando la nueva tarea
      setData(prevTasks => prevTasks ? [newTask, ...prevTasks] : [newTask]);
      
      return newTask;
    } catch (err) {
      const apiError = handleError(err);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, [taskService, handleError]);

  /**
   * Actualiza una tarea existente
   */
  const updateTask = useCallback(async (id: number, taskData: TaskUpdate): Promise<Task> => {
    setLoading(true);
    setError(null);

    try {
      const updatedTask = await taskService.updateTask(id, taskData);
      
      // Actualizar estado local
      setData(prevTasks => 
        prevTasks ? prevTasks.map(task => 
          task.id === id ? updatedTask : task
        ) : [updatedTask]
      );
      
      return updatedTask;
    } catch (err) {
      const apiError = handleError(err);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, [taskService, handleError]);

  /**
   * Elimina una tarea
   */
  const deleteTask = useCallback(async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await taskService.deleteTask(id);
      
      // Actualizar estado local removiendo la tarea
      setData(prevTasks => 
        prevTasks ? prevTasks.filter(task => task.id !== id) : []
      );
    } catch (err) {
      const apiError = handleError(err);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, [taskService, handleError]);

  /**
   * Busca tareas por título
   */
  const searchTasks = useCallback(async (query: string): Promise<Task[]> => {
    if (!query.trim()) {
      return data || [];
    }

    try {
      const results = await taskService.searchTasksByTitle(query);
      return results;
    } catch (err) {
      const apiError = handleError(err);
      setError(apiError);
      throw apiError;
    }
  }, [taskService, handleError, data]);

  /**
   * Obtiene estadísticas de tareas
   */
  const getTaskStats = useCallback(async () => {
    try {
      return await taskService.getTaskStats();
    } catch (err) {
      const apiError = handleError(err);
      setError(apiError);
      throw apiError;
    }
  }, [taskService, handleError]);

  /**
   * Funciones de paginación
   */
  const loadPage = useCallback(async (page: number) => {
    await loadTasks({ ...currentParams, page });
  }, [loadTasks, currentParams]);

  const changePageSize = useCallback(async (pageSize: number) => {
    await loadTasks({ ...currentParams, pageSize, page: 1 });
  }, [loadTasks, currentParams]);

  const searchWithPagination = useCallback(async (search: string, page: number = 1) => {
    await loadTasks({ ...currentParams, search, page });
  }, [loadTasks, currentParams]);

  // Cargar tareas al montar el componente
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return {
    data,
    loading,
    error,
    pagination,
    refetch,
    createTask,
    updateTask,
    deleteTask,
    searchTasks,
    getTaskStats,
    loadPage,
    changePageSize,
    searchWithPagination,
  };
}; 