import type { Exam, Course, ExamResult, ExamAttempt } from '../types';

export const generateTestExam = (): Exam => {
  const testExam: Exam = {
    id: 'test-exam-1',
    titulo: 'Examen de Prueba',
    descripcion: 'Un examen de prueba para verificar la funcionalidad',
    cursoId: 'test-course-1',
    nombreCurso: 'Curso de Prueba',
    duracionMinutos: 30,
    intentosMaximos: 3,
    dificultad: 'medio',
    puntuacionTotal: 100,
    fechaCreacion: new Date('2025-06-10'),
    preguntas: [
      {
        id: 'q1',
        tipo: 'multiple',
        pregunta: '¿Cuál es la capital de España?',
        opciones: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla'],
        respuestaCorrecta: 0,
        puntos: 25,
        explicacion: 'Madrid es la capital de España desde 1561.'
      },
      {
        id: 'q2',
        tipo: 'verdadero_falso',
        pregunta: 'React es una librería de JavaScript para construir interfaces de usuario.',
        respuestaCorrecta: true,
        puntos: 25,
        explicacion: 'React es efectivamente una librería desarrollada por Facebook para crear interfaces de usuario.'
      },
      {
        id: 'q3',
        tipo: 'multiple',
        pregunta: '¿Cuál de los siguientes NO es un hook de React?',
        opciones: ['useState', 'useEffect', 'useContext', 'useRender'],
        respuestaCorrecta: 3,
        puntos: 25,
        explicacion: 'useRender no es un hook válido de React.'
      },
      {
        id: 'q4',
        tipo: 'abierta',
        pregunta: 'Explica brevemente qué es TypeScript y sus ventajas principales.',
        respuestaCorrecta: 'TypeScript es un superconjunto de JavaScript que añade tipado estático.',
        puntos: 25,
        explicacion: 'TypeScript proporciona tipado estático, mejor IDE support, y ayuda a detectar errores en tiempo de compilación.'
      }
    ]
  };

  return testExam;
};

export const generateTestCourses = (): Course[] => {
  const testCourses: Course[] = [
    {
      id: 'test-course-1',
      nombre: 'Desarrollo Web con React',
      descripcion: 'Curso completo de desarrollo de aplicaciones web con React y TypeScript',
      categoria: 'Informática',
      fechaCreacion: new Date('2024-01-15'),
      profesor: 'Dr. Ana García',
      semestre: '2024-1',
      color: '#1976d2',
      tags: ['React', 'TypeScript', 'Web Development'],
      materialesCount: 12,
      examenesCount: 3,
    },
    {
      id: 'test-course-2',
      nombre: 'Matemáticas Avanzadas',
      descripcion: 'Cálculo diferencial e integral aplicado',
      categoria: 'Matemáticas',
      fechaCreacion: new Date('2024-01-20'),
      profesor: 'Prof. Carlos López',
      semestre: '2024-1',
      color: '#388e3c',
      tags: ['Cálculo', 'Integrales', 'Derivadas'],
      materialesCount: 8,
      examenesCount: 2,
    },
    {
      id: 'test-course-3',
      nombre: 'Historia Contemporánea',
      descripcion: 'Análisis de los eventos históricos del siglo XX',
      categoria: 'Historia',
      fechaCreacion: new Date('2024-02-01'),
      profesor: 'Prof. María Rodríguez',
      semestre: '2024-1',
      color: '#f57c00',
      tags: ['Siglo XX', 'Guerra Mundial', 'Política'],
      materialesCount: 15,
      examenesCount: 4,
    }
  ];

  return testCourses;
};

export const generateTestExamResults = (): { results: ExamResult[], attempts: ExamAttempt[] } => {
  const results: ExamResult[] = [
    {
      id: 'result-1',
      intentoId: 'attempt-1',
      puntuacionObtenida: 85,
      puntuacionMaxima: 100,
      porcentaje: 85,
      tiempoEmpleado: 25, // minutos
      respuestasCorrectas: 17,
      respuestasIncorrectas: 2,
      respuestasEnBlanco: 1,
    },
    {
      id: 'result-2',
      intentoId: 'attempt-2',
      puntuacionObtenida: 92,
      puntuacionMaxima: 100,
      porcentaje: 92,
      tiempoEmpleado: 28,
      respuestasCorrectas: 18,
      respuestasIncorrectas: 1,
      respuestasEnBlanco: 1,
    },    {
      id: 'result-3',
      intentoId: 'attempt-3',
      puntuacionObtenida: 78,
      puntuacionMaxima: 100,
      porcentaje: 78,
      tiempoEmpleado: 22,
      respuestasCorrectas: 15,
      respuestasIncorrectas: 4,
      respuestasEnBlanco: 1,
    },
    {
      id: 'result-4',
      intentoId: 'attempt-4',
      puntuacionObtenida: 88,
      puntuacionMaxima: 100,
      porcentaje: 88,
      tiempoEmpleado: 25,
      respuestasCorrectas: 17,
      respuestasIncorrectas: 2,
      respuestasEnBlanco: 1,
    }
  ];  // Usar fechas fijas para evitar re-renderizados constantes
  const now = new Date('2025-06-13'); // Fecha fija de referencia
  const oneDayMs = 24 * 60 * 60 * 1000;

  const attempts: ExamAttempt[] = [
    {
      id: 'attempt-1',
      examenId: 'test-exam-1',
      usuarioId: 'user-1',
      respuestas: {},
      puntuacion: 85,
      fechaInicio: new Date(now.getTime() - 6 * oneDayMs), // 6 días atrás desde fecha fija
      fechaFin: new Date(now.getTime() - 6 * oneDayMs),
      completado: true,
    },
    {
      id: 'attempt-2',
      examenId: 'test-exam-2',
      usuarioId: 'user-1',
      respuestas: {},
      puntuacion: 92,
      fechaInicio: new Date(now.getTime() - 4 * oneDayMs), // 4 días atrás desde fecha fija
      fechaFin: new Date(now.getTime() - 4 * oneDayMs),
      completado: true,
    },
    {
      id: 'attempt-3',
      examenId: 'test-exam-3',
      usuarioId: 'user-1',
      respuestas: {},
      puntuacion: 78,
      fechaInicio: new Date(now.getTime() - 2 * oneDayMs), // 2 días atrás desde fecha fija
      fechaFin: new Date(now.getTime() - 2 * oneDayMs),
      completado: true,
    },
    {
      id: 'attempt-4',
      examenId: 'test-exam-1',
      usuarioId: 'user-1',
      respuestas: {},
      puntuacion: 88,
      fechaInicio: new Date(now.getTime() - 1 * oneDayMs), // 1 día atrás desde fecha fija
      fechaFin: new Date(now.getTime() - 1 * oneDayMs),
      completado: true,
    }
  ];

  return { results, attempts };
};

export const initializeTestData = () => {
  // Solo inicializar un examen básico para que haya algo que probar
  // pero no llenar automáticamente con resultados
  const existingExams = localStorage.getItem('estudia_exams');
  
  let initialized = false;

  // Inicializar un examen básico si no existen
  if (!existingExams || JSON.parse(existingExams).length === 0) {
    const testExam = generateTestExam();
    localStorage.setItem('estudia_exams', JSON.stringify([testExam]));
    console.log('Examen básico inicializado para pruebas:', testExam);
    initialized = true;
  }
  
  console.log('Test data initialization minimal - mostly real data');
  return initialized;
};
