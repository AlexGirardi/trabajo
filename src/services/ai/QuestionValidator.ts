import type { Question } from '../../types';

export class QuestionValidator {
  validateAndTransform(rawQuestion: any, index: number): Question | null {
    try {
      const base = {
        id: `generated_${Date.now()}_${index}`,
        pregunta: (rawQuestion.pregunta || rawQuestion.question || '').toString().trim().slice(0, 400) || `Pregunta ${index + 1}`,
        explicacion: (rawQuestion.explicacion || rawQuestion.explanation || '').toString().trim().slice(0, 400) || '',
        puntos: this.resolvePoints(rawQuestion)
      };

      const tipo = rawQuestion.tipo || rawQuestion.type;
      if (!tipo) return null;

      if (tipo === 'multiple') {
        return this.validateMultipleQuestion(rawQuestion, base);
      }

      if (tipo === 'verdadero_falso') {
        return this.validateTrueFalseQuestion(rawQuestion, base);
      }

      if (tipo === 'abierta') {
        return this.validateOpenQuestion(rawQuestion, base);
      }

      return null;
    } catch {
      return null;
    }
  }

  removeDuplicates(questions: Question[]): Question[] {
    const seen = new Set<string>();
    const unique: Question[] = [];

    for (const q of questions) {
      const norm = q.pregunta
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (!seen.has(norm)) {
        seen.add(norm);
        unique.push(q);
      }
    }

    return unique;
  }

  private validateMultipleQuestion(rawQuestion: any, base: any): Question | null {
    const opciones: string[] = Array.isArray(rawQuestion.opciones || rawQuestion.options)
      ? (rawQuestion.opciones || rawQuestion.options).map((o: any) => this.sanitizeOption(String(o ?? '')))
      : ['Opción 1', 'Opción 2', 'Opción 3', 'Opción 4'];

    let rcRaw = rawQuestion.respuestaCorrecta ?? rawQuestion.correcta ?? rawQuestion.correctAnswer ?? rawQuestion.answer;
    let rc: number | null = null;

    if (typeof rcRaw === 'number') {
      if (rcRaw >= 0 && rcRaw < opciones.length) rc = rcRaw;
    } else if (typeof rcRaw === 'string') {
      rc = this.parseAnswerIndex(rcRaw.trim(), opciones);
    }

    // Fallback parcial: buscar coincidencia contenida
    if (rc == null && typeof rcRaw === 'string') {
      const lower = rcRaw.toLowerCase();
      const containsIdx = opciones.findIndex(
        o => o.toLowerCase().includes(lower) || lower.includes(o.toLowerCase())
      );
      if (containsIdx !== -1) rc = containsIdx;
    }

    if (rc == null || rc < 0 || rc >= opciones.length) {
      rc = 0; // Fallback fijo para reproducibilidad
    }

    return { ...base, tipo: 'multiple', opciones, respuestaCorrecta: rc };
  }

  private validateTrueFalseQuestion(rawQuestion: any, base: any): Question | null {
    let rc = rawQuestion.respuestaCorrecta ?? rawQuestion.correcta ?? rawQuestion.correctAnswer;

    if (typeof rc === 'string') {
      const v = rc.trim().toLowerCase();
      if (['true', 'verdadero', 'v', 'sí', 'si', '1'].includes(v)) rc = true;
      else if (['false', 'falso', 'f', 'no', '0'].includes(v)) rc = false;
    }

    if (typeof rc !== 'boolean') {
      rc = Math.random() > 0.5; // Fallback aleatorio
    }

    return { ...base, tipo: 'verdadero_falso', respuestaCorrecta: rc };
  }

  private validateOpenQuestion(rawQuestion: any, base: any): Question | null {
    let pregunta = base.pregunta
      .replace(/\?/g, '')
      .replace(/^\s*¿/, '')
      .trim();

    const blankCount = (pregunta.match(/________/g) || []).length;

    if (blankCount === 0) {
      pregunta = this.insertBlank(pregunta);
    } else if (blankCount > 1) {
      pregunta = this.keepFirstBlankOnly(pregunta);
    }

    // Evitar hueco al inicio o final
    pregunta = pregunta.replace(/^________\s*/, '').replace(/\s*________$/, ' ________');

    const respuesta = (rawQuestion.respuestaCorrecta || rawQuestion.answer || '')
      .toString()
      .split(/\s+/)[0] || 'Respuesta';

    return { ...base, tipo: 'abierta', pregunta, respuestaCorrecta: respuesta };
  }

  private sanitizeOption(s: string): string {
    return s
      .replace(/^\s*([A-Za-z]|\d{1,2})\s*[\.)-]\s+/, '')
      .replace(/^\s*([A-Za-z]|\d{1,2})\s*:\s+/, '')
      .trim()
      .slice(0, 160);
  }

  private parseAnswerIndex(trimmed: string, opciones: string[]): number | null {
    // Intento 1: Letra (A, B, C, D)
    const letterIdx = this.toIndexFromLetter(trimmed.replace(/\s+/g, ''));
    if (letterIdx >= 0 && letterIdx < opciones.length) return letterIdx;

    // Intento 2: Número
    if (/^\d+$/.test(trimmed)) {
      const num = parseInt(trimmed, 10);
      if (num >= 0 && num < opciones.length) return num; // Ya es índice
      if (num >= 1 && num <= opciones.length) return num - 1; // 1-based
    }

    // Intento 3: Coincidencia textual
    const lower = trimmed.toLowerCase();
    const foundIdx = opciones.findIndex(o => o.toLowerCase() === lower);
    if (foundIdx !== -1) return foundIdx;

    return null;
  }

  private toIndexFromLetter(s: string): number {
    const m = s.trim().toUpperCase();
    if (/^[A-Z]$/.test(m)) return m.charCodeAt(0) - 65; // A->0
    if (/^[A-Z][\.)]$/.test(m)) return m.charCodeAt(0) - 65; // A) A.

    const m2 = m.replace(/\s+/g, '');
    if (/^[A-Z][\.)-]$/.test(m2)) return m2.charCodeAt(0) - 65; // A- etc

    return -1;
  }

  private insertBlank(pregunta: string): string {
    const words = pregunta.split(' ');

    if (words.length > 6) {
      const pos = Math.max(1, Math.min(words.length - 2, Math.floor(words.length / 2)));
      words[pos] = '________';
      return words.join(' ');
    } else {
      return pregunta + ' ________';
    }
  }

  private keepFirstBlankOnly(pregunta: string): string {
    let replaced = false;
    return pregunta
      .replace(/________/g, () => {
        if (replaced) return 'XXXXX';
        replaced = true;
        return '________';
      })
      .replace(/XXXXX/g, '');
  }

  private resolvePoints(raw: any): number {
    if (typeof raw.puntos === 'number') return raw.puntos;

    const t = raw.tipo || raw.type;
    if (t === 'multiple') return 5;
    if (t === 'verdadero_falso') return 3;
    if (t === 'abierta') return 10;

    return 5;
  }
}
