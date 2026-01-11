interface ParsedAIResponse {
  preguntas: any[];
  titulo?: string;
  descripcion?: string;
}

export class ResponseParser {
  parse(raw: string): { preguntas: any[]; titulo?: string; descripcion?: string } {
    const jsonText = this.extractJSON(raw);
    const parsed: ParsedAIResponse | any = JSON.parse(jsonText);

    let rawQuestions: any[] = [];
    let titulo: string | undefined;
    let descripcion: string | undefined;

    if (Array.isArray(parsed)) {
      rawQuestions = parsed;
    } else if (parsed && typeof parsed === 'object') {
      rawQuestions = this.extractQuestions(parsed);
      titulo = parsed.titulo || parsed.title;
      descripcion = parsed.descripcion || parsed.description;
    }

    if (!rawQuestions.length) {
      throw new Error('No se encontraron preguntas');
    }

    return { preguntas: rawQuestions, titulo, descripcion };
  }

  private extractJSON(text: string): string {
    const firstBrace = text.indexOf('{');
    const firstBracket = text.indexOf('[');

    if (firstBrace === -1 && firstBracket === -1) {
      throw new Error('Sin JSON');
    }

    let start: number;
    let openChar: string;

    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      start = firstBrace;
      openChar = '{';
    } else {
      start = firstBracket;
      openChar = '[';
    }

    const closeChar = openChar === '{' ? '}' : ']';
    let depth = 0;

    for (let i = start; i < text.length; i++) {
      const c = text[i];
      if (c === openChar) depth++;
      else if (c === closeChar) {
        depth--;
        if (depth === 0) return text.slice(start, i + 1);
      }
    }

    throw new Error('JSON incompleto');
  }

  private extractQuestions(parsed: any): any[] {
    if (Array.isArray(parsed.preguntas)) return parsed.preguntas;
    if (Array.isArray(parsed.questions)) return parsed.questions;
    if (Array.isArray(parsed.data)) return parsed.data;
    if (Array.isArray(parsed.items)) return parsed.items;
    return [];
  }
}
