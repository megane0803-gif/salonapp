// Vite で CSS を同梱
import './style.css';

const API = {
  list: '/api/reservations',
  create: '/api/reservations'
};

// DOM取得
const el = {
  form: document.getElementById('reserveForm'),
  customerName: document.getElementById('customerName'),
  serviceSelect: document.getElementById('serviceSelect'),
  service: document.getElementById('service'),
  startTime: document.getElementById('startTime'),
  endTime: document.getElementById('endTime'),
  submitBtn: document.getElementById('submitBtn'),
  submitSpinner: document.querySelector('.btn-spinner'),
  resetBtn: document.getElementById('resetBtn'),

  count: document.getElementById('reservationsCount'),
  refreshBtn: document.getElementById('refreshBtn'),
  tbody: document.getElementById('reservationsTbody'),
  empty: document.getElementById('emptyState'),
  loading: document.getElementById('loadingArea'),

  errArea: document.getElementById('errorArea'),
  errMsg: document.getElementById('errorMessage'),
  errClose: document.getElementById('errorClose'),
  okArea: document.getElementById('successArea'),
  okMsg: document.getElementById('successMessage'),
  okClose: document.getElementById('successClose'),

  sortBtns: () => Array.from(document.querySelectorAll('.sort-btn'))
};

let sortKey = 'start_time';
let sortAsc = true;

// ==== helpers ====
const show = (node) => node.classList.remove('hidden');
const hide = (node) => node.classList.add('hidden');
const fmt = (ts) => new Date(ts).toLocaleString();

function toastError(msg) {
  el.errMsg.textContent = msg;
  show(el.errArea);
}
function toastOk(msg) {
  el.okMsg.textContent = msg;
  show(el.okArea);
}

// ==== API ====
async function fetchReservations() {
  show(el.loading);
  try {
    const res = await fetch(API.list);
    if (!res.ok) throw new Error(`読み込みに失敗 (${res.status})`);
    const data = await res.json();
    renderTable(data);
  } catch (e) {
    toastError(e.message || '予約の取得に失敗しました');
  } finally {
    hide(el.loading);
  }
}

async function createReservation(payload) {
  el.submitBtn.disabled = true;
  el.submitSpinner && show(el.submitSpinner);
  try {
    const res = await fetch(API.create, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      // サーバー側から message が返る場合に備える
      let msg = '予約作成に失敗しました';
      try {
        const j = await res.json();
        if (j?.message) msg = j.message;
      } catch {}
      throw new Error(msg);
    }
    toastOk('予約を作成しました');
    await fetchReservations();
    el.form.reset();
  } catch (e) {
    toastError(e.message || '予約作成に失敗しました');
  } finally {
    el.submitBtn.disabled = false;
    el.submitSpinner && hide(el.submitSpinner);
  }
}

// ==== render ====
function renderTable(items) {
  // ソート
  items.sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    const aVal = (sortKey.includes('time') ? new Date(av).getTime() : String(av));
    const bVal = (sortKey.includes('time') ? new Date(bv).getTime() : String(bv));
    return sortAsc ? (aVal > bVal ? 1 : -1) : (aVal > bVal ? -1 : 1);
  });

  el.count.textContent = `件数: ${items.length}件`;
  el.tbody.innerHTML = items.map(r => `
    <tr>
      <td>${r.customer_name}</td>
      <td>${r.service}</td>
      <td>${fmt(r.start_time)}</td>
      <td>${fmt(r.end_time)}</td>
    </tr>
  `).join('');

  if (items.length === 0) show(el.empty); else hide(el.empty);
}

// ==== events ====
function bindEvents() {
  // メッセージ閉じる
  el.errClose.addEventListener('click', () => hide(el.errArea));
  el.okClose.addEventListener('click', () => hide(el.okArea));

  // セレクト→自由入力へコピー
  el.serviceSelect.addEventListener('change', () => {
    if (el.serviceSelect.value && el.serviceSelect.value !== 'その他') {
      el.service.value = el.serviceSelect.value;
    }
  });

  // 並び替え
  el.sortBtns().forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.sort;
      if (sortKey === key) sortAsc = !sortAsc;
      else { sortKey = key; sortAsc = (key === 'start_time'); }
      // アイコンのON/OFF
      el.sortBtns().forEach(b => b.querySelector('.sort-icon').classList.remove('active'));
      btn.querySelector('.sort-icon').classList.add('active');
      fetchReservations();
    });
  });

  // 更新
  el.refreshBtn.addEventListener('click', fetchReservations);

  // リセット
  el.resetBtn.addEventListener('click', () => el.form.reset());

  // 送信
  el.form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    hide(el.errArea); hide(el.okArea);

    // バリデーション
    const errors = {};
    if (!el.customerName.value.trim()) errors.customerName = 'お名前は必須です';
    if (!el.service.value.trim()) errors.service = 'メニューは必須です';
    if (!el.startTime.value) errors.startTime = '開始時刻は必須です';
    if (!el.endTime.value) errors.endTime = '終了時刻は必須です';
    if (el.startTime.value && el.endTime.value) {
      if (new Date(el.endTime.value) <= new Date(el.startTime.value)) {
        errors.endTime = '終了は開始より後の時刻にしてください';
      }
    }

    // エラー表示
    ['customerName','service','startTime','endTime'].forEach(key => {
      const errEl = document.getElementById(`${key}Error`);
      if (errors[key]) { errEl.textContent = errors[key]; show(errEl); }
      else hide(errEl);
    });
    if (Object.keys(errors).length) {
      toastError('入力内容を確認してください');
      return;
    }

    // 送信
    createReservation({
      customer_name: el.customerName.value.trim(),
      service: el.service.value.trim(),
      start_time: new Date(el.startTime.value).toISOString(),
      end_time: new Date(el.endTime.value).toISOString()
    });
  });
}

// ==== init ====
function init() {
  bindEvents();
  fetchReservations();
}
document.addEventListener('DOMContentLoaded', init);
