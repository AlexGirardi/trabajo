import React, { useState, useEffect } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  LinearProgress,
  Typography,
  Link,
} from '@mui/material';
import {
  CheckCircle,
  Refresh,
  Download,
} from '@mui/icons-material';
import { ollamaClient } from '../../services/ollamaClient';

interface OllamaStatusProps {
  onStatusChange?: (isConnected: boolean) => void;
}

export const OllamaStatus: React.FC<OllamaStatusProps> = ({ onStatusChange }) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [models, setModels] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const connected = await ollamaClient.checkHealth();
      setIsConnected(connected);
      
      if (connected) {
        const availableModels = await ollamaClient.listModels();
        setModels(availableModels);
      } else {
        setModels([]);
      }
      
      onStatusChange?.(connected);
    } catch (error) {
      setIsConnected(false);
      setModels([]);
      onStatusChange?.(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  if (isChecking) {
    return (
      <Box sx={{ mb: 2 }}>
        <LinearProgress sx={{ mb: 1 }} />
        <Typography variant="body2" color="text.secondary">
          Verificando conexión con Ollama...
        </Typography>
      </Box>
    );
  }

  if (isConnected === null) {
    return null;
  }

  if (!isConnected) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        <AlertTitle>Ollama no está disponible</AlertTitle>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Para usar la generación de exámenes con IA, necesitas tener Ollama ejecutándose localmente.
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Pasos para configurar:
          </Typography>
          <Typography variant="body2" component="div">
            1. Descarga Ollama desde{' '}
            <Link href="https://ollama.ai/" target="_blank" rel="noopener">
              https://ollama.ai/
            </Link>
          </Typography>
          <Typography variant="body2">
            2. Instala y ejecuta Ollama
          </Typography>
          <Typography variant="body2">
            3. Descarga un modelo: <code>ollama pull llama3.1:8b</code>
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Refresh />}
            onClick={checkStatus}
          >
            Verificar de nuevo
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<Download />}
            href="https://ollama.ai/"
            target="_blank"
          >
            Descargar Ollama
          </Button>
        </Box>
      </Alert>
    );
  }

  return (
    <Alert severity="success" sx={{ mb: 2 }}>
      <AlertTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircle fontSize="small" />
          Ollama conectado correctamente
        </Box>
      </AlertTitle>
      
      <Typography variant="body2" sx={{ mb: 1 }}>
        IA local disponible para generar exámenes
      </Typography>
      
      {models.length > 0 && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Modelos disponibles:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {models.map((model) => (
              <Chip
                key={model}
                label={model}
                size="small"
                variant="outlined"
                color="primary"
              />
            ))}
          </Box>
        </Box>
      )}
      
      <Button
        size="small"
        variant="outlined"
        startIcon={<Refresh />}
        onClick={checkStatus}
        sx={{ mt: 1 }}
      >
        Actualizar
      </Button>
    </Alert>
  );
};
