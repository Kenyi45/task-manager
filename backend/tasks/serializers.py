"""
Task Serializers Implementation with SOLID Principles
Principio de Responsabilidad Única (SRP): Cada serializer tiene una responsabilidad específica
Principio de Segregación de Interfaces (ISP): Interfaces específicas para diferentes operaciones
"""

from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from drf_spectacular.types import OpenApiTypes
from .models import Task


class BaseTaskSerializer(serializers.ModelSerializer):
    """
    Serializer base para tareas
    Principio de Responsabilidad Única (SRP): Proporciona funcionalidad común
    """
    
    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'created_at', 'user']
        read_only_fields = ['id', 'created_at', 'user']
    
    def validate_title(self, value):
        """
        Validación personalizada para el título
        Principio de Responsabilidad Única (SRP): Solo valida el título
        """
        if not value or not value.strip():
            raise serializers.ValidationError("El título es requerido")
        
        if len(value.strip()) < 3:
            raise serializers.ValidationError("El título debe tener al menos 3 caracteres")
        
        if len(value.strip()) > 200:
            raise serializers.ValidationError("El título no puede exceder 200 caracteres")
        
        return value.strip()
    
    def validate_description(self, value):
        """
        Validación personalizada para la descripción
        """
        if value and len(value) > 1000:
            raise serializers.ValidationError("La descripción no puede exceder 1000 caracteres")
        
        return value.strip() if value else ""


class TaskSerializer(BaseTaskSerializer):
    """
    Serializer para representar tareas completas
    Principio de Responsabilidad Única (SRP): Solo para representación de datos
    """
    
    user = serializers.StringRelatedField(read_only=True)
    created_at = serializers.DateTimeField(
        read_only=True,
        format='%Y-%m-%d %H:%M:%S'
    )
    user_display = serializers.SerializerMethodField()
    
    @extend_schema_field(OpenApiTypes.STR)
    def get_user_display(self, obj):
        """
        Campo personalizado para mostrar información del usuario
        """
        return obj.user.username if obj.user else None
    
    class Meta(BaseTaskSerializer.Meta):
        fields = BaseTaskSerializer.Meta.fields + ['user_display']


class TaskCreateSerializer(BaseTaskSerializer):
    """
    Serializer para crear y actualizar tareas
    Principio de Segregación de Interfaces (ISP): Interface específica para creación/actualización
    """
    
    title = serializers.CharField(
        max_length=200,
        min_length=3,
        help_text="Título de la tarea (3-200 caracteres)"
    )
    description = serializers.CharField(
        max_length=1000,
        required=False,
        allow_blank=True,
        help_text="Descripción opcional de la tarea (máximo 1000 caracteres)"
    )
    
    class Meta(BaseTaskSerializer.Meta):
        fields = ['title', 'description']
    
    def create(self, validated_data):
        """
        Método de creación personalizado
        Nota: En la práctica, la creación se maneja en el servicio
        """
        # Este método no se usa directamente ya que usamos el servicio
        # Se mantiene para compatibilidad con DRF
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """
        Método de actualización personalizado
        Nota: En la práctica, la actualización se maneja en el servicio
        """
        # Este método no se usa directamente ya que usamos el servicio
        # Se mantiene para compatibilidad con DRF
        return super().update(instance, validated_data)


class TaskListSerializer(BaseTaskSerializer):
    """
    Serializer optimizado para listados de tareas
    Principio de Responsabilidad Única (SRP): Optimizado para listados
    """
    
    created_at = serializers.DateTimeField(
        read_only=True,
        format='%Y-%m-%d %H:%M:%S'
    )
    description_preview = serializers.SerializerMethodField()
    
    class Meta(BaseTaskSerializer.Meta):
        # Excluimos campos pesados para optimizar listados
        fields = ['id', 'title', 'created_at', 'description_preview']
    
    def get_description_preview(self, obj):
        """
        Genera preview de la descripción
        """
        if obj.description:
            return (
                obj.description[:50] + '...' 
                if len(obj.description) > 50 
                else obj.description
            )
        return ""


class TaskDetailSerializer(TaskSerializer):
    """
    Serializer detallado para vistas específicas de tareas
    Principio de Responsabilidad Única (SRP): Solo para vistas detalladas
    """
    
    # Campos adicionales para vista detallada
    word_count = serializers.SerializerMethodField()
    is_recent = serializers.SerializerMethodField()
    
    class Meta(TaskSerializer.Meta):
        fields = TaskSerializer.Meta.fields + ['word_count', 'is_recent']
    
    @extend_schema_field(OpenApiTypes.INT)
    def get_word_count(self, obj):
        """Calcula el número de palabras en título y descripción"""
        total_words = len(obj.title.split())
        if obj.description:
            total_words += len(obj.description.split())
        return total_words
    
    @extend_schema_field(OpenApiTypes.BOOL)
    def get_is_recent(self, obj):
        """Determina si la tarea es reciente (últimas 24 horas)"""
        from django.utils import timezone
        from datetime import timedelta
        
        return (timezone.now() - obj.created_at) < timedelta(days=1)


class TaskSerializerFactory:
    """
    Factory Pattern para crear serializers
    Principio de Responsabilidad Única (SRP): Solo se encarga de crear serializers
    """
    
    @staticmethod
    def get_serializer_for_action(action: str, *args, **kwargs):
        """
        Retorna el serializer apropiado según la acción
        Principio Abierto/Cerrado (OCP): Extensible para nuevas acciones
        """
        serializer_mapping = {
            'list': TaskListSerializer,
            'retrieve': TaskDetailSerializer,
            'create': TaskCreateSerializer,
            'update': TaskCreateSerializer,
            'partial_update': TaskCreateSerializer,
            'default': TaskSerializer,
        }
        
        serializer_class = serializer_mapping.get(action, TaskSerializer)
        return serializer_class(*args, **kwargs) 