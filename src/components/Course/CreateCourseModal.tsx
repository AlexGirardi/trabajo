import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Chip,
  Typography,
  Alert,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Close,
  Add,
  Delete,
  Description,
} from '@mui/icons-material';
import { UploadMaterialModal } from './UploadMaterialModal';
import { materialService } from '../../services/materialService';
import type { Course, Material as MaterialType } from '../../types';

interface CreateCourseModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (course: Omit<Course, 'id'>) => Course;
}

interface Material {
  id: string;
  nombre: string;
  nombreOriginal: string;
  tipo: string;
  tipoOriginal: string;
  contenido: string;
  tamaño: number;
  fueConvertido: boolean;
}

const coloresDisponibles = [
  '#1976d2', '#388e3c', '#f57c00', '#d32f2f',
  '#7b1fa2', '#0288d1', '#c2185b', '#5d4037',
  '#455a64', '#e64a19', '#303f9f', '#00796b'
];

export const CreateCourseModal: React.FC<CreateCourseModalProps> = ({
  open,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    color: coloresDisponibles[0],
  });
  const [materiales, setMateriales] = useState<Material[]>([]);  const [tags, setTags] = useState<string[]>([]);
  const [nuevoTag, setNuevoTag] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [tempCourseId, setTempCourseId] = useState<string>('');

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAddTag = () => {
    if (nuevoTag.trim() && !tags.includes(nuevoTag.trim())) {
      setTags(prev => [...prev, nuevoTag.trim()]);
      setNuevoTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };  const handleAddMaterial = () => {
    // Necesitamos crear un curso temporal para poder usar el modal de subida
    if (!tempCourseId) {
      const tempId = 'temp-' + Date.now();
      setTempCourseId(tempId);
    }
    setUploadModalOpen(true);
  };

  const handleMaterialUploaded = (material: MaterialType) => {
    const newMaterial: Material = {
      id: material.id,
      nombre: material.nombre,
      nombreOriginal: material.nombreOriginal || material.nombre,
      tipo: material.tipo,
      tipoOriginal: material.tipoOriginal || material.tipo,
      contenido: material.contenido || '',
      tamaño: material.tamaño || 0,
      fueConvertido: material.fueConvertido || false,
    };
    setMateriales(prev => [...prev, newMaterial]);
  };

  const handleRemoveMaterial = (materialId: string) => {
    setMateriales(prev => prev.filter(material => material.id !== materialId));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del curso es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const nuevoCurso: Omit<Course, 'id'> = {
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      categoria: 'General', // Valor por defecto
      fechaCreacion: new Date(),
      profesor: 'Sin especificar', // Valor por defecto
      semestre: '', // Valor por defecto
      color: formData.color,
      tags: tags,
      materialesCount: materiales.length,
      examenesCount: 0,
    };

    // Primero guardar el curso para obtener su ID
    const cursoGuardado = onSave(nuevoCurso);
      // Si hay materiales, guardarlos con el ID del curso
    if (materiales.length > 0 && cursoGuardado) {
      materiales.forEach(material => {
        materialService.saveMaterial({
          nombre: material.nombre,
          nombreOriginal: material.nombreOriginal,
          tipo: material.tipo as 'pdf' | 'texto' | 'documento',
          tipoOriginal: material.tipoOriginal,
          contenido: material.contenido,
          cursoId: cursoGuardado.id,
          tamaño: material.tamaño,
          fueConvertido: material.fueConvertido,
        });
      });
    }
    
    setShowSuccess(true);
    
    // Cerrar modal después de un momento
    setTimeout(() => {
      setShowSuccess(false);
      handleClose();
    }, 1500);
  };

  const handleClose = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      color: coloresDisponibles[0],
    });    setMateriales([]);
    setTags([]);
    setNuevoTag('');
    setErrors({});
    setShowSuccess(false);
    onClose();
  };
  const getMaterialIcon = () => {
    return <Description />;
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" fontWeight="bold">
            Crear Nuevo Curso
          </Typography>
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {showSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            ¡Curso creado exitosamente!
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Información Básica */}
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Información Básica
            </Typography>
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
                  placeholder="Describe brevemente el contenido del curso..."
                />
              </Box>
            </Box>
          </Paper>

          {/* Color del Curso */}
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Color del Curso
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {coloresDisponibles.map((color) => (
                <Box
                  key={color}
                  onClick={() => handleInputChange('color', color)}
                  sx={{
                    width: 40,
                    height: 40,
                    backgroundColor: color,
                    borderRadius: '50%',
                    cursor: 'pointer',
                    border: formData.color === color ? '3px solid #000' : '2px solid transparent',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    }
                  }}
                />
              ))}
            </Box>
          </Paper>

          {/* Tags */}
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Etiquetas
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                label="Nueva etiqueta"
                value={nuevoTag}
                onChange={(e) => setNuevoTag(e.target.value)}
                size="small"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button 
                variant="outlined" 
                onClick={handleAddTag}
                disabled={!nuevoTag.trim()}
              >
                <Add />
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Paper>          {/* Materiales */}
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Materiales del Curso
            </Typography>
            
            {/* Botón para agregar material */}
            <Box sx={{ mb: 2 }}>
              <Button 
                variant="outlined" 
                onClick={handleAddMaterial}
                startIcon={<Add />}
                size="large"
              >
                Agregar Archivos
              </Button>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Selecciona archivos PDF, TXT, MD, DOC o DOCX
              </Typography>
            </Box>

            {/* Lista de materiales agregados */}
            {materiales.length > 0 && (
              <List>
                {materiales.map((material) => (
                  <ListItem key={material.id}>
                    <Box sx={{ mr: 2 }}>
                      {getMaterialIcon()}
                    </Box>                    <ListItemText
                      primary={material.nombre}
                      secondary={`${material.fueConvertido ? 'PDF → TXT' : material.tipo.toUpperCase()} • ${(material.tamaño / 1024).toFixed(1)} KB`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end" 
                        onClick={() => handleRemoveMaterial(material.id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={handleClose} size="large">
          Cancelar
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSave}
          size="large"
          disabled={showSuccess}
        >
          {showSuccess ? 'Guardando...' : 'Crear Curso'}
        </Button>      </DialogActions>

      {/* Modal de subida de material */}
      {tempCourseId && (
        <UploadMaterialModal
          open={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          cursoId={tempCourseId}
          cursoNombre={formData.nombre || 'Nuevo Curso'}
          onMaterialUploaded={handleMaterialUploaded}
        />
      )}
    </Dialog>
  );
};
