/**
 * TaskModal Component - Modern Design with Lucide Icons
 * Principio de Responsabilidad Única (SRP): Solo maneja la visualización de detalles de tarea
 */

'use client'

import React from 'react';
import { 
  X, 
  Calendar, 
  User, 
  FileText, 
  Clock, 
  Hash,
  Eye,
  CheckCircle2,
  Tag
} from 'lucide-react';
import { Task } from '@/types';
import { formatFullDateLima, getTimeAgoLima } from '@/lib/dateUtils';

interface TaskModalProps {
  task: Task;
  onClose: () => void;
}

export default function TaskModal({ task, onClose }: TaskModalProps) {

  /**
   * Calcula estadísticas del contenido
   */
  const getContentStats = () => {
    const titleWords = task.title.split(' ').filter(word => word.trim()).length;
    const descriptionWords = task.description 
      ? task.description.split(' ').filter(word => word.trim()).length 
      : 0;
    const totalWords = titleWords + descriptionWords;
    const totalChars = task.title.length + (task.description?.length || 0);

    return {
      titleWords,
      descriptionWords,
      totalWords,
      totalChars,
      hasDescription: !!task.description?.trim()
    };
  };

  const stats = getContentStats();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gray-200/50 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1">
              <div className="p-3 bg-white/20 rounded-2xl">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-white leading-tight mb-2">
                  {task.title}
                </h2>
                                  <div className="flex items-center space-x-4 text-indigo-100">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{getTimeAgoLima(task.created_at)}</span>
                  </div>
                  {task.is_recent && (
                    <div className="flex items-center space-x-1 bg-green-500/20 px-2 py-1 rounded-full">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs font-medium">Reciente</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors ml-4"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Task Description */}
          {task.description ? (
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Descripción</h3>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {task.description}
                </p>
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-200">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Sin descripción</p>
                <p className="text-gray-400 text-sm mt-1">Esta tarea no tiene descripción adicional</p>
              </div>
            </div>
          )}

          {/* Task Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Creation Info */}
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Información de Creación</h4>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-600">Fecha de creación</p>
                  <p className="text-gray-900 font-medium">{formatFullDateLima(task.created_at)}</p>
                </div>
            <div>
                  <p className="text-sm font-medium text-gray-600">Tiempo transcurrido</p>
                  <p className="text-gray-900 font-medium">{getTimeAgoLima(task.created_at)}</p>
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-green-100 rounded-xl">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Información del Usuario</h4>
              </div>
              <div className="space-y-3">
            <div>
                  <p className="text-sm font-medium text-gray-600">Creado por</p>
                  <p className="text-gray-900 font-medium">
                    {task.user_display || task.user || 'Usuario'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">ID de usuario</p>
                  <p className="text-gray-900 font-medium">#{task.user}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Statistics */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-xl">
                <Hash className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Estadísticas del Contenido</h4>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="bg-white rounded-xl p-4 border border-purple-200">
                  <p className="text-2xl font-bold text-purple-600">{stats.totalWords}</p>
                  <p className="text-sm text-gray-600 mt-1">Palabras Total</p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-white rounded-xl p-4 border border-purple-200">
                  <p className="text-2xl font-bold text-blue-600">{stats.titleWords}</p>
                  <p className="text-sm text-gray-600 mt-1">Palabras Título</p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-white rounded-xl p-4 border border-purple-200">
                  <p className="text-2xl font-bold text-green-600">{stats.descriptionWords}</p>
                  <p className="text-sm text-gray-600 mt-1">Palabras Descripción</p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-white rounded-xl p-4 border border-purple-200">
                  <p className="text-2xl font-bold text-orange-600">{stats.totalChars}</p>
                  <p className="text-sm text-gray-600 mt-1">Caracteres Total</p>
                </div>
              </div>
            </div>
          </div>

          {/* Task Status */}
          <div className="mt-6 flex items-center justify-center">
            <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Tarea Activa</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Tag className="w-4 h-4" />
                <span>ID: {task.id}</span>
              </div>
              {task.word_count && (
                <div className="flex items-center space-x-1">
                  <Hash className="w-4 h-4" />
                  <span>{task.word_count} palabras calculadas</span>
                </div>
              )}
            </div>
            
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-medium hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 hover:scale-105"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 