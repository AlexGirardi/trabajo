-- CreateEnum
CREATE TYPE "public"."MaterialTipo" AS ENUM ('pdf', 'texto', 'documento');

-- CreateEnum
CREATE TYPE "public"."Dificultad" AS ENUM ('facil', 'medio', 'dificil');

-- CreateEnum
CREATE TYPE "public"."QuestionTipo" AS ENUM ('multiple', 'verdadero_falso', 'abierta');

-- CreateTable
CREATE TABLE "public"."Course" (
    "id" TEXT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL DEFAULT '',
    "categoria" TEXT,
    "semestre" TEXT,
    "profesor" TEXT,
    "color" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "materialesCount" INTEGER NOT NULL DEFAULT 0,
    "examenesCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Material" (
    "id" TEXT NOT NULL,
    "cursoId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "public"."MaterialTipo" NOT NULL DEFAULT 'texto',
    "contenido" TEXT NOT NULL,
    "fechaSubida" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tamaño" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Exam" (
    "id" TEXT NOT NULL,
    "cursoId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL DEFAULT '',
    "dificultad" "public"."Dificultad",
    "duracionMinutos" INTEGER NOT NULL,
    "intentosMaximos" INTEGER NOT NULL DEFAULT 1,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "puntuacionTotal" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Question" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "tipo" "public"."QuestionTipo" NOT NULL,
    "pregunta" TEXT NOT NULL,
    "opciones" TEXT[],
    "respuestaCorrecta" TEXT NOT NULL,
    "explicacion" TEXT,
    "puntos" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExamAttempt" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "completado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ExamAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExamResult" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "correctAnswers" INTEGER NOT NULL,
    "incorrectAnswers" INTEGER NOT NULL,
    "blankAnswers" INTEGER NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "totalPoints" DOUBLE PRECISION NOT NULL,
    "earnedPoints" DOUBLE PRECISION NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamResult_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Material" ADD CONSTRAINT "Material_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Exam" ADD CONSTRAINT "Exam_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Question" ADD CONSTRAINT "Question_examId_fkey" FOREIGN KEY ("examId") REFERENCES "public"."Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExamAttempt" ADD CONSTRAINT "ExamAttempt_examId_fkey" FOREIGN KEY ("examId") REFERENCES "public"."Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExamResult" ADD CONSTRAINT "ExamResult_examId_fkey" FOREIGN KEY ("examId") REFERENCES "public"."Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExamResult" ADD CONSTRAINT "ExamResult_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "public"."ExamAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
