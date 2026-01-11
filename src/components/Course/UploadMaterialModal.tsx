import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  CloudUpload,
  Description,
  PictureAsPdf,
  Delete,
  CheckCircle,
} from '@mui/icons-material';
import { materialService } from '../../services/materialService';
import type { Material } from '../../types';

interface UploadMaterialModalProps {
  open: boolean;
  onClose: () => void;
  cursoId: string;
  cursoNombre: string;
  onMaterialUploaded?: (material: Material) => void;
}

export const UploadMaterialModal: React.FC<UploadMaterialModalProps> = ({
  open,
  onClose,
  cursoId,
  cursoNombre,
  onMaterialUploaded,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  // removed success banner (UI updates optimistically in parent)

  const acceptedFileTypes = [
    'text/plain',
    'application/pdf',
    'text/markdown',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      addFiles(files);
    }
  };

  const addFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError(`El archivo ${file.name} es demasiado grande (máximo 10MB)`);
        return false;
      }
      
      if (!acceptedFileTypes.includes(file.type) && !file.name.endsWith('.md') && !file.name.endsWith('.txt')) {
        setError(`Tipo de archivo no soportado: ${file.name}`);
        return false;
      }
      
      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
    setError(null);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;    setUploading(true);
    setError(null);
  //
    setUploadProgress(0);

    try {
      let filesConverted = 0;
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        // Simular progreso
        setUploadProgress((i / selectedFiles.length) * 100);

        try {
          const processResult = await materialService.processFile(file);
          
          const materialData = {
            nombre: processResult.nombre, // Usar el nombre procesado (puede ser convertido)
            nombreOriginal: processResult.nombreOriginal,
            tipo: processResult.tipo, // Usar el tipo procesado
            tipoOriginal: processResult.tipoOriginal,
            contenido: processResult.contenido,
            cursoId,
            tamaño: processResult.tamaño,
            fueConvertido: processResult.fueConvertido,
          };

          // Contar archivos convertidos
          if (processResult.fueConvertido) {
            filesConverted++;
          }

          const savedMaterial = materialService.saveMaterial(materialData);
          const USE_API = (import.meta as any).env?.VITE_USE_API === 'true';
          if (USE_API && materialService.fetchMaterials) {
            try { await materialService.fetchMaterials(); } catch {}
          }
          
          if (onMaterialUploaded) {
            onMaterialUploaded(savedMaterial);
          }
        } catch (fileError) {
          console.error(`Error processing file ${file.name}:`, fileError);
          setError(`Error procesando ${file.name}: ${fileError instanceof Error ? fileError.message : 'Error desconocido'}`);
          return; // Salir del bucle en caso de error
        }
      }      setUploadProgress(100);
      
      let successMessage = `Se subieron ${selectedFiles.length} archivo(s) correctamente`;
      if (filesConverted > 0) {
        successMessage += `. ${filesConverted} PDF(s) convertido(s) a texto.`;
      }
      
  // skip success message
      const USE_API = (import.meta as any).env?.VITE_USE_API === 'true';
      if (USE_API && materialService.fetchMaterials) {
        try { await materialService.fetchMaterials(); } catch {}
      }
      setSelectedFiles([]);      // Cerrar modal después de un breve delay
  // Close immediately after upload completes
  onClose();
  setUploadProgress(0);

    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido al subir archivos');
    } finally {
      setUploading(false);
    }
  };
  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') return <PictureAsPdf color="error" />;
    return <Description color="primary" />;
  };

  const getFileTypeDisplay = (file: File) => {
    if (file.type === 'application/pdf') return 'PDF → TXT';
    if (file.type.includes('text/') || file.name.endsWith('.md') || file.name.endsWith('.txt')) return 'TEXTO';
    return 'DOCUMENTO';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };  const handleClose = () => {
    if (!uploading) {
      setSelectedFiles([]);
      setError(null);
  //
      setUploadProgress(0);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Subir Material - {cursoNombre}
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
  {/* success alert removed */}

        {uploading && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Subiendo archivos...
            </Typography>
            <LinearProgress variant="determinate" value={uploadProgress} />
          </Box>
        )}

        {/* Zona de drop */}
        <Paper
          sx={{
            border: '2px dashed',
            borderColor: dragOver ? 'primary.main' : 'grey.300',
            backgroundColor: dragOver ? 'action.hover' : 'background.paper',
            p: 4,
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            mb: 2,
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="h6" gutterBottom>
            Arrastra archivos aquí o haz clic para seleccionar
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Formatos soportados: PDF, TXT, MD, DOC, DOCX (máximo 10MB)
          </Typography>
          
          <input
            id="file-input"
            type="file"
            multiple
            accept=".pdf,.txt,.md,.doc,.docx"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
        </Paper>

        {/* Lista de archivos seleccionados */}
        {selectedFiles.length > 0 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Archivos seleccionados ({selectedFiles.length})
            </Typography>
            <List>
              {selectedFiles.map((file, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    {getFileIcon(file)}
                  </ListItemIcon>                  <ListItemText
                    primary={file.name}
                    secondary={formatFileSize(file.size)}
                  />
                  <Chip
                    label={getFileTypeDisplay(file)}
                    size="small"
                    variant="outlined"
                    color={file.type === 'application/pdf' ? 'warning' : 'default'}
                    sx={{ mr: 1 }}
                  />
                  <IconButton
                    edge="end"
                    onClick={() => removeFile(index)}
                    disabled={uploading}
                  >
                    <Delete />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={uploading}>
          Cancelar
        </Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          disabled={selectedFiles.length === 0 || uploading}
          startIcon={uploading ? <CheckCircle /> : <CloudUpload />}
        >
          {uploading ? 'Subiendo...' : `Subir ${selectedFiles.length} archivo(s)`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
