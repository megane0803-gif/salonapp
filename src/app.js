// CSSもここでimport（Vite方式）
import './style.css';

// API設定
const API_BASE_URL = '/api';
const ENDPOINTS = {
  reservations: `${API_BASE_URL}/reservations`
};

// --- 予約一覧を取得して表示 ---
async function fetchReservations() {
  try {
    const response = await fetch(ENDPOINTS.reservations);
    if (!response.ok) throw new Error(`サーバーエラー: ${response.status}`);
    const data = await response.json();
    renderReservations(data);
  } catch (err) {
    console.error('予約取得エラー:', err);
    document.getElementById('reservations').innerHTML = `<p style="color:red;">予約を読み込めませんでした</p>`;
  }
}

// --- 表示処理 ---
function renderReservations(items) {
  const container = document.getElementById('reservations');
  if (!items.length) {
    container.innerHTML = `<p>現在、予約はありません</p>`;
    return;
  }

  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>お名前</th>
          <th>メニュー</th>
          <th>開始</th>
          <th>終了</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(r => `
          <tr>
            <td>${r.customer_name}</td>
            <td>${r.service}</td>
            <td>${new Date(r.start_time).toLocaleString()}</td>
            <td>${new Date(r.end_time).toLocaleString()}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// --- 初期化 ---
function init() {
  fetchReservations();
}

// ページ読み込み後に実行
document.addEventListener('DOMContentLoaded', init);
