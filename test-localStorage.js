// Script de prueba para verificar el funcionamiento del localStorage
// Ejecutar en la consola del navegador

console.log('=== VERIFICACIÓN DE LOCALSTORAGE ===');

// Limpiar localStorage
localStorage.clear();
console.log('1. localStorage limpiado');

// Verificar datos iniciales
console.log('2. Datos iniciales en localStorage:');
console.log('- Exámenes:', localStorage.getItem('estudia_exams'));
console.log('- Cursos:', localStorage.getItem('estudia_courses'));
console.log('- Resultados:', localStorage.getItem('estudia_exam_results'));
console.log('- Intentos:', localStorage.getItem('estudia_exam_attempts'));

// Simular datos que se crearían al realizar un examen
const mockExamResult = {
  id: 'test-result-1',
  intentoId: 'test-attempt-1',
  puntuacionObtenida: 85,
  puntuacionMaxima: 100,
  porcentaje: 85,
  tiempoEmpleado: 1200, // 20 minutos en segundos
  respuestasCorrectas: 17,
  respuestasIncorrectas: 3,
  respuestasEnBlanco: 0
};

const mockExamAttempt = {
  id: 'test-attempt-1',
  examenId: 'test-exam-1',
  usuarioId: 'user-1',
  respuestas: { q1: { questionId: 'q1', answer: 0 } },
  puntuacion: 85,
  fechaInicio: new Date().toISOString(),
  fechaFin: new Date().toISOString(),
  completado: true
};

// Guardar datos de prueba
localStorage.setItem('estudia_exam_results', JSON.stringify([mockExamResult]));
localStorage.setItem('estudia_exam_attempts', JSON.stringify([mockExamAttempt]));

console.log('3. Datos de prueba guardados');
console.log('- Resultado guardado:', JSON.parse(localStorage.getItem('estudia_exam_results')));
console.log('- Intento guardado:', JSON.parse(localStorage.getItem('estudia_exam_attempts')));

console.log('=== VERIFICACIÓN COMPLETADA ===');
console.log('Ahora recarga la página y ve al Dashboard para ver si los datos se muestran correctamente.');
