import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, CardActions, Typography, Button, IconButton, Menu, MenuItem, Chip, CircularProgress, Alert } from '@mui/material';
import { Add, MoreVert, School, Edit, Delete, Assessment, Folder } from '@mui/icons-material';
import { CreateCourseModal } from './CreateCourseModal';
import { EditCourseModal } from './EditCourseModal';
import { UploadMaterialModal } from './UploadMaterialModal';
import { MaterialManagementModal } from './MaterialManagementModal';
import { CourseExamList } from '../Exam/CourseExamList';
import { courseService } from '../../services/courseService';
import { MaterialService } from '../../services/materialService';
import { ExamService } from '../../services/examService';
import type { Course } from '../../types';
import { useI18n } from '../../i18n';

export const CourseList: React.FC = () => {
  const { t, locale } = useI18n();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false); // deprecated legacy
  const [materialManagementModalOpen, setMaterialManagementModalOpen] = useState(false); // deprecated legacy
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [examListOpen, setExamListOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Función para obtener conteos dinámicos de materiales y exámenes
  const getCourseCounts = (courseId: string) => {
    const materialsCount = MaterialService.getMaterialsByCourse(courseId).length;
    const examsCount = ExamService.getExamsByCourse(courseId).length;
    return { materialsCount, examsCount };
  };

  // Cargar cursos al montar el componente y cuando refreshKey cambie
  useEffect(() => {
    const USE_API = (import.meta as any).env?.VITE_USE_API === 'true';
    let cancelled = false;
    const loadCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        if (USE_API && courseService.fetchCourses) {
          const remote = await courseService.fetchCourses();
          if (!cancelled) setCourses(remote as any);
        } else {
          const savedCourses = courseService.getCourses();
          if (!cancelled) setCourses(savedCourses);
        }
      } catch (e: any) {
        console.error('Error loading courses', e);
        const fallback = courseService.getCourses();
        if (!cancelled) setCourses(fallback);
        if (!cancelled) setError(e?.message || 'Error al cargar cursos');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadCourses();
    return () => { cancelled = true; };
  }, [refreshKey]);
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, course: Course) => {
    setAnchorEl(event.currentTarget);
    setSelectedCourse(course);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCourse(null);
  };
  const handleCreateCourse = (newCourseData: Omit<Course, 'id' | 'fechaCreacion'>): Course => {
    try {
      const newCourse = courseService.saveCourse(newCourseData);
      setCourses(prev => [...prev, newCourse]);
      setCreateModalOpen(false);
      // Trigger refresh to update counts
      setRefreshKey(prev => prev + 1);
      return newCourse;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  };
  const handleEditCourse = () => {
    if (selectedCourse) {
      setEditModalOpen(true);
    }
    handleMenuClose();
  };

  const handleDeleteCourse = () => {
    if (!selectedCourse) return;
    if (window.confirm(t('confirm.delete.course', { name: selectedCourse.nombre }))) {
      try {
        courseService.deleteCourse(selectedCourse.id);
        setCourses(prev => prev.filter(course => course.id !== selectedCourse.id));
  setRefreshKey(prev => prev + 1);
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
    handleMenuClose();
  };

  const formatDate = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString(locale === 'en' ? 'en-US' : 'es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: loading || courses.length === 0 ? 'center' : 'flex-start' }}>
        {loading && courses.length === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2 }}>Cargando cursos...</Typography>
          </Box>
        )}
        {!loading && courses.length === 0 ? (
          <Card sx={{ minWidth: 400, textAlign: 'center', p: 4 }}>
            <CardContent>
              <School sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" gutterBottom>{t('course.empty.title')}</Typography>
              <Typography variant="body1" color="text.secondary">{t('course.empty.subtitle')}</Typography>
              <Button variant="contained" sx={{ mt: 3 }} startIcon={<Add />} onClick={() => setCreateModalOpen(true)}>
                {t('course.createNew')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {courses.map(course => {
              const { materialsCount, examsCount } = getCourseCounts(course.id);
              return (
                <Card key={course.id} sx={{ minWidth: 320, maxWidth: 400, flex: '1 1 320px' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <School color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6" fontWeight="bold">{course.nombre}</Typography>
                      </Box>
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, course)}><MoreVert /></IconButton>
                    </Box>
                    {course.descripcion && <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{course.descripcion}</Typography>}
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip size="small" label={t('course.materials.label', { count: materialsCount })} />
                      <Chip size="small" color="secondary" label={t('course.exams.label', { count: examsCount })} />
                    </Box>
                    <Typography variant="caption" color="text.secondary">{t('course.createdOn',{ date: formatDate(course.fechaCreacion) })}</Typography>
                  </CardContent>
                  <CardActions sx={{ px: 2, pb: 2 }}>
                    <Button size="small" startIcon={<Assessment />} onClick={() => { setSelectedCourse(course); setExamListOpen(true); }}>{t('course.actions.exams')}</Button>
                    <Button size="small" startIcon={<Folder />} onClick={() => { setSelectedCourse(course); setMaterialManagementModalOpen(true); }}>{t('course.actions.materials')}</Button>
                  </CardActions>
                </Card>
              );
            })}
            <Card 
              sx={{ minWidth: 320, maxWidth: 400, flex: '1 1 320px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
              onClick={() => setCreateModalOpen(true)}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <Add sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6" color="primary">{t('course.createNew')}</Typography>
                <Typography variant="body2" color="text.secondary">{t('course.createNew.subtitle')}</Typography>
              </CardContent>
            </Card>
          </>
        )}
      </Box>

      {/* Menú contextual */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
  <MenuItem onClick={handleEditCourse}><Edit sx={{ mr: 1 }} />{t('common.edit')}</MenuItem>
  <MenuItem onClick={handleDeleteCourse} sx={{ color: 'error.main' }}><Delete sx={{ mr: 1 }} />{t('common.delete')}</MenuItem>
      </Menu>
      {/* Modal para crear curso */}
      <CreateCourseModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={handleCreateCourse}
      />

      {/* Modal para editar curso */}
      <EditCourseModal
        open={editModalOpen}
        course={selectedCourse}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedCourse(null);
        }}
        onUpdate={(id, updates) => {
          const updated = courseService.updateCourse(id, updates);
          if (updated) {
            setCourses(prev => prev.map(c => c.id === id ? updated : c));
            // refrescar conteos (materiales/exámenes) si algo depende
            setRefreshKey(prev => prev + 1);
          }
          return updated;
        }}
      />

      {/* Lista de exámenes del curso */}
      <CourseExamList
        open={examListOpen}
        onClose={() => { setExamListOpen(false); setSelectedCourse(null); }}
        curso={selectedCourse}
      />

      {/* Modal para subir material */}
      {selectedCourse && (
        <UploadMaterialModal
          open={uploadModalOpen}
          onClose={() => {
            setUploadModalOpen(false);
            setSelectedCourse(null);
          }}
          cursoId={selectedCourse.id}
          cursoNombre={selectedCourse.nombre}
          onMaterialUploaded={(material) => {
            console.log('Material uploaded:', material);
            // Actualizar el estado para refrescar los conteos
            setRefreshKey(prev => prev + 1);
          }}
        />
      )}

      {/* Modal para gestionar materiales */}
      {selectedCourse && (
        <MaterialManagementModal
          open={materialManagementModalOpen}
          onClose={() => {
            setMaterialManagementModalOpen(false);
            setSelectedCourse(null);
          }}
          cursoId={selectedCourse.id}
          cursoNombre={selectedCourse.nombre}
          onMaterialsChanged={() => {
            // Actualizar el estado para refrescar los conteos
            setRefreshKey(prev => prev + 1);
          }}
        />
      )}
    </Box>
  );
};
