import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import { CourseList } from '../components/Course/CourseList';
import { CreateCourseModal } from '../components/Course/CreateCourseModal';
import type { Course } from '../types';

const CoursesPage: React.FC = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const handleCreateCourse = (newCourse: Omit<Course, 'id'>) => {
    // Esta función se podría usar para actualizar el estado global
    // Por ahora, el CourseList maneja su propio estado
    console.log('Nuevo curso creado:', newCourse);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Mis Cursos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestiona tus asignaturas y materiales de estudio
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          size="large"
          sx={{ px: 3, py: 1.5 }}
          onClick={() => setCreateModalOpen(true)}
        >
          Nuevo Curso
        </Button>
      </Box>
      
      <CourseList />
      
      <CreateCourseModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={handleCreateCourse}
      />
    </Box>
  );
};

export default CoursesPage;
