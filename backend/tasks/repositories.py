"""
Repository Pattern Implementation
Principio de Responsabilidad Única (SRP): Cada repositorio tiene una sola responsabilidad
Principio de Inversión de Dependencias (DIP): Depende de abstracciones, no de concreciones
"""

from abc import ABC, abstractmethod
from typing import List, Optional, Protocol
from django.contrib.auth.models import User
from django.db.models import QuerySet
from .models import Task


class TaskRepositoryInterface(Protocol):
    """
    Interface para el repositorio de tareas
    Principio de Segregación de Interfaces (ISP): Interface específica para tareas
    """
    
    def get_by_id(self, task_id: int) -> Optional[Task]:
        """Obtiene una tarea por su ID"""
        ...
    
    def get_by_user(self, user: User) -> QuerySet[Task]:
        """Obtiene todas las tareas de un usuario"""
        ...
    
    def create(self, user: User, title: str, description: str = "") -> Task:
        """Crea una nueva tarea"""
        ...
    
    def update(self, task: Task, title: str = None, description: str = None) -> Task:
        """Actualiza una tarea existente"""
        ...
    
    def delete(self, task: Task) -> None:
        """Elimina una tarea"""
        ...
    
    def exists(self, task_id: int, user: User) -> bool:
        """Verifica si una tarea existe para un usuario"""
        ...


class TaskRepository:
    """
    Implementación concreta del repositorio de tareas
    Principio Abierto/Cerrado (OCP): Abierto para extensión, cerrado para modificación
    """
    
    def get_by_id(self, task_id: int) -> Optional[Task]:
        """Obtiene una tarea por su ID"""
        try:
            return Task.objects.get(id=task_id)
        except Task.DoesNotExist:
            return None
    
    def get_by_user(self, user: User) -> QuerySet[Task]:
        """Obtiene todas las tareas de un usuario ordenadas por fecha de creación"""
        return Task.objects.filter(user=user).order_by('-created_at')
    
    def create(self, user: User, title: str, description: str = "") -> Task:
        """Crea una nueva tarea"""
        return Task.objects.create(
            user=user,
            title=title,
            description=description
        )
    
    def update(self, task: Task, title: str = None, description: str = None) -> Task:
        """Actualiza una tarea existente"""
        if title is not None:
            task.title = title
        if description is not None:
            task.description = description
        task.save()
        return task
    
    def delete(self, task: Task) -> None:
        """Elimina una tarea"""
        task.delete()
    
    def exists(self, task_id: int, user: User) -> bool:
        """Verifica si una tarea existe para un usuario"""
        return Task.objects.filter(id=task_id, user=user).exists()


class TaskRepositoryFactory:
    """
    Factory Pattern para crear repositorios
    Principio de Responsabilidad Única (SRP): Solo se encarga de crear repositorios
    """
    
    @staticmethod
    def create_task_repository() -> TaskRepositoryInterface:
        """Crea una instancia del repositorio de tareas"""
        return TaskRepository() 