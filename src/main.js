// src/main.js（置き換え）
function showError(msg) {
  const el = document.getElementById("error");
  if (el) el.textContent = msg;
  console.error(msg);
}

function ensureBox(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`要素 #${id} が見つかりません（index.html を確認）`);
  return el;
}

async function fetchReservations() {
  const r = await fetch("/api/reservations");
  if (!r.ok) throw new Error(`APIエラー /api/reservations status=${r.status}`);
  return await r.json();
}

function render(reservations) {
  const day0 = ensureBox("day0");       // 今日
  const week0 = ensureBox("week0");     // 今週
  const month0 = ensureBox("month0");   // 今月

  day0.innerHTML = "";
  week0.innerHTML = "";
  month0.innerHTML = "";

  const todayStr = new Date().toISOString().slice(0, 10);

  reservations.forEach(r => {
    const item = document.createElement("div");
    item.className = "reservation";
    item.textContent = `${r.start_time}〜${r.end_time}：${r.service}`;

    // とりあえず全部 today/this week/this month に同じ表示
    day0.appendChild(item.cloneNode(true));
    week0.appendChild(item.cloneNode(true));
    month0.appendChild(item);
  });

  const today = ensureBox("today");
  today.textContent = todayStr.replace(/-/g, "/");
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const data = await fetchReservations();
    render(data);
  } catch (e) {
    showError(e.message);
  }
});
