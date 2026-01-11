import { Course, Exam, ExamAttempt, ExamResult, Material } from '../domain/models';
import { CourseRepository, ExamAttemptRepository, ExamRepository, ExamResultRepository, MaterialRepository, Repository, UnitOfWork } from './interfaces';

function genId() { return Math.random().toString(36).slice(2,11); }

class InMemoryRepo<T extends { id: string }> implements Repository<T> {
  protected items: T[] = [];
  constructor(seed: T[] = []) { this.items = seed; }
  async findAll(filter?: any): Promise<T[]> {
    if (!filter) return [...this.items];
    return this.items.filter(it => Object.entries(filter).every(([k,v]) => (it as any)[k] === v));
  }
  async findById(id: string): Promise<T | undefined> { return this.items.find(i => i.id === id); }
  async create(data: Omit<T, 'id'>): Promise<T> { const obj = { ...data, id: genId() } as T; this.items.push(obj); return obj; }
  async update(id: string, partial: Partial<T>): Promise<T | undefined> {
    const idx = this.items.findIndex(i => i.id === id); if (idx === -1) return undefined;
    this.items[idx] = { ...this.items[idx], ...partial };
    return this.items[idx];
  }
  async delete(id: string): Promise<boolean> { const idx = this.items.findIndex(i => i.id === id); if (idx === -1) return false; this.items.splice(idx,1); return true; }
}

class InMemoryCourseRepo extends InMemoryRepo<Course> implements CourseRepository {}
class InMemoryMaterialRepo extends InMemoryRepo<Material> implements MaterialRepository {}
class InMemoryExamRepo extends InMemoryRepo<Exam> implements ExamRepository {}
class InMemoryAttemptRepo extends InMemoryRepo<ExamAttempt> implements ExamAttemptRepository {}
class InMemoryResultRepo extends InMemoryRepo<ExamResult> implements ExamResultRepository {}

export function createInMemoryUoW(): UnitOfWork {
  return {
    courses: new InMemoryCourseRepo(),
    materials: new InMemoryMaterialRepo(),
    exams: new InMemoryExamRepo(),
    attempts: new InMemoryAttemptRepo(),
    results: new InMemoryResultRepo()
  };
}
