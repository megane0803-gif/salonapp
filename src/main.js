// src/main.js
// フロントエンドからバックエンド(server.js)経由で予約データを取得して表示

// ページ読み込み時に実行
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // APIサーバーから予約データを取得
    const res = await fetch("/api/reservations");
    const reservations = await res.json();

    renderReservations(reservations);
  } catch (err) {
    console.error("予約データ取得エラー:", err);
  }
});

// 予約データを画面に描画
function renderReservations(reservations) {
  const container = document.getElementById("day0"); // index.html の <div id="day0">
  container.innerHTML = "";

  reservations.forEach(r => {
    const div = document.createElement("div");
    div.className = "reservation";
    div.textContent = `${r.start_time} 〜 ${r.end_time} : ${r.service}`;
    container.appendChild(div);
  });
}
