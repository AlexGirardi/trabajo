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

- **Frontend**: React 19 con TypeScript
- **UI Library**: Material-UI (MUI) v7
- **Routing**: React Router DOM v7
- **Charts**: Recharts para visualización de datos
- **HTTP Client**: Axios para comunicación con APIs
- **Build Tool**: Vite para desarrollo y construcción rápida
- **Styling**: Emotion para estilos CSS-in-JS

## 📦 Instalación

1. **Clonar el repositorio**:
   ```bash
   git clone <repository-url>
   cd trabajo
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador**:
   La aplicación estará disponible en `http://localhost:5173` (o el puerto mostrado en consola)

## 🔧 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la construcción de producción
- `npm run lint` - Ejecuta el linter para verificar el código

## 📁 Estructura del Proyecto

```
src/
├── components/           # Componentes reutilizables
│   ├── Auth/            # Componentes de autenticación
│   ├── Course/          # Componentes relacionados con cursos
│   ├── Dashboard/       # Componentes del dashboard
│   ├── Exam/           # Componentes de exámenes
│   └── Layout/         # Componentes de layout
├── pages/              # Páginas principales de la aplicación
│   ├── DashboardPage.tsx
│   ├── CoursesPage.tsx
│   ├── ExamsPage.tsx
│   ├── GenerateExamPage.tsx
│   ├── LoginPage.tsx
│   └── SettingsPage.tsx
├── types/              # Definiciones de tipos TypeScript
├── services/           # Servicios para API y lógica de negocio
├── hooks/              # Hooks personalizados de React
├── utils/              # Utilidades y funciones auxiliares
├── theme.ts            # Configuración del tema de Material-UI
└── App.tsx             # Componente principal con routing
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

Actualmente, la aplicación está configurada para desarrollo con autenticación simulada. En producción, se debe integrar con un sistema de autenticación real.

## 🎯 Próximas Funcionalidades

- [ ] Integración con servicios de IA reales (OpenAI, Claude, etc.)
- [ ] Sistema de autenticación completo
- [ ] Sistema de notificaciones
- [ ] Colaboración entre estudiantes
- [ ] Exportación de resultados
- [ ] Modo offline

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu funcionalidad (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

**EstudIA** - Potenciando el aprendizaje con inteligencia artificial 🧠✨
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
