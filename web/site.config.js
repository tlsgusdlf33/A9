// 사이트 전역 설정. 배포 전에 TODO 항목을 채우세요.
// 광고·제휴는 승인 전까지 enabled: false로 둡니다. 켜기 전에 docs/monetization.md 체크리스트를 따르세요.
export default {
  siteName: '주말나들이',
  tagline: '아이와 가는 주말·휴일 나들이 일정',
  description: '굴포천역에서 편도 1시간 이내, 아이와 하루 다녀오기 좋은 축제·행사·전시 일정과 동선을 주말마다 정리합니다.',
  siteUrl: 'https://example.com', // TODO: 실제 도메인 (https, 끝에 / 없이)
  lang: 'ko',
  themeColor: '#6F7A00',

  origin: {
    name: '굴포천역',
    line: '7',
    note: '인천 부평구 · 편도 1시간 이내',
  },

  operator: {
    name: '', // TODO: 운영자(개인정보 보호책임자) 이름
    email: '', // TODO: 문의 이메일
  },

  // 개인정보처리방침 시행일. 방침 내용을 바꾸면 날짜도 바꾸세요.
  privacyEffectiveDate: '2026-10-06',

  monetization: {
    adsense: {
      enabled: false,
      client: '', // 'ca-pub-' + 16자리 숫자. 애드센스 계정 > 계정 정보에서 확인
      slots: {
        // 애드센스 > 광고 > 광고 단위별로 만든 data-ad-slot 값
        home: '',
        planTop: '',
        planBottom: '',
      },
    },
    coupang: {
      enabled: false,
      // 쿠팡 파트너스 대가성 문구. 공정위 지침상 게시물 제목 또는 첫 부분에 눈에 띄게 표시해야 합니다.
      disclosure: '이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.',
    },
  },
};
