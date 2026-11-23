import pg from 'pg';
const { Pool } = pg;
export const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgres://portfolio:portfolio_local_password@localhost:5432/portfolio' });
export async function initDb() {
  await pool.query(`CREATE TABLE IF NOT EXISTS projects (id SERIAL PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL, technologies TEXT[] NOT NULL DEFAULT '{}', url TEXT NOT NULL DEFAULT '#')`);
  await pool.query(`CREATE TABLE IF NOT EXISTS contacts (id SERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, message TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM projects');
  if (rows[0].count === 0) await pool.query(`INSERT INTO projects (title, description, technologies, url) VALUES
    ('Sistema de reservas','Aplicación web para administrar citas y disponibilidad.',ARRAY['React','Node.js','PostgreSQL'],'#'),
    ('Panel de analítica','Visualización clara de métricas para tomar mejores decisiones.',ARRAY['JavaScript','Express','SQL'],'#'),
    ('Automatización CI/CD','Pipeline de pruebas, contenedores e infraestructura como código.',ARRAY['GitHub Actions','Docker','Terraform'],'#')`);
}
