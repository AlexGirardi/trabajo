import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Quiz,
  AutoAwesome,
  School,
  Psychology,
} from '@mui/icons-material';
import type { ExamGenerationRequest } from '../../types';

const steps = ['Seleccionar Curso', 'Configurar Examen', 'Generar con IA'];

const mockCourses = [
  { id: '1', nombre: 'Matemáticas Avanzadas' },
  { id: '2', nombre: 'Historia Contemporánea' },
  { id: '3', nombre: 'Física Cuántica' },
];

export const ExamGenerator: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<ExamGenerationRequest>({
    cursoId: '',
    numeroPreguntas: 10,
    tiposPreguntas: ['multiple'],
    dificultad: 'medio',
    duracionMinutos: 60,
  });

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
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
    console.log('Generating exam with data:', formData);
    
    // Simular generación de examen
    setTimeout(() => {
      setIsGenerating(false);
      alert('¡Examen generado exitosamente!');
    }, 3000);
  };

  const handleCourseChange = (value: string) => {
    setFormData({ ...formData, cursoId: value });
  };

  const handleQuestionTypeChange = (type: string, checked: boolean) => {
    const updatedTypes = checked
      ? [...formData.tiposPreguntas, type as any]
      : formData.tiposPreguntas.filter(t => t !== type);
    
    setFormData({ ...formData, tiposPreguntas: updatedTypes });
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Selecciona el curso para generar el examen
            </Typography>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Curso</InputLabel>
              <Select
                value={formData.cursoId}
                label="Curso"
                onChange={(e) => handleCourseChange(e.target.value)}
              >
                {mockCourses.map((course) => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Configura los parámetros del examen
            </Typography>
            
            <Box sx={{ mt: 3 }}>
              <Typography gutterBottom>
                Número de preguntas: {formData.numeroPreguntas}
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
              <Typography gutterBottom>Tipos de preguntas:</Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.tiposPreguntas.includes('multiple')}
                      onChange={(e) => handleQuestionTypeChange('multiple', e.target.checked)}
                    />
                  }
                  label="Opción múltiple"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.tiposPreguntas.includes('verdadero_falso')}
                      onChange={(e) => handleQuestionTypeChange('verdadero_falso', e.target.checked)}
                    />
                  }
                  label="Verdadero/Falso"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.tiposPreguntas.includes('abierta')}
                      onChange={(e) => handleQuestionTypeChange('abierta', e.target.checked)}
                    />
                  }
                  label="Preguntas abiertas"
                />
              </FormGroup>
            </Box>

            <FormControl fullWidth sx={{ mt: 3 }}>
              <InputLabel>Dificultad</InputLabel>
              <Select
                value={formData.dificultad}
                label="Dificultad"
                onChange={(e) => setFormData({ ...formData, dificultad: e.target.value as any })}
              >
                <MenuItem value="facil">Fácil</MenuItem>
                <MenuItem value="medio">Medio</MenuItem>
                <MenuItem value="dificil">Difícil</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Duración (minutos)"
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
          <Box sx={{ textAlign: 'center' }}>
            {isGenerating ? (
              <Box>
                <CircularProgress size={60} sx={{ mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Generando examen con IA...
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Esto puede tomar unos momentos
                </Typography>
              </Box>
            ) : (
              <Box>
                <Psychology sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Resumen del examen
                </Typography>
                <Paper sx={{ p: 2, mt: 2, textAlign: 'left' }}>
                  <Typography><strong>Curso:</strong> {mockCourses.find(c => c.id === formData.cursoId)?.nombre}</Typography>
                  <Typography><strong>Preguntas:</strong> {formData.numeroPreguntas}</Typography>
                  <Typography><strong>Tipos:</strong> {formData.tiposPreguntas.join(', ')}</Typography>
                  <Typography><strong>Dificultad:</strong> {formData.dificultad}</Typography>
                  <Typography><strong>Duración:</strong> {formData.duracionMinutos} minutos</Typography>
                </Paper>
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
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <AutoAwesome sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Generar Examen con IA
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Crea exámenes personalizados usando inteligencia artificial
          </Typography>
        </Box>
      </Box>

      <Card sx={{ maxWidth: 800, mx: 'auto' }}>
        <CardContent sx={{ p: 4 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ minHeight: 300 }}>
            {renderStepContent(activeStep)}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Atrás
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={
                (activeStep === 0 && !formData.cursoId) ||
                (activeStep === 1 && formData.tiposPreguntas.length === 0) ||
                isGenerating
              }
              startIcon={activeStep === steps.length - 1 ? <Quiz /> : undefined}
            >
              {activeStep === steps.length - 1 ? 'Generar Examen' : 'Siguiente'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Información adicional */}
      <Box sx={{ mt: 4, display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Card sx={{ flex: '1 1 300px' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <School color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Materiales del Curso</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              La IA analizará todos los materiales subidos en el curso seleccionado para generar preguntas relevantes.
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: '1 1 300px' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Psychology color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">IA Avanzada</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Utilizamos modelos de IA de última generación para crear preguntas de alta calidad adaptadas al contenido.
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: '1 1 300px' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Quiz color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Personalización</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Configura el número de preguntas, tipos, dificultad y duración según tus necesidades.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};
