import express, { Request, Response } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { buildServices } from './services/domainServices';

// Build service layer (decoupled from Express & persistence implementation)
const services = buildServices();

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

// Courses
app.get('/api/courses', async (_req: Request, res: Response) => {
  res.json(await services.listCourses());
});
app.post('/api/courses', async (req: Request, res: Response) => {
  try {
    const created = await services.createCourse(req.body);
    res.status(201).json(created);
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'VALIDATION_ERROR' });
  }
});
app.put('/api/courses/:id', async (req: Request, res: Response) => {
  const updated = await services.updateCourse(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'NOT_FOUND' });
  res.json(updated);
});
app.delete('/api/courses/:id', async (req: Request, res: Response) => {
  const ok = await services.deleteCourse(req.params.id);
  if (!ok) return res.status(404).json({ error: 'NOT_FOUND' });
  res.status(204).end();
});

// Materials
app.get('/api/materials', async (req: Request, res: Response) => {
  const { cursoId } = req.query as any;
  res.json(await services.listMaterials(cursoId ? { cursoId } : undefined));
});
app.post('/api/materials', async (req: Request, res: Response) => {
  try {
    const mat = await services.createMaterial(req.body);
    res.status(201).json(mat);
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});
app.put('/api/materials/:id', async (req: Request, res: Response) => {
  try {
    const updated = await services.updateMaterial(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'NOT_FOUND' });
    res.json(updated);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});
app.delete('/api/materials/:id', async (req: Request, res: Response) => {
  const ok = await services.deleteMaterial(req.params.id);
  if (!ok) return res.status(404).json({ error: 'NOT_FOUND' });
  res.status(204).end();
});
// Toggle material active state
app.patch('/api/materials/:id/active', async (req: Request, res: Response) => {
  try {
    const { active } = req.body as any;
    if (typeof active !== 'boolean') return res.status(400).json({ error: 'active(boolean) required' });
    const updated = await services.updateMaterial(req.params.id, { activo: active } as any);
    if (!updated) return res.status(404).json({ error: 'NOT_FOUND' });
    res.json(updated);
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'TOGGLE_FAILED' });
  }
});
app.delete('/api/materials', async (req: Request, res: Response) => {
  const { cursoId } = req.query as any;
  if (!cursoId) return res.status(400).json({ error: 'cursoId required' });
  const result = await services.deleteMaterialsByCourse(cursoId);
  res.json(result);
});

// Exams
app.get('/api/exams', async (req: Request, res: Response) => {
  const { cursoId } = req.query as any;
  res.json(await services.listExams(cursoId ? { cursoId } : undefined));
});
app.get('/api/exams/:id', async (req: Request, res: Response) => {
  const exam = await services.getExam(req.params.id);
  if (!exam) return res.status(404).json({ error: 'NOT_FOUND' });
  res.json(exam);
});
app.post('/api/exams', async (req: Request, res: Response) => {
  try { const exam = await services.createExam(req.body); res.status(201).json(exam); }
  catch (e: any) { res.status(400).json({ error: e.message }); }
});
app.put('/api/exams/:id', async (req: Request, res: Response) => {
  const updated = await services.updateExam(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'NOT_FOUND' });
  res.json(updated);
});
app.delete('/api/exams/:id', async (req: Request, res: Response) => {
  const ok = await services.deleteExam(req.params.id);
  if (!ok) return res.status(404).json({ error: 'NOT_FOUND' });
  res.status(204).end();
});

// Attempts
app.get('/api/exam-attempts', async (_req: Request, res: Response) => {
  res.json(await services.listAttempts());
});
app.post('/api/exam-attempts', async (req: Request, res: Response) => {
  try { const attempt = await services.createAttempt(req.body); res.status(201).json(attempt); }
  catch (e: any) {
    console.error('[api] createAttempt error', e?.issues || e);
    res.status(400).json({ error: e.message, issues: e?.issues });
  }
});

// Results
app.get('/api/exam-results', async (_req: Request, res: Response) => { res.json(await services.listResults()); });
app.post('/api/exam-results', async (req: Request, res: Response) => {
  try { const result = await services.createResult(req.body); res.status(201).json(result); }
  catch (e: any) {
    console.error('[api] createResult error', e?.issues || e);
    res.status(400).json({ error: e.message, issues: e?.issues });
  }
});

// Aggregated stats (answer distribution)
app.get('/api/stats/answers', async (_req: Request, res: Response) => {
  try {
    const results = await services.listResults();
    let correct = 0; let incorrect = 0; let blank = 0; let total = 0;
    for (const r of results) {
      correct += (r as any).correctAnswers || 0;
      incorrect += (r as any).incorrectAnswers || 0;
      blank += (r as any).blankAnswers || 0;
    }
    total = correct + incorrect + blank;
    res.json({ correct, incorrect, blank, total });
  } catch (e: any) {
    res.status(500).json({ error: 'STATS_ERROR', detail: e.message });
  }
});

// Health
app.get('/api/health', (_req: Request, res: Response) => { res.json({ status: 'ok' }); });

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`EstudIA API listening on :${PORT}`);
});
