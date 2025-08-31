async function load() {
  const el = document.getElementById('app');
  try {
    const res = await fetch('/api/reservations', { cache: 'no-store' });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      el.textContent = '予約はまだありません。';
      el.className = 'empty';
      return;
    }

    const rows = data
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
      .map(r => {
        const start = new Date(r.start_time);
        const end   = new Date(r.end_time);
        const fmt = (d)=> d.toLocaleString('ja-JP', { month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' });
        return `<tr>
          <td>${r.id}</td>
          <td>${r.customer_name}</td>
          <td>${r.service}</td>
          <td>${fmt(start)}</td>
          <td>${fmt(end)}</td>
        </tr>`;
      }).join('');

    el.className = '';
    el.innerHTML = `
      <table>
        <thead>
          <tr><th>ID</th><th>お客様</th><th>メニュー</th><th>開始</th><th>終了</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  } catch (e) {
    el.textContent = '読み込みに失敗しました: ' + e.message;
    el.className = 'empty';
  }
}

load();
