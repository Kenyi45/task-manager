# Aplicación Gestor de Tareas

Una aplicación completa de gestión de tareas construida con Django REST Framework (backend) y Next.js (frontend).

## Características

- ✅ Autenticación de usuarios con tokens JWT
- ✅ Operaciones CRUD para tareas (Crear, Leer, Actualizar, Eliminar)
- ✅ Lista paginada de tareas (5 tareas por página)
- ✅ Interfaz moderna y responsiva con Tailwind CSS
- ✅ Vista modal de detalles de tareas
- ✅ Tareas específicas por usuario (cada usuario ve solo sus propias tareas)

## Stack Tecnológico

### Backend
- Django 4.2.7
- Django REST Framework
- Django REST Framework Simple JWT
- Base de datos SQLite
- Django CORS Headers

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Axios para llamadas a la API
- React Hook Form

## Estructura del Proyecto

```
task-manager/
├── backend/          # API REST Django
│   ├── taskmanager/  # Proyecto Django
│   ├── tasks/        # App de tareas
│   ├── manage.py
│   └── requirements.txt
├── frontend/         # App Next.js
│   ├── src/
│   │   ├── app/      # Directorio de la app Next.js
│   │   ├── components/
│   │   └── lib/
│   ├── package.json
│   └── ...
└── README.md
```

## Instrucciones de Configuración

### Configuración del Backend

1. **Navegar al directorio backend:**
   ```bash
   cd task-manager/backend
   ```

2. **Crear un entorno virtual:**
   ```bash
   python -m venv venv
   ```

3. **Activar el entorno virtual:**
   - En Windows:
     ```bash
     venv\Scripts\activate
     ```
   - En macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. **Instalar dependencias:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Ejecutar las migraciones de la base de datos:**
   ```bash
   python manage.py makemigrations
   python manage.py makemigrations tasks
   python manage.py migrate
   ```

6. **Crear el usuario administrador:**
   ```bash
   python manage.py create_admin
   ```
   Esto crea un usuario con:
   - Nombre de usuario: `admin`
   - Contraseña: `admin123`

7. **Iniciar el servidor de desarrollo de Django:**
   ```bash
   python manage.py runserver
   ```

La API del backend estará disponible en `http://localhost:8000/`

### Configuración del Frontend

1. **Navegar al directorio frontend:**
   ```bash
   cd task-manager/frontend
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

La aplicación frontend estará disponible en `http://localhost:3000/`

## Uso

1. **Acceder a la aplicación:**
   Abre tu navegador y ve a `http://localhost:3000/`

2. **Iniciar sesión:**
   - Nombre de usuario: `admin`
   - Contraseña: `admin123`

3. **Gestionar Tareas:**
   - Haz clic en "Agregar Nueva Tarea" para crear una tarea
   - Haz clic en "Ver" para ver los detalles de la tarea
   - Haz clic en "Editar" para modificar una tarea
   - Haz clic en "Eliminar" para quitar una tarea
   - Usa la paginación para navegar por las tareas

4. **Cerrar sesión:**
   Haz clic en el botón "Cerrar Sesión" en la esquina superior derecha

## Endpoints de la API

### Autenticación
- `POST /api/token/` - Iniciar sesión y obtener tokens JWT
- `POST /api/token/refresh/` - Renovar token JWT

### Tareas
- `GET /api/tasks/` - Listar tareas (paginado, 5 por página)
- `POST /api/tasks/` - Crear una nueva tarea
- `GET /api/tasks/{id}/` - Obtener detalles de la tarea
- `PUT /api/tasks/{id}/` - Actualizar una tarea
- `DELETE /api/tasks/{id}/` - Eliminar una tarea

### Documentación
- `/api/docs/` - Documentación de la API

Todos los endpoints de tareas requieren autenticación mediante token Bearer.

## Notas de Desarrollo

- El backend usa base de datos SQLite por simplicidad
- Los tokens JWT expiran después de 60 minutos
- CORS está configurado para permitir peticiones desde `http://localhost:3000`
- Las tareas son específicas por usuario (los usuarios solo pueden ver sus propias tareas)
- La paginación está configurada para 5 tareas por página

## Despliegue en Producción

Para el despliegue en producción:

1. **Backend:**
   - Cambiar `DEBUG = False` en settings.py
   - Establecer una `SECRET_KEY` segura
   - Configurar una base de datos de producción (PostgreSQL recomendado)
   - Configurar los orígenes CORS apropiados
   - Usar variables de entorno para configuraciones sensibles

2. **Frontend:**
   - Actualizar la URL base de la API en `lib/api.ts`
   - Construir la aplicación: `npm run build`
   - Desplegar en un servicio de hosting (Vercel, Netlify, etc.)

## Solución de Problemas

### Problemas Comunes y Soluciones

- **Errores CORS:** Asegúrate de que el backend Django esté ejecutándose en el puerto 8000
- **Errores de token:** Verifica que el token JWT se esté enviando correctamente en el header Authorization
- **Errores de base de datos:** Ejecuta las migraciones si encuentras problemas relacionados con la base de datos
- **Conflictos de puerto:** Cambia los puertos en los archivos de configuración respectivos si es necesario