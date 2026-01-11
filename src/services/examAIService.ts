import { ollamaClient } from './ollamaClient';
import type { Question, ExamGenerationRequest } from '../types';
import { PromptBuilder } from './ai/PromptBuilder';
import { ResponseParser } from './ai/ResponseParser';
import { QuestionValidator } from './ai/QuestionValidator';
import { FallbackGenerator } from './ai/FallbackGenerator';
import { errorHandler } from './ErrorHandler';

export interface ExamGenerationResult {
  success: boolean;
  questions: Question[];
  error?: string;
  titulo?: string;
  descripcion?: string;
}

export class ExamAIService {
  private model: string;
  private promptBuilder: PromptBuilder;
  private responseParser: ResponseParser;
  private questionValidator: QuestionValidator;
  private fallbackGenerator: FallbackGenerator;

  constructor(model: string = 'llama3.1:8b') {
    this.model = model;
    this.promptBuilder = new PromptBuilder();
    this.responseParser = new ResponseParser();
    this.questionValidator = new QuestionValidator();
    this.fallbackGenerator = new FallbackGenerator();
  }

  async generateExam(
    request: ExamGenerationRequest,
    materials?: string,
    locale?: 'es' | 'en'
  ): Promise<ExamGenerationResult> {
    try {
      const isHealthy = await ollamaClient.checkHealth();
      if (!isHealthy) {
        const errorMsg = 'Ollama no está disponible. Asegúrate de que esté ejecutándose.';
        errorHandler.warn(errorMsg, 'ExamAIService.generateExam');
        throw new Error(errorMsg);
      }

      const lang: 'es' | 'en' = locale || (localStorage.getItem('ui.locale') === 'en' ? 'en' : 'es');
      const prompt = this.promptBuilder.build(request, materials, lang);

      const numCtx = Number((import.meta as any).env?.VITE_OLLAMA_NUM_CTX) || 32768;
      const numPredict = Number((import.meta as any).env?.VITE_OLLAMA_NUM_PREDICT) || 4000;

      const response = await ollamaClient.generate({
        model: this.model,
        prompt,
        options: {
          temperature: 0.7,
          num_ctx: numCtx,
          num_predict: numPredict
        } as any
      });

      const { questions, titulo, descripcion } = this.processResponse(response, request, lang);

      errorHandler.info(`Examen generado exitosamente con ${questions.length} preguntas`, 'ExamAIService.generateExam');
      return { success: true, questions, titulo, descripcion };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      errorHandler.error(`Error al generar examen: ${errorMsg}`, 'ExamAIService.generateExam', error);
      return {
        success: false,
        questions: [],
        error: errorMsg
      };
    }
  }

  private processResponse(
    raw: string,
    request: ExamGenerationRequest,
    locale: 'es' | 'en'
  ): { questions: Question[]; titulo?: string; descripcion?: string } {
    try {
      const { preguntas: rawQuestions, titulo, descripcion } = this.responseParser.parse(raw);

      const allowed = new Set(request.tiposPreguntas);
      const validated: Question[] = rawQuestions
        .map((q, i) => this.questionValidator.validateAndTransform(q, i))
        .filter((q): q is Question => !!q && allowed.has(q.tipo));

      const unique = this.questionValidator.removeDuplicates(validated);

      const finalTitulo = titulo || this.getDefaultTitle(locale);
      const finalDescripcion = descripcion || this.getDefaultDescription(locale);

      if (unique.length < request.numeroPreguntas) {
        const faltan = request.numeroPreguntas - unique.length;
        errorHandler.warn(
          `Solo se generaron ${unique.length} de ${request.numeroPreguntas} preguntas. Usando fallback para ${faltan} preguntas`,
          'ExamAIService.processResponse'
        );
        const fallbackQuestions = this.fallbackGenerator.generate(
          { ...request, numeroPreguntas: faltan },
          locale
        );
        unique.push(...fallbackQuestions);
      }

      return {
        questions: unique.slice(0, request.numeroPreguntas),
        titulo: finalTitulo,
        descripcion: finalDescripcion
      };
    } catch (e) {
      errorHandler.error(
        'Error al parsear respuesta del modelo. Usando fallback completo',
        'ExamAIService.processResponse',
        e
      );
      return {
        questions: this.fallbackGenerator.generate(request, locale),
        titulo: locale === 'en' ? 'Generated Exam' : 'Examen Generado',
        descripcion: locale === 'en' ? 'Automatically generated (fallback)' : 'Generado automáticamente (fallback)'
      };
    }
  }

  private getDefaultTitle(locale: 'es' | 'en'): string {
    return locale === 'en'
      ? `Course Exam - ${new Date().toLocaleDateString()}`
      : `Examen del curso - ${new Date().toLocaleDateString()}`;
  }

  private getDefaultDescription(locale: 'es' | 'en'): string {
    return locale === 'en'
      ? 'Exam automatically generated'
      : 'Examen generado automáticamente';
  }

  async getAvailableModels(): Promise<string[]> {
    return await ollamaClient.listModels();
  }

  setModel(model: string): void {
    this.model = model;
  }
}

const DEFAULT_MODEL = 'qwen2.5:7b-instruct';
export const examAIService = new ExamAIService(DEFAULT_MODEL);
