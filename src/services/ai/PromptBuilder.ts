import type { ExamGenerationRequest } from '../../types';

export class PromptBuilder {
  build(request: ExamGenerationRequest, materials?: string, locale: 'es' | 'en' = 'es'): string {
    const difficulty = this.getDifficultyLabel(request.dificultad, locale);
    const allowed = request.tiposPreguntas;

    let prompt = this.buildBasePrompt(request.numeroPreguntas, difficulty, allowed, locale);
    prompt += this.buildMaterialsSection(materials, locale);
    prompt += this.buildFormatsSection(allowed, locale);
    prompt += this.buildRulesSection(allowed, locale);

    return prompt;
  }

  private getDifficultyLabel(dificultad: string, locale: 'es' | 'en'): string {
    const difficultyMap: Record<string, string> = {
      facil: 'fácil',
      medio: 'medio',
      dificil: 'difícil'
    };
    const difficultyEn: Record<string, string> = {
      facil: 'easy',
      medio: 'medium',
      dificil: 'hard'
    };

    return locale === 'en'
      ? (difficultyEn[dificultad] || 'medium')
      : (difficultyMap[dificultad] || 'medio');
  }

  private buildBasePrompt(numPreguntas: number, difficulty: string, allowed: string[], locale: 'es' | 'en'): string {
    if (locale === 'en') {
      return `You are an expert exam generator. Return ONLY valid JSON with no extra text.

GOAL: Create a full exam with helpful metadata.

Strict expected structure:
{
  "titulo": "Short specific exam title (max 12 words)",
  "descripcion": "Concise summary (1-2 sentences, 25-60 words) stating scope, focus and assessed knowledge type",
  "preguntas": [ EXACTLY ${numPreguntas} objects ]
}

GLOBAL DIFFICULTY: ${difficulty}.
ALLOWED TYPES (ONLY these, nothing else): ${allowed.join(', ')}

GENERAL RULES:
- Create exactly ${numPreguntas} questions
- ALL must be unique and cover different subtopics
- Don't repeat dominant keywords or identical openings
- Vary length and structure
- Don't invent unknown types
- titulo and descripcion MUST always be present

`;
    } else {
      return `Eres un generador experto de exámenes. Devuelve SOLO JSON válido sin ningún texto adicional.

OBJETIVO: Crear un examen completo con metadatos útiles.

Estructura estricta esperada:
{
  "titulo": "Título breve (máx 12 palabras) claro y específico del tema evaluado",
  "descripcion": "Resumen conciso (1-2 frases, 25-60 palabras) indicando alcance, enfoque y tipo de conocimientos evaluados",
  "preguntas": [ EXACTAMENTE ${numPreguntas} objetos ]
}

DIFICULTAD GLOBAL: ${difficulty}.
TIPOS PERMITIDOS (usa SOLO estos, ningún otro): ${allowed.join(', ')}

REGLAS GENERALES:
- Crea exactamente ${numPreguntas} preguntas
- TODAS deben ser únicas y cubrir subtemas diferentes del material
- No repitas palabras clave dominantes ni construcciones idénticas
- Varía el inicio y la longitud de las preguntas
- NO inventes tipos no listados
- titulo y descripcion DEBEN estar siempre presentes

`;
    }
  }

  private buildMaterialsSection(materials: string | undefined, locale: 'es' | 'en'): string {
    if (!materials || !materials.trim()) {
      return '';
    }

    return locale === 'en'
      ? `STUDY MATERIAL (use ONLY this content):\n${materials}\n\n`
      : `MATERIAL DE ESTUDIO (usa SOLO este contenido):\n${materials}\n\n`;
  }

  private buildFormatsSection(allowed: string[], locale: 'es' | 'en'): string {
    const formatLines: string[] = [];

    if (allowed.includes('multiple')) {
      formatLines.push(locale === 'en'
        ? `MULTIPLE: { "tipo": "multiple", "pregunta": "Text...", "opciones": ["Option 1","Option 2","Option 3","Option 4"], "respuestaCorrecta": index(0-3), "explicacion": "... reason ...", "puntos": 5 }`
        : `MULTIPLE: { "tipo": "multiple", "pregunta": "Texto...", "opciones": ["Opción 1","Opción 2","Opción 3","Opción 4"], "respuestaCorrecta": indice(0-3), "explicacion": "...", "puntos": 5 }`
      );
    }

    if (allowed.includes('verdadero_falso')) {
      formatLines.push(locale === 'en'
        ? `VERDADERO_FALSO: { "tipo": "verdadero_falso", "pregunta": "Statement...", "respuestaCorrecta": true|false, "explicacion": "...", "puntos": 3 }`
        : `VERDADERO_FALSO: { "tipo": "verdadero_falso", "pregunta": "Texto...", "respuestaCorrecta": true|false, "explicacion": "...", "puntos": 3 }`
      );
    }

    if (allowed.includes('abierta')) {
      formatLines.push(locale === 'en'
        ? `ABIERTA: { "tipo": "abierta", "pregunta": "Statement with exactly one blank ________ inside (not start/end)", "respuestaCorrecta": "word", "explicacion": "...", "puntos": 10 }`
        : `ABIERTA: { "tipo": "abierta", "pregunta": "Afirmación con un hueco ________ en medio", "respuestaCorrecta": "palabra", "explicacion": "...", "puntos": 10 }`
      );
    }

    const header = locale === 'en'
      ? 'Allowed formats (ONLY the listed types):\n'
      : 'Formatos permitidos (usa SOLO los tipos listados):\n';

    return header + formatLines.join('\n') + '\n\n';
  }

  private buildRulesSection(allowed: string[], locale: 'es' | 'en'): string {
    if (locale === 'en') {
      return `Specific rules questions:
- multiple: distribute respuestaCorrecta indices randomly (not always 0)
- multiple: options are pure text — do NOT prefix with letters or numbers (e.g., 'A.', 'B)', '1)')
- Do NOT append phrases like "according to the material" or "based on the material" at the end of questions
${allowed.includes('verdadero_falso') ? '- verdadero_falso: respuestaCorrecta boolean\n' : ''}${allowed.includes('abierta') ? '- abierta: statement with ONE blank "________" (not start/end) and respuestaCorrecta ONE single word (no articles)\n- Vary blank position across questions\n' : ''}- fixed points per type as in examples

Metadata rules:
- titulo: avoid generic words like "Exam", include main topic
- descripcion: mention scope & assessed skills without repeating titulo

IMPORTANT: Output ONLY raw JSON. No explanations, no markdown.`;
    } else {
      return `Reglas específicas preguntas:
- multiple: distribuye índices de respuestaCorrecta aleatoriamente (no siempre 0)
- multiple: las opciones deben ser solo el texto — NO añadas prefijos de letra o número (p. ej., 'A.', 'B)', '1)')
- NO termines las preguntas con frases como "según el material" o "de acuerdo con el material"
${allowed.includes('verdadero_falso') ? '- verdadero_falso: respuestaCorrecta boolean\n' : ''}${allowed.includes('abierta') ? '- abierta: afirmación con UN solo hueco "________" (no inicio / final) y respuestaCorrecta UNA palabra concreta (sin artículos)\n- Evita siempre colocar el hueco en la misma posición en todas las preguntas\n' : ''}- puntos fijos por tipo como en los ejemplos

Reglas metadatos:
- titulo: sin palabras genéricas vacías como "Examen", debe incluir el tema principal (ej: "Derivadas e Integrales Básicas")
- descripcion: debe mencionar el rango temático y el tipo de habilidades evaluadas (memoria, comprensión, aplicación) sin repetir exactamente el titulo

IMPORTANTE: Responde SOLO con el JSON. Nada de explicaciones, ni formato markdown.`;
    }
  }
}
