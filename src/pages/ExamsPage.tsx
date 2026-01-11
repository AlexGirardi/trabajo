import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  PlayArrow,
  MoreVert,
  Schedule,
  Assignment,
  Edit,
  Delete,
  Share,
} from '@mui/icons-material';
import type { Exam } from '../types';

// Datos de ejemplo
const mockExams: Exam[] = [
  {
    id: '1',
    titulo: 'Examen de Matemáticas - Derivadas',
    descripcion: 'Examen sobre conceptos básicos de derivadas',
    cursoId: '1',
    nombreCurso: 'Cálculo I',
    preguntas: [],
    duracionMinutos: 60,
    fechaCreacion: new Date('2024-01-15'),
    dificultad: 'medio',
    intentosMaximos: 3,
    puntuacionTotal: 100,
  },
  {
    id: '2',
    titulo: 'Historia de España - Siglo XIX',
    descripcion: 'Examen sobre la historia del siglo XIX en España',
    cursoId: '2',
    nombreCurso: 'Historia de España',
    preguntas: [],
    duracionMinutos: 90,
    fechaCreacion: new Date('2024-01-12'),
    dificultad: 'dificil',
    intentosMaximos: 2,
    puntuacionTotal: 100,
  },
  {
    id: '3',
    titulo: 'Programación - Conceptos Básicos',
    descripcion: 'Examen sobre fundamentos de programación',
    cursoId: '3',
    nombreCurso: 'Programación I',
    preguntas: [],
    duracionMinutos: 45,
    fechaCreacion: new Date('2024-01-10'),
    dificultad: 'facil',
    intentosMaximos: 5,
    puntuacionTotal: 100,
  },
];

const ExamsPage: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, _examId: string) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const getDifficultyColor = (dificultad?: string) => {
    switch (dificultad) {
      case 'facil': return 'success';
      case 'medio': return 'warning';
      case 'dificil': return 'error';
      default: return 'default';
    }
  };

  const getDifficultyLabel = (dificultad?: string) => {
    switch (dificultad) {
      case 'facil': return 'Fácil';
      case 'medio': return 'Medio';
      case 'dificil': return 'Difícil';
      default: return 'Normal';
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Mis Exámenes
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestiona y realiza tus exámenes generados por IA
        </Typography>
      </Box>      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
        gap: 3 
      }}>
        {mockExams.map((exam) => (
          <Card 
            key={exam.id}
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 3,
              }
            }}
          >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flexGrow: 1, mr: 1 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {exam.titulo}
                    </Typography>
                    <Chip 
                      label={exam.nombreCurso} 
                      size="small" 
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                  </Box>
                  <IconButton 
                    size="small"
                    onClick={(e) => handleMenuOpen(e, exam.id)}
                  >
                    <MoreVert />
                  </IconButton>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Assignment fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {exam.preguntas.length} preguntas
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Schedule fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {exam.duracionMinutos} min
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Chip 
                    label={getDifficultyLabel(exam.dificultad)} 
                    size="small"
                    color={getDifficultyColor(exam.dificultad) as any}
                    variant="outlined"
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Creado el {exam.fechaCreacion.toLocaleDateString()}
                </Typography>

                <Box sx={{ mt: 'auto' }}>
                  <Button
                    variant="contained"
                    startIcon={<PlayArrow />}
                    fullWidth
                    size="large"
                  >
                    Realizar Examen
                  </Button>
                </Box>
              </CardContent>            </Card>
        ))}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleMenuClose}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Share fontSize="small" sx={{ mr: 1 }} />
          Compartir
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Eliminar
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ExamsPage;
