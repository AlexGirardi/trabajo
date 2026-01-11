import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Save, Quiz } from '@mui/icons-material';
import type { Question } from '../../types';

interface SaveExamModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (titulo: string, descripcion: string) => Promise<void>;
  questions: Question[];
  courseName: string;
  duracionMinutos: number;
  loading?: boolean;
}

export const SaveExamModal: React.FC<SaveExamModalProps> = ({
  open,
  onClose,
  onSave,
  questions,
  courseName,
  duracionMinutos,
  loading = false,
}) => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!titulo.trim()) {
      setError('El título es obligatorio');
      return;
    }

    try {
      setError(null);
      await onSave(titulo.trim(), descripcion.trim());
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el examen');
    }
  };

  const handleClose = () => {
    setTitulo('');
    setDescripcion('');
    setError(null);
    onClose();
  };

  const puntuacionTotal = questions.reduce((total, q) => total + q.puntos, 0);
  const tiposPreguntas = [...new Set(questions.map(q => q.tipo))];

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Quiz color="primary" sx={{ mr: 1 }} />
          Guardar Examen Generado
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Configura los detalles del examen antes de guardarlo
          </Typography>
          
          {/* Resumen del examen */}
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Curso:</strong> {courseName}<br/>
              <strong>Preguntas:</strong> {questions.length}<br/>
              <strong>Duración:</strong> {duracionMinutos} minutos<br/>
              <strong>Puntuación total:</strong> {puntuacionTotal} puntos
            </Typography>
          </Alert>

          <Box sx={{ mt: 2, mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Tipos de preguntas:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {tiposPreguntas.map(tipo => (
                <Chip 
                  key={tipo}
                  label={tipo === 'multiple' ? 'Opción múltiple' : 
                        tipo === 'verdadero_falso' ? 'Verdadero/Falso' : 
                        'Pregunta abierta'}
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Título del examen"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ej: Examen Parcial - Capítulo 1"
          margin="normal"
          required
          error={!!error && !titulo.trim()}
        />

        <TextField
          fullWidth
          label="Descripción (opcional)"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Describe brevemente el contenido del examen"
          margin="normal"
          multiline
          rows={3}
        />
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button 
          onClick={handleClose}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading || !titulo.trim()}
          startIcon={loading ? <CircularProgress size={16} /> : <Save />}
        >
          {loading ? 'Guardando...' : 'Guardar Examen'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
