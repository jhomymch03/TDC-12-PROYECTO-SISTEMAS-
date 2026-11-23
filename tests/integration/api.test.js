import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../../server/app.js';
import { initDb, pool } from '../../server/db.js';

before(async () => { await initDb(); await pool.query('TRUNCATE contacts RESTART IDENTITY'); });
after(async () => { await pool.end(); });
test('GET /api/health responde estado saludable', async () => { const res = await request(app).get('/api/health'); assert.equal(res.status, 200); assert.equal(res.body.status, 'ok'); });
test('GET /api/projects entrega al menos tres proyectos', async () => { const res = await request(app).get('/api/projects'); assert.equal(res.status, 200); assert.ok(res.body.length >= 3); assert.ok(res.body[0].title); });
test('POST /api/contact valida y persiste el mensaje', async () => { const res = await request(app).post('/api/contact').send({ name: 'Rosa', email: 'rosa@example.com', message: 'Quiero conversar sobre tu portafolio.' }); assert.equal(res.status, 201); const row = await pool.query('SELECT email FROM contacts WHERE id=$1', [res.body.id]); assert.equal(row.rows[0].email, 'rosa@example.com'); });