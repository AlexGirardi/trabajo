import type { Exam, Question } from '../types';
import { loadArray, saveArray, generateId, updateById, removeById, clearCache } from './storageUtils';

const USE_API = (import.meta as any).env?.VITE_USE_API === 'true';
const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:4000/api';

const EXAMS_STORAGE_KEY = 'estudia_exams';
const EXAM_ID_MAP_KEY = 'estudia_exam_id_map';

function loadIdMap(): Record<string,string> {
  try { return JSON.parse(localStorage.getItem(EXAM_ID_MAP_KEY) || '{}'); } catch { return {}; }
}
function saveIdMap(map: Record<string,string>) {
  try { localStorage.setItem(EXAM_ID_MAP_KEY, JSON.stringify(map)); } catch {}
}
export function resolveServerExamId(id: string): string {
  const map = loadIdMap();
  return map[id] || id;
}

export class ExamService {
  static getExams(): Exam[] { return loadArray<Exam>(EXAMS_STORAGE_KEY, { dateFields: ['fechaCreacion'] }); }

  static async fetchExams(): Promise<Exam[]> {
    if (!USE_API) return Promise.resolve(this.getExams());
    const res = await fetch(`${API_BASE}/exams`);
    if (!res.ok) throw new Error('Error fetching exams');
    const data = await res.json();
    const normalized = data.map((e: any) => ({
      ...e,
      fechaCreacion: e.fechaCreacion ? new Date(e.fechaCreacion) : new Date(),
      preguntas: (e.preguntas || []).map((q: any) => ({
        ...q,
        respuestaCorrecta: q.tipo === 'verdadero_falso'
          ? (q.respuestaCorrecta === true || q.respuestaCorrecta === 'true')
          : q.tipo === 'multiple'
            ? (typeof q.respuestaCorrecta === 'number' ? q.respuestaCorrecta : parseInt(q.respuestaCorrecta, 10))
            : (typeof q.respuestaCorrecta === 'string' ? q.respuestaCorrecta : String(q.respuestaCorrecta ?? ''))
      }))
    }));
    saveArray(EXAMS_STORAGE_KEY, normalized);
    return normalized;
  }

  // Obtener exámenes por curso
  static getExamsByCourse(cursoId: string): Exam[] {
    return this.getExams().filter(exam => exam.cursoId === cursoId);
  }  // Obtener un examen por ID
  static getExamById(id: string): Exam | undefined {
  const real = resolveServerExamId(id);
  return this.getExams().find(exam => exam.id === real || exam.id === id);
  }

  // Guardar un nuevo examen
  static saveExam(examData: Omit<Exam, 'id' | 'fechaCreacion' | 'puntuacionTotal'>): Exam {
    if (!USE_API) {
      const list = this.getExams();
      const puntuacionTotal = examData.preguntas.reduce((sum, p) => sum + p.puntos, 0);
      const newExam: Exam = { id: generateId(), fechaCreacion: new Date(), puntuacionTotal, ...examData };
      saveArray(EXAMS_STORAGE_KEY, [...list, newExam]);
      return newExam;
    }

    const phantomPuntuacion = examData.preguntas.reduce((s,p)=> s+p.puntos,0);
    const phantom: Exam = { id: generateId(), fechaCreacion: new Date(), puntuacionTotal: phantomPuntuacion, ...examData };
    const list = this.getExams();
    saveArray(EXAMS_STORAGE_KEY, [...list, phantom]);

    const payload = {
      cursoId: examData.cursoId,
      titulo: examData.titulo,
      descripcion: examData.descripcion,
      dificultad: (examData as any).dificultad,
      duracionMinutos: (examData as any).duracionMinutos,
      intentosMaximos: (examData as any).intentosMaximos,
      preguntas: examData.preguntas.map(q => ({
        id: (q as any).id, // si ya viene generada, se mantiene; el backend generará si falta
        tipo: q.tipo,
        pregunta: q.pregunta,
        opciones: q.opciones,
        respuestaCorrecta: q.respuestaCorrecta,
        explicacion: q.explicacion,
        puntos: q.puntos
      }))
    };

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/exams`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!res.ok) {
          const errText = await res.text();
          console.warn('[examService] POST /exams failed', res.status, errText);
          throw new Error('remote create failed');
        }
        const serverObj = await res.json();
        const current = this.getExams().filter(e => e.id !== phantom.id && e.id !== serverObj.id);
        const merged: Exam = { ...phantom, ...serverObj, fechaCreacion: new Date(serverObj.fechaCreacion || phantom.fechaCreacion), preguntas: serverObj.preguntas };
        // Store mapping phantom -> server id if different
        if (phantom.id !== serverObj.id) {
          const map = loadIdMap();
            map[phantom.id] = serverObj.id;
            saveIdMap(map);
        }
        saveArray(EXAMS_STORAGE_KEY, [...current, merged]);
        console.log('[examService] Exam persisted on server, reconciled phantom -> real id', { phantomId: phantom.id, serverId: (serverObj as any).id });
      } catch (e) {
        console.warn('[examService] Falling back to phantom exam (server create failed). It will reconcile on next fetch.', e);
      }
    })();
    return phantom;
  }

  // Actualizar un examen existente
  static updateExam(id: string, updates: Partial<Exam>): Exam | null {
    const list = this.getExams();
    if (updates.preguntas) { updates.puntuacionTotal = updates.preguntas.reduce((sum, p) => sum + p.puntos, 0); }
    const { updated, list: next } = updateById(list, id, updates);
    if (!updated) return null;
    saveArray(EXAMS_STORAGE_KEY, next);
    if (USE_API) {
      (async () => { try { await fetch(`${API_BASE}/exams/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) }); } catch {} })();
    }
    return updated;
  }

  // Eliminar un examen
  static deleteExam(id: string): boolean {
    const list = this.getExams();
    const { removed, list: next } = removeById(list, id);
    if (!removed) return false;
    saveArray(EXAMS_STORAGE_KEY, next);
    if (USE_API) { (async () => { try { await fetch(`${API_BASE}/exams/${id}`, { method: 'DELETE' }); } catch {} })(); }
    return true;
  }

  // Generar preguntas con IDs únicos
  static generateQuestionsWithIds(questions: Omit<Question, 'id'>[]): Question[] {
    return questions.map(question => ({
      ...question,
  id: generateId(),
    }));
  }

  // Guardar array de exámenes en localStorage
  // (saveExams / generateId reemplazados por utilidades comunes)

  // Limpiar todos los exámenes (útil para desarrollo/testing)
  static clearAllExams(): void {
    localStorage.removeItem(EXAMS_STORAGE_KEY);
    clearCache(EXAMS_STORAGE_KEY);
  }

  // Estadísticas básicas
  static getExamStats() {
    const exams = this.getExams();
    const totalExams = exams.length;
    const examsByCourse = exams.reduce((acc, exam) => {
      acc[exam.cursoId] = (acc[exam.cursoId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalExams,
      examsByCourse,
      avgQuestionsPerExam: totalExams > 0 
        ? exams.reduce((sum, exam) => sum + exam.preguntas.length, 0) / totalExams 
        : 0,
    };
  }
}

export const examService = ExamService;
