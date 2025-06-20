/**
 * Types and Interfaces Definition
 * Principio de Segregación de Interfaces (ISP): Interfaces específicas para cada propósito
 */

// Base interfaces
export interface BaseEntity {
    id: number;
    created_at: string;
}

// Task-related types
export interface Task extends BaseEntity {
    title: string;
    description: string;
    user: string;
    user_display?: string;
    word_count?: number;
    is_recent?: boolean;
}

export interface TaskCreate {
    title: string;
    description?: string;
}

export interface TaskUpdate extends Partial<TaskCreate> { }

// API Response types
export interface ApiResponse<T> {
    data: T;
    status: number;
    message?: string;
}

export interface PaginatedResponse<T> {
    results: T[];
    count: number;
    next: string | null;
    previous: string | null;
}

// User-related types
export interface User {
    id: number;
    username: string;
    email?: string;
}

export interface AuthTokens {
    access: string;
    refresh: string;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

// Error types
export interface ApiError {
    message: string;
    status: number;
    details?: Record<string, string[]>;
}

// Form types
export interface FormState<T> {
    data: T;
    errors: Record<string, string>;
    isLoading: boolean;
    isValid: boolean;
}

// Component Props interfaces - Principio ISP
export interface BaseComponentProps {
    className?: string;
    children?: React.ReactNode;
}

export interface TaskComponentProps extends BaseComponentProps {
    task: Task;
}

export interface TaskFormProps extends BaseComponentProps {
    task?: Task | null;
    onSubmit: (data: TaskCreate | TaskUpdate) => Promise<void>;
    onCancel: () => void;
}

export interface TaskListProps extends BaseComponentProps {
    tasks: Task[];
    onTaskUpdate: (taskId: number) => void;
    onTaskDelete: (taskId: number) => void;
}

// Modal Props
export interface ModalProps extends BaseComponentProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
}

// Hook return types
export interface UseApiState<T> {
    data: T | null;
    loading: boolean;
    error: ApiError | null;
    refetch: () => Promise<void>;
}

export interface UseFormReturn<T> {
    data: T;
    errors: Record<string, string>;
    handleChange: (field: keyof T, value: any) => void;
    handleSubmit: (onSubmit: (data: T) => Promise<void>) => Promise<void>;
    reset: (newData?: Partial<T>) => void;
    isValid: boolean;
    isLoading: boolean;
}

// Service interfaces - Principio DIP
export interface ApiServiceInterface {
    get<T>(url: string): Promise<ApiResponse<T>>;
    post<T>(url: string, data: any): Promise<ApiResponse<T>>;
    put<T>(url: string, data: any): Promise<ApiResponse<T>>;
    patch<T>(url: string, data: any): Promise<ApiResponse<T>>;
    delete(url: string): Promise<void>;
    setAuthToken(token: string): void;
    removeAuthToken(): void;
}

export interface TaskServiceInterface {
    getTasks(): Promise<PaginatedResponse<Task>>;
    getTask(id: number): Promise<Task>;
    createTask(data: TaskCreate): Promise<Task>;
    updateTask(id: number, data: TaskUpdate): Promise<Task>;
    deleteTask(id: number): Promise<void>;
}

export interface AuthServiceInterface {
    login(credentials: LoginCredentials): Promise<AuthTokens>;
    logout(): Promise<void>;
    refreshToken(): Promise<AuthTokens>;
    getCurrentUser(): Promise<User>;
}

// Repository interfaces - Repository Pattern
export interface TaskRepositoryInterface {
    findAll(): Promise<Task[]>;
    findById(id: number): Promise<Task>;
    create(data: TaskCreate): Promise<Task>;
    update(id: number, data: TaskUpdate): Promise<Task>;
    delete(id: number): Promise<void>;
}

// State management types
export interface AppState {
    user: User | null;
    tasks: Task[];
    loading: boolean;
    error: string | null;
}

export interface TaskState {
    tasks: Task[];
    currentTask: Task | null;
    loading: boolean;
    error: string | null;
}

// Action types for state management
export type TaskAction =
    | { type: 'LOAD_TASKS_START' }
    | { type: 'LOAD_TASKS_SUCCESS'; payload: Task[] }
    | { type: 'LOAD_TASKS_ERROR'; payload: string }
    | { type: 'ADD_TASK'; payload: Task }
    | { type: 'UPDATE_TASK'; payload: Task }
    | { type: 'DELETE_TASK'; payload: number }
    | { type: 'SET_CURRENT_TASK'; payload: Task | null };

// Validation types
export interface ValidationRule<T> {
    validate: (value: T) => boolean;
    message: string;
}

export type ValidationSchema<T> = {
    [K in keyof T]?: ValidationRule<T[K]>[];
}

// Constants
export const API_ENDPOINTS = {
    TASKS: '/api/tasks/',
    TASK_DETAIL: (id: number) => `/api/tasks/${id}/`,
    AUTH_LOGIN: '/api/token/',
    AUTH_REFRESH: '/api/token/refresh/',
} as const;

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
} as const; 