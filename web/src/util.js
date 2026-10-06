const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);

export const arr = (value) => (Array.isArray(value) ? value : []);

export function safeUrl(value) {
  try {
    const url = new URL(String(value ?? ''));
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null;
  }
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function dateParts(iso) {
  const [y, m, d] = String(iso).split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return { y, m, d, weekday: WEEKDAYS[date.getUTCDay()] };
}

export function formatDay(iso) {
  const p = dateParts(iso);
  return `${p.m}/${p.d} (${p.weekday})`;
}

export function formatRange(start, end) {
  return start === end ? formatDay(start) : `${formatDay(start)} – ${formatDay(end)}`;
}

export const isIsoDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value ?? ''));
