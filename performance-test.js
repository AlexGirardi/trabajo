/**
 * Script de medición de rendimiento de operaciones clave
 */

async function measurePerformance() {
  const results = [];

  const startTotal = performance.now();

  const localStorage = {
    data: {},
    setItem(key, value) { this.data[key] = value; },
    getItem(key) { return this.data[key] || null; },
    removeItem(key) { delete this.data[key]; }
  };
  global.localStorage = localStorage;

  const { CourseService } = await import('./src/services/courseService.js');
  const { MaterialService } = await import('./src/services/materialService.js');

  console.log('\n=== MEDICIÓN DE RENDIMIENTO DE OPERACIONES ===\n');

  const start1 = performance.now();
  const curso = CourseService.saveCourse({
    nombre: 'Física Cuántica',
    descripcion: 'Curso de física cuántica avanzada',
    color: '#2196f3'
  });
  const time1 = performance.now() - start1;
  console.log(`✓ Creación de curso: ${time1.toFixed(2)} ms`);
  results.push({ operation: 'Creación de curso', time: time1 });

  const start2 = performance.now();
  for (let i = 0; i < 10; i++) {
    MaterialService.saveMaterial({
      cursoId: curso.id,
      nombre: `Material ${i + 1}.txt`,
      tipo: 'texto',
      contenido: 'A'.repeat(5000),
      tamaño: 5000
    });
  }
  const time2 = performance.now() - start2;
  console.log(`✓ Creación de 10 materiales: ${time2.toFixed(2)} ms (${(time2/10).toFixed(2)} ms por material)`);
  results.push({ operation: 'Creación de 10 materiales', time: time2 });

  const start3 = performance.now();
  const courses = CourseService.getCourses();
  const time3 = performance.now() - start3;
  console.log(`✓ Listado de cursos: ${time3.toFixed(2)} ms`);
  results.push({ operation: 'Listado de cursos', time: time3 });

  const start4 = performance.now();
  const materials = MaterialService.getMaterialsByCourse(curso.id);
  const time4 = performance.now() - start4;
  console.log(`✓ Listado de materiales por curso (10 items): ${time4.toFixed(2)} ms`);
  results.push({ operation: 'Listado de 10 materiales', time: time4 });

  const start5 = performance.now();
  const courseContent = MaterialService.getCourseContent(curso.id);
  const time5 = performance.now() - start5;
  console.log(`✓ Obtención de contenido del curso (${courseContent.length} caracteres): ${time5.toFixed(2)} ms`);
  results.push({ operation: 'Obtención de contenido del curso', time: time5 });

  const start6 = performance.now();
  CourseService.updateCourse(curso.id, { descripcion: 'Nueva descripción actualizada' });
  const time6 = performance.now() - start6;
  console.log(`✓ Actualización de curso: ${time6.toFixed(2)} ms`);
  results.push({ operation: 'Actualización de curso', time: time6 });

  const start7 = performance.now();
  MaterialService.deleteMaterial(materials[0].id);
  const time7 = performance.now() - start7;
  console.log(`✓ Eliminación de material: ${time7.toFixed(2)} ms`);
  results.push({ operation: 'Eliminación de material', time: time7 });

  const totalTime = performance.now() - startTotal;
  console.log(`\n✓ Tiempo total de todas las operaciones: ${totalTime.toFixed(2)} ms\n`);

  console.log('=== RESUMEN ESTADÍSTICO ===');
  const times = results.map(r => r.time);
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const max = Math.max(...times);
  const min = Math.min(...times);
  console.log(`Promedio: ${avg.toFixed(2)} ms`);
  console.log(`Máximo: ${max.toFixed(2)} ms`);
  console.log(`Mínimo: ${min.toFixed(2)} ms\n`);

  console.log('=== TABLA DE RESULTADOS ===');
  console.log('| Operación | Tiempo (ms) |');
  console.log('|-----------|-------------|');
  results.forEach(r => {
    console.log(`| ${r.operation.padEnd(40)} | ${r.time.toFixed(2).padStart(8)} |`);
  });
  console.log('');
}

measurePerformance().catch(console.error);
