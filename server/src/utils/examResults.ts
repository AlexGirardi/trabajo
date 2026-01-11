export interface Question {
  id: string;
  tipo: 'multiple' | 'verdadero_falso' | 'abierta';
  respuestaCorrecta: string | number | boolean;
  puntos: number;
}

export interface UserAnswer {
  questionId: string;
  answer: string | number | boolean | null;
}

export interface ExamResultCalculation {
  correctAnswers: number;
  incorrectAnswers: number;
  blankAnswers: number;
  totalPoints: number;
  earnedPoints: number;
  percentage: number;
}

export function calculateExamResults(
  questions: Question[],
  userAnswers: UserAnswer[]
): ExamResultCalculation {
  let correctAnswers = 0;
  let incorrectAnswers = 0;
  let blankAnswers = 0;
  let earnedPoints = 0;
  const totalPoints = questions.reduce((sum, q) => sum + q.puntos, 0);
  const answersMap = new Map(userAnswers.map(a => [a.questionId, a.answer]));
  for (const question of questions) {
    const userAnswer = answersMap.get(question.id);
    if (userAnswer === null || userAnswer === undefined || userAnswer === '') {
      blankAnswers++;
      continue;
    }
    const isCorrect = compareAnswers(question.respuestaCorrecta, userAnswer, question.tipo);
    if (isCorrect) {
      correctAnswers++;
      earnedPoints += question.puntos;
    } else {
      incorrectAnswers++;
    }
  }
  const percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
  return {
    correctAnswers,
    incorrectAnswers,
    blankAnswers,
    totalPoints,
    earnedPoints,
    percentage: Math.round(percentage * 100) / 100,
  };
}

/**
 * Compara la respuesta del usuario con la respuesta correcta
 */
function compareAnswers(
  correctAnswer: string | number | boolean,
  userAnswer: string | number | boolean,
  tipo: 'multiple' | 'verdadero_falso' | 'abierta'
): boolean {
  // Para preguntas de opción múltiple
  if (tipo === 'multiple') {
    // Normalizar a número si es posible
    const correctNum = typeof correctAnswer === 'number' ? correctAnswer : parseInt(String(correctAnswer));
    const userNum = typeof userAnswer === 'number' ? userAnswer : parseInt(String(userAnswer));
    return correctNum === userNum;
  }

  // Para preguntas de verdadero/falso
  if (tipo === 'verdadero_falso') {
    const correctBool = normalizeBoolean(correctAnswer);
    const userBool = normalizeBoolean(userAnswer);
    return correctBool === userBool;
  }

  // Para preguntas abiertas (comparación exacta de texto, case-insensitive)
  if (tipo === 'abierta') {
    return String(correctAnswer).trim().toLowerCase() === String(userAnswer).trim().toLowerCase();
  }

  return false;
}

/**
 * Normaliza valores a booleano
 */
function normalizeBoolean(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.toLowerCase().trim();
    return normalized === 'true' || normalized === 'verdadero' || normalized === '1' || normalized === 'yes' || normalized === 'sí';
  }
  return false;
}

/**
 * Normaliza la respuesta correcta de una pregunta generada por IA
 */
export function normalizeCorrectAnswer(
  answer: any,
  tipo: 'multiple' | 'verdadero_falso' | 'abierta',
  opciones?: string[]
): string | number | boolean {
  // Para preguntas de opción múltiple
  if (tipo === 'multiple') {
    // Si la respuesta es un número, verificar que esté en rango
    if (typeof answer === 'number') {
      if (opciones && answer >= 0 && answer < opciones.length) {
        return answer;
      }
      return 0; // Fallback a primera opción
    }

    // Si es string que representa un número
    if (typeof answer === 'string' && /^\d+$/.test(answer.trim())) {
      const num = parseInt(answer.trim());
      if (opciones && num >= 0 && num < opciones.length) {
        return num;
      }
      return 0;
    }

    // Si es string que coincide con una opción
    if (typeof answer === 'string' && opciones) {
      const index = opciones.findIndex(
        opt => opt.toLowerCase().trim() === answer.toLowerCase().trim()
      );
      return index >= 0 ? index : 0;
    }

    return 0; // Fallback
  }

  // Para preguntas de verdadero/falso
  if (tipo === 'verdadero_falso') {
    return normalizeBoolean(answer);
  }

  // Para preguntas abiertas
  return String(answer).trim();
}
