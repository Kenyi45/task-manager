/**
 * Task Service Implementation
 * Principio de Responsabilidad Única (SRP): Solo maneja lógica de negocio de tareas
 * Principio de Inversión de Dependencias (DIP): Depende de abstracciones (repositorios)
 */

import { 
  TaskServiceInterface, 
  TaskRepositoryInterface, 
  Task, 
  TaskCreate, 
  TaskUpdate, 
  PaginatedResponse 
} from '@/types';

export class TaskService implements TaskServiceInterface {
  private taskRepository: TaskRepositoryInterface;

  constructor(taskRepository: TaskRepositoryInterface) {
    this.taskRepository = taskRepository;
  }

  /**
   * Obtiene todas las tareas
   */
  async getTasks(): Promise<PaginatedResponse<Task>> {
    try {
      const tasks = await this.taskRepository.findAll();
      
      // Simulamos una respuesta paginada para compatibilidad
      // En un escenario real, el repository manejaría la paginación
      return {
        results: tasks,
        count: tasks.length,
        next: null,
        previous: null,
      };
    } catch (error) {
      throw this.handleServiceError(error, 'Error al obtener las tareas');
    }
  }

  /**
   * Obtiene una tarea específica
   */
  async getTask(id: number): Promise<Task> {
    try {
      this.validateTaskId(id);
      return await this.taskRepository.findById(id);
    } catch (error) {
      throw this.handleServiceError(error, `Error al obtener la tarea ${id}`);
    }
  }

  /**
   * Crea una nueva tarea
   */
  async createTask(data: TaskCreate): Promise<Task> {
    try {
      this.validateTaskData(data);
      const processedData = this.preprocessTaskData(data);
      return await this.taskRepository.create(processedData);
    } catch (error) {
      throw this.handleServiceError(error, 'Error al crear la tarea');
    }
  }

  /**
   * Actualiza una tarea existente
   */
  async updateTask(id: number, data: TaskUpdate): Promise<Task> {
    try {
      this.validateTaskId(id);
      this.validateUpdateData(data);
      const processedData = this.preprocessUpdateData(data);
      return await this.taskRepository.update(id, processedData);
    } catch (error) {
      throw this.handleServiceError(error, `Error al actualizar la tarea ${id}`);
    }
  }

  /**
   * Elimina una tarea
   */
  async deleteTask(id: number): Promise<void> {
    try {
      this.validateTaskId(id);
      await this.taskRepository.delete(id);
    } catch (error) {
      throw this.handleServiceError(error, `Error al eliminar la tarea ${id}`);
    }
  }

  /**
   * Busca tareas por título
   * Funcionalidad adicional del servicio
   */
  async searchTasksByTitle(title: string): Promise<Task[]> {
    try {
      if (!title || title.trim().length < 2) {
        throw new Error('El término de búsqueda debe tener al menos 2 caracteres');
      }

      // Si el repositorio tiene método de búsqueda, lo usa
      if ('findByTitle' in this.taskRepository) {
        return await (this.taskRepository as any).findByTitle(title.trim());
      }

      // Fallback: filtrar tareas localmente
      const allTasks = await this.taskRepository.findAll();
      return allTasks.filter(task => 
        task.title.toLowerCase().includes(title.toLowerCase())
      );
    } catch (error) {
      throw this.handleServiceError(error, 'Error al buscar tareas');
    }
  }

  /**
   * Obtiene estadísticas básicas de las tareas
   */
  async getTaskStats(): Promise<{
    total: number;
    recent: number;
    withDescription: number;
    averageWordCount: number;
  }> {
    try {
      const tasks = await this.taskRepository.findAll();
      
      const recent = tasks.filter(task => {
        const taskDate = new Date(task.created_at);
        const dayAgo = new Date();
        dayAgo.setDate(dayAgo.getDate() - 1);
        return taskDate > dayAgo;
      }).length;

      const withDescription = tasks.filter(task => 
        task.description && task.description.trim().length > 0
      ).length;

      const totalWords = tasks.reduce((sum, task) => {
        const titleWords = task.title.split(' ').length;
        const descWords = task.description ? task.description.split(' ').length : 0;
        return sum + titleWords + descWords;
      }, 0);

      const averageWordCount = tasks.length > 0 ? Math.round(totalWords / tasks.length) : 0;

      return {
        total: tasks.length,
        recent,
        withDescription,
        averageWordCount,
      };
    } catch (error) {
      throw this.handleServiceError(error, 'Error al obtener estadísticas');
    }
  }

  /**
   * Validaciones privadas
   */
  private validateTaskId(id: number): void {
    if (!id || id <= 0) {
      throw new Error('ID de tarea inválido');
    }
  }

  private validateTaskData(data: TaskCreate): void {
    if (!data.title || data.title.trim().length === 0) {
      throw new Error('El título es requerido');
    }

    if (data.title.trim().length < 3) {
      throw new Error('El título debe tener al menos 3 caracteres');
    }

    if (data.title.trim().length > 200) {
      throw new Error('El título no puede exceder 200 caracteres');
    }

    if (data.description && data.description.length > 1000) {
      throw new Error('La descripción no puede exceder 1000 caracteres');
    }
  }

  private validateUpdateData(data: TaskUpdate): void {
    if (Object.keys(data).length === 0) {
      throw new Error('Se requiere al menos un campo para actualizar');
    }

    if (data.title !== undefined) {
      this.validateTaskData({ title: data.title, description: data.description || '' });
    }
  }

  /**
   * Preprocesamiento de datos
   */
  private preprocessTaskData(data: TaskCreate): TaskCreate {
    return {
      title: data.title.trim(),
      description: data.description?.trim() || '',
    };
  }

  private preprocessUpdateData(data: TaskUpdate): TaskUpdate {
    const processed: TaskUpdate = {};
    
    if (data.title !== undefined) {
      processed.title = data.title.trim();
    }
    
    if (data.description !== undefined) {
      processed.description = data.description.trim();
    }

    return processed;
  }

  /**
   * Manejo centralizado de errores del servicio
   */
  private handleServiceError(error: any, contextMessage: string): Error {
    let errorMessage = contextMessage;
    
    try {
      // Si el error viene del repositorio (formato JSON)
      const parsedError = JSON.parse(error.message);
      errorMessage = parsedError.message || contextMessage;
    } catch {
      // Si no es JSON, usar el mensaje original
      errorMessage = error.message || contextMessage;
    }

    return new Error(errorMessage);
  }
} 