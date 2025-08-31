import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

// dist フォルダ（vite build の出力先）を配信
app.use(express.static("dist"));

// ルートアクセス
app.get("*", (req, res) => {
  res.sendFile(process.cwd() + "/dist/index.html");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
