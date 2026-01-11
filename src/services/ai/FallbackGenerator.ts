import type { Question, ExamGenerationRequest } from '../../types';

export class FallbackGenerator {
  generate(request: ExamGenerationRequest, locale: 'es' | 'en' = 'es'): Question[] {
    const questions: Question[] = [];
    const types = request.tiposPreguntas;
    const explain = locale === 'en' ? 'Example' : 'Ejemplo';

    if (types.length === 1) {
      return this.generateSingleType(types[0], request.numeroPreguntas, locale, explain);
    } else {
      return this.generateMixedTypes(types, request.numeroPreguntas, locale, explain);
    }
  }

  private generateSingleType(tipo: string, count: number, locale: 'es' | 'en', explain: string): Question[] {
    const questions: Question[] = [];

    for (let i = 0; i < count; i++) {
      if (tipo === 'multiple') {
        questions.push(this.createMultipleQuestion(i, locale, explain));
      } else if (tipo === 'verdadero_falso') {
        questions.push(this.createTrueFalseQuestion(i, locale, explain));
      } else if (tipo === 'abierta') {
        questions.push(this.createOpenQuestion(i, locale, explain));
      }
    }

    return questions;
  }

  private generateMixedTypes(types: string[], count: number, locale: 'es' | 'en', explain: string): Question[] {
    const questions: Question[] = [];
    const perType = Math.floor(count / types.length);
    const remainder = count % types.length;
    let idx = 0;

    types.forEach((t, tIdx) => {
      const num = perType + (tIdx < remainder ? 1 : 0);

      for (let i = 0; i < num; i++) {
        if (t === 'multiple') {
          questions.push(this.createMultipleQuestionMixed(idx, locale, explain));
        } else if (t === 'verdadero_falso') {
          questions.push(this.createTrueFalseQuestionMixed(idx, locale, explain));
        } else if (t === 'abierta') {
          questions.push(this.createOpenQuestionMixed(idx, locale, explain));
        }
        idx++;
      }
    });

    return questions.slice(0, count);
  }

  private createMultipleQuestion(i: number, locale: 'es' | 'en', explain: string): Question {
    const templates = locale === 'en' ? [
      { pregunta: 'Which programming language is most used for web development?', opciones: ['Python', 'JavaScript', 'Java', 'C++'], respuestaCorrecta: 1 },
      { pregunta: 'What does HTML stand for?', opciones: ['HyperText Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlink Text Management Language'], respuestaCorrecta: 0 },
      { pregunta: 'What is the default port for HTTPS?', opciones: ['80', '8080', '443', '22'], respuestaCorrecta: 2 }
    ] : [
      { pregunta: '¿Cuál es el lenguaje de programación más usado para desarrollo web?', opciones: ['Python', 'JavaScript', 'Java', 'C++'], respuestaCorrecta: 1 },
      { pregunta: '¿Qué significa HTML?', opciones: ['HyperText Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlink Text Management Language'], respuestaCorrecta: 0 },
      { pregunta: '¿Cuál es el puerto por defecto para HTTPS?', opciones: ['80', '8080', '443', '22'], respuestaCorrecta: 2 }
    ];

    const f = templates[i % 3];
    return {
      id: `fallback_${i}`,
      tipo: 'multiple',
      pregunta: f.pregunta,
      opciones: f.opciones,
      respuestaCorrecta: f.respuestaCorrecta,
      explicacion: explain,
      puntos: 5
    };
  }

  private createTrueFalseQuestion(i: number, locale: 'es' | 'en', explain: string): Question {
    const templates = locale === 'en' ? [
      { pregunta: 'JavaScript is an interpreted language.', respuestaCorrecta: true },
      { pregunta: 'HTML is a programming language.', respuestaCorrecta: false },
      { pregunta: 'CSS is used for styling.', respuestaCorrecta: true }
    ] : [
      { pregunta: 'JavaScript es un lenguaje interpretado.', respuestaCorrecta: true },
      { pregunta: 'HTML es un lenguaje de programación.', respuestaCorrecta: false },
      { pregunta: 'CSS se usa para dar estilo.', respuestaCorrecta: true }
    ];

    const f = templates[i % 3];
    return {
      id: `fallback_${i}`,
      tipo: 'verdadero_falso',
      pregunta: f.pregunta,
      respuestaCorrecta: f.respuestaCorrecta,
      explicacion: explain,
      puntos: 3
    };
  }

  private createOpenQuestion(i: number, locale: 'es' | 'en', explain: string): Question {
    const templates = locale === 'en' ? [
      { pregunta: 'The standard markup language for the web is ________.', respuestaCorrecta: 'HTML' },
      { pregunta: 'The secure protocol for the web is ________.', respuestaCorrecta: 'HTTPS' },
      { pregunta: 'The most used version control system is ________.', respuestaCorrecta: 'Git' }
    ] : [
      { pregunta: 'El lenguaje de marcado estándar para la web es ________.', respuestaCorrecta: 'HTML' },
      { pregunta: 'El protocolo seguro para la web es ________.', respuestaCorrecta: 'HTTPS' },
      { pregunta: 'El sistema de control de versiones más usado es ________.', respuestaCorrecta: 'Git' }
    ];

    const f = templates[i % 3];
    return {
      id: `fallback_${i}`,
      tipo: 'abierta',
      pregunta: f.pregunta,
      respuestaCorrecta: f.respuestaCorrecta,
      explicacion: explain,
      puntos: 10
    };
  }

  private createMultipleQuestionMixed(idx: number, locale: 'es' | 'en', explain: string): Question {
    const templates = locale === 'en' ? [
      { pregunta: 'Which programming language is most used for web development?', opciones: ['Python', 'JavaScript', 'Java', 'C++'], respuestaCorrecta: 1 },
      { pregunta: 'What does CSS stand for?', opciones: ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style Sheets', 'Custom Style Sheets'], respuestaCorrecta: 1 }
    ] : [
      { pregunta: '¿Cuál es el lenguaje de programación más usado para desarrollo web?', opciones: ['Python', 'JavaScript', 'Java', 'C++'], respuestaCorrecta: 1 },
      { pregunta: '¿Qué significa CSS?', opciones: ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style Sheets', 'Custom Style Sheets'], respuestaCorrecta: 1 }
    ];

    const f = templates[idx % 2];
    return {
      id: `fallback_${idx}`,
      tipo: 'multiple',
      pregunta: f.pregunta,
      opciones: f.opciones,
      respuestaCorrecta: f.respuestaCorrecta,
      explicacion: explain,
      puntos: 5
    };
  }

  private createTrueFalseQuestionMixed(idx: number, locale: 'es' | 'en', explain: string): Question {
    const templates = locale === 'en' ? [
      { pregunta: 'React is a JavaScript library.', respuestaCorrecta: true },
      { pregunta: 'MongoDB is relational.', respuestaCorrecta: false }
    ] : [
      { pregunta: 'React es una librería de JavaScript.', respuestaCorrecta: true },
      { pregunta: 'MongoDB es relacional.', respuestaCorrecta: false }
    ];

    const f = templates[idx % 2];
    return {
      id: `fallback_${idx}`,
      tipo: 'verdadero_falso',
      pregunta: f.pregunta,
      respuestaCorrecta: f.respuestaCorrecta,
      explicacion: explain,
      puntos: 3
    };
  }

  private createOpenQuestionMixed(idx: number, locale: 'es' | 'en', explain: string): Question {
    const templates = locale === 'en' ? [
      { pregunta: 'The most popular responsive CSS framework is ________.', respuestaCorrecta: 'Bootstrap' },
      { pregunta: 'The creator of Linux is ________ Torvalds.', respuestaCorrecta: 'Linus' }
    ] : [
      { pregunta: 'El framework de CSS para diseño responsivo más popular es ________.', respuestaCorrecta: 'Bootstrap' },
      { pregunta: 'El creador de Linux es ________ Torvalds.', respuestaCorrecta: 'Linus' }
    ];

    const f = templates[idx % 2];
    return {
      id: `fallback_${idx}`,
      tipo: 'abierta',
      pregunta: f.pregunta,
      respuestaCorrecta: f.respuestaCorrecta,
      explicacion: explain,
      puntos: 10
    };
  }
}
