/**
 * Login Page - Modern Design with Lucide Icons
 * Página de autenticación con diseño moderno
 */

'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Mail, 
  Lock, 
  LogIn, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  Eye,
  EyeOff,
  User,
  Shield,
  Sparkles
} from 'lucide-react';
import { login } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Verificar si ya está autenticado
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      router.push('/tasks');
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login(formData);
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      router.push('/tasks');
    } catch (err: any) {
      setError(err.message || 'Error de autenticación. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.username.trim() && formData.password.trim();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-white/20 rounded-2xl">
                <Shield className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Bienvenido de Nuevo
            </h1>
            <p className="text-blue-100">
              Inicia sesión para acceder a tu gestor de tareas
            </p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div className="space-y-2">
                <label htmlFor="username" className="flex items-center text-sm font-semibold text-gray-700">
                  <User className="w-4 h-4 mr-2 text-gray-500" />
                  Nombre de Usuario
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={loading}
                    className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 ${
                      error 
                        ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    placeholder="Ingresa tu nombre de usuario"
                    required
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <Mail className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="flex items-center text-sm font-semibold text-gray-700">
                  <Lock className="w-4 h-4 mr-2 text-gray-500" />
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 pr-12 ${
                      error 
                        ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    placeholder="Ingresa tu contraseña"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-red-800">Error de Autenticación</h4>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isFormValid || loading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Iniciar Sesión</span>
                  </>
                )}
              </button>
            </form>

            {/* Additional Info */}
            <div className="mt-8 text-center">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <Sparkles className="w-4 h-4" />
                <span>Gestiona tus tareas de manera eficiente</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 text-center">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Seguro y confiable</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 