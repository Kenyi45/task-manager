"""
Task Views Implementation with SOLID Principles
Principio de Responsabilidad Única (SRP): Cada vista maneja una responsabilidad específica
Principio de Inversión de Dependencias (DIP): Depende de abstracciones (servicios)
"""

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.core.exceptions import ValidationError, PermissionDenied
from django.db.models import Q
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse
from drf_spectacular.types import OpenApiTypes

from .models import Task
from .serializers import TaskSerializer, TaskCreateSerializer
from .services import TaskServiceInterface, TaskServiceFactory


class BaseTaskView:
    """
    Clase base para vistas de tareas
    Principio de Responsabilidad Única (SRP): Proporciona funcionalidad común
    """
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._task_service: TaskServiceInterface = TaskServiceFactory.create_task_service()
    
    def handle_service_exceptions(self, func, *args, **kwargs):
        """
        Maneja excepciones del servicio de manera centralizada
        Principio DRY (Don't Repeat Yourself)
        """
        try:
            return func(*args, **kwargs)
        except ValidationError as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except PermissionDenied as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_403_FORBIDDEN
            )
        except Exception as e:
            return Response(
                {'error': 'Error interno del servidor'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@extend_schema(
    tags=['Tasks'],
    description='Operaciones para listar y crear tareas'
)
class TaskListCreateView(BaseTaskView, generics.ListCreateAPIView):
    """
    Vista para listar y crear tareas
    Principio de Responsabilidad Única (SRP): Solo maneja listado y creación
    """
    
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        """
        Retorna diferentes serializers según la acción
        Principio Abierto/Cerrado (OCP): Extensible para nuevas acciones
        """
        if self.request.method == 'POST':
            return TaskCreateSerializer
        return TaskSerializer
    
    @extend_schema(
        summary='Listar tareas del usuario',
        description='Obtiene todas las tareas del usuario autenticado, ordenadas por fecha de creación',
        parameters=[
            OpenApiParameter(
                name='search',
                description='Buscar en título y descripción de las tareas',
                required=False,
                type=OpenApiTypes.STR
            ),
            OpenApiParameter(
                name='ordering',
                description='Ordenar por campo (ej: -created_at, title)',
                required=False,
                type=OpenApiTypes.STR
            ),
        ],
        responses={
            200: TaskSerializer(many=True),
            401: OpenApiResponse(description='No autenticado'),
        }
    )
    def get(self, request, *args, **kwargs):
        """Lista las tareas del usuario autenticado"""
        return super().get(request, *args, **kwargs)
    
    def get_queryset(self):
        """Obtiene las tareas usando el servicio con filtros"""
        queryset = self._task_service.get_user_tasks(self.request.user)
        
        # Filtro de búsqueda
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )
        
        # Ordenamiento
        ordering = self.request.query_params.get('ordering', '-created_at')
        if ordering:
            queryset = queryset.order_by(ordering)
        
        return queryset
    
    @extend_schema(
        summary='Crear nueva tarea',
        description='Crea una nueva tarea para el usuario autenticado',
        request=TaskCreateSerializer,
        responses={
            201: TaskSerializer,
            400: OpenApiResponse(description='Datos inválidos'),
            401: OpenApiResponse(description='No autenticado'),
        }
    )
    def post(self, request, *args, **kwargs):
        """Crea una nueva tarea"""
        return self.handle_service_exceptions(self._create_task)
    
    def _create_task(self):
        """Lógica privada para crear tarea"""
        serializer = self.get_serializer(data=self.request.data)
        serializer.is_valid(raise_exception=True)
        
        # Usar el servicio para crear la tarea
        task = self._task_service.create_task(
            user=self.request.user,
            title=serializer.validated_data['title'],
            description=serializer.validated_data.get('description', '')
        )
        
        # Serializar la respuesta
        response_serializer = TaskSerializer(task)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


@extend_schema(
    tags=['Tasks'],
    description='Operaciones para obtener, actualizar y eliminar tareas específicas'
)
class TaskRetrieveUpdateDestroyView(BaseTaskView, generics.RetrieveUpdateDestroyAPIView):
    """
    Vista para operaciones CRUD específicas de tareas
    Principio de Responsabilidad Única (SRP): Solo maneja operaciones específicas de una tarea
    """
    
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'
    
    def get_serializer_class(self):
        """Retorna diferentes serializers según la acción"""
        if self.request.method in ['PUT', 'PATCH']:
            return TaskCreateSerializer
        return TaskSerializer
    
    @extend_schema(
        summary='Obtener tarea específica',
        description='Obtiene los detalles de una tarea específica del usuario',
        responses={
            200: TaskSerializer,
            403: OpenApiResponse(description='Sin permisos para esta tarea'),
            404: OpenApiResponse(description='Tarea no encontrada'),
        }
    )
    def get(self, request, *args, **kwargs):
        """Obtiene una tarea específica"""
        return self.handle_service_exceptions(self._get_task)
    
    def _get_task(self):
        """Lógica privada para obtener tarea"""
        task_id = self.kwargs.get('id')
        task = self._task_service.get_task_by_id(task_id, self.request.user)
        serializer = TaskSerializer(task)
        return Response(serializer.data)
    
    @extend_schema(
        summary='Actualizar tarea',
        description='Actualiza una tarea específica del usuario',
        request=TaskCreateSerializer,
        responses={
            200: TaskSerializer,
            400: OpenApiResponse(description='Datos inválidos'),
            403: OpenApiResponse(description='Sin permisos para esta tarea'),
            404: OpenApiResponse(description='Tarea no encontrada'),
        }
    )
    def put(self, request, *args, **kwargs):
        """Actualiza una tarea completa"""
        return self.handle_service_exceptions(self._update_task, full_update=True)
    
    @extend_schema(
        summary='Actualizar parcialmente tarea',
        description='Actualiza parcialmente una tarea específica del usuario',
        request=TaskCreateSerializer,
        responses={
            200: TaskSerializer,
            400: OpenApiResponse(description='Datos inválidos'),
            403: OpenApiResponse(description='Sin permisos para esta tarea'),
            404: OpenApiResponse(description='Tarea no encontrada'),
        }
    )
    def patch(self, request, *args, **kwargs):
        """Actualiza una tarea parcialmente"""
        return self.handle_service_exceptions(self._update_task, full_update=False)
    
    def _update_task(self, full_update=True):
        """Lógica privada para actualizar tarea"""
        task_id = self.kwargs.get('id')
        serializer = self.get_serializer(data=self.request.data, partial=not full_update)
        serializer.is_valid(raise_exception=True)
        
        # Usar el servicio para actualizar la tarea
        task = self._task_service.update_task(
            task_id=task_id,
            user=self.request.user,
            title=serializer.validated_data.get('title'),
            description=serializer.validated_data.get('description')
        )
        
        # Serializar la respuesta
        response_serializer = TaskSerializer(task)
        return Response(response_serializer.data)
    
    @extend_schema(
        summary='Eliminar tarea',
        description='Elimina una tarea específica del usuario',
        responses={
            204: OpenApiResponse(description='Tarea eliminada exitosamente'),
            403: OpenApiResponse(description='Sin permisos para esta tarea'),
            404: OpenApiResponse(description='Tarea no encontrada'),
        }
    )
    def delete(self, request, *args, **kwargs):
        """Elimina una tarea"""
        return self.handle_service_exceptions(self._delete_task)
    
    def _delete_task(self):
        """Lógica privada para eliminar tarea"""
        task_id = self.kwargs.get('id')
        self._task_service.delete_task(task_id, self.request.user)
        return Response(status=status.HTTP_204_NO_CONTENT) 