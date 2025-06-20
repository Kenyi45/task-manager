/**
 * Custom Hook for Task Management
 * Principio de Responsabilidad Única (SRP): Solo maneja estado y operaciones de tareas
 * Principio de Inversión de Dependencias (DIP): Usa abstracciones (servicios)
 */

import { useState, useEffect, useCallback } from 'react';
import { ServiceFactory } from '@/lib/factories/ServiceFactory';
import { Task, TaskCreate, TaskUpdate, ApiError, UseApiState } from '@/types';

interface UseTasksReturn extends UseApiState<Task[]> {
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
}

export const useTasks = (): UseTasksReturn => {
  const [data, setData] = useState<Task[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

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
   * Carga inicial de tareas
   */
  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await taskService.getTasks();
      setData(response.results);
    } catch (err) {
      setError(handleError(err));
    } finally {
      setLoading(false);
    }
  }, [taskService, handleError]);

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

  // Cargar tareas al montar el componente
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return {
    data,
    loading,
    error,
    refetch,
    createTask,
    updateTask,
    deleteTask,
    searchTasks,
    getTaskStats,
  };
}; 