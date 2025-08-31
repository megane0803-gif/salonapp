// server.js（置き換え）
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import pkg from "pg";

const { Pool } = pkg;
const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 静的ファイル: dist を配信
app.use(express.static(path.join(__dirname, "dist")));

// DB（Neon）接続
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// 予約一覧API
app.get("/api/reservations", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, customer_name, service,
              to_char(start_time, 'YYYY/MM/DD HH24:MI') AS start_time,
              to_char(end_time,   'YYYY/MM/DD HH24:MI') AS end_time
         FROM reservations
        ORDER BY start_time ASC
        LIMIT 200`
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "db_error" });
  }
});

// ルート: dist/index.html を返す
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
