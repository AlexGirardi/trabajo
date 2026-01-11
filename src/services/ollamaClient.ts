// Cliente para interactuar con Ollama (IA local)
export interface OllamaResponse {
  response: string;
  done: boolean;
  model: string;
}

export interface OllamaRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
  max_tokens?: number; // legacy / fallback
  num_ctx?: number;    // contexto máximo (entrada)
  num_predict?: number; // límite de tokens de salida
  };
}

export class OllamaClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:11434') {
    this.baseUrl = baseUrl;
  }

  async generate(request: OllamaRequest): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request,
          stream: false, // Por simplicidad, no usamos streaming
        }),
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data: OllamaResponse = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error al comunicarse con Ollama:', error);
      throw new Error('No se pudo conectar con el modelo de IA local. Asegúrate de que Ollama esté ejecutándose.');
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.models?.map((model: any) => model.name) || [];
    } catch (error) {
      console.error('Error al obtener modelos:', error);
      return [];
    }
  }
}

// Instancia global del cliente
export const ollamaClient = new OllamaClient();
