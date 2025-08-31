import express from "express";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

const distPath = path.join(process.cwd(), "dist");
const hasDist = fs.existsSync(path.join(distPath, "index.html"));

// ヘルスチェック
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// 週の予約（まずはダミーデータでOK）
app.get("/api/reservations", (req, res) => {
  // ?week=YYYY-MM-DD（月曜日想定）
  const weekISO = req.query.week;
  const base = weekISO ? new Date(weekISO) : mondayOf(new Date());
  const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().slice(0,10);

  // 今は固定サンプル（HPB/LiMEを模した表示）。後でGmailやLIME連携で置き換え。
  const d0 = new Date(base);                      // 月
  const d2 = new Date(base); d2.setDate(d2.getDate()+2); // 水
  const d5 = new Date(base); d5.setDate(d5.getDate()+5); // 土

  const sample = [
    { date: iso(d0), start: "10:00", durationMin: 60, title: "HPB: 田中さま" },
    { date: iso(d2), start: "13:30", durationMin: 90, title: "LiME: 佐藤さま" },
    { date: iso(d5), start: "17:00", durationMin: 60, title: "TEL: 山本さま" }
  ];
  res.json(sample);
});

function mondayOf(d){
  const x = new Date(d); const day = (x.getDay()+6)%7;
  x.setDate(x.getDate()-day); x.setHours(0,0,0,0); return x;
}

// dist があるならビルド成果物を配信（本番想定）
if (hasDist) {
  app.use(express.static("dist"));
  app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
} else {
  // dist が無い場合でも最低限のページを返す（開発・応急用）
  app.get("*", (_req, res) => {
    res.type("html").send(`
      <!doctype html>
      <html><head><meta charset="utf-8"><title>Salon App</title></head>
      <body>
        <h2>Server is up 🟢</h2>
        <p>フロントは <code>index.html</code> を root に置いて再デプロイしてください。</p>
        <p>ヘルスチェック: <a href="/api/health">/api/health</a></p>
      </body></html>
    `);
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
