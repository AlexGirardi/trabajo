import React, { useState, useEffect } from 'react';
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
  Fab,
} from '@mui/material';
import { PlayArrow, MoreVert, Schedule, Assignment, Edit, Delete, Share, Add, Quiz } from '@mui/icons-material';
import { useI18n } from '../i18n';
import { useNavigate } from 'react-router-dom';
import type { Exam } from '../types';
import { examService } from '../services/examService';
import { useHybridResource } from '../hooks/useHybridResource';
import { initializeTestData } from '../utils/testData';

const ExamsPage: React.FC = () => {
  const {
    data: exams,
    loading,
    error,
    reload: reloadExams
  } = useHybridResource<Exam[]>({
    fetcher: () => examService.fetchExams(),
    local: () => examService.getExams()
  });
  const { t, locale } = useI18n();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const navigate = useNavigate();
  // Inicializar datos de prueba local si vacío (solo modo local)
  useEffect(() => {
    if (!loading && exams.length === 0) {
      initializeTestData();
      reloadExams();
    }
  }, [exams.length, loading, reloadExams]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, examId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedExamId(examId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedExamId(null);
  };

  const handleDeleteExam = (examId: string) => {
  if (window.confirm(t('confirm.delete.exam'))) {
  examService.deleteExam(examId);
  reloadExams();
    }
    handleMenuClose();
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
      case 'facil': return t('difficulty.facil');
      case 'medio': return t('difficulty.medio');
      case 'dificil': return t('difficulty.dificil');
      default: return t('difficulty.normal');
    }
  };

  const formatDate = (date: Date) => new Date(date).toLocaleDateString(locale==='en'?'en-US':'es-ES',{ year:'numeric', month:'short', day:'numeric' });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>{t('exams.title')}</Typography>
          <Typography variant="body1" color="text.secondary">{t('exams.subtitle')}</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/generate-exam')}
          sx={{ borderRadius: 2 }}
        >
          {t('exams.create')}
        </Button>
      </Box>

      {error && (
        <Box sx={{ mb: 2 }}>
          <Typography color="error" variant="body2">{error}</Typography>
        </Box>
      )}
      {loading && exams.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="body2">Cargando exámenes...</Typography>
        </Box>
      ) : exams.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Quiz sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>{t('exams.empty.title')}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{t('exams.empty.subtitle')}</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/generate-exam')}
          >
            {t('exams.create.first')}
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 3 }}>
          {exams.map((exam) => (
            <Card key={exam.id} sx={{ height: 'fit-content', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ flex: 1, pr: 1 }}>
                    {exam.titulo}
                  </Typography>
                  <IconButton size="small" onClick={(e) => handleMenuOpen(e, exam.id)}>
                    <MoreVert />
                  </IconButton>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                  {exam.descripcion || t('exams.card.noDescription')}
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  <Chip
                    label={exam.nombreCurso}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label={getDifficultyLabel(exam.dificultad)}
                    size="small"
                    color={getDifficultyColor(exam.dificultad) as any}
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, color: 'text.secondary' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Schedule fontSize="small" />
                    <Typography variant="caption">
                      {t('exams.meta.minutesShort',{count: exam.duracionMinutos})}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Assignment fontSize="small" />
                    <Typography variant="caption">
                      {t('exams.meta.questionsShort',{count: exam.preguntas.length})}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                  {t('exam.createdOn',{date: formatDate(exam.fechaCreacion)})}
                </Typography>                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<PlayArrow />}
                  onClick={() => navigate(`/take-exam/${exam.id}`)}
                >
                  {t('exams.action.take')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Menú contextual */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <Edit sx={{ mr: 1 }} />{t('common.edit')}
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Share sx={{ mr: 1 }} />Share
        </MenuItem>
        <MenuItem 
          onClick={() => selectedExamId && handleDeleteExam(selectedExamId)}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1 }} />{t('common.delete')}
        </MenuItem>
      </Menu>

      {/* Botón flotante para crear examen en móvil */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', sm: 'none' }
        }}
  onClick={() => navigate('/generate-exam')}
      >
        <Add />
      </Fab>
    </Box>
  );
};

export default ExamsPage;
