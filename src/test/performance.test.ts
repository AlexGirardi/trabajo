/**
 * Pruebas de rendimiento de operaciones clave
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CourseService } from '../services/courseService';
import { MaterialService } from '../services/materialService';
import { ExamService } from '../services/examService';

describe('Mediciones de Rendimiento', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('debe medir el tiempo de creación de un curso', () => {
    const start = performance.now();

    const curso = CourseService.saveCourse({
      nombre: 'Física Cuántica',
      descripcion: 'Curso de física cuántica avanzada',
      color: '#2196f3'
    });

    const duration = performance.now() - start;

    console.log(`  → Creación de curso: ${duration.toFixed(2)} ms`);
    expect(curso).toBeDefined();
    expect(curso.nombre).toBe('Física Cuántica');
    expect(duration).toBeLessThan(100);
  });

  it('debe medir el tiempo de creación de múltiples materiales', () => {
    const curso = CourseService.saveCourse({
      nombre: 'Test Course',
      descripcion: 'Test',
      color: '#000000'
    });

    const start = performance.now();

    for (let i = 0; i < 10; i++) {
      MaterialService.saveMaterial({
        cursoId: curso.id,
        nombre: `Material ${i + 1}.txt`,
        tipo: 'texto',
        contenido: 'A'.repeat(5000),
        tamaño: 5000
      });
    }

    const duration = performance.now() - start;
    const avgPerMaterial = duration / 10;

    console.log(`  → Creación de 10 materiales: ${duration.toFixed(2)} ms (${avgPerMaterial.toFixed(2)} ms por material)`);
    expect(duration).toBeLessThan(500);
  });

  it('debe medir el tiempo de listado de cursos', () => {
    for (let i = 0; i < 5; i++) {
      CourseService.saveCourse({
        nombre: `Curso ${i + 1}`,
        descripcion: `Descripción ${i + 1}`,
        color: '#000000'
      });
    }

    const start = performance.now();
    const courses = CourseService.getCourses();
    const duration = performance.now() - start;

    console.log(`  → Listado de ${courses.length} cursos: ${duration.toFixed(2)} ms`);
    expect(courses.length).toBe(5);
    expect(duration).toBeLessThan(50);
  });

  it('debe medir el tiempo de listado de materiales por curso', () => {
    const curso = CourseService.saveCourse({
      nombre: 'Test',
      descripcion: 'Test',
      color: '#000000'
    });

    for (let i = 0; i < 10; i++) {
      MaterialService.saveMaterial({
        cursoId: curso.id,
        nombre: `Material ${i}.txt`,
        tipo: 'texto',
        contenido: 'Test content',
        tamaño: 100
      });
    }

    const start = performance.now();
    const materials = MaterialService.getMaterialsByCourse(curso.id);
    const duration = performance.now() - start;

    console.log(`  → Listado de ${materials.length} materiales: ${duration.toFixed(2)} ms`);
    expect(materials.length).toBe(10);
    expect(duration).toBeLessThan(50);
  });

  it('debe medir el tiempo de obtención de contenido del curso', () => {
    const curso = CourseService.saveCourse({
      nombre: 'Test',
      descripcion: 'Test',
      color: '#000000'
    });

    for (let i = 0; i < 5; i++) {
      MaterialService.saveMaterial({
        cursoId: curso.id,
        nombre: `Material ${i}.txt`,
        tipo: 'texto',
        contenido: 'Lorem ipsum dolor sit amet. '.repeat(200),
        tamaño: 5000
      });
    }

    const start = performance.now();
    const content = MaterialService.getCourseContent(curso.id);
    const duration = performance.now() - start;

    console.log(`  → Obtención de contenido (${content.length} caracteres): ${duration.toFixed(2)} ms`);
    expect(content.length).toBeGreaterThan(0);
    expect(duration).toBeLessThan(100);
  });

  it('debe medir el tiempo de actualización de un curso', () => {
    const curso = CourseService.saveCourse({
      nombre: 'Original',
      descripcion: 'Original desc',
      color: '#000000'
    });

    const start = performance.now();
    const updated = CourseService.updateCourse(curso.id, {
      descripcion: 'Nueva descripción actualizada con más texto'
    });
    const duration = performance.now() - start;

    console.log(`  → Actualización de curso: ${duration.toFixed(2)} ms`);
    expect(updated).toBeDefined();
    expect(updated?.descripcion).toBe('Nueva descripción actualizada con más texto');
    expect(duration).toBeLessThan(100);
  });

  it('debe medir el tiempo de eliminación de un material', () => {
    const curso = CourseService.saveCourse({
      nombre: 'Test',
      descripcion: 'Test',
      color: '#000000'
    });

    const material = MaterialService.saveMaterial({
      cursoId: curso.id,
      nombre: 'Material.txt',
      tipo: 'texto',
      contenido: 'Content',
      tamaño: 100
    });

    const start = performance.now();
    const deleted = MaterialService.deleteMaterial(material.id);
    const duration = performance.now() - start;

    console.log(`  → Eliminación de material: ${duration.toFixed(2)} ms`);
    expect(deleted).toBe(true);
    expect(duration).toBeLessThan(100);
  });

  it('debe medir el tiempo de creación de un examen', () => {
    const curso = CourseService.saveCourse({
      nombre: 'Test',
      descripcion: 'Test',
      color: '#000000'
    });

    const start = performance.now();
    const exam = ExamService.saveExam({
      cursoId: curso.id,
      titulo: 'Examen de prueba',
      descripcion: 'Descripción del examen',
      preguntas: [
        {
          id: '1',
          enunciado: '¿Cuál es la capital de Francia?',
          tipo: 'multiple',
          opciones: ['París', 'Londres', 'Berlín', 'Madrid'],
          respuestaCorrecta: 0,
          puntos: 10
        },
        {
          id: '2',
          enunciado: '¿Es la Tierra plana?',
          tipo: 'verdadero_falso',
          respuestaCorrecta: false,
          puntos: 5
        }
      ]
    });
    const duration = performance.now() - start;

    console.log(`  → Creación de examen (2 preguntas): ${duration.toFixed(2)} ms`);
    expect(exam).toBeDefined();
    expect(exam.preguntas.length).toBe(2);
    expect(duration).toBeLessThan(100);
  });
});
