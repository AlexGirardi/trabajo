import type { Course } from '../types';
import { loadArray, saveArray, generateId, updateById, removeById, clearCache } from './storageUtils';

// Feature flag para backend
const USE_API = (import.meta as any).env?.VITE_USE_API === 'true';
const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:4000/api';

const COURSES_STORAGE_KEY = 'estudia_courses';

export class CourseService {
  // Obtener todos los cursos (con caché y revivido de fechas)
  static getCourses(): Course[] {
    if (USE_API) {
      // Nota: Esta versión síncrona se mantiene por compatibilidad; en modo API se debería usar método async.
      // Para transición progresiva devolvemos cache local y disparamos fetch asíncrono opcional (no implementado aquí por brevedad).
      return loadArray<Course>(COURSES_STORAGE_KEY, { dateFields: ['fechaCreacion'] });
    }
    return loadArray<Course>(COURSES_STORAGE_KEY, { dateFields: ['fechaCreacion'] });
  }

  static async fetchCourses(): Promise<Course[]> {
    if (!USE_API) return Promise.resolve(this.getCourses());
    const res = await fetch(`${API_BASE}/courses`);
    if (!res.ok) throw new Error('Error fetching courses');
    const data = await res.json();
    // Persistimos en cache local para fallback offline
    saveArray(COURSES_STORAGE_KEY, data);
    return data.map((c: any) => ({ ...c, fechaCreacion: new Date(c.fechaCreacion) }));
  }

  // Obtener un curso por ID
  static getCourseById(id: string): Course | undefined {
    return this.getCourses().find(course => course.id === id);
  }

  // Guardar un nuevo curso
  static saveCourse(courseData: Omit<Course, 'id' | 'fechaCreacion'>): Course {
    if (USE_API) {
      // Versión optimista: añadimos local y disparamos POST async (simplificado)
  const temp: Course = { id: generateId(), fechaCreacion: new Date(), ...courseData, materialesCount: (courseData as any).materialesCount ?? 0, examenesCount: 0 } as any;
      const list = this.getCourses();
      saveArray(COURSES_STORAGE_KEY, [...list, temp]);
      // Async fire-and-forget
      (async () => {
        try {
          const res = await fetch(`${API_BASE}/courses`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(courseData) });
          if (res.ok) {
            const created = await res.json();
            // Reemplazar temp por definitivo (mismo id temporal se mantiene; en real convendría reconciliar)
            const current = loadArray<Course>(COURSES_STORAGE_KEY, { dateFields: ['fechaCreacion'] });
            saveArray(COURSES_STORAGE_KEY, current.map(c => c.id === temp.id ? { ...created, fechaCreacion: new Date(created.fechaCreacion) } : c));
          }
        } catch { /* fallback silencioso */ }
      })();
      return temp;
    }
    const list = this.getCourses();
    const newCourse: Course = { id: generateId(), fechaCreacion: new Date(), ...courseData };
    const next = [...list, newCourse];
    saveArray(COURSES_STORAGE_KEY, next);
    return newCourse;
  }

  // Actualizar un curso existente
  static updateCourse(id: string, updates: Partial<Course>): Course | null {
    const list = this.getCourses();
    const { updated, list: next } = updateById(list, id, updates);
    if (!updated) return null;
    saveArray(COURSES_STORAGE_KEY, next);
    if (USE_API) {
      (async () => {
        try {
          await fetch(`${API_BASE}/courses/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) });
        } catch { /* mantener optimismo */ }
      })();
    }
    return updated;
  }

  // Eliminar un curso
  static deleteCourse(id: string): boolean {
    const list = this.getCourses();
    const { removed, list: next } = removeById(list, id);
    if (!removed) return false;
    saveArray(COURSES_STORAGE_KEY, next);
    if (USE_API) {
      (async () => {
        try { await fetch(`${API_BASE}/courses/${id}`, { method: 'DELETE' }); } catch { /* ignorar */ }
      })();
    }
    return true;
  }

  // Guardar array de cursos en localStorage

  // Limpiar todos los cursos (útil para desarrollo/testing)
  static clearAllCourses(): void {
    localStorage.removeItem(COURSES_STORAGE_KEY);
    clearCache(COURSES_STORAGE_KEY);
  }

  // Estadísticas básicas
  static getCourseStats() {
    const courses = this.getCourses();
    const totalCourses = courses.length;
    const coursesByCategory = courses.reduce((acc, course) => {
      acc[course.categoria] = (acc[course.categoria] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalCourses,
      coursesByCategory,
      totalMaterials: courses.reduce((sum, course) => sum + course.materialesCount, 0),
      totalExams: courses.reduce((sum, course) => sum + (course.examenesCount || 0), 0),
    };
  }
}

export const courseService = CourseService;
