import { PrismaClient } from '../generated/prisma';
import { Repository, UnitOfWork } from './interfaces';
import { Course, Exam, ExamAttempt, ExamResult, Material } from '../domain/models';

const prisma = new PrismaClient();

// Generic mapper helpers (Prisma types ~= domain types so minimal mapping)
function mapCourse(c: any): Course { return { ...c, fechaCreacion: c.fechaCreacion.toISOString() }; }
function mapMaterial(m: any): Material { return { ...m, fechaSubida: m.fechaSubida.toISOString() }; }
function mapExam(e: any): Exam {
  const preguntas = (e.preguntas || []).map((q: any) => {
    let rc: any = q.respuestaCorrecta;
    if (q.tipo === 'verdadero_falso') {
      rc = rc === true || rc === 'true';
    } else if (q.tipo === 'multiple') {
      rc = typeof rc === 'number' ? rc : parseInt(rc, 10);
      if (Number.isNaN(rc)) rc = 0;
    } else if (q.tipo === 'abierta') {
      rc = typeof rc === 'string' ? rc : String(rc ?? '');
    }
    return { ...q, respuestaCorrecta: rc };
  });
  return { ...e, fechaCreacion: e.fechaCreacion.toISOString(), preguntas };
}
function mapAttempt(a: any): ExamAttempt { return { ...a, startTime: a.startTime.toISOString(), endTime: a.endTime?.toISOString() }; }
function mapResult(r: any): ExamResult { return { ...r, createdOn: r.createdOn.toISOString() }; }

class CourseRepo implements Repository<Course> {
  async findAll(): Promise<Course[]> { return (await prisma.course.findMany()).map(mapCourse); }
  async findById(id: string): Promise<Course | undefined> { const c = await prisma.course.findUnique({ where: { id } }); return c ? mapCourse(c) : undefined; }
  async create(data: Omit<Course,'id'>): Promise<Course> { const created = await prisma.course.create({ data }); return mapCourse(created); }
  async update(id: string, partial: Partial<Course>): Promise<Course | undefined> { const updated = await prisma.course.update({ where: { id }, data: partial }); return updated && mapCourse(updated); }
  async delete(id: string): Promise<boolean> { await prisma.course.delete({ where: { id } }); return true; }
}

class MaterialRepo implements Repository<Material> {
  async findAll(filter?: any): Promise<Material[]> { return (await prisma.material.findMany({ where: filter })).map(mapMaterial); }
  async findById(id: string): Promise<Material | undefined> { const m = await prisma.material.findUnique({ where: { id } }); return m ? mapMaterial(m) : undefined; }
  async create(data: Omit<Material,'id'>): Promise<Material> { const created = await prisma.material.create({ data }); return mapMaterial(created); }
  async update(id: string, partial: Partial<Material>): Promise<Material | undefined> { const updated = await prisma.material.update({ where: { id }, data: partial }); return updated && mapMaterial(updated); }
  async delete(id: string): Promise<boolean> { await prisma.material.delete({ where: { id } }); return true; }
}

class ExamRepo implements Repository<Exam> {
  async findAll(filter?: any): Promise<Exam[]> { return (await prisma.exam.findMany({ where: filter, include: { preguntas: true } })).map(mapExam); }
  async findById(id: string): Promise<Exam | undefined> { const e = await prisma.exam.findUnique({ where: { id }, include: { preguntas: true } }); return e ? mapExam(e) : undefined; }
  async create(data: Omit<Exam,'id'>): Promise<Exam> {
    const { preguntas, ...rest } = data as any;
    // Coerce respuestaCorrecta to string to satisfy Prisma schema (currently String)
    const created = await prisma.exam.create({
      data: { ...rest, preguntas: { create: (preguntas || []).map((q: any) => ({ ...q, respuestaCorrecta: String(q.respuestaCorrecta) })) } },
      include: { preguntas: true }
    });
    return mapExam(created);
  }
  async update(id: string, partial: Partial<Exam>): Promise<Exam | undefined> {
    const { preguntas, ...rest } = partial as any;
    if (preguntas) {
      // naive replace strategy
      await prisma.question.deleteMany({ where: { examId: id } });
      const updated = await prisma.exam.update({
        where: { id },
        data: { ...rest, preguntas: { create: preguntas.map((q: any) => ({ ...q, respuestaCorrecta: String(q.respuestaCorrecta) })) } },
        include: { preguntas: true }
      });
      return mapExam(updated);
    }
    const updated = await prisma.exam.update({ where: { id }, data: rest, include: { preguntas: true } });
    return mapExam(updated);
  }
  async delete(id: string): Promise<boolean> { await prisma.exam.delete({ where: { id } }); return true; }
}

class AttemptRepo implements Repository<ExamAttempt> {
  async findAll(): Promise<ExamAttempt[]> { return (await prisma.examAttempt.findMany()).map(mapAttempt); }
  async findById(id: string): Promise<ExamAttempt | undefined> { const a = await prisma.examAttempt.findUnique({ where: { id } }); return a ? mapAttempt(a) : undefined; }
  async create(data: Omit<ExamAttempt,'id'>): Promise<ExamAttempt> { const created = await prisma.examAttempt.create({ data }); return mapAttempt(created); }
  async update(id: string, partial: Partial<ExamAttempt>): Promise<ExamAttempt | undefined> { const updated = await prisma.examAttempt.update({ where: { id }, data: partial }); return updated && mapAttempt(updated); }
  async delete(id: string): Promise<boolean> { await prisma.examAttempt.delete({ where: { id } }); return true; }
}

class ResultRepo implements Repository<ExamResult> {
  async findAll(): Promise<ExamResult[]> { return (await prisma.examResult.findMany()).map(mapResult); }
  async findById(id: string): Promise<ExamResult | undefined> { const r = await prisma.examResult.findUnique({ where: { id } }); return r ? mapResult(r) : undefined; }
  async create(data: Omit<ExamResult,'id'>): Promise<ExamResult> { const created = await prisma.examResult.create({ data }); return mapResult(created); }
  async update(id: string, partial: Partial<ExamResult>): Promise<ExamResult | undefined> { const updated = await prisma.examResult.update({ where: { id }, data: partial }); return updated && mapResult(updated); }
  async delete(id: string): Promise<boolean> { await prisma.examResult.delete({ where: { id } }); return true; }
}

export function createPostgresUoW(): UnitOfWork {
  return {
    courses: new CourseRepo(),
    materials: new MaterialRepo(),
    exams: new ExamRepo(),
    attempts: new AttemptRepo(),
    results: new ResultRepo()
  };
}
