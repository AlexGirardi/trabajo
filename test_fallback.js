import { examAIService } from './src/services/examAIService.js';

// Función para probar la generación de fallback questions
function testFallbackGeneration() {
  console.log("=== PRUEBA DE GENERACIÓN FALLBACK ===\n");

  const testConfigurations = [
    {
      name: "Solo opción múltiple",
      request: {
        cursoId: "1",
        numeroPreguntas: 5,
        tiposPreguntas: ['multiple'],
        dificultad: 'medio',
        duracionMinutos: 30
      }
    },
    {
      name: "Solo verdadero/falso",
      request: {
        cursoId: "1",
        numeroPreguntas: 5,
        tiposPreguntas: ['verdadero_falso'],
        dificultad: 'medio',
        duracionMinutos: 30
      }
    },
    {
      name: "Solo preguntas abiertas",
      request: {
        cursoId: "1",
        numeroPreguntas: 3,
        tiposPreguntas: ['abierta'],
        dificultad: 'medio',
        duracionMinutos: 30
      }
    },
    {
      name: "Mixto: múltiple + verdadero/falso",
      request: {
        cursoId: "1",
        numeroPreguntas: 6,
        tiposPreguntas: ['multiple', 'verdadero_falso'],
        dificultad: 'medio',
        duracionMinutos: 30
      }
    }
  ];

  testConfigurations.forEach((config, index) => {
    console.log(`${index + 1}. ${config.name}`);
    console.log("Configuración:", JSON.stringify(config.request, null, 2));
    
    // Simular generación fallback
    const fallbackQuestions = examAIService.generateFallbackQuestions(config.request);
    console.log("Preguntas generadas:");
    fallbackQuestions.forEach((q, i) => {
      console.log(`  ${i + 1}. Tipo: ${q.tipo}, Pregunta: ${q.pregunta}`);
    });
    console.log("---\n");
  });
}

testFallbackGeneration();
