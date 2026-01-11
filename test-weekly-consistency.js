// Script de verificación del progreso semanal consistente
// Ejecutar en la consola del navegador para verificar datos consistentes

console.log('=== VERIFICACIÓN DE PROGRESO SEMANAL CONSISTENTE ===');

// Función para probar la consistencia
function testWeeklyDataConsistency() {
  // Limpiar y reinicializar datos
  localStorage.clear();
  
  // Simular datos de prueba con fechas específicas
  const mockAttempts = [
    {
      id: 'attempt-1',
      examenId: 'test-exam-1',
      usuarioId: 'user-1',
      respuestas: {},
      puntuacion: 85,
      fechaInicio: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      fechaFin: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      completado: true,
    },
    {
      id: 'attempt-2',
      examenId: 'test-exam-2',
      usuarioId: 'user-1',
      respuestas: {},
      puntuacion: 92,
      fechaInicio: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      fechaFin: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      completado: true,
    },
    {
      id: 'attempt-3',
      examenId: 'test-exam-3',
      usuarioId: 'user-1',
      respuestas: {},
      puntuacion: 78,
      fechaInicio: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      fechaFin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
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

  // Guardar datos de prueba
  localStorage.setItem('estudia_exam_attempts', JSON.stringify(mockAttempts));
  localStorage.setItem('estudia_exam_results', JSON.stringify(mockResults));

  console.log('1. Datos de prueba guardados con fechas específicas');
  console.log('2. Ahora recarga la página y ve al Dashboard');
  console.log('3. El progreso semanal debería ser idéntico cada vez que recargas');
  console.log('4. Deberías ver exámenes en los días correspondientes a las fechas guardadas');
  
  return {
    attempts: mockAttempts,
    results: mockResults,
    message: 'Datos guardados. Recarga la página para ver progreso consistente.'
  };
}

// Ejecutar la prueba
const testResult = testWeeklyDataConsistency();
console.log('=== PRUEBA COMPLETADA ===');
console.log(testResult);
