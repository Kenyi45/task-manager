from django.contrib import admin
from .models import Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'created_at']
    list_filter = ['created_at', 'user']
    search_fields = ['title', 'description']
    readonly_fields = ['created_at'] 