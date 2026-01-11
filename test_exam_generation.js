// Script de prueba para verificar la generación de exámenes
// Ejecutar con: node test_exam_generation.js

const ExamAIService = require('./src/services/examAIService.ts');

// Simular diferentes configuraciones de exámenes
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

console.log("=== PRUEBA DE GENERACIÓN DE EXÁMENES ===\n");

testConfigurations.forEach((config, index) => {
  console.log(`${index + 1}. ${config.name}`);
  console.log("Configuración:", JSON.stringify(config.request, null, 2));
  console.log("---\n");
});
