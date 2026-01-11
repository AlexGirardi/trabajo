/**
 * Pruebas unitarias para cálculo de resultados de exámenes (RF8)
 * Verifica el cálculo correcto de puntos, porcentajes, aciertos, fallos y blancos
 */

import { describe, it, expect } from 'vitest';
import { calculateExamResults, normalizeCorrectAnswer } from '../../src/utils/examResults';
import type { Question, UserAnswer } from '../../src/utils/examResults';

describe('Cálculo de Resultados de Exámenes (RF8)', () => {
  describe('calculateExamResults', () => {
    it('debe calcular correctamente cuando todas las respuestas son correctas', () => {
      const questions: Question[] = [
        {
          id: 'q1',
          tipo: 'multiple',
          respuestaCorrecta: 0,
          puntos: 5,
        },
        {
          id: 'q2',
          tipo: 'verdadero_falso',
          respuestaCorrecta: true,
          puntos: 3,
        },
        {
          id: 'q3',
          tipo: 'abierta',
          respuestaCorrecta: 'París',
          puntos: 4,
        },
      ];

      const userAnswers: UserAnswer[] = [
        { questionId: 'q1', answer: 0 },
        { questionId: 'q2', answer: true },
        { questionId: 'q3', answer: 'parís' }, // Case insensitive
      ];

      const result = calculateExamResults(questions, userAnswers);

      expect(result.correctAnswers).toBe(3);
      expect(result.incorrectAnswers).toBe(0);
      expect(result.blankAnswers).toBe(0);
      expect(result.totalPoints).toBe(12);
      expect(result.earnedPoints).toBe(12);
      expect(result.percentage).toBe(100);
    });

    it('debe calcular correctamente cuando hay respuestas incorrectas', () => {
      const questions: Question[] = [
        { id: 'q1', tipo: 'multiple', respuestaCorrecta: 0, puntos: 5 },
        { id: 'q2', tipo: 'verdadero_falso', respuestaCorrecta: true, puntos: 3 },
        { id: 'q3', tipo: 'abierta', respuestaCorrecta: 'París', puntos: 4 },
      ];

      const userAnswers: UserAnswer[] = [
        { questionId: 'q1', answer: 1 }, // Incorrecta
        { questionId: 'q2', answer: true }, // Correcta
        { questionId: 'q3', answer: 'Londres' }, // Incorrecta
      ];

      const result = calculateExamResults(questions, userAnswers);

      expect(result.correctAnswers).toBe(1);
      expect(result.incorrectAnswers).toBe(2);
      expect(result.blankAnswers).toBe(0);
      expect(result.totalPoints).toBe(12);
      expect(result.earnedPoints).toBe(3);
      expect(result.percentage).toBe(25);
    });

    it('debe calcular correctamente cuando hay respuestas en blanco', () => {
      const questions: Question[] = [
        { id: 'q1', tipo: 'multiple', respuestaCorrecta: 0, puntos: 5 },
        { id: 'q2', tipo: 'verdadero_falso', respuestaCorrecta: true, puntos: 3 },
        { id: 'q3', tipo: 'abierta', respuestaCorrecta: 'París', puntos: 4 },
      ];

      const userAnswers: UserAnswer[] = [
        { questionId: 'q1', answer: 0 }, // Correcta
        { questionId: 'q2', answer: null }, // En blanco
        // q3 sin respuesta
      ];

      const result = calculateExamResults(questions, userAnswers);

      expect(result.correctAnswers).toBe(1);
      expect(result.incorrectAnswers).toBe(0);
      expect(result.blankAnswers).toBe(2);
      expect(result.totalPoints).toBe(12);
      expect(result.earnedPoints).toBe(5);
      expect(result.percentage).toBe(41.67);
    });

    it('debe manejar respuestas vacías como blanco', () => {
      const questions: Question[] = [
        { id: 'q1', tipo: 'abierta', respuestaCorrecta: 'París', puntos: 10 },
      ];

      const userAnswers: UserAnswer[] = [
        { questionId: 'q1', answer: '' }, // String vacío
      ];

      const result = calculateExamResults(questions, userAnswers);

      expect(result.blankAnswers).toBe(1);
      expect(result.correctAnswers).toBe(0);
      expect(result.incorrectAnswers).toBe(0);
    });

    it('debe calcular porcentaje con 2 decimales', () => {
      const questions: Question[] = [
        { id: 'q1', tipo: 'multiple', respuestaCorrecta: 0, puntos: 7 },
        { id: 'q2', tipo: 'multiple', respuestaCorrecta: 1, puntos: 3 },
      ];

      const userAnswers: UserAnswer[] = [
        { questionId: 'q1', answer: 0 }, // Correcta (7 puntos)
        { questionId: 'q2', answer: 2 }, // Incorrecta
      ];

      const result = calculateExamResults(questions, userAnswers);

      expect(result.totalPoints).toBe(10);
      expect(result.earnedPoints).toBe(7);
      expect(result.percentage).toBe(70);
    });

    it('debe manejar examen sin preguntas', () => {
      const result = calculateExamResults([], []);

      expect(result.correctAnswers).toBe(0);
      expect(result.incorrectAnswers).toBe(0);
      expect(result.blankAnswers).toBe(0);
      expect(result.totalPoints).toBe(0);
      expect(result.earnedPoints).toBe(0);
      expect(result.percentage).toBe(0);
    });
  });

  describe('normalizeCorrectAnswer - Normalización IA (RF4, RNF05)', () => {
    describe('Preguntas de opción múltiple', () => {
      const opciones = ['París', 'Londres', 'Roma', 'Berlín'];

      it('debe mantener índice numérico válido', () => {
        const normalized = normalizeCorrectAnswer(2, 'multiple', opciones);
        expect(normalized).toBe(2);
      });

      it('debe convertir string numérico a número', () => {
        const normalized = normalizeCorrectAnswer('1', 'multiple', opciones);
        expect(normalized).toBe(1);
      });

      it('debe mapear texto de opción a índice', () => {
        const normalized = normalizeCorrectAnswer('París', 'multiple', opciones);
        expect(normalized).toBe(0);
      });

      it('debe ser case-insensitive al mapear texto', () => {
        const normalized = normalizeCorrectAnswer('PARÍS', 'multiple', opciones);
        expect(normalized).toBe(0);
      });

      it('debe usar fallback 0 si índice fuera de rango', () => {
        const normalized = normalizeCorrectAnswer(10, 'multiple', opciones);
        expect(normalized).toBe(0);
      });

      it('debe usar fallback 0 si texto no coincide con opciones', () => {
        const normalized = normalizeCorrectAnswer('Madrid', 'multiple', opciones);
        expect(normalized).toBe(0);
      });

      it('debe manejar espacios en blanco en texto', () => {
        const normalized = normalizeCorrectAnswer('  París  ', 'multiple', opciones);
        expect(normalized).toBe(0);
      });
    });

    describe('Preguntas de verdadero/falso', () => {
      it('debe mantener booleano true', () => {
        const normalized = normalizeCorrectAnswer(true, 'verdadero_falso');
        expect(normalized).toBe(true);
      });

      it('debe mantener booleano false', () => {
        const normalized = normalizeCorrectAnswer(false, 'verdadero_falso');
        expect(normalized).toBe(false);
      });

      it('debe convertir string "true" a boolean', () => {
        const normalized = normalizeCorrectAnswer('true', 'verdadero_falso');
        expect(normalized).toBe(true);
      });

      it('debe convertir string "TRUE" a boolean', () => {
        const normalized = normalizeCorrectAnswer('TRUE', 'verdadero_falso');
        expect(normalized).toBe(true);
      });

      it('debe convertir string "verdadero" a boolean', () => {
        const normalized = normalizeCorrectAnswer('verdadero', 'verdadero_falso');
        expect(normalized).toBe(true);
      });

      it('debe convertir string "1" a boolean true', () => {
        const normalized = normalizeCorrectAnswer('1', 'verdadero_falso');
        expect(normalized).toBe(true);
      });

      it('debe convertir número 1 a boolean true', () => {
        const normalized = normalizeCorrectAnswer(1, 'verdadero_falso');
        expect(normalized).toBe(true);
      });

      it('debe convertir número 0 a boolean false', () => {
        const normalized = normalizeCorrectAnswer(0, 'verdadero_falso');
        expect(normalized).toBe(false);
      });

      it('debe convertir string "false" a boolean', () => {
        const normalized = normalizeCorrectAnswer('false', 'verdadero_falso');
        expect(normalized).toBe(false);
      });

      it('debe manejar espacios en strings booleanos', () => {
        const normalized = normalizeCorrectAnswer('  true  ', 'verdadero_falso');
        expect(normalized).toBe(true);
      });
    });

    describe('Preguntas abiertas', () => {
      it('debe mantener texto como string', () => {
        const normalized = normalizeCorrectAnswer('París', 'abierta');
        expect(normalized).toBe('París');
      });

      it('debe eliminar espacios en blanco', () => {
        const normalized = normalizeCorrectAnswer('  París  ', 'abierta');
        expect(normalized).toBe('París');
      });

      it('debe convertir números a string', () => {
        const normalized = normalizeCorrectAnswer(42, 'abierta');
        expect(normalized).toBe('42');
      });
    });
  });
});
