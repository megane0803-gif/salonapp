// 今日の日付
const today = new Date();

// 曜日表示用
const dayHead = document.getElementById("dayHead");
const weekHead = document.getElementById("weekHead");
const monthHead = document.getElementById("monthHead");

// タイムスロット
const timesEl = document.getElementById("times");

// 予約データを仮で用意（あとでAPIやDBから取得する想定）
const reservations = [
  { start_time: "2025-08-25T10:30:00Z", end_time: "2025-08-25T11:30:00Z", service: "HPB 自動取込予約" },
  { start_time: "2025-08-26T13:30:00Z", end_time: "2025-08-26T15:00:00Z", service: "LiME 直接登録" },
  { start_time: "2025-08-30T17:00:00Z", end_time: "2025-08-30T18:00:00Z", service: "TEL 直接予約" },
];

// ----------------------------
// 時間の目盛りを描画
// ----------------------------
function renderTimes() {
  timesEl.innerHTML = "";
  for (let h = 9; h <= 20; h++) {
    const div = document.createElement("div");
    div.className = "time";
    div.textContent = `${h}:00`;
    timesEl.appendChild(div);
  }
}

// ----------------------------
// 1日の予約を描画
// ----------------------------
function renderDay() {
  dayHead.textContent = today.toISOString().slice(0, 10);

  const dayCol = document.getElementById("dayCol");
  dayCol.innerHTML = "";

  reservations.forEach(r => {
    const start = new Date(r.start_time);
    if (start.toDateString() === today.toDateString()) {
      const div = document.createElement("div");
      div.className = "reservation";
      div.textContent = r.service;
      dayCol.appendChild(div);
    }
  });
}

// ----------------------------
// 週表示を描画
// ----------------------------
function renderWeek() {
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay()); // 日曜始まり
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  weekHead.textContent = `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;

  const weekCol = document.getElementById("weekCol");
  weekCol.innerHTML = "";

  reservations.forEach(r => {
    const start = new Date(r.start_time);
    if (start >= weekStart && start <= weekEnd) {
      const div = document.createElement("div");
      div.className = "reservation";
      div.textContent = r.service;
      weekCol.appendChild(div);
    }
  });
}

// ----------------------------
// 月表示を描画
// ----------------------------
function renderMonth() {
  const month = today.getMonth();
  const year = today.getFullYear();

  monthHead.textContent = `${year}年${month + 1}月`;

  const monthCol = document.getElementById("monthCol");
  monthCol.innerHTML = "";

  reservations.forEach(r => {
    const start = new Date(r.start_time);
    if (start.getMonth() === month && start.getFullYear() === year) {
      const div = document.createElement("div");
      div.className = "reservation";
      div.textContent = r.service;
      monthCol.appendChild(div);
    }
  });
}

// ----------------------------
// 初期化
// ----------------------------
function init() {
  renderTimes();
  renderDay();
  renderWeek();
  renderMonth();
}

init();
