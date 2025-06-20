/**
 * Task Repository Implementation
 * Principio de Responsabilidad Única (SRP): Solo maneja operaciones de datos de tareas
 * Principio de Sustitución de Liskov (LSP): Puede ser sustituido por cualquier implementación de la interfaz
 */

import { BaseRepository } from './BaseRepository';
import { 
  TaskRepositoryInterface, 
  Task, 
  TaskCreate, 
  TaskUpdate, 
  PaginatedResponse,
  API_ENDPOINTS 
} from '@/types';

export class TaskRepository extends BaseRepository implements TaskRepositoryInterface {
  
  /**
   * Obtiene todas las tareas del usuario
   */
  async findAll(): Promise<Task[]> {
    try {
      const response = await this.apiService.get<PaginatedResponse<Task>>(API_ENDPOINTS.TASKS);
      return this.transformResponse(response).results;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Obtiene una tarea específica por ID
   */
  async findById(id: number): Promise<Task> {
    try {
      const response = await this.apiService.get<Task>(API_ENDPOINTS.TASK_DETAIL(id));
      return this.transformResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Crea una nueva tarea
   */
  async create(data: TaskCreate): Promise<Task> {
    try {
      const response = await this.apiService.post<Task>(API_ENDPOINTS.TASKS, data);
      return this.transformResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Actualiza una tarea existente
   */
  async update(id: number, data: TaskUpdate): Promise<Task> {
    try {
      const response = await this.apiService.patch<Task>(API_ENDPOINTS.TASK_DETAIL(id), data);
      return this.transformResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Elimina una tarea
   */
  async delete(id: number): Promise<void> {
    try {
      await this.apiService.delete(API_ENDPOINTS.TASK_DETAIL(id));
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Busca tareas por título (funcionalidad adicional)
   * Principio Abierto/Cerrado (OCP): Extensión sin modificar código existente
   */
  async findByTitle(title: string): Promise<Task[]> {
    try {
      const response = await this.apiService.get<PaginatedResponse<Task>>(
        `${API_ENDPOINTS.TASKS}?search=${encodeURIComponent(title)}`
      );
      return this.transformResponse(response).results;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Obtiene tareas recientes (últimas 24 horas)
   */
  async findRecent(): Promise<Task[]> {
    try {
      const response = await this.apiService.get<PaginatedResponse<Task>>(
        `${API_ENDPOINTS.TASKS}?recent=true`
      );
      return this.transformResponse(response).results;
    } catch (error) {
      this.handleError(error);
    }
  }
} 