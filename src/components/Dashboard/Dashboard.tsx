import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  Alert,
} from '@mui/material';
import {
  School,
  Quiz,
  TrendingUp,
  Assessment,
  Add,
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { courseService } from '../../services/courseService';
import { examService } from '../../services/examService';
import { ExamResultService } from '../../services/examResultService';
import { useHybridResource } from '../../hooks/useHybridResource';
import { useI18n } from '../../i18n';
import { initializeTestData } from '../../utils/testData';
import type { Exam } from '../../types';

interface DashboardData {
  totalCourses: number;
  totalExams: number;
  averageScore: number;
  pendingExams: number;
  answerDistribution: Array<{ name: string; value: number; color: string; }>;
  recentExams: Exam[];
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t, locale } = useI18n();
  
  // Estado para los datos del dashboard
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalCourses: 0,
    totalExams: 0,
    averageScore: 0,
    pendingExams: 0,
    answerDistribution: [],
    recentExams: [],
  });  // Cargar datos reales al montar el componente
  const { data: courses } = useHybridResource({ fetcher: () => courseService.fetchCourses?.(), local: () => courseService.getCourses() });
  const { data: exams } = useHybridResource({ fetcher: () => examService.fetchExams?.(), local: () => examService.getExams() });
  const { data: attempts } = useHybridResource({ fetcher: () => ExamResultService.fetchExamAttempts?.(), local: () => ExamResultService.getExamAttempts?.() || [] });
  const { data: results } = useHybridResource({ fetcher: () => ExamResultService.fetchExamResults?.(), local: () => ExamResultService.getExamResults?.() || [] });
  const { data: answerStats } = useHybridResource({ fetcher: () => ExamResultService.fetchAnswerDistribution?.(), local: () => null });

  useEffect(() => {
    try {
      initializeTestData();
      const courseStats = courseService.getCourseStats();
      const performanceStats = ExamResultService.getPerformanceStats();
      const recentExams = [...exams]
        .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
        .slice(0, 3);
      const dist = performanceStats.answerDistribution;
      // If API stats available, override percentages using server counts
      let answerDistribution = dist;
      if (answerStats && answerStats.total > 0) {
        answerDistribution = [
          { name: 'Correctas', value: Math.round((answerStats.correct / answerStats.total) * 100), color: '#4caf50' },
          { name: 'Incorrectas', value: Math.round((answerStats.incorrect / answerStats.total) * 100), color: '#f44336' },
          { name: 'Sin responder', value: Math.round((answerStats.blank / answerStats.total) * 100), color: '#ff9800' },
        ];
      }
      setDashboardData({
        totalCourses: courseStats.totalCourses,
        totalExams: performanceStats.totalExamsTaken,
        averageScore: performanceStats.averageScore,
        pendingExams: performanceStats.pendingExams,
        answerDistribution,
        recentExams,
      });
    } catch (e) {
      console.error('Error loading dashboard data:', e);
    }
  }, [courses, exams, attempts, results, answerStats]);

  return (
    <Box sx={{ 
      maxWidth: '1200px', 
      mx: 'auto', 
      px: { xs: 2, sm: 3, md: 4 },
      py: { xs: 2, sm: 3 }
    }}>
  <Typography variant="h4" gutterBottom fontWeight="bold">{t('dashboard.title')}</Typography>
  <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>{t('dashboard.welcome')}</Typography>

      {/* Mensaje informativo cuando no hay datos */}
      {dashboardData.totalExams === 0 && dashboardData.totalCourses === 0 && (
        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="body1"><strong>{t('dashboard.info.startTitle')}</strong></Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>{t('dashboard.info.startBody')}</Typography>
        </Alert>
      )}

      {/* Tarjetas de estadísticas */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { 
          xs: '1fr', 
          sm: 'repeat(2, 1fr)', 
          lg: 'repeat(4, 1fr)' 
        }, 
        gap: { xs: 2, sm: 3 }, 
        mb: 4 
      }}>
        <Card sx={{ 
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: (theme) => theme.shadows[8],
          }
        }}>
          <CardContent sx={{ 
            height: 140, 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Box>
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                {dashboardData.totalCourses}
              </Typography>
              <Typography variant="body2" color="text.secondary">{t('dashboard.stats.courses')}</Typography>
            </Box>
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
              <School fontSize="large" />
            </Avatar>
          </CardContent>
        </Card>

        <Card sx={{ 
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: (theme) => theme.shadows[8],
          }
        }}>
          <CardContent sx={{ 
            height: 140, 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Box>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {dashboardData.totalExams}
              </Typography>
              <Typography variant="body2" color="text.secondary">{t('dashboard.stats.examsTaken')}</Typography>
            </Box>
            <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
              <Quiz fontSize="large" />
            </Avatar>
          </CardContent>
        </Card>

        <Card sx={{ 
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: (theme) => theme.shadows[8],
          }
        }}>
          <CardContent sx={{ 
            height: 140, 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Box>
              <Typography variant="h4" fontWeight="bold" color="info.main">
                {dashboardData.averageScore}%
              </Typography>
              <Typography variant="body2" color="text.secondary">{t('dashboard.stats.averageScore')}</Typography>
            </Box>
            <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
              <TrendingUp fontSize="large" />
            </Avatar>
          </CardContent>
        </Card>

        <Card sx={{ 
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: (theme) => theme.shadows[8],
          }
        }}>
          <CardContent sx={{ 
            height: 140, 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Box>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {dashboardData.pendingExams}
              </Typography>
              <Typography variant="body2" color="text.secondary">{t('dashboard.stats.pendingExams')}</Typography>
            </Box>
            <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
              <Assessment fontSize="large" />
            </Avatar>
          </CardContent>
        </Card>
      </Box>

      {/* Sección principal con gráficos */}
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: { 
          xs: '1fr',
          lg: '2fr 1fr'
        },
        gap: { xs: 2, sm: 3 },
        mb: 4
      }}>
        {/* Distribución de Respuestas */}
        <Card sx={{ 
          minHeight: 400,
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: (theme) => theme.shadows[8],
          }
        }}>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">{t('dashboard.answerDistribution')}</Typography>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={dashboardData.answerDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dashboardData.answerDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ mt: 2, px: 1 }}>
              {dashboardData.answerDistribution.map((entry, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      bgcolor: entry.color,
                      borderRadius: '50%',
                      mr: 1.5,
                    }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {t(
                      entry.name === 'Correctas' ? 'stats.correct' : entry.name === 'Incorrectas' ? 'stats.incorrect' : 'stats.unanswered'
                    )}: {entry.value}%
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Sección inferior con acciones y exámenes recientes */}
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: { 
          xs: '1fr',
          md: '1fr 1fr'
        },
        gap: { xs: 2, sm: 3 }
      }}>
        {/* Acciones Rápidas */}
        <Card sx={{ 
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: (theme) => theme.shadows[8],
          }
        }}>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">{t('dashboard.quickActions')}</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<Add />}
                onClick={() => navigate('/courses')}
                sx={{ 
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              >
                {t('dashboard.action.createCourse')}
              </Button>
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                size="large"
                startIcon={<Quiz />}
                onClick={() => navigate('/generate-exam')}
                sx={{ 
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              >
                {t('dashboard.action.generateExam')}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Exámenes Recientes */}
        <Card sx={{ 
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: (theme) => theme.shadows[8],
          }
        }}>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">{t('dashboard.recentExams')}</Typography>
            <List sx={{ mt: 1 }}>
              {dashboardData.recentExams.length > 0 ? (
                dashboardData.recentExams.map((exam) => (
                  <ListItem 
                    key={exam.id}
                    sx={{ 
                      px: 0,
                      py: 1,
                      borderRadius: 1,
                      mb: 1,
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                        <Quiz />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body1" fontWeight={500}>
                          {exam.titulo}
                        </Typography>
                      }
                      secondary={t('exam.createdOn',{ date: new Date(exam.fechaCreacion).toLocaleDateString(locale==='en'?'en-US':'es-ES') })}
                    />
                    <Chip 
                      label={t('exam.questions.count',{ count: exam.preguntas.length })} 
                      color="primary" 
                      size="small" 
                      variant="outlined"
                      sx={{ fontWeight: 500 }}
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem sx={{ px: 0, flexDirection: 'column', alignItems: 'flex-start' }}>
                  <ListItemText
                    primary={<Typography variant="body1" color="text.secondary">{t('dashboard.recent.noneTitle')}</Typography>}
                    secondary={t('dashboard.recent.noneSubtitle')}
                  />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};
