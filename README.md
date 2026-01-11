# EstudIA

EstudIA es una plataforma web React para la generación de exámenes personalizados mediante inteligencia artificial. La aplicación ayuda a los estudiantes a prepararse para sus exámenes permitiéndoles subir materiales del curso y generar exámenes interactivos con diferentes tipos de preguntas.

## 🚀 Características

- **Dashboard interactivo** con estadísticas de progreso
- **Gestión de cursos** y materiales de estudio
- **Generador de exámenes con IA** con múltiples tipos de preguntas:
  - Opción múltiple
  - Verdadero/Falso
  - Preguntas abiertas
- **Sistema de exámenes interactivos** con cronómetro
- **Corrección automática** y puntuación
- **Seguimiento de progreso** y analíticas
- **Interfaz moderna y responsive** con Material-UI
- **Configuración personalizable** de usuario

## 🛠 Tecnologías Utilizadas

### Frontend
- **React 19** con TypeScript
- **Material-UI (MUI) v7** para componentes UI
- **React Router DOM v7** para navegación
- **Recharts** para visualización de datos
- **Axios** para comunicación con APIs
- **Vite** para desarrollo y construcción rápida
- **Emotion** para estilos CSS-in-JS
- **PDF.js** para procesamiento de documentos PDF

### Backend
- **Node.js** con Express
- **PostgreSQL** como base de datos principal
- **Prisma** como ORM para gestión de base de datos
- **Ollama** para integración con modelos de IA locales
- **Multer** para subida de archivos
- **CORS** para comunicación cross-origin

### DevOps
- **Docker** para PostgreSQL
- **Vitest** para testing
- **ESLint** para linting

## 📦 Instalación y Configuración

### Prerrequisitos

- **Node.js** (v18 o superior)
- **Docker** y **Docker Compose**
- **Ollama** (para los modelos de IA)

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd trabajo
```

### 2. Instalar dependencias

```bash
npm install
cd server && npm install && cd ..
```

### 3. Configurar PostgreSQL con Docker

```bash
docker-compose up -d
```

Esto levantará una instancia de PostgreSQL en el puerto 5432.

### 4. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto (si no existe):

```env
# Base de datos
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/estudia

# Ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2

# Puerto del servidor backend
PORT=3000
```

### 5. Levantar Ollama

Instala y ejecuta Ollama desde [https://ollama.ai](https://ollama.ai)

Luego descarga el modelo necesario:

```bash
ollama pull llama3.2
```

Verifica que Ollama esté corriendo:

```bash
ollama list
```

### 6. Iniciar los servicios

#### Opción A: Con PostgreSQL (recomendado)

```bash
npm run start:all:pg
```

Este comando levanta:
- Servidor backend conectado a PostgreSQL (puerto 3000)
- Aplicación frontend React (puerto 5176)

#### Opción B: Solo con memoria (sin base de datos)

```bash
npm run start:all:memory
```

#### Opción C: Manualmente (cada servicio por separado)

Terminal 1 - Backend con PostgreSQL:
```bash
npm run dev:server:pg
```

Terminal 2 - Frontend:
```bash
npm run dev
```

### 7. Abrir en el navegador

La aplicación estará disponible en `http://localhost:5176`

## 🔧 Scripts Disponibles

### Desarrollo
- `npm run dev` - Inicia solo el frontend (puerto 5176)
- `npm run dev:server` - Inicia el backend con base de datos en memoria
- `npm run dev:server:pg` - Inicia el backend con PostgreSQL
- `npm run start:all:pg` - Inicia backend (PostgreSQL) + frontend
- `npm run start:all:memory` - Inicia backend (memoria) + frontend
- `npm run dev:auto` - Inicia frontend con auto-reload

### Producción
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la construcción de producción

### Testing y Calidad
- `npm run test` - Ejecuta los tests con Vitest
- `npm run test:ui` - Ejecuta los tests con interfaz gráfica
- `npm run test:run` - Ejecuta los tests una sola vez
- `npm run lint` - Ejecuta el linter para verificar el código

## 📁 Estructura del Proyecto

```
trabajo/
├── src/                      # Frontend (React + TypeScript)
│   ├── components/           # Componentes reutilizables
│   │   ├── AI/              # Componentes de IA
│   │   ├── Course/          # Gestión de cursos
│   │   ├── Dashboard/       # Dashboard y estadísticas
│   │   ├── Exam/            # Sistema de exámenes
│   │   └── Layout/          # Layout y navegación
│   ├── pages/               # Páginas principales
│   ├── services/            # Servicios para APIs
│   ├── hooks/               # Hooks personalizados
│   ├── utils/               # Utilidades
│   ├── contexts/            # Contextos de React
│   ├── types/               # Tipos TypeScript
│   └── App.tsx              # Componente principal
│
├── server/                   # Backend (Node.js + Express)
│   ├── src/
│   │   ├── routes/          # Rutas de la API
│   │   ├── controllers/     # Controladores
│   │   ├── services/        # Lógica de negocio
│   │   ├── middleware/      # Middlewares
│   │   └── prisma/          # Esquema de Prisma
│   └── uploads/             # Archivos subidos
│
├── scripts/                  # Scripts de utilidad
├── docker-compose.yml        # Configuración de Docker
└── package.json             # Dependencias del proyecto
```

## 🎨 Características de la Interfaz

### Dashboard
- Vista general del progreso del estudiante
- Estadísticas de exámenes realizados
- Gráficos interactivos de rendimiento
- Accesos rápidos a funcionalidades principales

### Gestión de Cursos
- Lista de cursos con información detallada
- Subida de materiales (documentos, PDFs, texto)
- Organización por materias y temas

### Generador de Exámenes
- Selección de curso y configuración de parámetros
- Tipos de preguntas configurables
- Dificultad y duración personalizables
- Generación automática mediante IA

### Sistema de Exámenes
- Interfaz de examen con cronómetro
- Diferentes tipos de preguntas
- Guardado automático de progreso
- Corrección inmediata

### Configuración
- Preferencias de usuario
- Configuración de notificaciones
- Personalización de la interfaz
- Gestión de sesión y seguridad

## 🔐 Autenticación

Se ha eliminado la capa de autenticación para simplificar el uso local (single-user). El diseño deja puntos claros donde podría reintroducirse (wrapper de rutas, menú de usuario, servicios de usuario) sin refactor masivo.

## 🏗 Arquitectura

### Flujo de Datos

1. **Frontend (React)** → Solicitudes HTTP vía Axios
2. **Backend (Express)** → Procesa y valida las solicitudes
3. **Prisma ORM** → Interactúa con PostgreSQL
4. **Ollama** → Genera contenido mediante modelos de IA locales

### API Endpoints Principales

- **Cursos**: `/api/courses` - CRUD de cursos y materiales
- **Exámenes**: `/api/exams` - Generación y gestión de exámenes
- **IA**: `/api/ai/generate-exam` - Generación de exámenes con IA
- **Materiales**: `/api/upload` - Subida de archivos PDF/Texto
- **Estadísticas**: `/api/stats` - Datos para el dashboard

### Base de Datos

El esquema de la base de datos incluye:
- **Users**: Usuarios del sistema (preparado para futuro)
- **Courses**: Cursos y asignaturas
- **Materials**: Materiales de estudio (PDFs, textos)
- **Exams**: Exámenes generados
- **ExamResults**: Resultados y estadísticas

## 🎯 Próximas Funcionalidades

- [ ] Integración con más modelos de IA (OpenAI, Claude, etc.)
- [ ] Autenticación multiusuario
- [ ] Mejoras en el procesamiento de PDFs
- [ ] Sistema de notificaciones en tiempo real
- [ ] Colaboración entre estudiantes
- [ ] Exportación de resultados a PDF/Excel
- [ ] Modo offline con sincronización
- [ ] Análisis avanzado de progreso con ML

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu funcionalidad (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 🐛 Resolución de Problemas

### Ollama no se conecta
```bash
# Verificar que Ollama esté corriendo
ollama list
# Si no funciona, reiniciar Ollama
```

### PostgreSQL no arranca
```bash
# Verificar contenedores de Docker
docker ps
# Reiniciar PostgreSQL
docker-compose down && docker-compose up -d
```

### Error de puerto ocupado
```bash
# Verificar qué proceso usa el puerto 3000 o 5176
# Windows:
netstat -ano | findstr :3000
# Linux/Mac:
lsof -i :3000
```

### Base de datos no sincronizada
```bash
cd server
npx prisma migrate dev
npx prisma generate
```

## 📝 Licencia

Este proyecto es parte de un Trabajo de Fin de Grado (TFG).

---

**EstudIA** - Potenciando el aprendizaje con inteligencia artificial 🧠✨
