// 소개·광고 안내·개인정보처리방침·이용약관 본문.
// 광고·제휴를 켜면 해당 문단이 자동으로 들어갑니다. 문구는 배포 전에 법률 검토를 권장합니다.
import { esc } from './util.js';

const todo = (value, label) => (value ? esc(value) : `<mark>[TODO: ${label}]</mark>`);

export function aboutBody(config) {
  return `<p>${esc(config.siteName)}는 ${esc(config.origin.name)}에서 편도 1시간 안팎으로 다녀올 수 있는, 아이와 하루 즐기기 좋은 축제·행사·전시를 쉬는 날마다 골라 정리하는 사이트입니다.</p>
<h2>일정은 이렇게 만듭니다</h2>
<ul class="plain">
  <li>쉬는 날(주말, 공휴일, 대체공휴일)이 끝나는 밤에 다음 쉬는 날의 행사를 찾아봅니다.</li>
  <li>주최 측 발표와 기사로 날짜, 운영시간, 예약 방식, 주차, 교통통제를 확인하고 출처를 남깁니다.</li>
  <li>아이와 다니기 편하도록 인기 체험을 먼저 하고 오후 4시 무렵 귀가하는 동선을 짭니다.</li>
  <li>공식 시간표가 없거나 추정한 내용은 "확인 필요"에 따로 적습니다.</li>
</ul>
<p>일정은 바뀔 수 있으니 출발 전에 공식 안내를 다시 확인해 주세요.</p>
<h2>문의</h2>
<p>${todo(config.operator.email, '문의 이메일')}</p>`;
}

export function disclosureBody(config) {
  const { adsense, coupang } = config.monetization;
  const parts = [];
  if (coupang.enabled) {
    parts.push(`<h2>쿠팡 파트너스</h2>
<p class="disclosure">${esc(coupang.disclosure)}</p>
<p>일부 준비물 링크는 쿠팡 파트너스 제휴 링크입니다. 링크를 통해 구매하면 운영자가 일정액의 수수료를 받으며, 구매자가 내는 가격은 달라지지 않습니다. 제휴 링크가 있는 페이지에는 맨 위에 같은 문구를 표시합니다.</p>`);
  }
  if (adsense.enabled) {
    parts.push(`<h2>구글 애드센스</h2>
<p>이 사이트에는 구글 애드센스 광고가 표시됩니다. 광고 영역에는 "광고"라고 표시하며, 광고 내용은 구글이 정합니다.</p>`);
  }
  if (!parts.length) parts.push('<p>현재 이 사이트에는 광고나 제휴 링크가 없습니다. 도입하면 이 페이지와 해당 페이지 상단에 알립니다.</p>');
  return parts.join('\n') + `
<h2>편집 원칙</h2>
<p>행사 추천은 광고나 제휴 여부와 관계없이 아이와 가기 좋은지, 이동 거리와 일정이 맞는지를 기준으로 고릅니다.</p>`;
}

export function privacyBody(config) {
  const { adsense, coupang } = config.monetization;
  const cookieThirdParty = [];
  if (adsense.enabled) {
    cookieThirdParty.push(`<li><strong>Google 애드센스</strong>: 구글과 그 파트너는 쿠키를 사용해 이용자의 이 사이트 및 다른 사이트 방문 기록을 바탕으로 광고를 게재합니다. 맞춤 광고는 <a href="https://adssettings.google.com" target="_blank" rel="noopener">Google 광고 설정</a>에서 끌 수 있습니다. 자세한 내용은 <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener">Google 파트너 사이트 데이터 사용 안내</a>를 참고하세요.</li>`);
  }
  if (coupang.enabled) {
    cookieThirdParty.push(`<li><strong>쿠팡 파트너스</strong>: 제휴 링크를 누르면 쿠팡으로 이동하며, 쿠팡이 구매 실적 확인을 위해 쿠키 등을 사용할 수 있습니다. 쿠팡에서의 개인정보 처리는 쿠팡의 개인정보처리방침을 따릅니다.</li>`);
  }
  return `<p>${esc(config.siteName)}(이하 "사이트")는 「개인정보 보호법」에 따라 이용자의 개인정보를 보호하고 관련 고충을 원활하게 처리하기 위해 다음과 같이 개인정보처리방침을 둡니다.</p>
<h2>1. 처리하는 개인정보와 목적</h2>
<p>사이트는 회원가입 없이 이용할 수 있으며, 이름·연락처 등 개인을 식별하는 정보를 직접 수집하지 않습니다. 서비스 운영과 보안을 위해 접속 기록(IP 주소, 브라우저 정보, 접속 시각)이 호스팅 서버에 자동으로 남을 수 있습니다.</p>
<h2>2. 보유 기간</h2>
<p>접속 기록은 호스팅 업체의 기록 보관 정책에 따라 보관 후 삭제됩니다. ${todo('', '호스팅 업체명과 보관 기간')}</p>
<h2>3. 이용자 기기에 저장되는 정보</h2>
<p>준비물 체크 표시는 이용자 기기의 브라우저 저장소(localStorage)에만 저장되며 사이트로 전송되지 않습니다. 브라우저 설정에서 언제든 지울 수 있습니다.</p>
<h2>4. 쿠키와 제3자 서비스</h2>
${cookieThirdParty.length ? `<ul class="plain">${cookieThirdParty.join('')}</ul><p>이용자는 브라우저 설정에서 쿠키 저장을 거부하거나 삭제할 수 있습니다. 거부하면 일부 기능이나 광고 표시가 달라질 수 있습니다.</p>` : '<p>현재 사이트는 광고·분석용 쿠키를 사용하지 않습니다. 도입하면 이 방침을 개정하고 시행일을 고쳐 알립니다.</p>'}
<h2>5. 제3자 제공과 처리 위탁</h2>
<p>사이트는 이용자의 개인정보를 제3자에게 제공하지 않습니다. 사이트 호스팅을 위해 다음 업체에 서버 운영을 맡깁니다: ${todo('', '호스팅 업체명')}</p>
<h2>6. 이용자의 권리</h2>
<p>이용자는 개인정보 열람, 정정, 삭제, 처리정지를 요구할 수 있으며, 아래 연락처로 요청하면 지체 없이 처리합니다.</p>
<h2>7. 개인정보 보호책임자</h2>
<p>이름: ${todo(config.operator.name, '운영자 이름')}<br>이메일: ${todo(config.operator.email, '문의 이메일')}</p>
<p>개인정보 침해 신고·상담은 개인정보침해신고센터(privacy.kisa.or.kr, 국번 없이 118)에서도 받을 수 있습니다.</p>
<h2>8. 시행일</h2>
<p>이 개인정보처리방침은 ${esc(config.privacyEffectiveDate)}부터 적용됩니다.</p>`;
}

export function termsBody(config) {
  return `<h2>1. 서비스 내용</h2>
<p>${esc(config.siteName)}는 공개된 행사 정보를 바탕으로 나들이 일정과 동선을 정리해 제공합니다.</p>
<h2>2. 정보의 정확성</h2>
<p>행사 일정, 운영시간, 예약 조건, 요금, 교통 정보는 주최 측 사정으로 예고 없이 바뀔 수 있습니다. 사이트는 정보를 확인해 싣지만 정확성을 보증하지 않으며, 방문 전 공식 안내를 확인할 책임은 이용자에게 있습니다.</p>
<h2>3. 외부 링크</h2>
<p>사이트에는 주최 측, 언론, 판매처 등 외부 사이트 링크가 있습니다. 외부 사이트의 내용과 거래는 해당 사이트의 책임입니다.</p>
<h2>4. 저작권</h2>
<p>사이트가 작성한 일정·동선 정리의 저작권은 운영자에게 있습니다. 행사 포스터, 배치도 등 주최 측 자료는 싣지 않으며 출처 링크로 안내합니다.</p>
<h2>5. 문의</h2>
<p>${todo(config.operator.email, '문의 이메일')}</p>`;
}
