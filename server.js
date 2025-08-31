// server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { Pool } from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ---- DB 接続（Neon）----
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Render の環境変数に入れる
  ssl: { rejectUnauthorized: false },         // Neon は SSL 必須
});

// JSON 受け取り
app.use(express.json());

// ヘルスチェック
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// 予約一覧（最新順）
app.get("/api/reservations", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, customer_name, service, start_time, end_time, created_at
       FROM reservations
       ORDER BY start_time DESC
       LIMIT 200`
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed_to_fetch" });
  }
});

// 予約作成
app.post("/api/reservations", async (req, res) => {
  try {
    const { customer_name, service, start_time, end_time } = req.body;
    if (!customer_name || !service || !start_time || !end_time) {
      return res.status(400).json({ error: "missing_fields" });
    }
    const q = `
      INSERT INTO reservations (customer_name, service, start_time, end_time)
      VALUES ($1, $2, $3, $4)
      RETURNING *`;
    const { rows } = await pool.query(q, [
      customer_name,
      service,
      start_time, // ISO文字列でOK（例: "2025-09-01T10:00:00+09:00"）
      end_time,
    ]);
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed_to_insert" });
  }
});

// （お好み）予約削除
app.delete("/api/reservations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM reservations WHERE id = $1`, [id]);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed_to_delete" });
  }
});

// 静的ファイル（/dist をトップで配信）
app.use(express.static(path.join(__dirname, "dist")));
app.get("*", (_req, res) =>
  res.sendFile(path.join(__dirname, "dist", "index.html"))
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
