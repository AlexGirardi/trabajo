/*
Rb1 E2E — Normalización con generateExam (sin mocks)
- Usa el cliente real de Ollama; requiere Ollama en http://localhost:11434
- Invoca examAIService.generateExam(request, materials, locale)
- Verifica normalización, success y puntuación total, sin asumir formato exacto del modelo
*/

import assert from 'node:assert';
import { examAIService } from '../../src/services/examAIService';
import { ollamaClient } from '../../src/services/ollamaClient';

async function run() {
  const healthy = await ollamaClient.checkHealth();
  if (!healthy) {
    throw new Error('Ollama no está disponible en http://localhost:11434. Inícialo antes de ejecutar este E2E.');
  }

  const request = {
    cursoId: 'curso-demo',
    numeroPreguntas: 3,
    tiposPreguntas: ['multiple', 'verdadero_falso'] as const,
    dificultad: 'medio' as const,
    duracionMinutos: 30,
  };

  // Seleccionar un modelo disponible para evitar 404 (model not found)
  const models = await examAIService.getAvailableModels();
  if (!models.length) {
    throw new Error('No hay modelos en Ollama. Descarga uno (ej. `ollama pull llama3.1:8b`) y reintenta.');
  }
  examAIService.setModel(models[0]);

  // Pasamos locale para evitar acceso a localStorage en entorno Node
  const result = await examAIService.generateExam(request as any, 'MATERIAL ACTIVO', 'es');
  assert.equal(result.success, true, 'generateExam debe devolver success=true');
  assert.equal(result.questions.length, 3, 'debe devolver 3 preguntas (o rellenar con fallback)');

  // Validaciones genéricas de normalización por tipo
  for (const q of result.questions as any[]) {
    assert(['multiple','verdadero_falso','abierta'].includes(q.tipo), 'tipo válido');
    assert(typeof q.puntos === 'number' && q.puntos > 0, 'puntos positivos');
    if (q.tipo === 'multiple') {
      assert(Array.isArray(q.opciones) && q.opciones.length >= 2, 'opciones presentes');
      assert(typeof q.respuestaCorrecta === 'number', 'índice numérico');
      assert(q.respuestaCorrecta >= 0 && q.respuestaCorrecta < q.opciones.length, 'índice en rango');
    }
    if (q.tipo === 'verdadero_falso') {
      assert(typeof q.respuestaCorrecta === 'boolean', 'boolean normalizado');
    }
  }

  const puntuacionTotal = result.questions.reduce((s: number, q: any) => s + (q.puntos || 0), 0);
  assert(puntuacionTotal > 0, 'puntuacionTotal > 0');

  console.log('Rb1 E2E PASSED', { titulo: result.titulo, descripcion: result.descripcion, total: result.questions.length, puntuacionTotal });
}

run().catch((e) => { console.error('Rb1 E2E FAILED', e); process.exit(1); });
