// server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { Pool } from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- DB（必要なら使う） ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Render/Neon の接続文字列
  ssl: { rejectUnauthorized: false },
});

// API例（動作確認用）：/api/health -> {"ok":true}
app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("select 1");
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// --- 静的配信（Viteのビルド成果物） ---
const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));

// どのパスでも index.html を返す（SPA ルーティング）
app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// PORT は Render が注入。なければ 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
