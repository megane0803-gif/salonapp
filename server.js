import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ヘルスチェック
app.get('/api/health', (_req, res) => {
  res.status(200).json({ ok: true });
});

// dist（ビルド成果物）を配信
const distDir = path.join(__dirname, 'dist');
app.use(express.static(distDir));

// ルーティング（SPA想定）：どのパスでも index.html を返す
app.get('*', (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
