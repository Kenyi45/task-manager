/**
 * TaskForm Component - Modern Design with Lucide Icons
 * Principio de Responsabilidad Única (SRP): Solo maneja la presentación y validación del formulario
 * Principio de Inversión de Dependencias (DIP): Usa abstracciones (hooks y servicios)
 */

'use client'

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  X, 
  Save, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  Type,
  BarChart3,
  Calendar
} from 'lucide-react';
import { Task, TaskCreate, TaskUpdate, BaseComponentProps } from '@/types';

interface TaskFormProps extends BaseComponentProps {
  task?: Task | null;
  onSubmit: (data: TaskCreate | TaskUpdate) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

interface FormData {
  title: string;
  description: string;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  task,
  onSubmit,
  onCancel,
  isLoading = false,
  className = '',
}) => {
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormData>({
    defaultValues: {
      title: '',
      description: '',
    },
  });

  // Watcher para validación en tiempo real
  const title = watch('title');
  const description = watch('description');

  /**
   * Efecto para inicializar el formulario con datos de la tarea
   */
  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || '',
      });
    } else {
      reset({
        title: '',
        description: '',
      });
    }
  }, [task, reset]);

  /**
   * Validaciones del formulario
   */
  const validateTitle = (value: string): string | true => {
    if (!value || !value.trim()) {
      return 'El título es requerido';
    }
    if (value.trim().length < 3) {
      return 'El título debe tener al menos 3 caracteres';
    }
    if (value.trim().length > 200) {
      return 'El título no puede exceder 200 caracteres';
    }
    return true;
  };

  const validateDescription = (value: string): string | true => {
    if (value && value.length > 1000) {
      return 'La descripción no puede exceder 1000 caracteres';
    }
    return true;
  };

  /**
   * Maneja el envío del formulario
   */
  const handleFormSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError('');

    try {
      const formData: TaskCreate | TaskUpdate = {
        title: data.title.trim(),
        description: data.description.trim(),
      };

      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || 'Error al guardar la tarea');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Calcula estadísticas del formulario en tiempo real
   */
  const getFormStats = () => {
    const titleLength = title?.length || 0;
    const descriptionLength = description?.length || 0;
    const wordCount = (title?.split(' ').filter(word => word.trim()).length || 0) + 
                     (description?.split(' ').filter(word => word.trim()).length || 0);

    return {
      titleLength,
      descriptionLength,
      wordCount,
      isValid: titleLength >= 3 && titleLength <= 200 && descriptionLength <= 1000,
    };
  };

  const formStats = getFormStats();
  const isFormDisabled = isLoading || isSubmitting;

  return (
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 ${className}`}>
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-200/50 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl">
                {task ? <FileText className="w-6 h-6 text-white" /> : <Type className="w-6 h-6 text-white" />}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {task ? 'Editar Tarea' : 'Nueva Tarea'}
                </h3>
                <p className="text-blue-100 text-sm">
                  {task ? 'Modifica los detalles de tu tarea' : 'Crea una nueva tarea para tu lista'}
                </p>
              </div>
            </div>
            
            <button
              onClick={onCancel}
              disabled={isFormDisabled}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors disabled:opacity-50"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Title Field */}
            <div className="space-y-2">
              <label htmlFor="title" className="flex items-center text-sm font-semibold text-gray-700">
                <Type className="w-4 h-4 mr-2 text-gray-500" />
                Título de la Tarea
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  {...register('title', { validate: validateTitle })}
                  type="text"
                  disabled={isFormDisabled}
                  className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 ${
                    errors.title
                      ? 'border-red-300 focus:ring-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${isFormDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="Ej: Completar informe mensual"
                />
                {formStats.titleLength > 0 && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      formStats.titleLength > 200 
                        ? 'bg-red-100 text-red-600' 
                        : formStats.titleLength > 150 
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {formStats.titleLength}/200
                    </span>
                  </div>
                )}
              </div>
              
              {errors.title && (
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-sm font-medium">{errors.title.message}</p>
                </div>
              )}
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <label htmlFor="description" className="flex items-center text-sm font-semibold text-gray-700">
                <FileText className="w-4 h-4 mr-2 text-gray-500" />
                Descripción
                <span className="text-gray-400 ml-1 font-normal">(opcional)</span>
              </label>
              <div className="relative">
                <textarea
                  {...register('description', { validate: validateDescription })}
                  rows={5}
                  disabled={isFormDisabled}
                  className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 resize-none ${
                    errors.description
                      ? 'border-red-300 focus:ring-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${isFormDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="Describe los detalles de tu tarea, objetivos, notas importantes..."
                />
                {formStats.descriptionLength > 0 && (
                  <div className="absolute right-4 bottom-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      formStats.descriptionLength > 1000 
                        ? 'bg-red-100 text-red-600' 
                        : formStats.descriptionLength > 800 
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {formStats.descriptionLength}/1000
                    </span>
                  </div>
                )}
              </div>
              
              {errors.description && (
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-sm font-medium">{errors.description.message}</p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-red-800">Error al guardar</h4>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isFormDisabled}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              onClick={handleSubmit(handleFormSubmit)}
              disabled={isFormDisabled || !formStats.isValid}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>{task ? 'Actualizar Tarea' : 'Crear Tarea'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskForm; 