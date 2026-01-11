// Ejecutar en consola del navegador
const mockAttempts = [
  {id: 'a1', examenId: 'e1', usuarioId: 'u1', respuestas: {}, puntuacion: 85, fechaInicio: new Date().toISOString(), fechaFin: new Date().toISOString(), completado: true},
  {id: 'a2', examenId: 'e1', usuarioId: 'u1', respuestas: {}, puntuacion: 92, fechaInicio: new Date().toISOString(), fechaFin: new Date().toISOString(), completado: true},
  {id: 'a3', examenId: 'e1', usuarioId: 'u1', respuestas: {}, puntuacion: 78, fechaInicio: new Date().toISOString(), fechaFin: new Date().toISOString(), completado: true}
];

const mockResults = [
  {id: 'r1', intentoId: 'a1', puntuacionObtenida: 85, puntuacionMaxima: 100, porcentaje: 85, tiempoEmpleado: 30, respuestasCorrectas: 17, respuestasIncorrectas: 2, respuestasEnBlanco: 1},
  {id: 'r2', intentoId: 'a2', puntuacionObtenida: 92, puntuacionMaxima: 100, porcentaje: 92, tiempoEmpleado: 28, respuestasCorrectas: 18, respuestasIncorrectas: 1, respuestasEnBlanco: 1},
  {id: 'r3', intentoId: 'a3', puntuacionObtenida: 78, puntuacionMaxima: 100, porcentaje: 78, tiempoEmpleado: 22, respuestasCorrectas: 15, respuestasIncorrectas: 4, respuestasEnBlanco: 1}
];

localStorage.setItem('estudia_exam_attempts', JSON.stringify(mockAttempts));
localStorage.setItem('estudia_exam_results', JSON.stringify(mockResults));
console.log('Datos creados, recargando...');
setTimeout(() => location.reload(), 1000);
