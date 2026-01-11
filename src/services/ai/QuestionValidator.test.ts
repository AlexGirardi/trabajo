import { describe, it, expect } from 'vitest';
import { QuestionValidator } from './QuestionValidator';

describe('QuestionValidator', () => {
  const validator = new QuestionValidator();

  describe('validateAndTransform', () => {
    it('debería transformar una pregunta de opción múltiple válida', () => {
      const rawQuestion = {
        tipo: 'multiple',
        pregunta: '¿Cuál es la capital de Francia?',
        opciones: ['Madrid', 'París', 'Londres', 'Berlín'],
        respuestaCorrecta: 1,
        explicacion: 'París es la capital de Francia',
        puntos: 5
      };

      const result = validator.validateAndTransform(rawQuestion, 0);

      expect(result).not.toBeNull();
      expect(result?.tipo).toBe('multiple');
      expect(result?.pregunta).toBe('¿Cuál es la capital de Francia?');
      expect(result?.opciones).toEqual(['Madrid', 'París', 'Londres', 'Berlín']);
      expect(result?.respuestaCorrecta).toBe(1);
      expect(result?.puntos).toBe(5);
    });

    it('debería sanitizar opciones con prefijos', () => {
      const rawQuestion = {
        tipo: 'multiple',
        pregunta: 'Test question',
        opciones: ['A. Madrid', 'B) París', '1. Londres', '2) Berlín'],
        respuestaCorrecta: 1
      };

      const result = validator.validateAndTransform(rawQuestion, 0);

      expect(result?.opciones).toEqual(['Madrid', 'París', 'Londres', 'Berlín']);
    });

    it('debería aceptar respuesta correcta como letra (A, B, C, D)', () => {
      const rawQuestion = {
        tipo: 'multiple',
        pregunta: 'Test',
        opciones: ['Op1', 'Op2', 'Op3', 'Op4'],
        respuestaCorrecta: 'B'
      };

      const result = validator.validateAndTransform(rawQuestion, 0);

      expect(result?.respuestaCorrecta).toBe(1);
    });

    it('debería aceptar respuesta correcta como número base-1', () => {
      const rawQuestion = {
        tipo: 'multiple',
        pregunta: 'Test',
        opciones: ['Op1', 'Op2', 'Op3', 'Op4'],
        respuestaCorrecta: '2' // base-1: 2 significa índice 1
      };

      const result = validator.validateAndTransform(rawQuestion, 0);

      expect(result?.respuestaCorrecta).toBe(1);
    });

    it('debería transformar pregunta verdadero/falso', () => {
      const rawQuestion = {
        tipo: 'verdadero_falso',
        pregunta: 'JavaScript es un lenguaje compilado',
        respuestaCorrecta: false,
        puntos: 3
      };

      const result = validator.validateAndTransform(rawQuestion, 0);

      expect(result?.tipo).toBe('verdadero_falso');
      expect(result?.respuestaCorrecta).toBe(false);
      expect(result?.puntos).toBe(3);
    });

    it('debería normalizar respuesta verdadero/falso de string a boolean', () => {
      const rawQuestion = {
        tipo: 'verdadero_falso',
        pregunta: 'Test',
        respuestaCorrecta: 'true'
      };

      const result = validator.validateAndTransform(rawQuestion, 0);

      expect(result?.respuestaCorrecta).toBe(true);
    });

    it('debería transformar pregunta abierta añadiendo hueco si falta', () => {
      const rawQuestion = {
        tipo: 'abierta',
        pregunta: '¿Cuál es la capital de Francia?',
        respuestaCorrecta: 'París',
        puntos: 10
      };

      const result = validator.validateAndTransform(rawQuestion, 0);

      expect(result?.tipo).toBe('abierta');
      expect(result?.pregunta).toContain('________');
      expect(result?.respuestaCorrecta).toBe('París');
    });

    it('debería mantener solo un hueco en preguntas abiertas', () => {
      const rawQuestion = {
        tipo: 'abierta',
        pregunta: 'La ________ de Francia es ________',
        respuestaCorrecta: 'capital París'
      };

      const result = validator.validateAndTransform(rawQuestion, 0);

      const blankCount = (result?.pregunta.match(/________/g) || []).length;
      expect(blankCount).toBe(1);
    });

    it('debería retornar null para pregunta sin tipo', () => {
      const rawQuestion = {
        pregunta: 'Test sin tipo',
        opciones: ['A', 'B', 'C']
      };

      const result = validator.validateAndTransform(rawQuestion, 0);

      expect(result).toBeNull();
    });
  });

  describe('removeDuplicates', () => {
    it('debería eliminar preguntas duplicadas', () => {
      const questions: any[] = [
        { id: '1', tipo: 'multiple', pregunta: '¿Cuál es la capital de Francia?', opciones: [], respuestaCorrecta: 0, puntos: 5 },
        { id: '2', tipo: 'multiple', pregunta: '¿Cuál es la capital de Francia?', opciones: [], respuestaCorrecta: 0, puntos: 5 },
        { id: '3', tipo: 'multiple', pregunta: '¿Cuál es la capital de España?', opciones: [], respuestaCorrecta: 0, puntos: 5 }
      ];

      const result = validator.removeDuplicates(questions);

      expect(result).toHaveLength(2);
      expect(result[0].pregunta).toBe('¿Cuál es la capital de Francia?');
      expect(result[1].pregunta).toBe('¿Cuál es la capital de España?');
    });

    it('debería ignorar puntuación y mayúsculas al detectar duplicados', () => {
      const questions: any[] = [
        { id: '1', tipo: 'multiple', pregunta: '¿Cuál es la capital de Francia?', opciones: [], respuestaCorrecta: 0, puntos: 5 },
        { id: '2', tipo: 'multiple', pregunta: 'cual es la capital de francia', opciones: [], respuestaCorrecta: 0, puntos: 5 }
      ];

      const result = validator.removeDuplicates(questions);

      expect(result).toHaveLength(1);
    });
  });
});
