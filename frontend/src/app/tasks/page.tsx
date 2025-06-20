/**
 * Tasks Page - Modern Design with Lucide Icons
 * Principio de Responsabilidad Única (SRP): Solo maneja la presentación de la página de tareas
 * Principio de Inversión de Dependencias (DIP): Usa abstracciones (hooks y servicios)
 */

'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Eye, 
  Edit3, 
  Trash2, 
  LogOut, 
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  FileText,
  User,
  TrendingUp
} from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { Task, TaskCreate, TaskUpdate } from '@/types';
import TaskForm from '@/components/TaskForm';
import TaskModal from '@/components/TaskModal';
import { formatDateLima } from '@/lib/dateUtils';
import { AUTH_CONFIG } from '@/lib/config';

export default function TasksPage() {
  const router = useRouter();
  const {
    data: tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    refetch
  } = useTasks();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRecent, setFilterRecent] = useState(false);

  // Verificar autenticación usando configuración
  useEffect(() => {
    const token = localStorage.getItem(AUTH_CONFIG.TOKEN_STORAGE_KEY);
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  /**
   * Maneja el envío del formulario de tareas (crear/actualizar)
   */
  const handleTaskSubmit = async (data: TaskCreate | TaskUpdate) => {
    setIsFormLoading(true);
    
    try {
      if (selectedTask) {
        await updateTask(selectedTask.id, data as TaskUpdate);
      } else {
        await createTask(data as TaskCreate);
      }
      
      handleFormClose();
    } catch (error) {
      console.error('Error al guardar tarea:', error);
      throw error;
    } finally {
      setIsFormLoading(false);
    }
  };

  /**
   * Cierra el formulario y limpia el estado
   */
  const handleFormClose = () => {
    setShowCreateForm(false);
    setSelectedTask(null);
    setIsFormLoading(false);
  };

  /**
   * Maneja la eliminación de una tarea
   */
  const handleDeleteTask = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      try {
        await deleteTask(id);
      } catch (error) {
        console.error('Error al eliminar tarea:', error);
        alert('Error al eliminar la tarea. Por favor, intenta de nuevo.');
      }
    }
  };

  /**
   * Abre el modal para ver los detalles de una tarea
   */
  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  /**
   * Abre el formulario para editar una tarea
   */
  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setShowCreateForm(true);
  };

  /**
   * Maneja el cierre de sesión usando configuración
   */
  const handleLogout = () => {
    localStorage.removeItem(AUTH_CONFIG.TOKEN_STORAGE_KEY);
    localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY);
    router.push('/login');
  };

  /**
   * Filtra las tareas según búsqueda y filtros
   */
  const filteredTasks = tasks?.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !filterRecent || task.is_recent;
    return matchesSearch && matchesFilter;
  }) || [];

  /**
   * Calcula estadísticas de las tareas
   */
  const taskStats = {
    total: tasks?.length || 0,
    recent: tasks?.filter(task => task.is_recent).length || 0,
    withDescription: tasks?.filter(task => task.description?.trim()).length || 0,
  };

  // Loading state
  if (loading && !tasks) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Cargando tareas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Gestor de Tareas
                  </h1>
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {taskStats.total} tarea{taskStats.total !== 1 ? 's' : ''} total{taskStats.total !== 1 ? 'es' : ''}
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all duration-200 hover:scale-105"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Tareas</p>
                <p className="text-3xl font-bold text-gray-900">{taskStats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tareas Recientes</p>
                <p className="text-3xl font-bold text-green-600">{taskStats.recent}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Con Descripción</p>
                <p className="text-3xl font-bold text-purple-600">{taskStats.withDescription}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <User className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar tareas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setFilterRecent(!filterRecent)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all ${
                  filterRecent 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="font-medium">Recientes</span>
              </button>
              
              <button
                onClick={() => setShowCreateForm(true)}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span className="font-medium">Nueva Tarea</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <div className="flex-1">
                <p className="text-sm text-red-700 font-medium">Error: {error.message}</p>
              </div>
              <button
                onClick={refetch}
                className="flex items-center space-x-1 text-red-600 hover:text-red-800 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm font-medium">Reintentar</span>
              </button>
            </div>
          </div>
        )}

        {/* Tasks List */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 overflow-hidden">
          {loading && tasks ? (
            <div className="px-6 py-4 text-center border-b border-gray-100">
              <div className="flex items-center justify-center space-x-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Actualizando...</span>
              </div>
            </div>
          ) : null}
          
          {!filteredTasks || filteredTasks.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || filterRecent ? 'No se encontraron tareas' : 'No hay tareas disponibles'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || filterRecent 
                  ? 'Intenta ajustar tus filtros de búsqueda'
                  : 'Comienza creando tu primera tarea'}
              </p>
              {!searchQuery && !filterRecent && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span className="font-medium">Crear Primera Tarea</span>
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="group px-6 py-6 hover:bg-gray-50/50 transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {task.title}
                        </h3>
                        {task.is_recent && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Clock className="w-3 h-3 mr-1" />
                            Reciente
                          </span>
                        )}
                      </div>
                      
                      {task.description && (
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>Creada: {formatDateLima(task.created_at)}</span>
                        </div>
                        {task.word_count && (
                          <div className="flex items-center space-x-1">
                            <FileText className="w-3 h-3" />
                            <span>{task.word_count} palabras</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditTask(task)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar tarea"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar tarea"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task Form Modal */}
      {showCreateForm && (
        <TaskForm
          task={selectedTask}
          onSubmit={handleTaskSubmit}
          onCancel={handleFormClose}
        />
      )}

      {/* Task Detail Modal */}
      {showTaskModal && selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setShowTaskModal(false)}
        />
      )}
    </div>
  );
} 