// 페이지가 정적으로 빌드되므로, '지난 일정'과 D-day는 방문 시점(한국 시간) 기준으로 여기서 정리합니다.
(function () {
  const todayKST = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const dayNumber = (iso) => Date.UTC(...iso.split('-').map((n, i) => (i === 1 ? Number(n) - 1 : Number(n)))) / 86400000;

  const list = document.getElementById('plan-list');
  const pastList = document.getElementById('past-list');
  const pastWrap = document.getElementById('past-wrap');
  if (list && pastList && pastWrap) {
    let next = null;
    const past = [];
    list.querySelectorAll('.plan-item').forEach((item) => {
      const { start, end } = item.dataset;
      const dday = item.querySelector('[data-dday]');
      if (end < todayKST) return past.push(item);
      if (!next) { next = item; item.classList.add('is-next'); }
      const diff = dayNumber(start) - dayNumber(todayKST);
      if (dday) dday.textContent = diff > 0 ? 'D-' + diff : '진행 중';
    });
    past.reverse().forEach((item) => {
      const dday = item.querySelector('[data-dday]');
      if (dday) dday.textContent = '지난 일정';
      pastList.appendChild(item);
    });
    if (past.length) {
      pastWrap.hidden = false;
      pastWrap.querySelector('summary').textContent = '지난 일정 ' + past.length + '개';
    }
  }

  // 준비물 체크: 이 기기의 localStorage에만 저장
  const plan = document.querySelector('[data-plan]');
  if (plan) {
    const key = 'chk:' + plan.dataset.plan;
    let saved = [];
    try { saved = JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) { saved = []; }
    plan.querySelectorAll('[data-chk]').forEach((box) => {
      box.checked = saved.includes(Number(box.dataset.chk));
      box.addEventListener('change', () => {
        const checked = [...plan.querySelectorAll('[data-chk]')].filter((b) => b.checked).map((b) => Number(b.dataset.chk));
        try { localStorage.setItem(key, JSON.stringify(checked)); } catch (e) { /* 저장 불가 환경은 무시 */ }
      });
    });
  }

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
})();
