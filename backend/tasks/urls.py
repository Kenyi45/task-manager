"""
Task URLs Configuration
Configuración de URLs siguiendo convenciones REST
"""

from django.urls import path
from .views import TaskListCreateView, TaskRetrieveUpdateDestroyView

# Namespace para la app
app_name = 'tasks'

urlpatterns = [
    path('tasks/', TaskListCreateView.as_view(), name='task-list-create'),
    path('tasks/<int:id>/', TaskRetrieveUpdateDestroyView.as_view(), name='task-detail'),
] 