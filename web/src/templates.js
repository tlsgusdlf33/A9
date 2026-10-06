import { esc, arr, safeUrl, dateParts, formatDay, formatRange } from './util.js';
import { adsenseHead, adSlot, disclosureBlock, planHasAffiliate, planProducts, productItemHTML } from './monetization.js';

const FOOTER_LINKS = [
  ['/about/', '소개'],
  ['/disclosure/', '광고·제휴 안내'],
  ['/privacy/', '개인정보처리방침'],
  ['/terms/', '이용약관'],
];

export function layout(config, { title, description, path, body, affiliate = false, noindex = false }) {
  const pageTitle = title ? `${title} | ${config.siteName}` : `${config.siteName} · ${config.tagline}`;
  const desc = description || config.description;
  const canonical = config.siteUrl + path;
  const { monetization } = config;
  return `<!doctype html>
<html lang="${esc(config.lang)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(pageTitle)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(canonical)}">
${noindex ? '<meta name="robots" content="noindex">' : ''}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(config.siteName)}">
<meta property="og:title" content="${esc(title || config.siteName)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:locale" content="ko_KR">
<meta name="theme-color" content="${esc(config.themeColor)}">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="icon" href="/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/icon-192.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Do+Hyeon&family=IBM+Plex+Sans+KR:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap">
<link rel="stylesheet" href="/styles.css">
${adsenseHead(monetization)}
</head>
<body>
<div class="app">
<header class="bar">
  <a class="brand" href="/">
    <span class="brand-name">${esc(config.siteName)}</span>
    <span class="origin"><i>${esc(config.origin.line)}</i>${esc(config.origin.name)} 출발 · ${esc(config.origin.note)}</span>
  </a>
</header>
<main id="main">
${affiliate ? disclosureBlock(monetization) : ''}
${body}
</main>
<footer class="foot">
  <nav class="foot-links">${FOOTER_LINKS.map(([href, label]) => `<a href="${href}">${label}</a>`).join('')}</nav>
  <p>행사 일정과 운영 정보는 주최 측 사정으로 바뀔 수 있습니다. 방문 전 공식 안내를 꼭 확인하세요.</p>
  <p>© ${new Date().getFullYear()} ${esc(config.siteName)}</p>
</footer>
</div>
<script src="/app.js" defer></script>
</body>
</html>
`;
}

function statusPill(status) {
  if (status === '추천') return '<span class="pill pick">추천</span>';
  if (status === '쉬기') return '<span class="pill rest">쉬기</span>';
  return `<span class="pill opt">${esc(status || '선택')}</span>`;
}

export function homePage(config, plans) {
  const sorted = [...plans].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const items = sorted
    .map((p) => {
      const days = arr(p.days);
      const s = dateParts(p.startDate);
      return `<li class="plan-item" data-start="${esc(p.startDate)}" data-end="${esc(p.endDate)}">
  <a class="pitem" href="/plans/${esc(p.id)}/">
    <span class="cal"><small>${s.m}월</small><b>${s.d}</b></span>
    <span class="t"><strong>${esc(p.title)}</strong><span class="range">${esc(formatRange(p.startDate, p.endDate))}</span>
      <span class="days">${days
        .map((d) => `<span class="dline">${statusPill(d.status)} ${esc(d.status === '쉬기' && !d.event ? '쉬는 날' : d.event)}</span>`)
        .join('')}</span>
    </span>
    <span class="dday mono" data-dday></span>
  </a>
</li>`;
    })
    .join('\n');

  const body = `<section class="intro">
  <h1>이번 주말, 아이와 어디 갈까</h1>
  <p class="muted">${esc(config.origin.name)}에서 편도 1시간 이내로 다녀올 수 있는 축제·행사·전시를 쉬는 날마다 골라 시간대별 동선까지 정리합니다.</p>
</section>
${sorted.length ? `<ul class="plist" id="plan-list">${items}</ul>` : '<p class="empty">아직 올라온 일정이 없어요. 쉬는 날이 끝나는 밤에 다음 일정이 올라옵니다.</p>'}
<details class="past-wrap" id="past-wrap" hidden><summary>지난 일정</summary><ul class="plist" id="past-list"></ul></details>
${adSlot(config.monetization, 'home')}`;

  return layout(config, { path: '/', body });
}

function dayHTML(config, day) {
  const p = dateParts(day.date);
  const anchor = `d${p.m}-${p.d}`;
  if (day.status === '쉬기' && !day.event) {
    return `<section class="card day" id="${anchor}"><h2 class="day-head">${esc(formatDay(day.date))} ${statusPill(day.status)}</h2><p class="muted">이날은 쉬는 날로 비워 뒀어요.</p></section>`;
  }
  const facts = [
    ['장소', day.place],
    ['이동', day.travel],
    ['시간', day.hours],
    ['요금', day.fee],
  ].filter((f) => f[1]);
  const booking = arr(day.booking);
  const timeline = arr(day.timeline);
  return `<section class="card day" id="${anchor}">
  <div class="day-head"><span class="mono">${esc(formatDay(day.date))}</span>${statusPill(day.status)}${day.holiday ? `<span class="pill opt">${esc(day.holiday)}</span>` : ''}</div>
  <h2 class="ev-title">${esc(day.event)}</h2>
  ${day.summary ? `<p>${esc(day.summary)}</p>` : ''}
  ${facts.length ? `<dl class="facts">${facts.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl>` : ''}
  ${booking.length ? `<h3>예약 · 접수</h3><ul class="book">${booking.map((b) => `<li><span class="pill ${b.required ? 'warn' : 'opt'}">${esc(b.label || '현장')}</span><span>${esc(b.text)}</span></li>`).join('')}</ul>` : ''}
  ${timeline.length ? `<h3>동선</h3><ol class="route">${timeline.map((t, i) => `<li class="${i === 0 || i === timeline.length - 1 ? 'ends' : ''}"><span class="tm">${esc(t.time)}</span><span class="rail"><span class="stop"></span></span><div class="what"><strong>${esc(t.what)}</strong>${t.where ? `<span>${esc(t.where)}</span>` : ''}</div></li>`).join('')}</ol>` : ''}
  ${arr(day.alternatives).length ? `<h3>대안</h3><ul class="plain">${arr(day.alternatives).map((a) => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}
  ${arr(day.tips).length ? `<h3>팁</h3><ul class="plain">${arr(day.tips).map((a) => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}
</section>`;
}

export function planPage(config, plan) {
  const { monetization } = config;
  const days = arr(plan.days);
  const products = planProducts(plan);
  const sources = arr(plan.sources).filter((s) => safeUrl(s.url));
  const affiliate = planHasAffiliate(monetization, plan);
  const picks = days.filter((d) => d.status === '추천' && d.event).map((d) => d.event);
  const description = `${formatRange(plan.startDate, plan.endDate)} ${plan.title}. ${picks.length ? '추천: ' + picks.join(', ') + '. ' : ''}${config.origin.name} 출발 아이와 가는 일정과 동선.`;

  const body = `<article class="plan" data-plan="${esc(plan.id)}">
  <header class="plan-head">
    <p class="eyebrow">${esc(formatRange(plan.startDate, plan.endDate))}</p>
    <h1>${esc(plan.title)}</h1>
    ${plan.holidayNote ? `<p class="muted small">${esc(plan.holidayNote)}</p>` : ''}
    ${days.length > 1 ? `<nav class="tabs" aria-label="날짜">${days.map((d) => { const p = dateParts(d.date); return `<a class="tab" href="#d${p.m}-${p.d}"><span class="mono">${p.m}/${p.d} ${p.weekday}</span><span>${esc(d.status || '선택')}</span></a>`; }).join('')}</nav>` : ''}
  </header>
  ${adSlot(monetization, 'planTop')}
  ${days.map((d) => dayHTML(config, d)).join('\n')}
  ${products.length ? `<section class="card"><h2>준비물</h2><ul class="checks">${products.map((p, i) => `<li><label><input type="checkbox" id="chk-${esc(plan.id)}-${i}" data-chk="${i}"><span class="chk-text">${productItemHTML(monetization, p)}</span></label></li>`).join('')}</ul><p class="muted small">체크 표시는 이 기기에만 저장됩니다.</p></section>` : ''}
  ${arr(plan.unknowns).length ? `<section class="card"><h2>확인 필요</h2><ul class="plain">${arr(plan.unknowns).map((u) => `<li>${esc(u)}</li>`).join('')}</ul></section>` : ''}
  ${sources.length ? `<section class="card"><h2>출처</h2><ul class="src">${sources.map((s) => `<li><a href="${esc(safeUrl(s.url))}" target="_blank" rel="noopener">${esc(s.label || s.url)}</a></li>`).join('')}</ul></section>` : ''}
  ${plan.updatedAt ? `<p class="muted small">업데이트 ${esc(plan.updatedAt)}</p>` : ''}
  ${adSlot(monetization, 'planBottom')}
</article>`;

  return layout(config, { title: `${plan.title} (${formatRange(plan.startDate, plan.endDate)})`, description, path: `/plans/${plan.id}/`, body, affiliate });
}

export function staticPage(config, { title, path, body, noindex = false }) {
  return layout(config, { title, path, body: `<article class="doc"><h1>${esc(title)}</h1>${body}</article>`, noindex });
}
