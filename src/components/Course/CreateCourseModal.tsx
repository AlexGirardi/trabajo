import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  PictureAsPdf,
  Link,
} from '@mui/icons-material';
import type { Course } from '../../types';

interface CreateCourseModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (course: Omit<Course, 'id'>) => void;
}

interface Material {
  id: string;
  nombre: string;
  tipo: 'documento' | 'enlace' | 'texto';
  contenido?: string;
  url?: string;
}

const categorias = [
  'Matemáticas',
  'Ciencias',
  'Historia',
  'Literatura',
  'Idiomas',
  'Informática',
  'Arte',
  'Música',
  'Filosofía',
  'Derecho',
  'Medicina',
  'Ingeniería',
  'Otros'
];

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
    categoria: '',
    semestre: '',
    profesor: '',
    color: coloresDisponibles[0],
  });

  const [materiales, setMateriales] = useState<Material[]>([]);  const [nuevoMaterial, setNuevoMaterial] = useState<{
    nombre: string;
    tipo: 'documento' | 'enlace' | 'texto';
    contenido: string;
    url: string;
  }>({
    nombre: '',
    tipo: 'documento',
    contenido: '',
    url: '',
  });
  const [tags, setTags] = useState<string[]>([]);
  const [nuevoTag, setNuevoTag] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
  };

  const handleAddMaterial = () => {
    if (nuevoMaterial.nombre.trim()) {
      const material: Material = {
        id: Date.now().toString(),
        nombre: nuevoMaterial.nombre,
        tipo: nuevoMaterial.tipo,
        contenido: nuevoMaterial.tipo === 'texto' ? nuevoMaterial.contenido : undefined,
        url: nuevoMaterial.tipo === 'enlace' ? nuevoMaterial.url : undefined,
      };
      
      setMateriales(prev => [...prev, material]);
      setNuevoMaterial({
        nombre: '',
        tipo: 'documento',
        contenido: '',
        url: '',
      });
    }
  };

  const handleRemoveMaterial = (materialId: string) => {
    setMateriales(prev => prev.filter(material => material.id !== materialId));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del curso es obligatorio';
    }
    if (!formData.categoria) {
      newErrors.categoria = 'La categoría es obligatoria';
    }
    if (!formData.profesor.trim()) {
      newErrors.profesor = 'El nombre del profesor es obligatorio';
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
      categoria: formData.categoria,
      fechaCreacion: new Date(),
      profesor: formData.profesor,
      semestre: formData.semestre,
      color: formData.color,
      tags: tags,
      materialesCount: materiales.length,
      // Los materiales se guardarían por separado en una implementación real
    };

    onSave(nuevoCurso);
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
      categoria: '',
      semestre: '',
      profesor: '',
      color: coloresDisponibles[0],
    });
    setMateriales([]);
    setTags([]);
    setNuevoTag('');
    setNuevoMaterial({
      nombre: '',
      tipo: 'documento',
      contenido: '',
      url: '',
    });
    setErrors({});
    setShowSuccess(false);
    onClose();
  };

  const getMaterialIcon = (tipo: string) => {
    switch (tipo) {
      case 'documento': return <Description />;
      case 'enlace': return <Link />;
      case 'texto': return <PictureAsPdf />;
      default: return <Description />;
    }
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
              <FormControl fullWidth required error={!!errors.categoria}>
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={formData.categoria}
                  label="Categoría"
                  onChange={(e) => handleInputChange('categoria', e.target.value)}
                >
                  {categorias.map((categoria) => (
                    <MenuItem key={categoria} value={categoria}>
                      {categoria}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
              <TextField
                label="Profesor"
                value={formData.profesor}
                onChange={(e) => handleInputChange('profesor', e.target.value)}
                fullWidth
                required
                error={!!errors.profesor}
                helperText={errors.profesor}
              />
              <TextField
                label="Semestre/Período"
                value={formData.semestre}
                onChange={(e) => handleInputChange('semestre', e.target.value)}
                fullWidth
                placeholder="Ej: 2024-1, Primavera 2024..."
              />
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
          </Paper>

          {/* Materiales */}
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Materiales del Curso
            </Typography>
            
            {/* Formulario para agregar material */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  label="Nombre del material"
                  value={nuevoMaterial.nombre}
                  onChange={(e) => setNuevoMaterial(prev => ({ ...prev, nombre: e.target.value }))}
                  size="small"
                  sx={{ flex: 1 }}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={nuevoMaterial.tipo}
                    label="Tipo"
                    onChange={(e) => setNuevoMaterial(prev => ({ 
                      ...prev, 
                      tipo: e.target.value as 'documento' | 'enlace' | 'texto' 
                    }))}
                  >
                    <MenuItem value="documento">Documento</MenuItem>
                    <MenuItem value="enlace">Enlace</MenuItem>
                    <MenuItem value="texto">Texto</MenuItem>
                  </Select>
                </FormControl>
                <Button 
                  variant="outlined" 
                  onClick={handleAddMaterial}
                  disabled={!nuevoMaterial.nombre.trim()}
                  startIcon={<Add />}
                >
                  Agregar
                </Button>
              </Box>

              {/* Campos adicionales según el tipo */}
              {nuevoMaterial.tipo === 'enlace' && (
                <TextField
                  label="URL del enlace"
                  value={nuevoMaterial.url}
                  onChange={(e) => setNuevoMaterial(prev => ({ ...prev, url: e.target.value }))}
                  size="small"
                  placeholder="https://..."
                />
              )}
              
              {nuevoMaterial.tipo === 'texto' && (
                <TextField
                  label="Contenido del texto"
                  value={nuevoMaterial.contenido}
                  onChange={(e) => setNuevoMaterial(prev => ({ ...prev, contenido: e.target.value }))}
                  multiline
                  rows={3}
                  placeholder="Escribe o pega el contenido aquí..."
                />
              )}
            </Box>

            {/* Lista de materiales agregados */}
            {materiales.length > 0 && (
              <List>
                {materiales.map((material) => (
                  <ListItem key={material.id}>
                    <Box sx={{ mr: 2 }}>
                      {getMaterialIcon(material.tipo)}
                    </Box>
                    <ListItemText
                      primary={material.nombre}
                      secondary={`Tipo: ${material.tipo}`}
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
        </Button>
      </DialogActions>
    </Dialog>
  );
};
