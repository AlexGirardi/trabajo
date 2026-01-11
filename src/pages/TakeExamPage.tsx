import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  TextField,
  LinearProgress,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  Timer,
  CheckCircle,
  Warning,
  ArrowBack,
  Send,
} from '@mui/icons-material';
import type { Exam, Question } from '../types';
import { examService } from '../services/examService';
import { ExamResultService } from '../services/examResultService';
import { useI18n } from '../i18n';

interface UserAnswer {
  questionId: string;
  answer: string | number | boolean | null;
}

const TakeExamPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const { t } = useI18n();
  const navigate = useNavigate();
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, UserAnswer>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [examStartTime, setExamStartTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);  // Cargar examen
  useEffect(() => {
    const USE_API = (import.meta as any).env?.VITE_USE_API === 'true';
    const load = async () => {
      if (!examId) {
        setError(t('error.invalid.examId'));
        setTimeout(() => navigate('/exams'), 2000);
        return;
      }
      try {
        let foundExam = examService.getExamById(examId);
        if (!foundExam && USE_API && examService.fetchExams) {
          await examService.fetchExams();
          foundExam = examService.getExamById(examId);
        }
        if (foundExam) {
          setExam(foundExam);
          setTimeRemaining(foundExam.duracionMinutos * 60);
          setExamStartTime(new Date());
          const initialAnswers: Record<string, UserAnswer> = {};
          foundExam.preguntas.forEach(q => { initialAnswers[q.id] = { questionId: q.id, answer: null }; });
          setUserAnswers(initialAnswers);
          setLoading(false);
        } else {
          setError(t('error.exam.notFound'));
          setTimeout(() => navigate('/exams'), 2000);
        }
      } catch (err) {
        console.error('Error cargando examen:', err);
        setError(t('error.load.exam'));
        setTimeout(() => navigate('/exams'), 2000);
      }
    };
    load();
  }, [examId, navigate, t]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining > 0 && !isSubmitted && exam) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && !isSubmitted && exam) {
      // Tiempo agotado, enviar automáticamente
      handleAutoSubmit();
    }
  }, [timeRemaining, isSubmitted, exam]);
  const handleAutoSubmit = () => {
    try {
      setIsSubmitted(true);
      const results = calculateResults();
      if (results && exam) {
        // Guardar resultado en localStorage
        saveExamResult(results, exam);
        navigate('/exam-results', { state: { results, exam, userAnswers } });
      } else {
        navigate('/exams');
      }
    } catch (error) {
  console.error('Error en auto-envío:', error);
      navigate('/exams');
    }
  };
  const handleAnswerChange = (questionId: string, answer: string | number | boolean) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: {
        questionId,
        answer,
      },
    }));
  };  const saveExamResult = (results: any, examData: Exam) => {
    try {
      // Crear el intento del examen (sin id, el servicio lo genera)
      const examAttemptData = {
        examenId: examData.id,
        usuarioId: 'user-1',
        respuestas: userAnswers,
        puntuacion: results.earnedPoints,
        fechaInicio: examStartTime || new Date(),
        fechaFin: new Date(),
        completado: true,
      };      // Guardar el intento primero para obtener el ID
      const savedAttempt = ExamResultService.saveExamAttempt(examAttemptData);

      // Crear el resultado del examen (sin id, el servicio lo genera)
      const examResultData = {
        intentoId: savedAttempt.id,
        examId: examData.id,
        puntuacionObtenida: results.earnedPoints,
        puntuacionMaxima: results.totalPoints,
        porcentaje: results.percentage,
        tiempoEmpleado: results.timeUsed,
        respuestasCorrectas: results.correctAnswers,
        respuestasIncorrectas: results.totalQuestions - results.correctAnswers,
        respuestasEnBlanco: results.totalQuestions - results.answeredQuestions,
      };      // Guardar el resultado
      const savedResult = ExamResultService.saveExamResult(examResultData);

      console.log('Intento del examen guardado:', savedAttempt);
      console.log('Resultado del examen guardado:', savedResult);
    } catch (error) {
      console.error('Error al guardar el resultado del examen:', error);
    }
  };
  const handleSubmitExam = () => {
    try {
      setIsSubmitted(true);
      setShowSubmitDialog(false);
      
      const results = calculateResults();
      
      if (!results || !exam) {
  console.error('Error: No se pudieron calcular los resultados');
  setError(t('error.process.exam'));
        return;
      }
      
      // Guardar resultado en localStorage
      saveExamResult(results, exam);
      
      console.log('Examen enviado y guardado:', results);
      navigate('/exam-results', { state: { results, exam, userAnswers } });
    } catch (error) {
  console.error('Error al enviar examen:', error);
  setIsSubmitted(false);
  setError(t('error.send.exam'));
    }
  };

  const calculateResults = () => {
    if (!exam || !exam.preguntas || exam.preguntas.length === 0) {
      console.error('Error: Examen o preguntas no válidos');
      return null;
    }
    
    let correctAnswers = 0;
    let totalPoints = 0;
    let earnedPoints = 0;
    
    try {
      exam.preguntas.forEach(question => {
        if (!question || typeof question.puntos !== 'number') {
          console.warn('Pregunta inválida encontrada:', question);
          return;
        }
        
        totalPoints += question.puntos;
        const userAnswer = userAnswers[question.id]?.answer;
        
        if (userAnswer !== null && userAnswer !== undefined) {
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
          if (isCorrect) { correctAnswers++; earnedPoints += question.puntos; }
        }
      });
      
      const percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
      const timeUsed = examStartTime ? Math.floor((new Date().getTime() - examStartTime.getTime()) / 1000 / 60) : 0;
      
      return {
        correctAnswers,
        totalQuestions: exam.preguntas.length,
        earnedPoints: Math.round(earnedPoints * 100) / 100,
        totalPoints,
        percentage: Math.round(percentage * 100) / 100,
        timeUsed,
        answeredQuestions: Object.values(userAnswers).filter(answer => answer.answer !== null).length,
      };
    } catch (error) {
      console.error('Error al calcular resultados:', error);
      return null;
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!exam) return 0;
    const answeredQuestions = Object.values(userAnswers).filter(answer => answer.answer !== null).length;
    return (answeredQuestions / exam.preguntas.length) * 100;
  };

  const renderQuestion = (question: Question, index: number) => {
    const userAnswer = userAnswers[question.id]?.answer;

    return (
      <Card key={question.id} sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h6" sx={{ flex: 1, pr: 2 }}>
              {index + 1}. {question.pregunta}
            </Typography>
            <Chip 
              label={`${question.puntos} pts`} 
              size="small" 
              color="primary" 
              variant="outlined"
            />
          </Box>

          {question.tipo === 'multiple' && question.opciones && (
            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={userAnswer ?? ''}
                onChange={(e) => handleAnswerChange(question.id, parseInt(e.target.value))}
              >
                {question.opciones.map((opcion, optionIndex) => (
                  <FormControlLabel
                    key={optionIndex}
                    value={optionIndex}
                    control={<Radio />}
                    label={`${String.fromCharCode(65 + optionIndex)}. ${opcion}`}
                    sx={{ mb: 1 }}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          )}

          {question.tipo === 'verdadero_falso' && (
            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={userAnswer ?? ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value === 'true')}
              >
                <FormControlLabel
                  value="true"
                  control={<Radio />}
                  label="Verdadero"
                  sx={{ mb: 1 }}
                />
                <FormControlLabel
                  value="false"
                  control={<Radio />}
                  label="Falso"
                />
              </RadioGroup>
            </FormControl>
          )}

          {question.tipo === 'abierta' && (
            <TextField
              fullWidth
              placeholder="Completa con una palabra..."
              value={userAnswer ?? ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              variant="outlined"
              helperText="Escribe la palabra que completa la frase"
              InputProps={{
                style: {
                  textAlign: 'center',
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }
              }}
            />
          )}
        </CardContent>
      </Card>
    );
  };

  // Estado de carga
  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">{t('exam.loading')}</Typography>
      </Box>
    );
  }

  // Estado de error
  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={() => navigate('/exams')}>
          {t('takeExam.returnToExams')}
        </Button>
      </Box>
    );
  }

  // Si no hay examen
  if (!exam) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">{t('error.exam.notFound')}</Typography>
        <Button onClick={() => navigate('/exams')}>
          {t('takeExam.returnToExams')}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      {/* Header del examen */}
      <Paper sx={{ p: 3, mb: 3, position: 'sticky', top: 0, zIndex: 10 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {exam.titulo}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {exam.nombreCurso} • {t('exams.meta.questionsShort',{count: exam.preguntas.length})} • {exam.puntuacionTotal} pts
            </Typography>
          </Box>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/exams')}
            disabled={isSubmitted}
          >
            {t('common.back')}
          </Button>
        </Box>

        {/* Barra de progreso */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">
              {t('takeExam.progress')}: {Object.values(userAnswers).filter(a => a.answer !== null).length} / {exam.preguntas.length}
            </Typography>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
              <Timer sx={{ mr: 0.5, fontSize: 16 }} />
              {formatTime(timeRemaining)}
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={getProgressPercentage()} 
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        {/* Alerta de tiempo */}
        {timeRemaining <= 300 && timeRemaining > 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {t('takeExam.time.warning')}
          </Alert>
        )}
      </Paper>

      {/* Preguntas */}
      <Box sx={{ mb: 4 }}>
        {exam.preguntas.map((question, index) => renderQuestion(question, index))}
      </Box>

      {/* Botón de envío */}
      <Paper sx={{ p: 3, position: 'sticky', bottom: 0, zIndex: 10 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {Object.values(userAnswers).filter(a => a.answer !== null).length} / {exam.preguntas.length} {t('results.metric.answered')}
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<Send />}
            onClick={() => setShowSubmitDialog(true)}
            disabled={isSubmitted}
          >
            {t('exam.send.button')}
          </Button>
        </Box>
      </Paper>

      {/* Dialog de confirmación */}
      <Dialog open={showSubmitDialog} onClose={() => setShowSubmitDialog(false)}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Warning color="warning" sx={{ mr: 1 }} />
            {t('exam.send.confirmTitle')}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>{t('exam.send.confirmMessage')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t('takeExam.confirm.answered',{answered: Object.values(userAnswers).filter(a => a.answer !== null).length, total: exam.preguntas.length})}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('takeExam.confirm.timeRemaining',{time: formatTime(timeRemaining)})}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSubmitDialog(false)}>{t('common.cancel')}</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmitExam}
            startIcon={<CheckCircle />}
          >
            {t('exam.send.button')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TakeExamPage;
