/**
 * API Service Implementation
 * Principio de Responsabilidad Única (SRP): Solo maneja comunicación HTTP
 * Principio de Inversión de Dependencias (DIP): Implementa interface ApiServiceInterface
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiServiceInterface, ApiResponse, HTTP_STATUS } from '@/types';
import { API_CONFIG, AUTH_CONFIG } from '@/lib/config';

export class ApiService implements ApiServiceInterface {
  private axiosInstance: AxiosInstance;
  private baseURL: string;

  constructor(baseURL?: string) {
    this.baseURL = baseURL || API_CONFIG.BASE_URL!;
    this.axiosInstance = this.createAxiosInstance();
    this.setupInterceptors();
  }

  /**
   * Crea instancia de Axios con configuración base usando variables de entorno
   * Principio de Responsabilidad Única (SRP): Solo configura Axios
   */
  private createAxiosInstance(): AxiosInstance {
    return axios.create({
      baseURL: this.baseURL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Configura interceptores para manejar tokens y errores
   */
  private setupInterceptors(): void {
    // Request interceptor para agregar token de autenticación
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor para manejar errores de autenticación
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
          await this.handleUnauthorized();
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Obtiene el token de autenticación del almacenamiento local usando configuración
   */
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(AUTH_CONFIG.TOKEN_STORAGE_KEY!);
    }
    return null;
  }

  /**
   * Maneja errores de autorización
   */
  private async handleUnauthorized(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_CONFIG.TOKEN_STORAGE_KEY!);
      localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY!);
      // Redirigir al login si es necesario
      window.location.href = '/login';
    }
  }

  /**
   * Transforma respuesta de Axios a formato estándar
   */
  private transformResponse<T>(response: AxiosResponse<T>): ApiResponse<T> {
    return {
      data: response.data,
      status: response.status,
      message: response.statusText,
    };
  }

  /**
   * Método GET
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.get<T>(url, config);
      return this.transformResponse(response);
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Método POST
   */
  async post<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.post<T>(url, data, config);
      return this.transformResponse(response);
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Método PUT
   */
  async put<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.put<T>(url, data, config);
      return this.transformResponse(response);
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Método PATCH
   */
  async patch<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.patch<T>(url, data, config);
      return this.transformResponse(response);
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Método DELETE
   */
  async delete(url: string, config?: AxiosRequestConfig): Promise<void> {
    try {
      await this.axiosInstance.delete(url, config);
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Manejo centralizado de errores de API
   */
  private handleApiError(error: any): Error {
    if (error.response) {
      // Error de respuesta del servidor
      return new Error(
        JSON.stringify({
          message: error.response.data?.message || 'Error del servidor',
          status: error.response.status,
          details: error.response.data,
        })
      );
    }

    if (error.request) {
      // Error de red
      return new Error(
        JSON.stringify({
          message: 'Error de conexión. Verifique su conexión a internet.',
          status: 0,
          details: {},
        })
      );
    }

    // Error desconocido
    return new Error(
      JSON.stringify({
        message: error.message || 'Error desconocido',
        status: 500,
        details: {},
      })
    );
  }

  /**
   * Configura nuevo token de autenticación usando configuración
   */
  setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_CONFIG.TOKEN_STORAGE_KEY!, token);
    }
  }

  /**
   * Remueve token de autenticación usando configuración
   */
  removeAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_CONFIG.TOKEN_STORAGE_KEY!);
      localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY!);
    }
  }
} 