/**
 * Base Repository Implementation
 * Principio de Responsabilidad Única (SRP): Funcionalidad común de repositorios
 * Template Method Pattern: Define estructura común para todos los repositorios
 */

import { ApiServiceInterface, ApiResponse } from '@/types';

export abstract class BaseRepository {
  protected apiService: ApiServiceInterface;
  
  constructor(apiService: ApiServiceInterface) {
    this.apiService = apiService;
  }

  /**
   * Transforma la respuesta de la API a datos de dominio
   * Template Method: Puede ser sobrescrito por clases hijas
   */
  protected transformResponse<T>(response: ApiResponse<T>): T {
    return response.data;
  }

  /**
   * Manejo centralizado de errores
   */
  protected handleError(error: any): never {
    let errorMessage = 'Error desconocido en el repositorio';
    let status = 500;
    let details = {};

    try {
      if (typeof error.message === 'string') {
        const parsed = JSON.parse(error.message);
        errorMessage = parsed.message || errorMessage;
        status = parsed.status || status;
        details = parsed.details || details;
      } else {
        errorMessage = error.message || errorMessage;
      }
    } catch {
      errorMessage = error.message || errorMessage;
    }

    const repositoryError = new Error(errorMessage);
    (repositoryError as any).status = status;
    (repositoryError as any).details = details;
    
    throw repositoryError;
  }

  /**
   * Valida que un ID sea válido
   */
  protected validateId(id: number): void {
    if (!id || id <= 0) {
      throw new Error('ID inválido');
    }
  }

  /**
   * Valida que los datos no estén vacíos
   */
  protected validateData<T>(data: T): void {
    if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
      throw new Error('Datos inválidos');
    }
  }
} 