// Script para crear datos mínimos de prueba para el progreso semanal
// Ejecutar en la consola del navegador para simular algunos exámenes completados

console.log('🧪 Creando datos mínimos para testing del progreso semanal...');

// Crear algunos intentos de exámenes simulados
const mockAttempts = [
  {
    id: 'attempt-1',
    examenId: 'test-exam-1',
    usuarioId: 'user-1',
    respuestas: {},
    puntuacion: 85,
    fechaInicio: new Date('2025-06-10').toISOString(),
    fechaFin: new Date('2025-06-10').toISOString(),
    completado: true,
  },
  {
    id: 'attempt-2',
    examenId: 'test-exam-1',
    usuarioId: 'user-1',
    respuestas: {},
    puntuacion: 92,
    fechaInicio: new Date('2025-06-11').toISOString(),
    fechaFin: new Date('2025-06-11').toISOString(),
    completado: true,
  },
  {
    id: 'attempt-3',
    examenId: 'test-exam-1',
    usuarioId: 'user-1',
    respuestas: {},
    puntuacion: 78,
    fechaInicio: new Date('2025-06-12').toISOString(),
    fechaFin: new Date('2025-06-12').toISOString(),
    completado: true,
  }
];

const mockResults = [
  {
    id: 'result-1',
    intentoId: 'attempt-1',
    puntuacionObtenida: 85,
    puntuacionMaxima: 100,
    porcentaje: 85,
    tiempoEmpleado: 30,
    respuestasCorrectas: 17,
    respuestasIncorrectas: 2,
    respuestasEnBlanco: 1,
  },
  {
    id: 'result-2',
    intentoId: 'attempt-2',
    puntuacionObtenida: 92,
    puntuacionMaxima: 100,
    porcentaje: 92,
    tiempoEmpleado: 28,
    respuestasCorrectas: 18,
    respuestasIncorrectas: 1,
    respuestasEnBlanco: 1,
  },
  {
    id: 'result-3',
    intentoId: 'attempt-3',
    puntuacionObtenida: 78,
    puntuacionMaxima: 100,
    porcentaje: 78,
    tiempoEmpleado: 22,
    respuestasCorrectas: 15,
    respuestasIncorrectas: 4,
    respuestasEnBlanco: 1,
  }
];

// Guardar datos de prueba mínimos
localStorage.setItem('estudia_exam_attempts', JSON.stringify(mockAttempts));
localStorage.setItem('estudia_exam_results', JSON.stringify(mockResults));

console.log('✅ Datos mínimos creados para testing');
console.log('📊 Ahora el progreso semanal debería mostrar datos distribuidos');
console.log('🔄 Recarga la página para ver el gráfico actualizado');

// Recargar la página automáticamente
setTimeout(() => {
  location.reload();
}, 2000);
