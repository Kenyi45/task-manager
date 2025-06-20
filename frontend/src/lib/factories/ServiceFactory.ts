/**
 * Service Factory Implementation
 * Principio de Responsabilidad Única (SRP): Solo se encarga de crear servicios
 * Factory Pattern: Centraliza la creación de objetos complejos
 */

import { ApiService } from '../services/ApiService';
import { TaskRepository } from '../repositories/TaskRepository';
import { TaskService } from '../services/TaskService';
import { 
  ApiServiceInterface, 
  TaskRepositoryInterface, 
  TaskServiceInterface 
} from '@/types';

export class ServiceFactory {
  private static apiService: ApiServiceInterface | null = null;
  private static taskRepository: TaskRepositoryInterface | null = null;
  private static taskService: TaskServiceInterface | null = null;

  /**
   * Crea o retorna instancia singleton de ApiService
   * Singleton Pattern: Una sola instancia de ApiService
   */
  static getApiService(): ApiServiceInterface {
    if (!this.apiService) {
      this.apiService = new ApiService();
    }
    return this.apiService;
  }

  /**
   * Crea o retorna instancia singleton de TaskRepository
   * Principio de Inversión de Dependencias (DIP): Inyecta dependencias
   */
  static getTaskRepository(): TaskRepositoryInterface {
    if (!this.taskRepository) {
      const apiService = this.getApiService();
      this.taskRepository = new TaskRepository(apiService);
    }
    return this.taskRepository;
  }

  /**
   * Crea o retorna instancia singleton de TaskService
   */
  static getTaskService(): TaskServiceInterface {
    if (!this.taskService) {
      const taskRepository = this.getTaskRepository();
      this.taskService = new TaskService(taskRepository);
    }
    return this.taskService;
  }

  /**
   * Resetea todas las instancias (útil para testing)
   */
  static reset(): void {
    this.apiService = null;
    this.taskRepository = null;
    this.taskService = null;
  }

  /**
   * Crea instancias para testing con dependencias mockeadas
   * Principio Abierto/Cerrado (OCP): Extensible para testing
   */
  static createForTesting(
    apiService?: ApiServiceInterface,
    taskRepository?: TaskRepositoryInterface
  ): {
    apiService: ApiServiceInterface;
    taskRepository: TaskRepositoryInterface;
    taskService: TaskServiceInterface;
  } {
    const api = apiService || this.getApiService();
    const repo = taskRepository || new TaskRepository(api);
    const service = new TaskService(repo);

    return {
      apiService: api,
      taskRepository: repo,
      taskService: service,
    };
  }
} 