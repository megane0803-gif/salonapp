const API_BASE_URL = '/api/reservations';

// 一覧取得
async function fetchReservations() {
  const res = await fetch(API_BASE_URL);
  return await res.json();
}

// 予約作成
async function createReservation(data) {
  const res = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await res.json();
}

// 一覧表示
function renderReservations(list) {
  const tbody = document.getElementById('reservationsTbody');
  tbody.innerHTML = '';
  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4">予約がありません</td></tr>`;
    return;
  }
  list.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.customer_name}</td>
      <td>${r.service}</td>
      <td>${new Date(r.start_time).toLocaleString()}</td>
      <td>${new Date(r.end_time).toLocaleString()}</td>
    `;
    tbody.appendChild(tr);
  });
}

// 初期化
async function init() {
  // 初回ロード
  const list = await fetchReservations();
  renderReservations(list);

  // フォーム送信
  document.getElementById('reserveForm').addEventListener('submit', async e => {
    e.preventDefault();
    const data = {
      customer_name: document.getElementById('customerName').value,
      service: document.getElementById('service').value,
      start_time: document.getElementById('startTime').value,
      end_time: document.getElementById('endTime').value,
    };
    await createReservation(data);
    const list = await fetchReservations();
    renderReservations(list);
    e.target.reset();
  });

  // 更新ボタン
  document.getElementById('refreshBtn').addEventListener('click', async () => {
    const list = await fetchReservations();
    renderReservations(list);
  });
}

init();
