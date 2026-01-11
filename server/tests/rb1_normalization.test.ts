/*
Rb1 — Normalización de respuestas heterogéneas
- Índices como string en 'multiple' deben convertirse a índice numérico en rango
- Booleanos en texto deben convertirse a boolean nativo
- PuntuacionTotal recalculada y preguntas válidas tras normalización

Este test no llama a Ollama: simula la respuesta cruda y fuerza el parseo/normalización
utilizando los métodos internos de ExamAIService (parseResponse + validateAndTransformQuestion).
*/

import assert from 'node:assert';
import { ExamAIService } from '../../src/services/examAIService';

// Contrato mínimo de petición
const request = {
  cursoId: 'curso-demo',
  numeroPreguntas: 3,
  tiposPreguntas: ['multiple', 'verdadero_falso'] as const,
  dificultad: 'medio' as const,
  duracionMinutos: 30,
};

function run() {
  const svc = new ExamAIService('noop');
  const raw = `Here is your exam:\n\n{\n  "titulo": "Demo",
  "descripcion": "Prueba de normalizacion",
  "preguntas": [
    {
      "tipo": "multiple",
      "pregunta": "Capital de Francia",
      "opciones": ["París", "Londres", "Roma", "Berlín"],
      "respuestaCorrecta": "1",
      "puntos": 5
    },
    {
      "tipo": "verdadero_falso",
      "pregunta": "2+2=4",
      "respuestaCorrecta": "TRUE",
      "puntos": 3
    },
    {
      "tipo": "multiple",
      "pregunta": "Color del cielo",
      "opciones": ["Azul", "Verde", "Rojo", "Amarillo"],
      "respuestaCorrecta": "Azul",
      "puntos": 5
    }
  ]
}`;

  // Acceso al método privado a efectos de test (sin romper encapsulación pública en runtime)
  const parse = (svc as any)["parseResponse"].bind(svc);
  const { questions, titulo, descripcion } = parse(raw, request, 'es');

  // Verificación 1: índices múltiples normalizados a número dentro de rango
  const q1 = questions.find((q: any) => q.pregunta.includes('Capital'))!;
  assert.equal(q1.tipo, 'multiple');
  assert.equal(typeof q1.respuestaCorrecta, 'number');
  assert(q1.respuestaCorrecta >= 0 && q1.respuestaCorrecta < (q1.opciones?.length || 0));

  // Verificación 2: booleano normalizado
  const q2 = questions.find((q: any) => q.pregunta.includes('2+2'))!;
  assert.equal(q2.tipo, 'verdadero_falso');
  assert.equal(typeof q2.respuestaCorrecta, 'boolean');
  assert.equal(q2.respuestaCorrecta, true);

  // Verificación 3: texto de opción mapeado al índice correcto
  const q3 = questions.find((q: any) => q.pregunta.includes('cielo'))!;
  assert.equal(q3.tipo, 'multiple');
  assert.equal(typeof q3.respuestaCorrecta, 'number');
  assert.equal(q3.opciones![q3.respuestaCorrecta as number], 'Azul');

  // Verificación 4: puntuación total calculable (simulamos createExam del backend)
  const puntuacionTotal = questions.reduce((s: number, q: any) => s + (q.puntos || 0), 0);
  assert(puntuacionTotal >= 13, 'puntuacionTotal esperada >= 13');

  console.log('Rb1 normalization PASSED', { titulo, descripcion, total: questions.length, puntuacionTotal });
}

run();
