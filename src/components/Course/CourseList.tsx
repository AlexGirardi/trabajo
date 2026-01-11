import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Fab,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Add,
  MoreVert,
  School,
  Quiz,
  Edit,
  Delete,
  Assessment,
  CloudUpload,
} from '@mui/icons-material';
import { CreateCourseModal } from './CreateCourseModal';
import type { Course } from '../../types';

// Datos de ejemplo
const mockCourses: Course[] = [
  {
    id: '1',
    nombre: 'Matemáticas Avanzadas',
    descripcion: 'Curso completo de cálculo diferencial e integral',
    categoria: 'Matemáticas',
    fechaCreacion: new Date('2024-01-15'),
    profesor: 'Dr. María González',
    color: '#1976d2',
    materialesCount: 15,
    examenesCount: 8,
  },
  {
    id: '2',
    nombre: 'Historia Contemporánea',
    descripcion: 'Análisis de los eventos históricos del siglo XX',
    categoria: 'Historia',
    fechaCreacion: new Date('2024-02-01'),
    profesor: 'Prof. Juan Pérez',
    color: '#388e3c',
    materialesCount: 23,
    examenesCount: 12,
  },
  {
    id: '3',
    nombre: 'Física Cuántica',
    descripcion: 'Introducción a la mecánica cuántica y sus aplicaciones',
    categoria: 'Ciencias',
    fechaCreacion: new Date('2024-02-20'),
    profesor: 'Dr. Ana López',
    color: '#f57c00',
    materialesCount: 18,
    examenesCount: 6,
  },
];

export const CourseList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, course: Course) => {
    setAnchorEl(event.currentTarget);
    console.log('Selected course:', course); // Para usar la variable course
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCreateCourse = (newCourse: Omit<Course, 'id'>) => {
    const courseWithId: Course = {
      ...newCourse,
      id: Date.now().toString(),
    };
    setCourses(prev => [...prev, courseWithId]);  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Mis Cursos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestiona tus cursos y materiales de estudio
          </Typography>
        </Box>
      </Box>

      {/* Lista de Cursos */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {courses.map((course) => (
          <Card key={course.id} sx={{ minWidth: 320, maxWidth: 400, flex: '1 1 320px' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <School color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    {course.nombre}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuOpen(e, course)}
                >
                  <MoreVert />
                </IconButton>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {course.descripcion}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip
                  icon={<CloudUpload />}
                  label={`${course.materialesCount} materiales`}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  icon={<Quiz />}
                  label={`${course.examenesCount} exámenes`}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              </Box>

              <Typography variant="caption" color="text.secondary">
                Creado el {formatDate(course.fechaCreacion)}
              </Typography>

              {/* Progreso simulado */}
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Progreso del curso</Typography>
                  <Typography variant="body2">75%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={75} />
              </Box>
            </CardContent>

            <CardActions sx={{ px: 2, pb: 2 }}>
              <Button size="small" startIcon={<Assessment />}>
                Ver Exámenes
              </Button>
              <Button size="small" startIcon={<CloudUpload />}>
                Subir Material
              </Button>
            </CardActions>
          </Card>
        ))}

        {/* Tarjeta para crear nuevo curso */}
        <Card 
          sx={{ 
            minWidth: 320, 
            maxWidth: 400, 
            flex: '1 1 320px',
            display: 'flex',
            alignItems: 'center',            justifyContent: 'center',
            cursor: 'pointer',
            '&:hover': { backgroundColor: 'action.hover' }
          }}
          onClick={() => setCreateModalOpen(true)}
        >
          <CardContent sx={{ textAlign: 'center' }}>
            <Add sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" color="primary">
              Crear Nuevo Curso
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Comienza un nuevo curso de estudio
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* FAB para crear curso */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setCreateModalOpen(true)}
      >
        <Add />
      </Fab>

      {/* Menú contextual */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <Edit sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Assessment sx={{ mr: 1 }} />
          Subir Material
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Quiz sx={{ mr: 1 }} />
          Generar Examen
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Eliminar
        </MenuItem>
      </Menu>

      {/* Modal para crear curso */}
      <CreateCourseModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={handleCreateCourse}
      />
    </Box>
  );
};
