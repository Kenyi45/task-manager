/**
 * Pagination Component - Modern Design with Tailwind CSS
 * Principio de Responsabilidad Única (SRP): Solo maneja la UI de paginación
 */

'use client'

import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  MoreHorizontal 
} from 'lucide-react';
import { PaginationState } from '@/types';

interface PaginationProps {
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  loading?: boolean;
  className?: string;
  showPageSizeSelector?: boolean;
  pageSizeOptions?: number[];
}

export default function Pagination({
  pagination,
  onPageChange,
  onPageSizeChange,
  loading = false,
  className = '',
  showPageSizeSelector = true,
  pageSizeOptions = [5, 10, 20, 50]
}: PaginationProps) {
  const {
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    hasNext,
    hasPrevious
  } = pagination;

  /**
   * Genera array de números de página para mostrar
   */
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica compleja para páginas con ellipsis
      if (currentPage <= 4) {
        // Estamos cerca del inicio
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Estamos cerca del final
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Estamos en el medio
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null; // No mostrar paginación si solo hay una página
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Información de elementos */}
      <div className="flex items-center text-sm text-gray-600">
        <span>
          Mostrando{' '}
          <span className="font-medium text-gray-900">
            {((currentPage - 1) * pageSize) + 1}
          </span>
          {' '}-{' '}
          <span className="font-medium text-gray-900">
            {Math.min(currentPage * pageSize, totalItems)}
          </span>
          {' '}de{' '}
          <span className="font-medium text-gray-900">{totalItems}</span>
          {' '}elementos
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Selector de tamaño de página */}
        {showPageSizeSelector && (
          <div className="flex items-center gap-2">
            <label htmlFor="pageSize" className="text-sm text-gray-600">
              Mostrar:
            </label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              disabled={loading}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Controles de paginación */}
        <div className="flex items-center gap-1">
          {/* Primera página */}
          <button
            onClick={() => onPageChange(1)}
            disabled={!hasPrevious || loading}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
            title="Primera página"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          {/* Página anterior */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPrevious || loading}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
            title="Página anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Números de página */}
          <div className="flex items-center gap-1 mx-2">
            {getPageNumbers().map((page, index) => (
              <React.Fragment key={index}>
                {page === 'ellipsis' ? (
                  <div className="px-3 py-2 text-gray-400">
                    <MoreHorizontal className="w-4 h-4" />
                  </div>
                ) : (
                  <button
                    onClick={() => onPageChange(page)}
                    disabled={loading}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      page === currentPage
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 disabled:hover:bg-transparent'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Página siguiente */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNext || loading}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
            title="Página siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Última página */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={!hasNext || loading}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
            title="Última página"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Indicador de carga */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Cargando...</span>
        </div>
      )}
    </div>
  );
} 