import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Alert,
  Chip,
  Paper,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import type { Course } from '../../types';

interface EditCourseModalProps {
  open: boolean;
  course: Course | null;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Course>) => Course | null;
}

const coloresDisponibles = [
  '#1976d2', '#388e3c', '#f57c00', '#d32f2f',
  '#7b1fa2', '#0288d1', '#c2185b', '#5d4037',
  '#455a64', '#e64a19', '#303f9f', '#00796b'
];

export const EditCourseModal: React.FC<EditCourseModalProps> = ({
  open,
  course,
  onClose,
  onUpdate,
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    color: coloresDisponibles[0],
  });
  const [tags, setTags] = useState<string[]>([]);
  const [nuevoTag, setNuevoTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (course) {
      setFormData({
        nombre: course.nombre || '',
        descripcion: course.descripcion || '',
        color: course.color || coloresDisponibles[0],
      });
      setTags(course.tags || []);
      setErrors({});
      setShowSuccess(false);
      setNuevoTag('');
    }
  }, [course, open]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const n = { ...prev }; delete n[field]; return n;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!course) return;
    if (!validate()) return;
    const updated = onUpdate(course.id, {
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion.trim(),
      color: formData.color,
      tags: tags,
    });
    if (updated) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 1200);
    }
  };

  const handleAddTag = () => {
    if (nuevoTag.trim() && !tags.includes(nuevoTag.trim())) {
      setTags(prev => [...prev, nuevoTag.trim()]);
      setNuevoTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(t => t !== tagToRemove));
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth PaperProps={{ sx: { minHeight: '70vh' } }}>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" fontWeight="bold">Editar Curso</Typography>
          <IconButton onClick={handleClose}><Close /></IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {showSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>¡Curso actualizado!</Alert>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom color="primary">Información Básica</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
              <TextField
                label="Nombre del Curso"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                fullWidth
                required
                error={!!errors.nombre}
                helperText={errors.nombre}
              />
              <Box sx={{ gridColumn: '1 / -1' }}>
                <TextField
                  label="Descripción"
                  value={formData.descripcion}
                  onChange={(e) => handleInputChange('descripcion', e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Actualiza la descripción del curso..."
                />
              </Box>
            </Box>
          </Paper>

          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom color="primary">Color del Curso</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {coloresDisponibles.map(color => (
                <Box
                  key={color}
                  onClick={() => handleInputChange('color', color)}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: color,
                    cursor: 'pointer',
                    border: formData.color === color ? '3px solid #000' : '2px solid transparent',
                    transition: 'all .2s',
                    '&:hover': { transform: 'scale(1.1)' }
                  }}
                />
              ))}
            </Box>
          </Paper>

            <Paper elevation={1} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom color="primary">Etiquetas</Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  label="Nueva etiqueta"
                  value={nuevoTag}
                  onChange={(e) => setNuevoTag(e.target.value)}
                  size="small"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                />
                <Button variant="outlined" disabled={!nuevoTag.trim()} onClick={handleAddTag}>Añadir</Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {tags.map(tag => (
                  <Chip key={tag} label={tag} onDelete={() => handleRemoveTag(tag)} color="primary" variant="outlined" />
                ))}
              </Box>
            </Paper>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={handleClose} size="large">Cancelar</Button>
        <Button variant="contained" size="large" onClick={handleSave} disabled={showSuccess || !course}>Guardar Cambios</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditCourseModal;
