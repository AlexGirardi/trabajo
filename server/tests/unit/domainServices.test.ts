/**
 * Pruebas unitarias para servicios de dominio
 * - Gestión de contadores en cursos (RF1, RF11)
 * - Metadatos de fechas
 * - Cálculo de puntuación total en exámenes
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DomainServices } from '../../src/services/domainServices';
import { createInMemoryUoW } from '../../src/repositories/memory';

describe('DomainServices - Gestión de Contadores y Metadatos (RF1, RF11)', () => {
  let services: DomainServices;

  beforeEach(() => {
    // Usar repositorio en memoria para tests
    const uow = createInMemoryUoW();
    services = new DomainServices(uow);
  });

  describe('Contadores de materiales en cursos', () => {
    it('debe inicializar curso con materialesCount = 0', async () => {
      const course = await services.createCourse({
        nombre: 'Matemáticas',
        descripcion: 'Curso de matemáticas avanzadas',
      });

      expect(course.materialesCount).toBe(0);
    });

    it('debe incrementar materialesCount al añadir material', async () => {
      const course = await services.createCourse({
        nombre: 'Matemáticas',
        descripcion: 'Curso de matemáticas',
      });

      await services.createMaterial({
        cursoId: course.id,
        nombre: 'Álgebra Lineal',
        tipo: 'pdf',
        contenido: 'Contenido del material...',
        tamaño: 1024,
      });

      const updatedCourse = await services.listCourses();
      const foundCourse = updatedCourse.find(c => c.id === course.id);

      expect(foundCourse).toBeDefined();
      expect(foundCourse!.materialesCount).toBe(1);
    });

    it('debe incrementar materialesCount correctamente al añadir múltiples materiales', async () => {
      const course = await services.createCourse({
        nombre: 'Física',
        descripcion: 'Curso de física',
      });

      await services.createMaterial({
        cursoId: course.id,
        nombre: 'Material 1',
        tipo: 'texto',
        contenido: 'Contenido 1',
        tamaño: 100,
      });

      await services.createMaterial({
        cursoId: course.id,
        nombre: 'Material 2',
        tipo: 'pdf',
        contenido: 'Contenido 2',
        tamaño: 200,
      });

      await services.createMaterial({
        cursoId: course.id,
        nombre: 'Material 3',
        tipo: 'documento',
        contenido: 'Contenido 3',
        tamaño: 300,
      });

      const courses = await services.listCourses();
      const foundCourse = courses.find(c => c.id === course.id);

      expect(foundCourse!.materialesCount).toBe(3);
    });

    it('debe decrementar materialesCount al eliminar material', async () => {
      const course = await services.createCourse({
        nombre: 'Química',
        descripcion: 'Curso de química',
      });

      const material = await services.createMaterial({
        cursoId: course.id,
        nombre: 'Tabla Periódica',
        tipo: 'pdf',
        contenido: 'Contenido...',
        tamaño: 500,
      });

      await services.deleteMaterial(material.id);

      const courses = await services.listCourses();
      const foundCourse = courses.find(c => c.id === course.id);

      expect(foundCourse!.materialesCount).toBe(0);
    });

    it('debe mantener contador correcto tras múltiples operaciones', async () => {
      const course = await services.createCourse({
        nombre: 'Historia',
        descripcion: 'Curso de historia',
      });

      // Añadir 3 materiales
      const m1 = await services.createMaterial({
        cursoId: course.id,
        nombre: 'Material 1',
        tipo: 'texto',
        contenido: 'Contenido 1',
        tamaño: 100,
      });

      const m2 = await services.createMaterial({
        cursoId: course.id,
        nombre: 'Material 2',
        tipo: 'texto',
        contenido: 'Contenido 2',
        tamaño: 100,
      });

      const m3 = await services.createMaterial({
        cursoId: course.id,
        nombre: 'Material 3',
        tipo: 'texto',
        contenido: 'Contenido 3',
        tamaño: 100,
      });

      // Eliminar uno
      await services.deleteMaterial(m2.id);

      const courses = await services.listCourses();
      const foundCourse = courses.find(c => c.id === course.id);

      expect(foundCourse!.materialesCount).toBe(2);
    });

    it('no debe permitir contador negativo', async () => {
      const course = await services.createCourse({
        nombre: 'Biología',
        descripcion: 'Curso de biología',
      });

      // Intentar eliminar material inexistente
      const deleted = await services.deleteMaterial('material-inexistente');

      expect(deleted).toBe(false);

      const courses = await services.listCourses();
      const foundCourse = courses.find(c => c.id === course.id);

      expect(foundCourse!.materialesCount).toBe(0);
    });
  });

  describe('Contadores de exámenes en cursos', () => {
    it('debe inicializar curso con examenesCount = 0', async () => {
      const course = await services.createCourse({
        nombre: 'Programación',
        descripcion: 'Curso de programación',
      });

      expect(course.examenesCount).toBe(0);
    });

    it('debe incrementar examenesCount al crear examen', async () => {
      const course = await services.createCourse({
        nombre: 'JavaScript',
        descripcion: 'Curso de JS',
      });

      await services.createExam({
        cursoId: course.id,
        titulo: 'Examen 1',
        descripcion: 'Primer examen',
        duracionMinutos: 60,
        intentosMaximos: 3,
        preguntas: [
          {
            tipo: 'multiple',
            pregunta: '¿Qué es JavaScript?',
            opciones: ['Lenguaje', 'Base de datos', 'Framework', 'Librería'],
            respuestaCorrecta: 0,
            puntos: 10,
          },
        ],
      });

      const courses = await services.listCourses();
      const foundCourse = courses.find(c => c.id === course.id);

      expect(foundCourse!.examenesCount).toBe(1);
    });

    it('debe decrementar examenesCount al eliminar examen', async () => {
      const course = await services.createCourse({
        nombre: 'Python',
        descripcion: 'Curso de Python',
      });

      const exam = await services.createExam({
        cursoId: course.id,
        titulo: 'Examen Python',
        descripcion: 'Examen de Python',
        duracionMinutos: 45,
        intentosMaximos: 2,
        preguntas: [
          {
            tipo: 'verdadero_falso',
            pregunta: '¿Python es interpretado?',
            respuestaCorrecta: true,
            puntos: 5,
          },
        ],
      });

      await services.deleteExam(exam.id);

      const courses = await services.listCourses();
      const foundCourse = courses.find(c => c.id === course.id);

      expect(foundCourse!.examenesCount).toBe(0);
    });
  });

  describe('Metadatos de fechas', () => {
    it('debe asignar fechaCreacion al crear curso', async () => {
      const course = await services.createCourse({
        nombre: 'Curso Test',
        descripcion: 'Test',
      });

      expect(course.fechaCreacion).toBeDefined();
      expect(typeof course.fechaCreacion).toBe('string');

      // Verificar que es una fecha válida ISO 8601
      const date = new Date(course.fechaCreacion);
      expect(date.toISOString()).toBe(course.fechaCreacion);
    });

    it('debe asignar fechaSubida al crear material', async () => {
      const course = await services.createCourse({
        nombre: 'Curso',
        descripcion: 'Descripción',
      });

      const material = await services.createMaterial({
        cursoId: course.id,
        nombre: 'Material',
        tipo: 'texto',
        contenido: 'Contenido',
        tamaño: 100,
      });

      expect(material.fechaSubida).toBeDefined();
      expect(typeof material.fechaSubida).toBe('string');

      // Verificar que es una fecha válida ISO 8601
      const date = new Date(material.fechaSubida);
      expect(date.toISOString()).toBe(material.fechaSubida);
    });

    it('debe asignar fechaCreacion al crear examen', async () => {
      const course = await services.createCourse({
        nombre: 'Curso',
        descripcion: 'Descripción',
      });

      const exam = await services.createExam({
        cursoId: course.id,
        titulo: 'Examen',
        descripcion: 'Descripción del examen',
        duracionMinutos: 30,
        intentosMaximos: 1,
        preguntas: [
          {
            tipo: 'abierta',
            pregunta: '¿Qué es la gravedad?',
            respuestaCorrecta: 'Fuerza de atracción',
            puntos: 10,
          },
        ],
      });

      expect(exam.fechaCreacion).toBeDefined();
      expect(typeof exam.fechaCreacion).toBe('string');

      // Verificar que es una fecha válida ISO 8601
      const date = new Date(exam.fechaCreacion);
      expect(date.toISOString()).toBe(exam.fechaCreacion);
    });

    it('debe asignar createdOn al crear resultado', async () => {
      const course = await services.createCourse({
        nombre: 'Curso',
        descripcion: 'Descripción',
      });

      const exam = await services.createExam({
        cursoId: course.id,
        titulo: 'Examen',
        descripcion: 'Desc',
        duracionMinutos: 30,
        intentosMaximos: 1,
        preguntas: [
          {
            tipo: 'multiple',
            pregunta: 'Pregunta',
            opciones: ['A', 'B', 'C', 'D'],
            respuestaCorrecta: 0,
            puntos: 10,
          },
        ],
      });

      const attempt = await services.createAttempt({
        examId: exam.id,
        startTime: new Date().toISOString(),
        completado: false,
      });

      const result = await services.createResult({
        examId: exam.id,
        attemptId: attempt.id,
        correctAnswers: 1,
        incorrectAnswers: 0,
        blankAnswers: 0,
        percentage: 100,
        totalPoints: 10,
        earnedPoints: 10,
      });

      expect(result.createdOn).toBeDefined();
      expect(typeof result.createdOn).toBe('string');

      // Verificar que es una fecha válida ISO 8601
      const date = new Date(result.createdOn);
      expect(date.toISOString()).toBe(result.createdOn);
    });
  });

  describe('Cálculo de puntuación total en exámenes', () => {
    it('debe calcular puntuacionTotal al crear examen', async () => {
      const course = await services.createCourse({
        nombre: 'Curso',
        descripcion: 'Descripción',
      });

      const exam = await services.createExam({
        cursoId: course.id,
        titulo: 'Examen Completo',
        descripcion: 'Examen con múltiples preguntas',
        duracionMinutos: 60,
        intentosMaximos: 2,
        preguntas: [
          {
            tipo: 'multiple',
            pregunta: 'Pregunta 1',
            opciones: ['A', 'B', 'C', 'D'],
            respuestaCorrecta: 0,
            puntos: 5,
          },
          {
            tipo: 'verdadero_falso',
            pregunta: 'Pregunta 2',
            respuestaCorrecta: true,
            puntos: 3,
          },
          {
            tipo: 'abierta',
            pregunta: 'Pregunta 3',
            respuestaCorrecta: 'Respuesta',
            puntos: 7,
          },
        ],
      });

      expect(exam.puntuacionTotal).toBe(15); // 5 + 3 + 7
    });

    it('debe recalcular puntuacionTotal al actualizar preguntas', async () => {
      const course = await services.createCourse({
        nombre: 'Curso',
        descripcion: 'Descripción',
      });

      const exam = await services.createExam({
        cursoId: course.id,
        titulo: 'Examen',
        descripcion: 'Desc',
        duracionMinutos: 30,
        intentosMaximos: 1,
        preguntas: [
          {
            tipo: 'multiple',
            pregunta: 'Pregunta 1',
            opciones: ['A', 'B'],
            respuestaCorrecta: 0,
            puntos: 10,
          },
        ],
      });

      expect(exam.puntuacionTotal).toBe(10);

      const updated = await services.updateExam(exam.id, {
        preguntas: [
          {
            tipo: 'multiple',
            pregunta: 'Pregunta 1',
            opciones: ['A', 'B'],
            respuestaCorrecta: 0,
            puntos: 10,
          },
          {
            tipo: 'verdadero_falso',
            pregunta: 'Pregunta 2',
            respuestaCorrecta: false,
            puntos: 5,
          },
        ],
      });

      expect(updated!.puntuacionTotal).toBe(15); // 10 + 5
    });

    it('debe asignar IDs únicos a las preguntas', async () => {
      const course = await services.createCourse({
        nombre: 'Curso',
        descripcion: 'Descripción',
      });

      const exam = await services.createExam({
        cursoId: course.id,
        titulo: 'Examen',
        descripcion: 'Desc',
        duracionMinutos: 30,
        intentosMaximos: 1,
        preguntas: [
          {
            tipo: 'multiple',
            pregunta: 'Pregunta 1',
            opciones: ['A', 'B'],
            respuestaCorrecta: 0,
            puntos: 5,
          },
          {
            tipo: 'verdadero_falso',
            pregunta: 'Pregunta 2',
            respuestaCorrecta: true,
            puntos: 5,
          },
        ],
      });

      expect(exam.preguntas).toHaveLength(2);
      expect(exam.preguntas[0].id).toBeDefined();
      expect(exam.preguntas[1].id).toBeDefined();
      expect(exam.preguntas[0].id).not.toBe(exam.preguntas[1].id);
    });
  });

  describe('Validación de datos con Zod', () => {
    it('debe rechazar curso sin nombre', async () => {
      await expect(
        services.createCourse({
          nombre: '',
          descripcion: 'Descripción',
        } as any)
      ).rejects.toThrow();
    });

    it('debe rechazar material sin contenido', async () => {
      const course = await services.createCourse({
        nombre: 'Curso',
        descripcion: 'Desc',
      });

      await expect(
        services.createMaterial({
          cursoId: course.id,
          nombre: 'Material',
          tipo: 'texto',
          contenido: '',
          tamaño: 100,
        })
      ).rejects.toThrow();
    });

    it('debe rechazar examen sin preguntas', async () => {
      const course = await services.createCourse({
        nombre: 'Curso',
        descripcion: 'Desc',
      });

      await expect(
        services.createExam({
          cursoId: course.id,
          titulo: 'Examen',
          descripcion: 'Desc',
          duracionMinutos: 30,
          intentosMaximos: 1,
          preguntas: [],
        })
      ).rejects.toThrow();
    });

    it('debe rechazar puntos negativos en pregunta', async () => {
      const course = await services.createCourse({
        nombre: 'Curso',
        descripcion: 'Desc',
      });

      await expect(
        services.createExam({
          cursoId: course.id,
          titulo: 'Examen',
          descripcion: 'Desc',
          duracionMinutos: 30,
          intentosMaximos: 1,
          preguntas: [
            {
              tipo: 'multiple',
              pregunta: 'Pregunta',
              opciones: ['A', 'B'],
              respuestaCorrecta: 0,
              puntos: -5, // Inválido
            },
          ],
        })
      ).rejects.toThrow();
    });
  });
});
