import { z } from 'zod';
import { createInMemoryUoW } from '../repositories/memory';
import { createPostgresUoW } from '../repositories/postgres';
import type { UnitOfWork } from '../repositories/interfaces';
import type { Course, NewCourse, UpdateCourse, NewMaterial, Material, NewExam, Exam, Question, UpdateExam, NewExamAttempt, ExamAttempt, NewExamResult, ExamResult } from '../domain/models';

// Schemas reused for validation (service boundary)
const courseSchema = z.object({
  nombre: z.string().min(2),
  descripcion: z.string().optional().default(''),
  categoria: z.string().optional(),
  semestre: z.string().optional(),
  profesor: z.string().optional(),
  color: z.string().optional(),
  tags: z.array(z.string()).optional().default([])
});

const materialSchema = z.object({
  cursoId: z.string(),
  nombre: z.string().min(1),
  tipo: z.enum(['pdf','texto','documento']).default('texto'),
  contenido: z.string().min(1),
  tamaño: z.number().int().nonnegative(),
  activo: z.boolean().optional().default(true)
});

const questionSchema = z.object({
  id: z.string().optional(),
  tipo: z.enum(['multiple','verdadero_falso','abierta']),
  pregunta: z.string().min(1),
  opciones: z.array(z.string()).optional(),
  respuestaCorrecta: z.union([z.string(), z.number(), z.boolean()]),
  explicacion: z.string().optional(),
  puntos: z.number().positive().default(1)
});

const examSchema = z.object({
  cursoId: z.string(),
  titulo: z.string().min(2),
  descripcion: z.string().optional().default(''),
  dificultad: z.enum(['facil','medio','dificil']).optional(),
  duracionMinutos: z.number().int().positive(),
  intentosMaximos: z.number().int().positive().default(1),
  preguntas: z.array(questionSchema).min(1)
});

const examAttemptSchema = z.object({
  examId: z.string(),
  startTime: z.string(),
  endTime: z.string().optional(),
  completado: z.boolean().default(false)
});

const examResultSchema = z.object({
  examId: z.string(),
  attemptId: z.string(),
  correctAnswers: z.number().int().nonnegative(),
  incorrectAnswers: z.number().int().nonnegative(),
  blankAnswers: z.number().int().nonnegative(),
  percentage: z.number().min(0).max(100),
  totalPoints: z.number().nonnegative(),
  earnedPoints: z.number().nonnegative(),
});

function nowISO() { return new Date().toISOString(); }
function withId<T extends { id: string }>(obj: T) { return obj; }
function genId() { return Math.random().toString(36).slice(2,11); }

export class DomainServices {
  constructor(private uow: UnitOfWork) {}

  // Courses
  async listCourses(): Promise<Course[]> { return this.uow.courses.findAll(); }
  async createCourse(data: NewCourse): Promise<Course> {
    const parsed = courseSchema.safeParse(data);
    if (!parsed.success) throw parsed.error;
    return this.uow.courses.create({
      fechaCreacion: nowISO(),
      materialesCount: 0,
      examenesCount: 0,
      ...parsed.data,
      tags: parsed.data.tags || []
    } as any);
  }
  async updateCourse(id: string, patch: UpdateCourse): Promise<Course | undefined> {
    return this.uow.courses.update(id, patch as any);
  }
  async deleteCourse(id: string): Promise<boolean> { return this.uow.courses.delete(id); }

  // Materials
  async listMaterials(filter?: { cursoId?: string }): Promise<Material[]> {
    return this.uow.materials.findAll(filter && filter.cursoId ? { cursoId: filter.cursoId } : undefined);
  }
  async createMaterial(data: NewMaterial): Promise<Material> {
    const parsed = materialSchema.safeParse(data);
    if (!parsed.success) throw parsed.error;
  const material = await this.uow.materials.create({ fechaSubida: nowISO(), ...parsed.data } as any);
    // Update course counter
    const course = await this.uow.courses.findById(material.cursoId);
    if (course) {
      await this.uow.courses.update(course.id, { materialesCount: course.materialesCount + 1 });
    }
    return material;
  }
  async deleteMaterial(id: string): Promise<boolean> {
    const mat = await this.uow.materials.findById(id);
    if (!mat) return false;
    const ok = await this.uow.materials.delete(id);
    if (ok) {
      const course = await this.uow.courses.findById(mat.cursoId);
      if (course && course.materialesCount > 0) {
        await this.uow.courses.update(course.id, { materialesCount: course.materialesCount - 1 });
      }
    }
    return ok;
  }
  async updateMaterial(id: string, patch: Partial<Material>): Promise<Material | undefined> {
    // Prevent changing cursoId to maintain counters consistency (could be enhanced later)
    if ((patch as any)?.cursoId) delete (patch as any).cursoId;
    return this.uow.materials.update(id, patch as any);
  }
  async deleteMaterialsByCourse(cursoId: string) {
    const list = await this.listMaterials({ cursoId });
    for (const m of list) { await this.uow.materials.delete(m.id); }
    const course = await this.uow.courses.findById(cursoId);
    if (course) await this.uow.courses.update(course.id, { materialesCount: 0 });
    return { removed: list.length };
  }

  // Exams
  async listExams(filter?: { cursoId?: string }): Promise<Exam[]> {
    return this.uow.exams.findAll(filter && filter.cursoId ? { cursoId: filter.cursoId } : undefined);
  }
  async getExam(id: string): Promise<Exam | undefined> { return this.uow.exams.findById(id); }
  async createExam(data: NewExam): Promise<Exam> {
    const parsed = examSchema.safeParse(data);
    if (!parsed.success) throw parsed.error;
    const preguntas = parsed.data.preguntas.map(q => ({ ...q, id: q.id || genId() }));
    const puntuacionTotal = preguntas.reduce((s,q)=> s+q.puntos,0);
  const exam = await this.uow.exams.create({ fechaCreacion: nowISO(), puntuacionTotal, ...parsed.data, preguntas } as any);
    const course = await this.uow.courses.findById(exam.cursoId);
    if (course) await this.uow.courses.update(course.id, { examenesCount: course.examenesCount + 1 });
    return exam;
  }
  async updateExam(id: string, patch: UpdateExam): Promise<Exam | undefined> {
    if (patch.preguntas) {
      const preguntas = patch.preguntas.map(q => ({ ...q, id: q.id || genId() }));
      const puntuacionTotal = preguntas.reduce((s,q)=> s+q.puntos,0);
      patch = { ...patch, preguntas, puntuacionTotal } as any;
    }
    return this.uow.exams.update(id, patch as any);
  }
  async deleteExam(id: string): Promise<boolean> {
    const exam = await this.uow.exams.findById(id);
    if (!exam) return false;
    const ok = await this.uow.exams.delete(id);
    if (ok) {
      const course = await this.uow.courses.findById(exam.cursoId);
      if (course && course.examenesCount > 0) await this.uow.courses.update(course.id, { examenesCount: course.examenesCount - 1 });
    }
    return ok;
  }

  // Attempts
  async listAttempts(): Promise<ExamAttempt[]> { return this.uow.attempts.findAll(); }
  async createAttempt(data: NewExamAttempt): Promise<ExamAttempt> {
    const parsed = examAttemptSchema.safeParse(data);
    if (!parsed.success) throw parsed.error;
  return this.uow.attempts.create({ ...parsed.data } as any);
  }

  // Results
  async listResults(): Promise<ExamResult[]> { return this.uow.results.findAll(); }
  async createResult(data: NewExamResult): Promise<ExamResult> {
    const parsed = examResultSchema.safeParse(data);
    if (!parsed.success) throw parsed.error;
  return this.uow.results.create({ createdOn: nowISO(), ...parsed.data } as any);
  }
}

// Factory selecting implementation (memory now; DB future)
export function buildServices(): DomainServices {
  const impl = process.env.REPO_IMPL || 'postgres';
  switch (impl) {
    case 'postgres':
  console.log('[boot] Using repository implementation: postgres');
      return new DomainServices(createPostgresUoW());
    case 'memory':
    default:
  console.log('[boot] Using repository implementation: memory');
      return new DomainServices(createInMemoryUoW());
  }
}

export const schemas = { courseSchema, materialSchema, examSchema, examAttemptSchema, examResultSchema };
