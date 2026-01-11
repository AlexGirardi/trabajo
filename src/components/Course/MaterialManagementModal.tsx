import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Switch,
  Chip,
  Alert,
  Divider,
  Paper,
  FormControlLabel,
} from '@mui/material';
import {
  Close,
  Description,
  PictureAsPdf,
  Delete,
  TextSnippet,
  Visibility,
  VisibilityOff,
  CloudUpload,
} from '@mui/icons-material';
import { materialService } from '../../services/materialService';
import { useHybridResource } from '../../hooks/useHybridResource';
import { UploadMaterialModal } from './UploadMaterialModal';
import type { Material } from '../../types';

interface MaterialManagementModalProps {
  open: boolean;
  onClose: () => void;
  cursoId: string;
  cursoNombre: string;
  onMaterialsChanged?: () => void;
}

export const MaterialManagementModal: React.FC<MaterialManagementModalProps> = ({
  open,
  onClose,
  cursoId,
  cursoNombre,
  onMaterialsChanged,
}) => {
  // Memoized providers to avoid recreating functions each render (prevents reload loop)
  const fetcher = useCallback(() => materialService.fetchMaterials?.().then(list => list.filter(m => m.cursoId === cursoId)), [cursoId]);
  const localFn = useCallback(() => materialService.getMaterialsByCourse(cursoId), [cursoId]);
  const { data: materials, loading, error, reload: reloadMaterials, mutate, backgroundSync } = useHybridResource<Material[]>({
    fetcher,
    local: localFn,
    deps: [cursoId, open],
    auto: open
  });
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [alert, setAlert] = useState<{ type: 'error', message: string } | null>(null);

  // Refresco explícito solo cuando se abre (evitamos dependencia en reloadMaterials para no disparar bucles)
  useEffect(() => {
    if (open) reloadMaterials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleDeleteMaterial = (materialId: string, materialName: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${materialName}"?`)) {
      const success = materialService.deleteMaterial(materialId);
      if (success) {
        mutate(prev => prev.filter(m => m.id !== materialId)); // optimistic
  // no success toast
  setTimeout(() => { if (open) backgroundSync(); }, 700); // delayed sync sin flicker
        onMaterialsChanged?.();
    if (open) {
      // slight delay so optimistic state shows first
      setTimeout(() => reloadMaterials(), 50);
    }
        
        // Limpiar alerta después de 3 segundos
        setTimeout(() => setAlert(null), 3000);
      } else {
  setAlert({ type: 'error', message: 'Error al eliminar el material' });
      }
    }
  };

  const handleToggleActive = (materialId: string) => {
    const updated = materialService.toggleMaterialActive(materialId);
    if (!updated) {
  setAlert({ type: 'error', message: 'Error al cambiar el estado del material' });
      return;
    }
    // Optimistic toggle (instant UI)
    mutate(prev => prev.map(m => m.id === materialId ? { ...m, activo: updated.activo } : m));
    onMaterialsChanged?.();
  // no success toast
    // Delay background sync to let server persist first and avoid flicker
  setTimeout(() => { if (open) backgroundSync(); }, 600);
  };

  const getMaterialIcon = (material: Material) => {
    if (material.fueConvertido || material.tipoOriginal === 'application/pdf') {
      return <PictureAsPdf color={material.activo !== false ? 'warning' : 'disabled'} />;
    }
    if (material.tipo === 'texto') {
      return <TextSnippet color={material.activo !== false ? 'primary' : 'disabled'} />;
    }
    return <Description color={material.activo !== false ? 'primary' : 'disabled'} />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const activeMaterials = materials.filter(m => m.activo !== false);
  const inactiveMaterials = materials.filter(m => m.activo === false);

  const handleMaterialUploaded = (material: Material) => {
    // Optimistic append
    mutate(prev => [...prev, material]);
    onMaterialsChanged?.();
    setUploadModalOpen(false);
    // Silent background sync to reconcile phantom ids
    setTimeout(() => { if (open) backgroundSync(); }, 500);
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { maxHeight: '90vh' }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" fontWeight="bold">
              Gestionar Materiales - {cursoNombre}
            </Typography>
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {alert && (
            <Alert severity={alert.type} sx={{ mb: 2 }}>
              {alert.message}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>
          )}
          {loading && (
            <Alert severity="info" sx={{ mb:2 }}>Cargando materiales...</Alert>
          )}

          {/* Botón para agregar más materiales */}
          <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Total de materiales: {materials.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {activeMaterials.length} activos • {inactiveMaterials.length} inactivos
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<CloudUpload />}
                onClick={() => setUploadModalOpen(true)}
              >
                Agregar Material
              </Button>
            </Box>
          </Paper>

          {materials.length === 0 ? (
            <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
              <Description sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No hay materiales en este curso
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Comienza agregando archivos PDF, documentos de texto o enlaces
              </Typography>
              <Button
                variant="outlined"
                startIcon={<CloudUpload />}
                onClick={() => setUploadModalOpen(true)}
              >
                Subir Primer Material
              </Button>
            </Paper>
          ) : (
            <>
              {/* Materiales Activos */}
              {activeMaterials.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Visibility sx={{ mr: 1, color: 'success.main' }} />
                    <Typography variant="h6" color="success.main">
                      Materiales Activos ({activeMaterials.length})
                    </Typography>
                  </Box>
                  <Paper elevation={1}>
                    <List>
                      {activeMaterials.map((material, index) => (
                        <React.Fragment key={material.id}>
                          <ListItem>
                            <ListItemIcon>
                              {getMaterialIcon(material)}
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {material.nombre}
                                  {material.fueConvertido && (
                                    <Chip
                                      label="PDF → TXT"
                                      size="small"
                                      color="warning"
                                      variant="outlined"
                                    />
                                  )}
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    {material.tipo.toUpperCase()} • {formatFileSize(material.tamaño)}
                                    {material.nombreOriginal && ` • Original: ${material.nombreOriginal}`}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Subido: {material.fechaSubida.toLocaleDateString('es-ES')}
                                  </Typography>
                                </Box>
                              }
                            />
                            <ListItemSecondaryAction>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={material.activo !== false}
                                      onChange={() => handleToggleActive(material.id)}
                                      color="success"
                                    />
                                  }
                                  label="Activo"
                                />
                                <IconButton
                                  edge="end"
                                  onClick={() => handleDeleteMaterial(material.id, material.nombre)}
                                  color="error"
                                >
                                  <Delete />
                                </IconButton>
                              </Box>
                            </ListItemSecondaryAction>
                          </ListItem>
                          {index < activeMaterials.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </Paper>
                </Box>
              )}

              {/* Materiales Inactivos */}
              {inactiveMaterials.length > 0 && (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <VisibilityOff sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="h6" color="text.secondary">
                      Materiales Inactivos ({inactiveMaterials.length})
                    </Typography>
                  </Box>
                  <Paper elevation={1} sx={{ opacity: 0.7 }}>
                    <List>
                      {inactiveMaterials.map((material, index) => (
                        <React.Fragment key={material.id}>
                          <ListItem>
                            <ListItemIcon>
                              {getMaterialIcon(material)}
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <span style={{ textDecoration: 'line-through' }}>
                                    {material.nombre}
                                  </span>
                                  {material.fueConvertido && (
                                    <Chip
                                      label="PDF → TXT"
                                      size="small"
                                      color="default"
                                      variant="outlined"
                                    />
                                  )}
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    {material.tipo.toUpperCase()} • {formatFileSize(material.tamaño)}
                                    {material.nombreOriginal && ` • Original: ${material.nombreOriginal}`}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Subido: {material.fechaSubida.toLocaleDateString('es-ES')}
                                  </Typography>
                                </Box>
                              }
                            />
                            <ListItemSecondaryAction>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={material.activo !== false}
                                      onChange={() => handleToggleActive(material.id)}
                                      color="success"
                                    />
                                  }
                                  label="Activo"
                                />
                                <IconButton
                                  edge="end"
                                  onClick={() => handleDeleteMaterial(material.id, material.nombre)}
                                  color="error"
                                >
                                  <Delete />
                                </IconButton>
                              </Box>
                            </ListItemSecondaryAction>
                          </ListItem>
                          {index < inactiveMaterials.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </Paper>
                </Box>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} size="large">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para subir nuevos materiales */}
      <UploadMaterialModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        cursoId={cursoId}
        cursoNombre={cursoNombre}
        onMaterialUploaded={handleMaterialUploaded}
      />
    </>
  );
};
