// Script para crear datos de prueba mínimos
// Copia y pega este código en la consola del navegador (F12)

console.log('🧪 Creando datos de prueba...');

// Crear datos de intentos de examen
const attempts = [
  {id: 'att1', examenId: 'exam1', usuarioId: 'user1', respuestas: {}, puntuacion: 85, fechaInicio: new Date().toISOString(), fechaFin: new Date().toISOString(), completado: true},
  {id: 'att2', examenId: 'exam1', usuarioId: 'user1', respuestas: {}, puntuacion: 92, fechaInicio: new Date().toISOString(), fechaFin: new Date().toISOString(), completado: true},
  {id: 'att3', examenId: 'exam1', usuarioId: 'user1', respuestas: {}, puntuacion: 78, fechaInicio: new Date().toISOString(), fechaFin: new Date().toISOString(), completado: true},
  {id: 'att4', examenId: 'exam2', usuarioId: 'user1', respuestas: {}, puntuacion: 88, fechaInicio: new Date().toISOString(), fechaFin: new Date().toISOString(), completado: true},
  {id: 'att5', examenId: 'exam2', usuarioId: 'user1', respuestas: {}, puntuacion: 95, fechaInicio: new Date().toISOString(), fechaFin: new Date().toISOString(), completado: true}
];

// Crear datos de resultados
const results = [
  {id: 'res1', intentoId: 'att1', puntuacionObtenida: 85, puntuacionMaxima: 100, porcentaje: 85, tiempoEmpleado: 30, respuestasCorrectas: 17, respuestasIncorrectas: 2, respuestasEnBlanco: 1},
  {id: 'res2', intentoId: 'att2', puntuacionObtenida: 92, puntuacionMaxima: 100, porcentaje: 92, tiempoEmpleado: 28, respuestasCorrectas: 18, respuestasIncorrectas: 1, respuestasEnBlanco: 1},
  {id: 'res3', intentoId: 'att3', puntuacionObtenida: 78, puntuacionMaxima: 100, porcentaje: 78, tiempoEmpleado: 22, respuestasCorrectas: 15, respuestasIncorrectas: 4, respuestasEnBlanco: 1},
  {id: 'res4', intentoId: 'att4', puntuacionObtenida: 88, puntuacionMaxima: 100, porcentaje: 88, tiempoEmpleado: 25, respuestasCorrectas: 17, respuestasIncorrectas: 2, respuestasEnBlanco: 1},
  {id: 'res5', intentoId: 'att5', puntuacionObtenida: 95, puntuacionMaxima: 100, porcentaje: 95, tiempoEmpleado: 32, respuestasCorrectas: 19, respuestasIncorrectas: 1, respuestasEnBlanco: 0}
];

// Guardar en localStorage
localStorage.setItem('estudia_exam_attempts', JSON.stringify(attempts));
localStorage.setItem('estudia_exam_results', JSON.stringify(results));

console.log('✅ Datos de prueba creados');
console.log('📊 El progreso semanal ahora debe mostrar datos distribuidos');
console.log('🔄 Recargando página en 2 segundos...');

// Recargar página
setTimeout(() => {
  window.location.reload();
}, 2000);
