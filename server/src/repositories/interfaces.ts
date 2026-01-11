import type { Course, Material, Exam, ExamAttempt, ExamResult } from '../domain/models';

export interface Repository<T extends { id: string }> {
  findAll(filter?: any): Promise<T[]>;
  findById(id: string): Promise<T | undefined>;
  create(data: Omit<T, 'id'>): Promise<T>;
  update(id: string, partial: Partial<T>): Promise<T | undefined>;
  delete(id: string): Promise<boolean>;
}

export interface CourseRepository extends Repository<Course> {}
export interface MaterialRepository extends Repository<Material> {}
export interface ExamRepository extends Repository<Exam> {}
export interface ExamAttemptRepository extends Repository<ExamAttempt> {}
export interface ExamResultRepository extends Repository<ExamResult> {}

export interface UnitOfWork {
  courses: CourseRepository;
  materials: MaterialRepository;
  exams: ExamRepository;
  attempts: ExamAttemptRepository;
  results: ExamResultRepository;
}
