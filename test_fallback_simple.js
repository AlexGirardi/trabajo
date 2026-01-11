// Test simple para verificar generación de fallback
import fs from 'fs';

// Simular la función generateFallbackQuestions
function generateFallbackQuestions(request) {
  const questions = [];
  const selectedTypes = request.tiposPreguntas;
  
  console.log('=== INICIO TEST FALLBACK ===');
  console.log('Tipos seleccionados:', selectedTypes);
  console.log('Número de preguntas:', request.numeroPreguntas);
  
  // Si solo hay un tipo seleccionado, generar todas las preguntas de ese tipo
  if (selectedTypes.length === 1) {
    const singleType = selectedTypes[0];
    console.log('Generando SOLO tipo:', singleType);
    
    for (let i = 0; i < request.numeroPreguntas; i++) {
      if (singleType === 'multiple') {
        questions.push({
          id: `fallback_${i}`,
          tipo: 'multiple',
          pregunta: `Pregunta de opción múltiple ${i + 1} (generada automáticamente)`,
          opciones: ['Opción A', 'Opción B', 'Opción C', 'Opción D'],
          respuestaCorrecta: 0,
          explicacion: 'Esta es una pregunta de ejemplo generada automáticamente.',
          puntos: 5,
        });
      } else if (singleType === 'verdadero_falso') {
        questions.push({
          id: `fallback_${i}`,
          tipo: 'verdadero_falso',
          pregunta: `Pregunta de verdadero/falso ${i + 1} (generada automáticamente)`,
          respuestaCorrecta: true,
          explicacion: 'Esta es una pregunta de ejemplo generada automáticamente.',
          puntos: 3,
        });
      } else if (singleType === 'abierta') {
        questions.push({
          id: `fallback_${i}`,
          tipo: 'abierta',
          pregunta: `Pregunta abierta ${i + 1} (generada automáticamente)`,
          respuestaCorrecta: 'Respuesta esperada para la pregunta abierta.',
          explicacion: 'Esta es una pregunta de ejemplo generada automáticamente.',
          puntos: 10,
        });
      }
    }
  } else {
    // Si hay múltiples tipos, distribuir equitativamente
    const questionsPerType = Math.floor(request.numeroPreguntas / selectedTypes.length);
    const remainder = request.numeroPreguntas % selectedTypes.length;
    
    let questionIndex = 0;
    
    selectedTypes.forEach((type, typeIndex) => {
      const numQuestions = questionsPerType + (typeIndex < remainder ? 1 : 0);
      console.log(`Generando ${numQuestions} preguntas de tipo: ${type}`);
      
      for (let i = 0; i < numQuestions; i++) {
        if (type === 'multiple') {
          questions.push({
            id: `fallback_${questionIndex}`,
            tipo: 'multiple',
            pregunta: `Pregunta de opción múltiple ${questionIndex + 1} (generada automáticamente)`,
            opciones: ['Opción A', 'Opción B', 'Opción C', 'Opción D'],
            respuestaCorrecta: 0,
            explicacion: 'Esta es una pregunta de ejemplo generada automáticamente.',
            puntos: 5,
          });
        } else if (type === 'verdadero_falso') {
          questions.push({
            id: `fallback_${questionIndex}`,
            tipo: 'verdadero_falso',
            pregunta: `Pregunta de verdadero/falso ${questionIndex + 1} (generada automáticamente)`,
            respuestaCorrecta: true,
            explicacion: 'Esta es una pregunta de ejemplo generada automáticamente.',
            puntos: 3,
          });
        } else if (type === 'abierta') {
          questions.push({
            id: `fallback_${questionIndex}`,
            tipo: 'abierta',
            pregunta: `Pregunta abierta ${questionIndex + 1} (generada automáticamente)`,
            respuestaCorrecta: 'Respuesta esperada para la pregunta abierta.',
            explicacion: 'Esta es una pregunta de ejemplo generada automáticamente.',
            puntos: 10,
          });
        }
        questionIndex++;
      }
    });
  }

  console.log('Preguntas generadas:');
  questions.forEach((q, i) => {
    console.log(`${i + 1}. Tipo: ${q.tipo}, ID: ${q.id}`);
  });
  console.log('=== FIN TEST FALLBACK ===');
  
  return questions.slice(0, request.numeroPreguntas);
}

// Tests
const tests = [
  {
    name: "Solo opción múltiple - 5 preguntas",
    request: {
      cursoId: "1",
      numeroPreguntas: 5,
      tiposPreguntas: ['multiple'],
      dificultad: 'medio',
      duracionMinutos: 30
    }
  },
  {
    name: "Solo verdadero/falso - 3 preguntas",
    request: {
      cursoId: "1",
      numeroPreguntas: 3,
      tiposPreguntas: ['verdadero_falso'],
      dificultad: 'medio',
      duracionMinutos: 30
    }
  },
  {
    name: "Solo abiertas - 2 preguntas",
    request: {
      cursoId: "1",
      numeroPreguntas: 2,
      tiposPreguntas: ['abierta'],
      dificultad: 'medio',
      duracionMinutos: 30
    }
  }
];

tests.forEach(test => {
  console.log(`\n*** ${test.name} ***`);
  const result = generateFallbackQuestions(test.request);
  console.log(`Resultado: ${result.length} preguntas generadas`);
  
  // Verificar que todas sean del tipo correcto
  const expectedType = test.request.tiposPreguntas[0];
  const allCorrectType = result.every(q => q.tipo === expectedType);
  console.log(`¿Todas del tipo correcto (${expectedType})? ${allCorrectType}`);
  
  if (!allCorrectType) {
    console.log('TIPOS ENCONTRADOS:');
    result.forEach(q => console.log(`- ${q.tipo}`));
  }
});
