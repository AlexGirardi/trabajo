import React, { useState, useEffect } from 'react';
import { useI18n } from '../../i18n';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Slider,
  Paper,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  AlertTitle,
  List,
  ListItem,
  Chip,
  Snackbar,
} from '@mui/material';
import {
  Quiz,
  School,
  Psychology,
  Send,
  CheckCircle,
} from '@mui/icons-material';
import type { ExamGenerationRequest, Question } from '../../types';
import { useExamAIService, useErrorHandler } from '../../contexts/ServicesContext';
import { examService } from '../../services/examService';
import { courseService } from '../../services/courseService';
import { materialService } from '../../services/materialService';
import { useHybridResource } from '../../hooks/useHybridResource';
import { OllamaStatus } from '../AI/OllamaStatus';
// Modal de guardado eliminado: ahora el título y la descripción los genera la IA automáticamente

const stepKeys = ['exam.steps.selectCourse','exam.steps.configure','exam.steps.generate'];

const mockCourses = [
  { id: '1', nombre: 'Matemáticas Avanzadas' },
  { id: '2', nombre: 'Historia Contemporánea' },
  { id: '3', nombre: 'Física Cuántica' },
];

export const ExamGenerator: React.FC = () => {
  const examAIService = useExamAIService();
  const errorHandler = useErrorHandler();
  const [activeStep, setActiveStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [aiTitulo, setAiTitulo] = useState<string>('');
  const [aiDescripcion, setAiDescripcion] = useState<string>('');
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isOllamaConnected, setIsOllamaConnected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { data: courses } = useHybridResource({ fetcher: () => courseService.fetchCourses?.(), local: () => courseService.getCourses() });
  const { data: materials } = useHybridResource({ fetcher: () => materialService.fetchMaterials?.(), local: () => materialService.getMaterials() });
  const [availableCourses, setAvailableCourses] = useState(mockCourses);
  const [formData, setFormData] = useState<ExamGenerationRequest>({
    cursoId: '',
    numeroPreguntas: 10,
    tiposPreguntas: ['multiple'],
    dificultad: 'medio',
    duracionMinutos: 60,
  });
  const { t, locale } = useI18n();

  // Cargar cursos disponibles al montar el componente
  useEffect(() => {
    if (courses && courses.length > 0) {
      const simplifiedCourses = courses.map((c: any) => ({ id: c.id, nombre: c.nombre }));
      setAvailableCourses(simplifiedCourses);
    }
  }, [courses]);
  const getCourseContext = (cursoId: string): string => {
    // Obtener contenido real de los materiales del curso
    const courseContent = materialService.getCourseContent(cursoId);
    
    console.log(`ExamGenerator - Obteniendo contexto para curso ${cursoId}:`, {
      contenidoLength: courseContent.length,
      tieneContenido: courseContent.trim() !== ''
    });
    
    if (courseContent.trim() === '') {
      console.log('No hay materiales subidos, usando contenido por defecto');
      // Si no hay materiales subidos, usar contenido por defecto
      const courseContexts: Record<string, string> = {
        '1': 'Matemáticas Avanzadas - Contenido del curso: Cálculo diferencial e integral, Límites y continuidad, Derivadas y sus aplicaciones, Integrales definidas e indefinidas, Series y sucesiones.',
        '2': 'Historia Contemporánea - Contenido del curso: Primera y Segunda Guerra Mundial, Revolución Industrial, Guerra Fría, Descolonización, Movimientos sociales del siglo XX.',
        '3': 'Física Cuántica - Contenido del curso: Principios de la mecánica cuántica, Dualidad onda-partícula, Ecuación de Schrödinger, Principio de incertidumbre de Heisenberg, Interpretaciones de la mecánica cuántica.',
      };
      
      return courseContexts[cursoId] || 'Contenido general del curso';
    }
    
    console.log('Usando contenido real de materiales subidos');
    return courseContent;
  };

  const handleNext = () => {
    if (activeStep === stepKeys.length - 1) {
      handleGenerateExam();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  const handleGenerateExam = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedQuestions([]);
    
    try {
      console.log('Generating exam with data:', formData);
      
      const courseMaterial = getCourseContext(formData.cursoId);
      console.log('Material del curso para IA:', {
        length: courseMaterial.length,
        preview: courseMaterial.substring(0, 300) + '...',
        esMaterial: courseMaterial.includes('===')
      });
      
  const result = await examAIService.generateExam(formData, courseMaterial, locale);
      
      if (result.success) {
        setGeneratedQuestions(result.questions);
  setAiTitulo(result.titulo || t('exam.default.title'));
  setAiDescripcion(result.descripcion || t('exam.default.description'));
        console.log('Examen generado exitosamente:', { preguntas: result.questions.length, titulo: result.titulo, descripcion: result.descripcion });
      } else {
        setGenerationError(result.error || 'Error desconocido al generar el examen');
      }
    } catch (error) {
      console.error('Error generating exam:', error);
      setGenerationError('Error al conectar con el servicio de IA');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveExam = async () => {
    setIsSaving(true);
    try {
      const questionsWithIds = examService.generateQuestionsWithIds(
        generatedQuestions.map(q => ({
          tipo: q.tipo,
          pregunta: q.pregunta,
          opciones: q.opciones,
          respuestaCorrecta: q.respuestaCorrecta,
          explicacion: q.explicacion,
          puntos: q.puntos,
        }))
      );

      const savedExam = examService.saveExam({
  titulo: aiTitulo || t('exam.default.title'),
  descripcion: aiDescripcion || t('exam.default.description'),
        cursoId: formData.cursoId,
        nombreCurso: mockCourses.find(c => c.id === formData.cursoId)?.nombre,
        preguntas: questionsWithIds,
        duracionMinutos: formData.duracionMinutos,
        intentosMaximos: 3,
        dificultad: formData.dificultad,
      });

      console.log('Examen guardado:', savedExam);
      setSaveSuccess(true);
      
      setTimeout(() => {
        setGeneratedQuestions([]);
        setActiveStep(0);
        setSaveSuccess(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error al guardar examen:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };
  const handleCourseChange = (value: string) => {
    setFormData({ ...formData, cursoId: value });
  };
  const getMaterialsInfo = (cursoId: string) => {
    if (!cursoId) return { count: 0, hasContent: false, convertedCount: 0, totalCharacters: 0, materials: [] };
    
  // Filtrar materiales del curso
  const ms = materials.filter((m: any) => m.cursoId === cursoId);
  // Solo los activos (getCourseContent también excluye los inactivos)
  const active = ms.filter((m: any) => m.activo !== false);
  const totalContent = active.reduce((acc: number, material: any) => acc + (material.contenido?.length || 0), 0);
  const convertedCount = active.filter((m: any) => m.fueConvertido).length;
    
    return {
      // Mostrar el número realmente utilizable (activos de ese curso)
      count: active.length,
      hasContent: totalContent > 0,
      totalCharacters: totalContent,
      convertedCount,
  materials: active.map((m: any) => ({ 
        nombre: m.nombre, 
        tipo: m.tipo, 
        contenido: m.contenido.length,
        fueConvertido: m.fueConvertido,
        nombreOriginal: m.nombreOriginal 
      }))
    };
  };

  const handleQuestionTypeChange = (type: string, checked: boolean) => {
    const updatedTypes = checked
      ? [...formData.tiposPreguntas, type as any]
      : formData.tiposPreguntas.filter(t => t !== type);
    
    setFormData({ ...formData, tiposPreguntas: updatedTypes });
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('exam.selectCourse.help')}
            </Typography>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>{t('exam.selectCourse.courseLabel')}</InputLabel>
              <Select
                value={formData.cursoId}
                label={t('exam.selectCourse.courseLabel')}
                onChange={(e) => handleCourseChange(e.target.value)}
              >
                {availableCourses.map((course) => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {formData.cursoId && (() => {
              const materialsInfo = getMaterialsInfo(formData.cursoId);
              return (
                <Alert 
                  severity={materialsInfo.hasContent ? "success" : "info"} 
                  sx={{ mt: 2 }}
                  action={
                    <Button 
                      color="inherit" 
                      size="small"
                      onClick={() => {
                        // Navegar a la página de cursos donde se pueden subir materiales
                        window.open('/courses', '_blank');
                      }}
                    >
                      {t('exam.material.manage')}
                    </Button>
                  }
                >
                  <AlertTitle>
                    {materialsInfo.hasContent ? t('exam.material.available') : t('exam.material.none')}
                  </AlertTitle>                  {materialsInfo.hasContent ? (
                    <Box>                      <Typography variant="body2">
                        {t('exam.material.files',{count: materialsInfo.count, chars: (materialsInfo.totalCharacters || 0).toLocaleString()})}
                      </Typography>
                      {materialsInfo.convertedCount > 0 && (
                        <Typography variant="body2" sx={{ mt: 0.5, color: 'warning.dark' }}>
                          📄 {t('exam.material.converted',{count: materialsInfo.convertedCount})}
                        </Typography>
                      )}
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>{t('exam.material.usedReal')}</strong>
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      <Typography variant="body2">
                        {t('exam.material.noFiles.line1')}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {t('exam.material.noFiles.line2')}
                      </Typography>
                    </Box>
                  )}
                </Alert>
              );
            })()}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('exam.steps.configure')}
            </Typography>
            
            <Box sx={{ mt: 3 }}>
              <Typography gutterBottom>
                {t('exam.config.numQuestions',{count: formData.numeroPreguntas})}
              </Typography>
              <Slider
                value={formData.numeroPreguntas}
                onChange={(_, value) => setFormData({ ...formData, numeroPreguntas: value as number })}
                min={5}
                max={50}
                marks
                valueLabelDisplay="auto"
              />
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography gutterBottom>{t('exam.config.types')}</Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.tiposPreguntas.includes('multiple')}
                      onChange={(e) => handleQuestionTypeChange('multiple', e.target.checked)}
                    />
                  }
                  label={t('exam.type.multiple')}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.tiposPreguntas.includes('verdadero_falso')}
                      onChange={(e) => handleQuestionTypeChange('verdadero_falso', e.target.checked)}
                    />
                  }
                  label={t('exam.type.verdadero_falso')}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.tiposPreguntas.includes('abierta')}
                      onChange={(e) => handleQuestionTypeChange('abierta', e.target.checked)}
                    />
                  }
                  label={t('exam.type.abierta')}
                />
              </FormGroup>
            </Box>

            <FormControl fullWidth sx={{ mt: 3 }}>
              <InputLabel>{t('exam.config.difficulty')}</InputLabel>
              <Select
                value={formData.dificultad}
                label={t('exam.config.difficulty')}
                onChange={(e) => setFormData({ ...formData, dificultad: e.target.value as any })}
              >
                <MenuItem value="facil">{t('difficulty.facil')}</MenuItem>
                <MenuItem value="medio">{t('difficulty.medio')}</MenuItem>
                <MenuItem value="dificil">{t('difficulty.dificil')}</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label={t('exam.config.duration')}
              type="number"
              value={formData.duracionMinutos}
              onChange={(e) => setFormData({ ...formData, duracionMinutos: parseInt(e.target.value) })}
              sx={{ mt: 3 }}
              InputProps={{ inputProps: { min: 15, max: 240 } }}
            />
          </Box>
        );

      case 2:
        return (
          <Box>
            <Box sx={{ mb: 3 }}>
              <OllamaStatus onStatusChange={setIsOllamaConnected} />
            </Box>

            {!isOllamaConnected ? (
              <Alert severity="warning" sx={{ mb: 3 }}>
                <AlertTitle>{t('exam.status.ollama.unavailable')}</AlertTitle>
                {t('exam.status.ollama.detail')}
              </Alert>
            ) : generationError ? (
              <Alert severity="error" sx={{ mb: 3 }}>
                <AlertTitle>{t('exam.status.error.title')}</AlertTitle>
                {generationError}
              </Alert>
            ) : generatedQuestions.length > 0 ? (
              <Box>
                <Alert severity="success" sx={{ mb: 3 }}>
                  <AlertTitle>{t('exam.generated.success')}</AlertTitle>
                  {t('exam.generated.count',{count: generatedQuestions.length})}
                </Alert>
                <Paper sx={{ p:2, mb:3 }}>
                  <Typography variant="subtitle2" gutterBottom>{t('exam.generated.metadata')}</Typography>
                  <Typography variant="body2"><strong>{t('exam.generated.titleLabel')}</strong> {aiTitulo || t('exam.default.title')}</Typography>
                  <Typography variant="body2" sx={{ whiteSpace:'pre-line' }}><strong>{t('exam.generated.descriptionLabel')}</strong> {aiDescripcion || t('exam.default.description')}</Typography>
                </Paper>
                
                <Typography variant="h6" gutterBottom>
                  {t('exam.questions.title')}
                </Typography>
                
                <List>
                  {generatedQuestions.map((question, index) => (
                    <ListItem key={index} sx={{ mb: 2 }}>
                      <Paper sx={{ p: 2, width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Chip 
                            label={`#${index + 1}`} 
                            color="primary" 
                            size="small" 
                            sx={{ mr: 1 }}
                          />
                          <Chip 
                            label={t(`exam.type.${question.tipo}${question.tipo==='verdadero_falso'?'.short':''}`) || question.tipo} 
                            variant="outlined" 
                            size="small"
                          />
                        </Box>
                        
                        <Typography variant="body1" sx={{ mb: 1, fontWeight: 'medium' }}>
                          {question.pregunta}
                        </Typography>
                        
                        {question.tipo === 'multiple' && question.opciones && (
                          <Box sx={{ ml: 2 }}>
                            {question.opciones.map((opcion, optIndex) => (
                              <Typography 
                                key={optIndex} 
                                variant="body2" 
                                sx={{ 
                                  color: 'text.secondary',
                                  fontWeight: opcion === question.respuestaCorrecta ? 'bold' : 'normal'
                                }}
                              >
                                {String.fromCharCode(65 + optIndex)}. {opcion}
                                {opcion === question.respuestaCorrecta && ' ✓'}
                              </Typography>
                            ))}
                          </Box>
                        )}
                        
                        {question.tipo === 'verdadero_falso' && (
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                            {t('exam.answer.correct')} {question.respuestaCorrecta ? t('label.true') : t('label.false')} ✓
                          </Typography>
                        )}
                        
                        {question.tipo === 'abierta' && (
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                            {t('exam.answer.suggested')} {question.respuestaCorrecta}
                          </Typography>
                        )}
                      </Paper>
                    </ListItem>
                  ))}
                </List>
                
                <Button
                  variant="outlined"
                  onClick={() => {
                    setGeneratedQuestions([]);
                    setActiveStep(0);
                    setGenerationError(null);
                  }}
                  sx={{ mt: 2, mr: 2 }}
                >
                  {t('exam.button.newExam')}
                </Button>
                
                <Button
                  variant="contained"
                  onClick={handleSaveExam}
                  sx={{ mt: 2 }}
                  startIcon={<CheckCircle />}
                  disabled={isSaving}
                >
                  {isSaving ? t('exam.button.generating') : t('exam.button.saveExam')}
                </Button>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center' }}>
                {isGenerating ? (
                  <Box>
                    <CircularProgress size={60} sx={{ mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      {t('exam.status.generating.title')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('exam.status.generating.detail')}
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <Psychology sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />                    <Typography variant="h6" gutterBottom>
                      {t('exam.summary.title')}
                    </Typography>
                    <Paper sx={{ p: 2, mt: 2, textAlign: 'left' }}>
                      <Typography><strong>{t('exam.summary.course')}</strong> {mockCourses.find(c => c.id === formData.cursoId)?.nombre}</Typography>
                      <Typography><strong>{t('exam.summary.questions')}</strong> {formData.numeroPreguntas}</Typography>
                      <Typography><strong>{t('exam.summary.types')}</strong> {formData.tiposPreguntas.map(tp=>t(`exam.type.${tp}.short`)).join(', ')}</Typography>
                      <Typography><strong>{t('exam.summary.difficulty')}</strong> {t(`difficulty.${formData.dificultad}`)}</Typography>
                      <Typography><strong>{t('exam.summary.duration')}</strong> {t('time.minutes',{count: formData.duracionMinutos})}</Typography>
                      
                      {formData.cursoId && (() => {
                        const materialsInfo = getMaterialsInfo(formData.cursoId);
                        return (
                          <Box sx={{ mt: 2, p: 1, bgcolor: materialsInfo.hasContent ? 'success.light' : 'warning.light', borderRadius: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              📚 {t('exam.summary.material')}
                            </Typography>                            {materialsInfo.hasContent ? (
                              <Box>
                                <Typography variant="body2" color="success.dark">
                                  {t('exam.summary.material.files',{count: materialsInfo.count, chars: materialsInfo.totalCharacters})}
                                </Typography>
                                {materialsInfo.convertedCount > 0 && (
                                  <Typography variant="body2" color="warning.dark">
                                    {t('exam.summary.material.converted',{count: materialsInfo.convertedCount})}
                                  </Typography>
                                )}
                                <Typography variant="caption" color="text.secondary">
                                  {t('exam.summary.material.usedReal')}
                                </Typography>
                              </Box>
                            ) : (
                              <Box>
                                <Typography variant="body2" color="warning.dark">
                                  {t('exam.summary.material.none')}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {t('exam.summary.material.generic')}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        );
                      })()}
                    </Paper>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <Card sx={{ maxWidth: 800, mx: 'auto' }}>
        <CardContent sx={{ p: 4 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {stepKeys.map((k) => (
              <Step key={k}>
                <StepLabel>{t(k)}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          <Box sx={{ minHeight: activeStep === 2 ? 'auto' : 300 }}>
            {renderStepContent(activeStep)}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              {t('exam.button.back')}
            </Button>
            {generatedQuestions.length === 0 && (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={
                  (activeStep === 0 && !formData.cursoId) ||
                  (activeStep === 1 && formData.tiposPreguntas.length === 0) ||
                  (activeStep === 2 && (!isOllamaConnected || isGenerating)) ||
                  isGenerating
                }
                startIcon={activeStep === stepKeys.length - 1 ? <Send /> : undefined}
              >
                {activeStep === stepKeys.length - 1 ? (
                  isGenerating ? t('exam.button.generating') : t('exam.button.generate')
                ) : (
                  t('exam.button.next')
                )}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>


      <Snackbar
        open={saveSuccess}
        autoHideDuration={4000}
        onClose={() => setSaveSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSaveSuccess(false)}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {t('exam.save.success')}
        </Alert>
      </Snackbar>

      <Box sx={{ mt: 4, display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Card sx={{ flex: '1 1 300px' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Psychology color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">{t('info.localAI')}</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {t('info.localAI.desc')}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: '1 1 300px' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <School color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">{t('info.personalized')}</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {t('info.personalized.desc')}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: '1 1 300px' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Quiz color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">{t('info.multiFormats')}</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {t('info.multiFormats.desc')}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default ExamGenerator;
