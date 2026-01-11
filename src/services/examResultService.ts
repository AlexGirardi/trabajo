import type { ExamResult, ExamAttempt } from '../types';
import { resolveServerExamId } from './examService';
import { loadArray, saveArray, generateId, clearCache } from './storageUtils';

const USE_API = (import.meta as any).env?.VITE_USE_API === 'true';
const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:4000/api';

const EXAM_RESULTS_STORAGE_KEY = 'estudia_exam_results';
const EXAM_ATTEMPTS_STORAGE_KEY = 'estudia_exam_attempts';
const ATTEMPT_ID_MAP_KEY = 'estudia_attempt_id_map';

function loadAttemptMap(): Record<string,string> { try { return JSON.parse(localStorage.getItem(ATTEMPT_ID_MAP_KEY)||'{}'); } catch { return {}; } }
function saveAttemptMap(map: Record<string,string>) { try { localStorage.setItem(ATTEMPT_ID_MAP_KEY, JSON.stringify(map)); } catch {} }
function resolveServerAttemptId(id: string): string { const m = loadAttemptMap(); return m[id] || id; }

class ExamResultService {
  static getExamResults(): ExamResult[] {
    return loadArray<ExamResult>(EXAM_RESULTS_STORAGE_KEY);
  }

  static getExamAttempts(): ExamAttempt[] {
    return loadArray<ExamAttempt>(EXAM_ATTEMPTS_STORAGE_KEY, { dateFields: ['fechaInicio','fechaFin'] });
  }

  static async fetchExamResults(): Promise<ExamResult[]> {
    if (!USE_API) return Promise.resolve(this.getExamResults());
    const res = await fetch(`${API_BASE}/exam-results`);
    if (!res.ok) throw new Error('Error fetching exam results');
    const data = await res.json();
    // Map server -> UI shape
    const mapped: ExamResult[] = data.map((r: any) => ({
      id: r.id,
      intentoId: r.attemptId,
      examId: r.examId,
      puntuacionObtenida: r.earnedPoints,
      puntuacionMaxima: r.totalPoints,
      porcentaje: r.percentage,
      tiempoEmpleado: 0,
      respuestasCorrectas: r.correctAnswers,
      respuestasIncorrectas: r.incorrectAnswers,
      respuestasEnBlanco: r.blankAnswers,
    }));
    console.log('[examResultService] fetched exam-results', mapped);
    saveArray(EXAM_RESULTS_STORAGE_KEY, mapped);
    return mapped;
  }

  static async fetchExamAttempts(): Promise<ExamAttempt[]> {
    if (!USE_API) return Promise.resolve(this.getExamAttempts());
    const res = await fetch(`${API_BASE}/exam-attempts`);
    if (!res.ok) throw new Error('Error fetching exam attempts');
    const data = await res.json();
    const mapped: ExamAttempt[] = data.map((a: any) => ({
      id: a.id,
      examenId: a.examId,
      usuarioId: 'user-1',
      respuestas: {},
      puntuacion: 0,
      fechaInicio: new Date(a.startTime),
      fechaFin: a.endTime ? new Date(a.endTime) : undefined,
      completado: a.completado,
    }));
  console.log('[examResultService] fetched exam-attempts', mapped);
    saveArray(EXAM_ATTEMPTS_STORAGE_KEY, mapped);
    return mapped;
  }

  // Guardar un resultado de examen
  static saveExamResult(result: Omit<ExamResult, 'id'>): ExamResult {
    const list = this.getExamResults();
    const newResult: ExamResult = { id: generateId(), ...result };
    saveArray(EXAM_RESULTS_STORAGE_KEY, [...list, newResult]);
    if (USE_API) {
      (async () => {
        try {
          // Map UI -> server
          const originalId = (result as any).examId || (result as any).examenId || (result as any).cursoId;
          const payload = {
            examId: resolveServerExamId(originalId),
            attemptId: resolveServerAttemptId((result as any).intentoId),
            correctAnswers: (result as any).respuestasCorrectas,
            incorrectAnswers: (result as any).respuestasIncorrectas,
            blankAnswers: (result as any).respuestasEnBlanco,
            percentage: (result as any).porcentaje,
            totalPoints: (result as any).puntuacionMaxima,
            earnedPoints: (result as any).puntuacionObtenida,
          };
          console.log('[examResultService] POST exam-result payload', payload);
          let r = await fetch(`${API_BASE}/exam-results`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
          if (!r.ok) {
            const body = await r.text();
            console.warn('[examResultService] server rejected exam-result first try', r.status, body);
            // Retry once after short delay (attempt id might not be mapped yet)
            await new Promise(res => setTimeout(res, 300));
            const retry = { ...payload, attemptId: resolveServerAttemptId((result as any).intentoId) };
            r = await fetch(`${API_BASE}/exam-results`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(retry) });
            if (!r.ok) console.warn('[examResultService] server rejected exam-result second try', r.status, await r.text());
          }
        } catch {}
      })();
    }
    return newResult;
  }

  // Guardar un intento de examen
  static saveExamAttempt(attempt: Omit<ExamAttempt, 'id'>): ExamAttempt {
    const list = this.getExamAttempts();
    const newAttempt: ExamAttempt = { id: generateId(), ...attempt };
    saveArray(EXAM_ATTEMPTS_STORAGE_KEY, [...list, newAttempt]);
    if (USE_API) {
      (async () => {
        try {
          const originalId = (attempt as any).examenId || (attempt as any).examId;
          const payload = {
            examId: resolveServerExamId(originalId),
            startTime: ((attempt as any).fechaInicio || new Date()).toISOString(),
            endTime: (attempt as any).fechaFin ? new Date((attempt as any).fechaFin).toISOString() : undefined,
            completado: attempt.completado,
          };
          console.log('[examResultService] POST exam-attempt payload', payload);
          let r = await fetch(`${API_BASE}/exam-attempts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
          if (!r.ok) {
            const body = await r.text();
            console.warn('[examResultService] server rejected exam-attempt first try', r.status, body);
            const retry = { ...payload, examId: resolveServerExamId(originalId) };
            r = await fetch(`${API_BASE}/exam-attempts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(retry) });
            if (!r.ok) console.warn('[examResultService] server rejected exam-attempt second try', r.status, await r.text());
          } else {
            try {
              const serverAttempt = await r.json();
              if (serverAttempt && serverAttempt.id) {
                const map = loadAttemptMap();
                map[newAttempt.id] = serverAttempt.id;
                saveAttemptMap(map);
                console.log('[examResultService] mapped attempt id', { phantom: newAttempt.id, server: serverAttempt.id });
              }
            } catch {}
          }
        } catch {}
      })();
    }
    return newAttempt;
  }

  // Obtener estadísticas de rendimiento
  static getPerformanceStats() {
    const results = this.getExamResults();
    const attempts = this.getExamAttempts();
    
    if (results.length === 0) {
      return {
        totalExamsTaken: 0,
        averageScore: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        blankAnswers: 0,
        pendingExams: 0,
        answerDistribution: []
      };
    }

    const totalExamsTaken = results.length;
    const averageScore = results.reduce((sum, result) => sum + result.porcentaje, 0) / totalExamsTaken;
    const correctAnswers = results.reduce((sum, result) => sum + result.respuestasCorrectas, 0);
    const incorrectAnswers = results.reduce((sum, result) => sum + result.respuestasIncorrectas, 0);
    const blankAnswers = results.reduce((sum, result) => sum + result.respuestasEnBlanco, 0);
    
    // Calcular exámenes pendientes (intentos no completados)
    const pendingExams = attempts.filter(attempt => !attempt.completado).length;
    
    // Distribución de respuestas para gráfico circular
    const totalAnswers = correctAnswers + incorrectAnswers + blankAnswers;
    const answerDistribution = [
      { name: 'Correctas', value: totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0, color: '#4caf50' },
      { name: 'Incorrectas', value: totalAnswers > 0 ? Math.round((incorrectAnswers / totalAnswers) * 100) : 0, color: '#f44336' },
      { name: 'Sin responder', value: totalAnswers > 0 ? Math.round((blankAnswers / totalAnswers) * 100) : 0, color: '#ff9800' },
    ];

    return {
      totalExamsTaken,
      averageScore: Math.round(averageScore),
      correctAnswers,
      incorrectAnswers,
      blankAnswers,
      pendingExams,
      answerDistribution,
    };
  }

  static async fetchAnswerDistribution(): Promise<{ correct: number; incorrect: number; blank: number; total: number; }> {
    if (!USE_API) {
      // Local mode: no aggregated server counts; return zeros (UI keeps local percentages)
      return { correct: 0, incorrect: 0, blank: 0, total: 0 };
    }
    const res = await fetch(`${API_BASE}/stats/answers`);
    if (!res.ok) throw new Error('Error fetching answer stats');
    return res.json();
  }

  // Generar datos semanales basados en datos reales pero estables
  // Guardar array de resultados en localStorage
  // Métodos save* reemplazados por utilidades comunes

  // Limpiar todos los resultados (útil para desarrollo/testing)
  static clearAllResults(): void {
    localStorage.removeItem(EXAM_RESULTS_STORAGE_KEY);
    localStorage.removeItem(EXAM_ATTEMPTS_STORAGE_KEY);
    clearCache(EXAM_RESULTS_STORAGE_KEY);
    clearCache(EXAM_ATTEMPTS_STORAGE_KEY);
  }
}

export { ExamResultService };
export const examResultService = ExamResultService;
export default ExamResultService;
