import app from './app.js';
import { initDb, pool } from './db.js';
const port = Number(process.env.PORT || 3000);
try { await initDb(); app.listen(port, '0.0.0.0', () => console.log(`Portfolio escuchando en ${port}`)); }
catch (error) { console.error('No se pudo inicializar la base de datos:', error.message); await pool.end(); process.exit(1); }
