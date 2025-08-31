import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// JSON を受ける
app.use(express.json());

// Postgres 接続（Neon の URL を Render の環境変数 DATABASE_URL に入れてある想定）
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Neon/Renderの一般的設定
});

// --- API ---
// 予約一覧
app.get('/api/reservations', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, customer_name, service, start_time, end_time, created_at FROM reservations ORDER BY start_time DESC LIMIT 100'
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'db_error' });
  }
});

// ダミー登録（必要なら）
app.post('/api/reservations', async (req, res) => {
  const { customer_name, service, start_time, end_time } = req.body || {};
  try {
    const { rows } = await pool.query(
      `INSERT INTO reservations (customer_name, service, start_time, end_time)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [customer_name, service, start_time, end_time]
    );
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'db_error' });
  }
});

// --- フロント（Vite の成果物を配信） ---
const distDir = path.join(__dirname, 'dist');
app.use(express.static(distDir));
app.get('*', (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
