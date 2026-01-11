import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Chip,
  Alert,
  Paper,
  Divider,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Schedule,
  Quiz,
  Home,
  Refresh,
  TrendingUp,
} from '@mui/icons-material';
import type { Exam } from '../types';

interface ExamResults {
  correctAnswers: number;
  totalQuestions: number;
  earnedPoints: number;
  totalPoints: number;
  percentage: number;
  timeUsed: number;
  answeredQuestions: number;
}

interface UserAnswer {
  questionId: string;
  answer: string | number | boolean | null;
}

const ExamResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { results, exam, userAnswers } = location.state as {
    results: ExamResults;
    exam: Exam;
    userAnswers: Record<string, UserAnswer>;
  };

  if (!results || !exam) {
    navigate('/exams');
    return null;
  }

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'success';
    if (percentage >= 70) return 'warning';
    return 'error';
  };

  const getGradeLetter = (percentage: number) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const getPerformanceMessage = (percentage: number) => {
    if (percentage >= 90) return '¡Excelente trabajo!';
    if (percentage >= 80) return '¡Muy bien hecho!';
    if (percentage >= 70) return 'Buen trabajo';
    if (percentage >= 60) return 'Necesitas mejorar';
    return 'Debes estudiar más';
  };

  const renderQuestionReview = () => {
    return exam.preguntas.map((question, index) => {
      const userAnswer = userAnswers[question.id]?.answer;
      const isCorrect = (() => {
        if (question.tipo === 'multiple') {
          return Number(userAnswer) === Number(question.respuestaCorrecta);
        }
        if (question.tipo === 'verdadero_falso') {
          const correct = typeof question.respuestaCorrecta === 'boolean' ? question.respuestaCorrecta : question.respuestaCorrecta === 'true';
          return Boolean(userAnswer) === correct;
        }
        if (question.tipo === 'abierta') {
          if (typeof userAnswer === 'string' && typeof question.respuestaCorrecta === 'string') {
            return userAnswer.trim().toLowerCase() === question.respuestaCorrecta.trim().toLowerCase();
          }
        }
        return false;
      })();
      const wasAnswered = userAnswer !== null && userAnswer !== undefined;

      return (
        <Card key={question.id} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h6" sx={{ flex: 1, pr: 2 }}>
                {index + 1}. {question.pregunta}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip 
                  label={`${question.puntos} pts`} 
                  size="small" 
                  variant="outlined"
                />
                {wasAnswered ? (
                  <Chip
                    icon={isCorrect ? <CheckCircle /> : <Cancel />}
                    label={isCorrect ? 'Correcta' : 'Incorrecta'}
                    color={isCorrect ? 'success' : 'error'}
                    size="small"
                  />
                ) : (
                  <Chip
                    label="Sin responder"
                    color="default"
                    size="small"
                  />
                )}
              </Box>
            </Box>

            {question.tipo === 'multiple' && question.opciones && (
              <Box sx={{ ml: 2 }}>
                {question.opciones.map((opcion, optionIndex) => {
                  const isUserAnswer = Number(userAnswer) === optionIndex;
                  const isCorrectAnswer = Number(question.respuestaCorrecta) === optionIndex;
                  
                  return (
                    <Typography
                      key={optionIndex}
                      variant="body2"
                      sx={{
                        mb: 0.5,
                        fontWeight: isCorrectAnswer ? 'bold' : 'normal',
                        color: isUserAnswer 
                          ? (isCorrect ? 'success.main' : 'error.main')
                          : isCorrectAnswer 
                            ? 'success.main' 
                            : 'text.secondary',
                        bgcolor: isUserAnswer ? (isCorrect ? 'success.light' : 'error.light') : 'transparent',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                      }}
                    >
                      {String.fromCharCode(65 + optionIndex)}. {opcion}
                      {isCorrectAnswer && ' ✓'}
                      {isUserAnswer && !isCorrect && ' ✗'}
                    </Typography>
                  );
                })}
              </Box>
            )}

            {question.tipo === 'verdadero_falso' && (
              <Box sx={{ ml: 2 }}>
                <Typography
                  variant="body2"
                  sx={{ 
                    color: isCorrect ? 'success.main' : 'error.main',
                    fontWeight: 'medium'
                  }}
                >
                  Tu respuesta: {userAnswer === true ? 'Verdadero' : userAnswer === false ? 'Falso' : 'Sin responder'}
                </Typography>
                <Typography variant="body2" color="success.main">
                  Respuesta correcta: {(typeof question.respuestaCorrecta === 'boolean' ? question.respuestaCorrecta : question.respuestaCorrecta === 'true') ? 'Verdadero' : 'Falso'}
                </Typography>
              </Box>
            )}

            {question.tipo === 'abierta' && (
              <Box sx={{ ml: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Tu respuesta:
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontStyle: 'italic', 
                    mb: 1,
                    color: userAnswer && typeof question.respuestaCorrecta === 'string' && 
                           typeof userAnswer === 'string' &&
                           userAnswer.trim().toLowerCase() === question.respuestaCorrecta.trim().toLowerCase() 
                           ? 'success.main' : 'error.main'
                  }}
                >
                  {userAnswer || 'Sin responder'}
                </Typography>
                <Typography variant="body2" color="success.main">
                  Respuesta correcta: {question.respuestaCorrecta}
                </Typography>
                {userAnswer && typeof question.respuestaCorrecta === 'string' && 
                 typeof userAnswer === 'string' &&
                 userAnswer.trim().toLowerCase() === question.respuestaCorrecta.trim().toLowerCase() && (
                  <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
                    ✓ ¡Correcto!
                  </Typography>
                )}
              </Box>
            )}

            {question.explicacion && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Explicación:</strong> {question.explicacion}
                </Typography>
              </Alert>
            )}
          </CardContent>
        </Card>
      );
    });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      {/* Header de resultados */}
      <Paper sx={{ p: 4, mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Resultados del Examen
        </Typography>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          {exam.titulo}
        </Typography>
        <Chip 
          label={exam.nombreCurso} 
          color="primary" 
          variant="outlined" 
          sx={{ mb: 3 }}
        />

        {/* Puntuación principal */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h1" fontWeight="bold" color={`${getGradeColor(results.percentage)}.main`}>
            {results.percentage}%
          </Typography>
          <Typography variant="h4" color={`${getGradeColor(results.percentage)}.main`} gutterBottom>
            Calificación: {getGradeLetter(results.percentage)}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {getPerformanceMessage(results.percentage)}
          </Typography>
        </Box>

        {/* Barra de progreso */}
        <Box sx={{ mb: 3 }}>
          <LinearProgress
            variant="determinate"
            value={results.percentage}
            color={getGradeColor(results.percentage) as any}
            sx={{ height: 12, borderRadius: 6 }}
          />
        </Box>
      </Paper>      {/* Estadísticas detalladas */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3, mb: 4 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <CheckCircle color="success" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              {results.correctAnswers}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Respuestas Correctas
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <TrendingUp color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              {results.earnedPoints}/{results.totalPoints}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Puntos Obtenidos
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Schedule color="warning" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              {results.timeUsed}m
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tiempo Utilizado
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Quiz color="info" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              {results.answeredQuestions}/{results.totalQuestions}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Preguntas Respondidas
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Revisión de preguntas */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Revisión Detallada
          </Typography>
          <Divider sx={{ mb: 3 }} />
          {renderQuestionReview()}
        </CardContent>
      </Card>

      {/* Botones de acción */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<Home />}
          onClick={() => navigate('/exams')}
        >
          Volver a Exámenes
        </Button>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={() => navigate(`/take-exam/${exam.id}`)}
        >
          Repetir Examen
        </Button>
      </Box>
    </Box>
  );
};

export default ExamResultsPage;
