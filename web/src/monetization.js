// 광고(구글 애드센스)와 제휴(쿠팡 파트너스) 출력 규칙을 한 곳에 모은 모듈.
// 정책 근거와 켜는 절차는 docs/monetization.md를 보세요.
import { esc, arr, safeUrl } from './util.js';

const ADSENSE_CLIENT = /^ca-pub-\d{16}$/;
const COUPANG_HOSTS = new Set(['link.coupang.com', 'coupa.ng']);
// ads.txt의 구글 인증 기관 ID (애드센스 고정값)
const GOOGLE_CERT_ID = 'f08c47fec0942fa0';

export function validateMonetization(monetization) {
  const errors = [];
  const { adsense, coupang } = monetization;
  if (adsense.enabled) {
    if (!ADSENSE_CLIENT.test(adsense.client)) errors.push('adsense.client는 "ca-pub-" 뒤에 16자리 숫자여야 합니다.');
  }
  if (coupang.enabled) {
    const text = String(coupang.disclosure ?? '');
    if (!text.includes('쿠팡 파트너스') || !text.includes('수수료')) {
      errors.push('coupang.disclosure에는 "쿠팡 파트너스"와 "수수료"가 들어간 대가성 문구가 있어야 합니다.');
    }
  }
  if (errors.length) throw new Error('수익화 설정 오류:\n- ' + errors.join('\n- '));
}

export function isCoupangLink(url) {
  const safe = safeUrl(url);
  if (!safe) return false;
  return COUPANG_HOSTS.has(new URL(safe).hostname);
}

// --- 구글 애드센스 ---

export function adsenseHead(monetization) {
  const { adsense } = monetization;
  if (!adsense.enabled) return '';
  return `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${esc(adsense.client)}" crossorigin="anonymous"></script>`;
}

export function adSlot(monetization, name) {
  const { adsense } = monetization;
  const slot = adsense.slots?.[name];
  if (!adsense.enabled || !slot) return '';
  return `<aside class="ad" aria-label="광고">
  <span class="ad-label">광고</span>
  <ins class="adsbygoogle" style="display:block" data-ad-client="${esc(adsense.client)}" data-ad-slot="${esc(slot)}" data-ad-format="auto" data-full-width-responsive="true"></ins>
  <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
</aside>`;
}

export function adsTxt(monetization) {
  const { adsense } = monetization;
  if (!adsense.enabled) return null;
  return `google.com, ${adsense.client.replace(/^ca-/, '')}, DIRECT, ${GOOGLE_CERT_ID}\n`;
}

// --- 쿠팡 파트너스 ---

// 준비물(prep)과 날짜별 products에서 상품 목록을 모읍니다. 문자열 준비물은 링크가 없는 상품으로 취급합니다.
export function planProducts(plan) {
  const fromPrep = arr(plan.prep).map((item) => (typeof item === 'string' ? { name: item } : item));
  const fromDays = arr(plan.days).flatMap((day) => arr(day.products));
  return [...fromPrep, ...fromDays].filter((p) => p && p.name);
}

// 쿠팡이 켜져 있고 실제 쿠팡 링크가 있을 때만 제휴 링크로 씁니다.
export function productLink(monetization, product) {
  if (!monetization.coupang.enabled) return null;
  return isCoupangLink(product.coupangUrl) ? safeUrl(product.coupangUrl) : null;
}

export function planHasAffiliate(monetization, plan) {
  return planProducts(plan).some((p) => productLink(monetization, p));
}

// 공정위 지침: 제목 또는 첫 부분에 눈에 띄게. 레이아웃이 페이지 제목 바로 아래에 넣습니다.
export function disclosureBlock(monetization) {
  return `<p class="disclosure" role="note">${esc(monetization.coupang.disclosure)}</p>`;
}

export function productItemHTML(monetization, product) {
  const link = productLink(monetization, product);
  const note = product.note ? ` <span class="muted small">${esc(product.note)}</span>` : '';
  if (!link) return `<span>${esc(product.name)}</span>${note}`;
  return `<a class="buy" href="${esc(link)}" target="_blank" rel="sponsored nofollow noopener">${esc(product.name)}<span class="buy-tag">쿠팡</span></a>${note}`;
}
