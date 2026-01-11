import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.course.count();
  if (existing > 0) {
    console.log('Seed skipped (data already present)');
    return;
  }
  const course = await prisma.course.create({
    data: {
      nombre: 'Curso Demo',
      descripcion: 'Curso inicial de ejemplo',
      tags: ['demo','inicio'],
      materialesCount: 0,
      examenesCount: 0
    }
  });
  console.log('Created course', course.id);
  const material = await prisma.material.create({
    data: {
      cursoId: course.id,
      nombre: 'Apuntes Introducción',
      tipo: 'texto',
      contenido: 'Contenido de ejemplo para el curso demo',
      tamaño: 1200,
      activo: true
    }
  });
  await prisma.course.update({ where: { id: course.id }, data: { materialesCount: 1 } });
  console.log('Created material', material.id);
  const exam = await prisma.exam.create({
    data: {
      cursoId: course.id,
      titulo: 'Examen Inicial',
      descripcion: 'Pequeño examen de ejemplo',
      duracionMinutos: 30,
      intentosMaximos: 1,
      puntuacionTotal: 2,
      preguntas: {
        create: [
          { tipo: 'multiple', pregunta: '2+2?', opciones: ['3','4','5'], respuestaCorrecta: '4', puntos: 1 },
          { tipo: 'verdadero_falso', pregunta: 'El cielo es azul', opciones: [], respuestaCorrecta: 'true', puntos: 1 }
        ]
      }
    },
    include: { preguntas: true }
  });
  await prisma.course.update({ where: { id: course.id }, data: { examenesCount: 1 } });
  console.log('Created exam', exam.id);
  console.log('Seed completed');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
