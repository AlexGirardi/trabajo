import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  Save,
  AccountCircle,
  Notifications,
  Security,
  Palette,
  PhotoCamera,
} from '@mui/icons-material';

const SettingsPage: React.FC = () => {
  const [userSettings, setUserSettings] = useState({
    nombre: 'Juan Pérez',
    email: 'juan.perez@email.com',
    idioma: 'es',
    tema: 'light',
    notificaciones: true,
    notificacionesEmail: false,
    duracionSesion: 60,
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = () => {
    // Aquí iría la lógica para guardar la configuración
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleInputChange = (field: string, value: any) => {
    setUserSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Configuración
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Personaliza tu experiencia en EstudIA
        </Typography>
      </Box>

      {showSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Configuración guardada correctamente
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Perfil de Usuario */}
        <Card>
          <CardHeader
            avatar={<AccountCircle color="primary" />}
            title="Perfil de Usuario"
            subheader="Información personal y configuración de cuenta"
          />
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ width: 80, height: 80, mr: 2 }}>
                {userSettings.nombre.charAt(0)}
              </Avatar>
              <IconButton color="primary" aria-label="cambiar foto">
                <PhotoCamera />
              </IconButton>
            </Box>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
              <TextField
                label="Nombre completo"
                value={userSettings.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                fullWidth
              />
              <TextField
                label="Correo electrónico"
                type="email"
                value={userSettings.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                fullWidth
              />
            </Box>
          </CardContent>
        </Card>

        {/* Preferencias de Aplicación */}
        <Card>
          <CardHeader
            avatar={<Palette color="primary" />}
            title="Preferencias de Aplicación"
            subheader="Personaliza la apariencia y el comportamiento de la aplicación"
          />
          <CardContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Idioma</InputLabel>
                <Select
                  value={userSettings.idioma}
                  label="Idioma"
                  onChange={(e) => handleInputChange('idioma', e.target.value)}
                >
                  <MenuItem value="es">Español</MenuItem>
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="fr">Français</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Tema</InputLabel>
                <Select
                  value={userSettings.tema}
                  label="Tema"
                  onChange={(e) => handleInputChange('tema', e.target.value)}
                >
                  <MenuItem value="light">Claro</MenuItem>
                  <MenuItem value="dark">Oscuro</MenuItem>
                  <MenuItem value="auto">Automático</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>

        {/* Notificaciones */}
        <Card>
          <CardHeader
            avatar={<Notifications color="primary" />}
            title="Notificaciones"
            subheader="Controla cómo y cuándo recibir notificaciones"
          />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={userSettings.notificaciones}
                    onChange={(e) => handleInputChange('notificaciones', e.target.checked)}
                  />
                }
                label="Notificaciones push"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={userSettings.notificacionesEmail}
                    onChange={(e) => handleInputChange('notificacionesEmail', e.target.checked)}
                  />
                }
                label="Notificaciones por email"
              />
            </Box>
          </CardContent>
        </Card>

        {/* Seguridad y Sesión */}
        <Card>
          <CardHeader
            avatar={<Security color="primary" />}
            title="Seguridad y Sesión"
            subheader="Configuración de seguridad y duración de sesión"
          />
          <CardContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
              <TextField
                label="Duración de sesión (minutos)"
                type="number"
                value={userSettings.duracionSesion}
                onChange={(e) => handleInputChange('duracionSesion', parseInt(e.target.value))}
                inputProps={{ min: 15, max: 480 }}
              />
              <Box sx={{ pt: 1 }}>
                <Button variant="outlined" color="warning">
                  Cambiar Contraseña
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Botones de Acción */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}>
          <Button variant="outlined" size="large">
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            size="large" 
            startIcon={<Save />}
            onClick={handleSave}
          >
            Guardar Cambios
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default SettingsPage;
