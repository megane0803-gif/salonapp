// server.js
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ヘルスチェック
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// ビルド成果物があれば配信（dist）
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
} else {
  // distが無い場合でも起動は成功させる（まずは配信確認用）
  app.get('*', (_req, res) => res.send('OK – server up'));
}

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
