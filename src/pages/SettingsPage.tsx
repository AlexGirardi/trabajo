import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
} from '@mui/material';
import { Save, Palette } from '@mui/icons-material';
import { useThemeMode } from '../themeContext';
import { useI18n } from '../i18n';

const SettingsPage: React.FC = () => {
  const { mode, toggleMode, setMode } = useThemeMode();
  const { t, locale, setLocale } = useI18n();

  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = () => {
    // Aquí iría la lógica para guardar la configuración
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleInputChange = (_field: string, _value: any) => {};

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          {t('settings.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('settings.description')}
        </Typography>
      </Box>

      {showSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {t('settings.saved')}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Preferencias de Apariencia */}
        <Card>
          <CardHeader
            avatar={<Palette color="primary" />}
            title={t('settings.appearance.cardTitle')}
            subheader={t('settings.appearance.cardSubtitle')}
          />
          <CardContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
              <FormControl fullWidth>
                <InputLabel>{t('settings.language')}</InputLabel>
                <Select
                  value={locale}
                  label={t('settings.language')}
                  onChange={(e) => { setLocale(e.target.value as any); handleInputChange('idioma', e.target.value); }}
                >
                  <MenuItem value="es">{t('common.spanish')}</MenuItem>
                  <MenuItem value="en">{t('common.english')}</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>{t('settings.theme')}</InputLabel>
                <Select
                  value={mode}
                  label={t('settings.theme')}
                  onChange={(e) => { setMode(e.target.value as any); handleInputChange('tema', e.target.value); }}
                >
                  <MenuItem value="light">{t('theme.light')}</MenuItem>
                  <MenuItem value="dark">{t('theme.dark')}</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ mt: 3 }}>
              <Button variant="outlined" onClick={toggleMode}>{t('theme.toggle')} {mode === 'light' ? t('theme.dark') : t('theme.light')}</Button>
            </Box>
          </CardContent>
        </Card>

        {/* Botones de Acción */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}>
          <Button variant="contained" startIcon={<Save />} onClick={handleSave}>{t('common.save')}</Button>
        </Box>
      </Box>
    </Box>
  );
};

export default SettingsPage;
