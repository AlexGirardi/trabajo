// Domain model definitions (pure, no framework dependencies)
export interface Course {
  id: string;
  fechaCreacion: string; // ISO
  nombre: string;
  descripcion?: string;
  categoria?: string;
  semestre?: string;
  profesor?: string;
  color?: string;
  tags: string[];
  materialesCount: number;
  examenesCount: number;
}

export interface Material {
  id: string;
  cursoId: string;
  nombre: string;
  tipo: 'pdf' | 'texto' | 'documento';
  contenido: string;
  fechaSubida: string;
  tamaño: number;
  activo?: boolean;
}

export interface Question {
  id: string;
  tipo: 'multiple' | 'verdadero_falso' | 'abierta';
  pregunta: string;
  opciones?: string[];
  respuestaCorrecta: string | number | boolean;
  explicacion?: string;
  puntos: number;
}

export interface Exam {
  id: string;
  cursoId: string;
  titulo: string;
  descripcion?: string;
  dificultad?: 'facil' | 'medio' | 'dificil';
  duracionMinutos: number;
  intentosMaximos: number;
  preguntas: Question[];
  fechaCreacion: string;
  puntuacionTotal: number;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  startTime: string;
  endTime?: string;
  completado: boolean;
}

export interface ExamResult {
  id: string;
  examId: string;
  attemptId: string;
  correctAnswers: number;
  incorrectAnswers: number;
  blankAnswers: number;
  percentage: number;
  totalPoints: number;
  earnedPoints: number;
  createdOn: string;
}

export type NewCourse = Omit<Course, 'id' | 'fechaCreacion' | 'materialesCount' | 'examenesCount'> & { tags?: string[] };
export type UpdateCourse = Partial<NewCourse>;

export type NewMaterial = Omit<Material, 'id' | 'fechaSubida'>;
export type UpdateMaterial = Partial<Omit<Material, 'id' | 'cursoId'>>;

export type NewExam = Omit<Exam, 'id' | 'fechaCreacion' | 'puntuacionTotal' | 'preguntas'> & { preguntas: Question[] };
export type UpdateExam = Partial<NewExam> & { preguntas?: Question[] };

export type NewExamAttempt = Omit<ExamAttempt, 'id'>;
export type NewExamResult = Omit<ExamResult, 'id' | 'createdOn'>;
