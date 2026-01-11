import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
} from '@mui/material';
import {
  School,
  Quiz,
  TrendingUp,
  Assessment,
  Add,
  PlayArrow,
  CheckCircle,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Datos de ejemplo
const statsData = [
  { name: 'Lun', examenes: 2, puntuacion: 85 },
  { name: 'Mar', examenes: 1, puntuacion: 92 },
  { name: 'Mie', examenes: 3, puntuacion: 78 },
  { name: 'Jue', examenes: 2, puntuacion: 88 },
  { name: 'Vie', examenes: 1, puntuacion: 95 },
  { name: 'Sab', examenes: 0, puntuacion: 0 },
  { name: 'Dom', examenes: 1, puntuacion: 90 },
];

const pieData = [
  { name: 'Correctas', value: 75, color: '#4caf50' },
  { name: 'Incorrectas', value: 20, color: '#f44336' },
  { name: 'Sin responder', value: 5, color: '#ff9800' },
];

export const Dashboard: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        ¡Bienvenido de vuelta! Aquí tienes un resumen de tu progreso.
      </Typography>

      {/* Tarjetas de estadísticas */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Card sx={{ minWidth: 250, flex: '1 1 calc(25% - 12px)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <School />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  12
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cursos Activos
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 250, flex: '1 1 calc(25% - 12px)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                <Quiz />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  47
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Exámenes Realizados
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 250, flex: '1 1 calc(25% - 12px)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                <TrendingUp />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  87%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Puntuación Media
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 250, flex: '1 1 calc(25% - 12px)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                <Assessment />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  3
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Exámenes Pendientes
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* Gráfico de Progreso */}
        <Card sx={{ flex: '2 1 600px' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Progreso Semanal
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={statsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="puntuacion"
                  stroke="#1976d2"
                  strokeWidth={3}
                  dot={{ fill: '#1976d2', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribución de Respuestas */}
        <Card sx={{ flex: '1 1 300px' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Distribución de Respuestas
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ mt: 2 }}>
              {pieData.map((entry, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      bgcolor: entry.color,
                      borderRadius: '50%',
                      mr: 1,
                    }}
                  />
                  <Typography variant="body2">
                    {entry.name}: {entry.value}%
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Acciones Rápidas */}
        <Card sx={{ flex: '1 1 300px' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Acciones Rápidas
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Add />}
              >
                Crear Curso
              </Button>
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                startIcon={<Quiz />}
              >
                Generar Examen
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Exámenes Recientes */}
        <Card sx={{ flex: '1 1 300px' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Exámenes Recientes
            </Typography>
            <List>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <CheckCircle />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Matemáticas - Álgebra"
                  secondary="Completado hace 2 horas"
                />
                <Chip label="95%" color="success" size="small" />
              </ListItem>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <PlayArrow />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Historia - Revolución Francesa"
                  secondary="En progreso"
                />
                <Box sx={{ width: 60 }}>
                  <LinearProgress variant="determinate" value={60} />
                </Box>
              </ListItem>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <Quiz />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Física - Mecánica"
                  secondary="Disponible"
                />
                <Chip label="Pendiente" color="warning" size="small" />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};
