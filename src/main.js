// /src/main.js
const listEl = document.getElementById('list');
const statusEl = document.getElementById('status');
document.getElementById('reload').addEventListener('click', load);

function toJST(iso) {
  // 受け取った時刻（ISO or 'YYYY/MM/DD HH:mm' 形式）を日本時間表示へ
  const dt = new Date(iso);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  const hh = String(dt.getHours()).padStart(2, '0');
  const mm = String(dt.getMinutes()).padStart(2, '0');
  return { date: `${y}/${m}/${d}`, time: `${hh}:${mm}` };
}

async function load() {
  statusEl.textContent = '読み込み中…';
  listEl.innerHTML = '';
  try {
    const res = await fetch('/api/reservations');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // 日付ごとにグループ化
    const groups = {};
    for (const r of data) {
      const { date, time } = toJST(r.start_time);
      const end = toJST(r.end_time).time;
      (groups[date] ||= []).push({
        id: r.id,
        customer: r.customer_name,
        service: r.service,
        start: time,
        end
      });
    }

    // 日付の昇順で描画
    const dates = Object.keys(groups).sort();
    if (dates.length === 0) {
      listEl.innerHTML = '<p>予約はありません。</p>';
    } else {
      for (const date of dates) {
        const card = document.createElement('div');
        card.className = 'card';
        const head = document.createElement('div');
        head.className = 'date';
        head.textContent = date;
        card.appendChild(head);

        // 同日内は開始時刻でソート
        groups[date].sort((a,b)=>a.start.localeCompare(b.start));
        for (const r of groups[date]) {
          const row = document.createElement('div');
          row.className = 'item';
          row.innerHTML = `
            <div class="left">
              <div><strong>${r.start}〜${r.end}</strong></div>
              <div class="service">${r.service}</div>
            </div>
            <div>${r.customer}</div>
          `;
          card.appendChild(row);
        }
        listEl.appendChild(card);
      }
    }
    statusEl.textContent = '更新済み';
  } catch (e) {
    console.error(e);
    statusEl.textContent = '読み込み失敗';
    listEl.innerHTML = `<p>データ取得でエラーが起きました。</p>`;
  }
}

// 初回ロード
load();
