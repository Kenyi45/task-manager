"""
Service Layer Implementation
Principio de Responsabilidad Única (SRP): Cada servicio maneja una responsabilidad específica
Principio de Inversión de Dependencias (DIP): Depende de abstracciones (repositorios)
"""

from typing import List, Optional, Protocol
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError, PermissionDenied
from django.db.models import QuerySet

from .models import Task
from .repositories import TaskRepositoryInterface, TaskRepositoryFactory


class TaskServiceInterface(Protocol):
    """
    Interface para el servicio de tareas
    Principio de Segregación de Interfaces (ISP): Interface específica para servicios de tareas
    """
    
    def create_task(self, user: User, title: str, description: str = "") -> Task:
        """Crea una nueva tarea"""
        ...
    
    def get_user_tasks(self, user: User) -> QuerySet[Task]:
        """Obtiene todas las tareas de un usuario"""
        ...
    
    def get_task_by_id(self, task_id: int, user: User) -> Task:
        """Obtiene una tarea específica del usuario"""
        ...
    
    def update_task(self, task_id: int, user: User, title: str = None, description: str = None) -> Task:
        """Actualiza una tarea del usuario"""
        ...
    
    def delete_task(self, task_id: int, user: User) -> None:
        """Elimina una tarea del usuario"""
        ...


class TaskValidationService:
    """
    Servicio para validaciones de tareas
    Principio de Responsabilidad Única (SRP): Solo se encarga de validaciones
    """
    
    @staticmethod
    def validate_task_data(title: str, description: str = "") -> None:
        """Valida los datos de una tarea"""
        if not title or not title.strip():
            raise ValidationError("El título es requerido")
        
        if len(title.strip()) < 3:
            raise ValidationError("El título debe tener al menos 3 caracteres")
        
        if len(title.strip()) > 200:
            raise ValidationError("El título no puede exceder 200 caracteres")
        
        if description and len(description) > 1000:
            raise ValidationError("La descripción no puede exceder 1000 caracteres")


class TaskPermissionService:
    """
    Servicio para verificar permisos de tareas
    Principio de Responsabilidad Única (SRP): Solo se encarga de permisos
    """
    
    @staticmethod
    def check_task_ownership(task: Task, user: User) -> None:
        """Verifica si el usuario es dueño de la tarea"""
        if task.user != user:
            raise PermissionDenied("No tienes permisos para acceder a esta tarea")


class TaskService:
    """
    Servicio principal para operaciones de tareas
    Principio de Inversión de Dependencias (DIP): Depende de abstracciones
    Principio Abierto/Cerrado (OCP): Abierto para extensión
    """
    
    def __init__(self, repository: TaskRepositoryInterface = None):
        """
        Constructor con inyección de dependencias
        """
        self._repository = repository or TaskRepositoryFactory.create_task_repository()
        self._validation_service = TaskValidationService()
        self._permission_service = TaskPermissionService()
    
    def create_task(self, user: User, title: str, description: str = "") -> Task:
        """
        Crea una nueva tarea
        Aplica validaciones antes de crear
        """
        # Validación de datos
        self._validation_service.validate_task_data(title, description)
        
        # Crear tarea
        return self._repository.create(
            user=user,
            title=title.strip(),
            description=description.strip() if description else ""
        )
    
    def get_user_tasks(self, user: User) -> QuerySet[Task]:
        """Obtiene todas las tareas de un usuario"""
        return self._repository.get_by_user(user)
    
    def get_task_by_id(self, task_id: int, user: User) -> Task:
        """
        Obtiene una tarea específica del usuario
        Verifica permisos antes de devolver
        """
        task = self._repository.get_by_id(task_id)
        
        if not task:
            raise ValidationError("Tarea no encontrada")
        
        # Verificar permisos
        self._permission_service.check_task_ownership(task, user)
        
        return task
    
    def update_task(self, task_id: int, user: User, title: str = None, description: str = None) -> Task:
        """
        Actualiza una tarea del usuario
        Aplica validaciones y verifica permisos
        """
        # Obtener tarea y verificar permisos
        task = self.get_task_by_id(task_id, user)
        
        # Validar nuevos datos si se proporcionan
        if title is not None:
            self._validation_service.validate_task_data(title, description or task.description)
            title = title.strip()
        
        if description is not None:
            description = description.strip()
        
        # Actualizar tarea
        return self._repository.update(task, title, description)
    
    def delete_task(self, task_id: int, user: User) -> None:
        """
        Elimina una tarea del usuario
        Verifica permisos antes de eliminar
        """
        # Obtener tarea y verificar permisos
        task = self.get_task_by_id(task_id, user)
        
        # Eliminar tarea
        self._repository.delete(task)


class TaskServiceFactory:
    """
    Factory Pattern para crear servicios
    Principio de Responsabilidad Única (SRP): Solo se encarga de crear servicios
    """
    
    @staticmethod
    def create_task_service(repository: TaskRepositoryInterface = None) -> TaskServiceInterface:
        """Crea una instancia del servicio de tareas"""
        return TaskService(repository) 