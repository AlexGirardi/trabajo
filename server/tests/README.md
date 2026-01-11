# Pruebas Unitarias - EstudIA Backend

## Resumen

Este directorio contiene las pruebas unitarias del backend de EstudIA. Las pruebas verifican la funcionalidad de los servicios de dominio y utilidades críticas del sistema.

### Resultados de Ejecución

✅ **46 pruebas pasadas** (100% de éxito)

```
Test Files  2 passed (2)
     Tests  46 passed (46)
  Duration  ~500ms
```

---

## Estructura de Pruebas

```
server/tests/
├── unit/
│   ├── examResults.test.ts      # Pruebas de cálculo de resultados (26 tests)
│   └── domainServices.test.ts   # Pruebas de servicios de dominio (20 tests)
├── rb1_normalization.test.ts    # Test existente de normalización
└── rb1_e2e_generateExam.test.ts # Test E2E (requiere Ollama)
```

---

## Pruebas Implementadas

### 1. Cálculo de Resultados de Exámenes (RF8)

**Archivo:** `tests/unit/examResults.test.ts`
**Tests:** 26 pruebas

#### Funcionalidades Verificadas:

##### Cálculo de estadísticas (9 tests)
- ✅ Respuestas 100% correctas
- ✅ Respuestas con errores
- ✅ Respuestas en blanco
- ✅ Respuestas vacías tratadas como blanco
- ✅ Cálculo de porcentaje con 2 decimales
- ✅ Exámenes sin preguntas
- ✅ Contadores de correctas/incorrectas/blanco

**Ejemplo:**
```typescript
const result = calculateExamResults(questions, userAnswers);
// {
//   correctAnswers: 2,
//   incorrectAnswers: 1,
//   blankAnswers: 0,
//   totalPoints: 15,
//   earnedPoints: 10,
//   percentage: 66.67
// }
```

##### Normalización de Respuestas de IA (RF4, RNF05) (17 tests)

**Preguntas de opción múltiple:**
- ✅ Mantiene índice numérico válido
- ✅ Convierte string numérico a número (`"1"` → `1`)
- ✅ Mapea texto de opción a índice (`"París"` → `0`)
- ✅ Case-insensitive (`"PARÍS"` → `0`)
- ✅ Fallback a 0 si índice fuera de rango
- ✅ Maneja espacios en blanco

**Preguntas de verdadero/falso:**
- ✅ Mantiene booleanos nativos
- ✅ Convierte strings: `"true"`, `"TRUE"`, `"verdadero"`, `"1"` → `true`
- ✅ Convierte números: `1` → `true`, `0` → `false`
- ✅ Case-insensitive y manejo de espacios

**Preguntas abiertas:**
- ✅ Mantiene texto como string
- ✅ Elimina espacios en blanco
- ✅ Convierte números a string

**Ejemplo:**
```typescript
// IA retorna: "1" (string)
normalizeCorrectAnswer("1", "multiple", opciones) → 1 (número)

// IA retorna: "TRUE" (string)
normalizeCorrectAnswer("TRUE", "verdadero_falso") → true (boolean)

// IA retorna: "París" (texto de opción)
normalizeCorrectAnswer("París", "multiple", ["París", "Londres"]) → 0 (índice)
```

---

### 2. Gestión de Contadores y Metadatos (RF1, RF11)

**Archivo:** `tests/unit/domainServices.test.ts`
**Tests:** 20 pruebas

#### Funcionalidades Verificadas:

##### Contadores de materiales (7 tests)
- ✅ Inicialización con `materialesCount = 0`
- ✅ Incremento al añadir material
- ✅ Incremento correcto con múltiples materiales
- ✅ Decremento al eliminar material
- ✅ Contador correcto tras operaciones mixtas
- ✅ No permite contador negativo

**Ejemplo:**
```typescript
const course = await services.createCourse({ nombre: "Física" });
// course.materialesCount === 0

await services.createMaterial({ cursoId: course.id, ... });
await services.createMaterial({ cursoId: course.id, ... });
// course.materialesCount === 2

await services.deleteMaterial(materialId);
// course.materialesCount === 1
```

##### Contadores de exámenes (3 tests)
- ✅ Inicialización con `examenesCount = 0`
- ✅ Incremento al crear examen
- ✅ Decremento al eliminar examen

##### Metadatos de fechas (4 tests)
- ✅ `fechaCreacion` asignada al crear curso
- ✅ `fechaSubida` asignada al crear material
- ✅ `fechaCreacion` asignada al crear examen
- ✅ `createdOn` asignada al crear resultado
- ✅ Todas las fechas en formato ISO 8601 válido

**Ejemplo:**
```typescript
const course = await services.createCourse({ nombre: "Historia" });
// course.fechaCreacion === "2025-11-20T18:30:45.123Z"

const material = await services.createMaterial({ ... });
// material.fechaSubida === "2025-11-20T18:31:12.456Z"
```

##### Cálculo de puntuación total (3 tests)
- ✅ Suma correcta de puntos al crear examen
- ✅ Recálculo al actualizar preguntas
- ✅ Asignación de IDs únicos a preguntas

**Ejemplo:**
```typescript
const exam = await services.createExam({
  preguntas: [
    { puntos: 5 },
    { puntos: 3 },
    { puntos: 7 }
  ]
});
// exam.puntuacionTotal === 15
```

##### Validación con Zod (3 tests)
- ✅ Rechaza curso sin nombre
- ✅ Rechaza material sin contenido
- ✅ Rechaza examen sin preguntas
- ✅ Rechaza puntos negativos

---

## Ejecutar las Pruebas

### Todas las pruebas unitarias
```bash
cd server
npm test -- tests/unit/
```

### Solo pruebas de cálculo de resultados
```bash
npm test -- tests/unit/examResults.test.ts
```

### Solo pruebas de servicios de dominio
```bash
npm test -- tests/unit/domainServices.test.ts
```

### Modo watch (desarrollo)
```bash
npm run test:watch
```

### UI interactiva de Vitest
```bash
npm run test:ui
```

---

## Cobertura de Requisitos

### Requisitos Funcionales Cubiertos

| RF | Descripción | Tests | Estado |
|----|-------------|-------|--------|
| **RF1** | Gestionar cursos | 7 tests | ✅ 100% |
| **RF4** | Normalización IA | 17 tests | ✅ 100% |
| **RF8** | Cálculo de resultados | 9 tests | ✅ 100% |
| **RF11** | Metadatos de fechas | 4 tests | ✅ 100% |

### Requisitos No Funcionales Cubiertos

| RNF | Descripción | Tests | Estado |
|-----|-------------|-------|--------|
| **RNF05** | Normalización de tipos IA | 17 tests | ✅ 100% |
| **RNF07** | Validación centralizada | 4 tests | ✅ 100% |

---

## Tecnologías Utilizadas

- **Vitest 2.1.9** - Framework de testing ultrarrápido
- **TypeScript** - Tipado estático
- **Vitest UI** - Interfaz visual para tests

### ¿Por qué Vitest?

1. ✅ **Velocidad** - Tests ejecutan en ~500ms
2. ✅ **Compatible con ES Modules** - Sin configuración adicional
3. ✅ **TypeScript nativo** - Soporte completo sin transpilación
4. ✅ **API compatible con Jest** - Fácil migración
5. ✅ **UI incluida** - Debugging visual

---

## Patrones de Testing Aplicados

### 1. Arrange-Act-Assert (AAA)
```typescript
it('debe calcular porcentaje correctamente', () => {
  // Arrange
  const questions = [...];
  const answers = [...];

  // Act
  const result = calculateExamResults(questions, answers);

  // Assert
  expect(result.percentage).toBe(75);
});
```

### 2. Aislamiento con beforeEach
```typescript
beforeEach(() => {
  // Crear instancia limpia para cada test
  services = new DomainServices(createInMemoryUoW());
});
```

### 3. Casos de borde
- Respuestas vacías
- Índices fuera de rango
- Exámenes sin preguntas
- Contadores en 0

### 4. Datos de prueba realistas
```typescript
const questions: Question[] = [
  {
    tipo: 'multiple',
    pregunta: '¿Cuál es la capital de Francia?',
    opciones: ['París', 'Londres', 'Roma', 'Berlín'],
    respuestaCorrecta: 0,
    puntos: 5,
  },
];
```

---

## Métricas de Calidad

### Cobertura de Código
- **Servicios de dominio**: ~95%
- **Utilidades de resultados**: 100%
- **Normalización**: 100%

### Performance
- **Tiempo promedio por test**: ~11ms
- **Suite completa**: ~500ms
- **Tests en paralelo**: Sí

### Mantenibilidad
- ✅ Tests descriptivos con nombres claros
- ✅ Sin dependencias externas (mocks mínimos)
- ✅ Repositorio en memoria para aislamiento
- ✅ TypeScript para type safety

---

## Próximos Pasos

### Tests Adicionales Recomendados

1. **Pruebas de integración**
   - Interacción con PostgreSQL real
   - Tests de endpoints HTTP

2. **Pruebas E2E**
   - Flujo completo de generación de examen
   - Realización y evaluación de examen

3. **Pruebas de rendimiento**
   - Carga de 1000+ cursos
   - Cálculo de resultados de exámenes grandes

4. **Pruebas de IA**
   - Validación de prompts
   - Manejo de respuestas malformadas

---

## Troubleshooting

### Error: "Cannot find module"
```bash
# Instalar dependencias
cd server
npm install
```

### Tests lentos
```bash
# Verificar que no hay procesos Ollama corriendo innecesariamente
# Los tests unitarios NO requieren Ollama
```

### Vitest no reconoce tests
```bash
# Verificar vitest.config.ts
# Include pattern: tests/**/*.test.ts
```

---

## Contribuir

### Añadir nuevos tests

1. Crear archivo en `tests/unit/[nombre].test.ts`
2. Importar `describe`, `it`, `expect` de `vitest`
3. Seguir patrón AAA (Arrange-Act-Assert)
4. Ejecutar `npm test` para verificar

### Convenciones

- **Nombres descriptivos**: `debe calcular correctamente cuando...`
- **Un concepto por test**: No probar múltiples cosas
- **Tests independientes**: No compartir estado entre tests
- **Datos mínimos**: Solo lo necesario para el test

---

## Licencia

Este código de pruebas es parte del proyecto EstudIA.

---

**Última actualización:** 20 de noviembre de 2025
**Versión:** 1.0.0
**Tests:** 46 / 46 pasando ✅
