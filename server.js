import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

// dist フォルダを静的配信
app.use(express.static("dist"));

// SPA想定で全ルートに index.html を返す
app.get("*", (req, res) => {
  res.sendFile(process.cwd() + "/dist/index.html");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
