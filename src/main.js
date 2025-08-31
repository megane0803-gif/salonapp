// ★ Vite では CSS をJSからimportしてバンドルする
import './style.css';

/**
 * API 設定
 */
const API_BASE_URL = '/api';
const ENDPOINTS = {
  reservations: `${API_BASE_URL}/reservations`,
};

/**
 * DOM 取得
 */
const els = {
  form: document.getElementById('reserveForm'),
  name: document.getElementById('customerName'),
  serviceSelect: document.getElementById('serviceSelect'),
  service: document.getElementById('service'),
  start: document.getElementById('startTime'),
  end: document.getElementById('endTime'),
  resetBtn: document.getElementById('resetBtn'),
  submitBtn: document.getElementById('submitBtn'),
  submitSpinner: document.querySelector('.btn-spinner'),
  tableBody: document.getElementById('reservationsTbody'),
  count: document.getElementById('reservationsCount'),
  refreshBtn: document.getElementById('refreshBtn'),
  loading: document.getElementById('loadingArea'),
  empty: document.getElementById('emptyState'),
  // メッセージ
  errorArea: document.getElementById('errorArea'),
  errorMsg: document.getElementById('errorMessage'),
  errorClose: document.getElementById('errorClose'),
  successArea: document.getElementById('successArea'),
  successMsg: document.getElementById('successMessage'),
  successClose: document.getElementById('successClose'),
};

let state = {
  reservations: [],
  sortKey: 'start_time',
  sortAsc: true,
};

/**
 * ユーティリティ
 */
function show(el) { el.classList.remove('hidden'); }
function hide(el) { el.classList.add('hidden'); }
function setBusy(busy) {
  els.submitBtn.disabled = busy;
  if (busy) { show(els.submitSpinner); } else { hide(els.submitSpinner); }
}
function showError(msg) {
  els.errorMsg.textContent = msg;
  show(els.errorArea);
}
function showSuccess(msg) {
  els.successMsg.textContent = msg;
  show(els.successArea);
}
function clearMessages() {
  hide(els.errorArea); els.errorMsg.textContent = '';
  hide(els.successArea); els.successMsg.textContent = '';
}

/**
 * API
 */
async function fetchReservations() {
  const res = await fetch(ENDPOINTS.reservations);
  if (!res.ok) throw new Error(`一覧取得に失敗 (${res.status})`);
  return res.json();
}

async function createReservation(payload) {
  const res = await fetch(ENDPOINTS.reservations, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(()=>'');
    throw new Error(`予約作成に失敗 (${res.status}) ${text}`);
  }
  return res.json();
}

/**
 * 描画
 */
function renderTable(items) {
  els.tableBody.innerHTML = '';
  if (!items.length) {
    show(els.empty);
    els.count.textContent = '件数: 0件';
    return;
  }
  hide(els.empty);
  els.count.textContent = `件数: ${items.length}件`;

  const rows = items.map(r => {
    const tr = document.createElement('tr');
    const start = new Date(r.start_time);
    const end = new Date(r.end_time);
    tr.innerHTML = `
      <td>${escapeHtml(r.customer_name)}</td>
      <td>${escapeHtml(r.service)}</td>
      <td>${fmtDateTime(start)}</td>
      <td>${fmtDateTime(end)}</td>
    `;
    return tr;
  });
  rows.forEach(tr => els.tableBody.appendChild(tr));
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}
function fmtDateTime(d) {
  if (Number.isNaN(d.getTime())) return '-';
  // ローカル表示（YYYY-MM-DD HH:mm）
  const pad = n => String(n).padStart(2,'0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * 並び替え
 */
function sortAndRender() {
  const { sortKey, sortAsc } = state;
  const arr = [...state.reservations].sort((a,b) => {
    const va = a[sortKey], vb = b[sortKey];
    // 時刻列は Date 比較
    if (/_time$/.test(sortKey)) {
      return (new Date(va) - new Date(vb)) * (sortAsc?1:-1);
    }
    // 文字列
    return String(va).localeCompare(String(vb), 'ja') * (sortAsc?1:-1);
  });
  renderTable(arr);
}

function setupSortButtons() {
  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.sort;
      if (state.sortKey === key) {
        state.sortAsc = !state.sortAsc;
      } else {
        state.sortKey = key;
        state.sortAsc = true;
      }
      // アイコン更新
      document.querySelectorAll('.sort-btn .sort-icon').forEach(i => i.classList.remove('active'));
      btn.querySelector('.sort-icon').classList.add('active');
      btn.querySelector('.sort-icon').textContent = state.sortAsc ? '↑' : '↓';

      sortAndRender();
    });
  });
}

/**
 * フォーム送信
 */
function pickServiceValue() {
  // セレクトが空ならテキスト、テキストが空ならセレクト、両方あればテキスト優先
  const sel = els.serviceSelect.value.trim();
  const txt = els.service.value.trim();
  return txt || sel || '';
}

function validateForm() {
  let ok = true;
  // 初期化
  ['customerNameError','serviceError','startTimeError','endTimeError'].forEach(id=>{
    const el = document.getElementById(id);
    el.textContent = ''; el.classList.add('hidden');
  });

  if (!els.name.value.trim()) {
    const e = document.getElementById('customerNameError');
    e.textContent = 'お名前を入力してください'; e.classList.remove('hidden'); ok = false;
  }
  const serviceVal = pickServiceValue();
  if (!serviceVal) {
    const e = document.getElementById('serviceError');
    e.textContent = 'メニューを選択または入力してください'; e.classList.remove('hidden'); ok = false;
  }
  if (!els.start.value) {
    const e = document.getElementById('startTimeError');
    e.textContent = '開始時刻を入力してください'; e.classList.remove('hidden'); ok = false;
  }
  if (!els.end.value) {
    const e = document.getElementById('endTimeError');
    e.textContent = '終了時刻を入力してください'; e.classList.remove('hidden'); ok = false;
  }
  if (els.start.value && els.end.value) {
    const s = new Date(els.start.value);
    const e = new Date(els.end.value);
    if (e <= s) {
      const el = document.getElementById('endTimeError');
      el.textContent = '終了時刻は開始より後にしてください'; el.classList.remove('hidden'); ok = false;
    }
  }
  return ok;
}

async function handleSubmit(ev) {
  ev.preventDefault();
  clearMessages();
  if (!validateForm()) return;

  setBusy(true);
  try {
    // ★ サーバーが期待するキーは snake_case（customer_name / start_time など）
    const payload = {
      customer_name: els.name.value.trim(),
      service: pickServiceValue(),
      start_time: new Date(els.start.value).toISOString(),
      end_time: new Date(els.end.value).toISOString(),
    };
    await createReservation(payload);
    showSuccess('予約を作成しました');
    els.form.reset();
    await loadList(); // 再読込
  } catch (e) {
    showError(e.message || '予約作成に失敗しました');
  } finally {
    setBusy(false);
  }
}

/**
 * 初期化
 */
async function loadList() {
  show(els.loading);
  try {
    const data = await fetchReservations();
    state.reservations = Array.isArray(data) ? data : [];
    sortAndRender();
  } catch (e) {
    showError(e.message || '一覧の取得に失敗しました');
  } finally {
    hide(els.loading);
  }
}

function initEvents() {
  els.form.addEventListener('submit', handleSubmit);
  els.resetBtn.addEventListener('click', () => { els.form.reset(); clearMessages(); });
  els.refreshBtn.addEventListener('click', () => loadList());
  els.errorClose.addEventListener('click', () => hide(els.errorArea));
  els.successClose.addEventListener('click', () => hide(els.successArea));

  // セレクト変更で入力欄に反映（任意）
  els.serviceSelect.addEventListener('change', () => {
    if (els.serviceSelect.value && !els.service.value.trim()) {
      els.service.value = els.serviceSelect.value;
    }
  });
}

async function init() {
  initEvents();
  setupSortButtons();
  await loadList();
}

init();
