import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './db.js';
import { validateContact } from './validators.js';
const app = express();
app.use(express.json({ limit: '32kb' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/api/projects', async (_req, res) => {
  try { const { rows } = await pool.query('SELECT id,title,description,technologies,url FROM projects ORDER BY id'); res.json(rows); }
  catch { res.status(500).json({ error: 'No se pudieron cargar los proyectos.' }); }
});
app.post('/api/contact', async (req, res) => {
  const result = validateContact(req.body);
  if (!result.valid) return res.status(400).json({ error: result.error });
  try { const { name, email, message } = result.data; const saved = await pool.query('INSERT INTO contacts (name,email,message) VALUES ($1,$2,$3) RETURNING id', [name,email,message]); res.status(201).json({ id: saved.rows[0].id, message: 'Mensaje recibido.' }); }
  catch { res.status(500).json({ error: 'No se pudo guardar el mensaje.' }); }
});
if (process.env.NODE_ENV === 'production') {
  const here = path.dirname(fileURLToPath(import.meta.url));
  app.use(express.static(path.resolve(here, '../public')));
  app.get('*', (_req, res) => res.sendFile(path.resolve(here, '../public/index.html')));
}
export default app;
