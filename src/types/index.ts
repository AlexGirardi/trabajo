export interface User {
  id: string;
  nombre: string;
  email: string;
  fechaRegistro: Date;
  avatar?: string;
}

export interface Course {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  fechaCreacion: Date;
  profesor: string;
  semestre?: string;
  color: string;
  tags?: string[];
  usuarioId?: string;
  materialesCount: number;
  examenesCount?: number;
}

export interface Material {
  id: string;
  nombre: string;
  tipo: 'pdf' | 'texto' | 'documento';
  contenido: string;
  fechaSubida: Date;
  cursoId: string;
  tamaño: number;
}

export interface Question {
  id: string;
  tipo: 'multiple' | 'verdadero_falso' | 'abierta';
  pregunta: string;
  opciones?: string[];
  respuestaCorrecta: string | number;
  explicacion?: string;
  puntos: number;
}

export interface Exam {
  id: string;
  titulo: string;
  descripcion: string;
  cursoId: string;
  nombreCurso?: string;
  preguntas: Question[];
  fechaCreacion: Date;
  duracionMinutos: number;
  intentosMaximos: number;
  puntuacionTotal: number;
  dificultad?: 'facil' | 'medio' | 'dificil';
}

export interface ExamAttempt {
  id: string;
  examenId: string;
  usuarioId: string;
  respuestas: Record<string, any>;
  puntuacion: number;
  fechaInicio: Date;
  fechaFin?: Date;
  completado: boolean;
}

export interface ExamResult {
  id: string;
  intentoId: string;
  puntuacionObtenida: number;
  puntuacionMaxima: number;
  porcentaje: number;
  tiempoEmpleado: number;
  respuestasCorrectas: number;
  respuestasIncorrectas: number;
  respuestasEnBlanco: number;
}

export interface AIProvider {
  id: string;
  nombre: string;
  endpoint: string;
  apiKey: string;
  activo: boolean;
}

export interface ExamGenerationRequest {
  cursoId: string;
  numeroPreguntas: number;
  tiposPreguntas: Question['tipo'][];
  dificultad: 'facil' | 'medio' | 'dificil';
  temas?: string[];
  duracionMinutos: number;
}
