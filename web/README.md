# 주말나들이 웹앱

아이와 가는 주말·휴일 나들이 일정을 보여 주는 정적 웹앱입니다. 외부 패키지 없이 Node(20 이상)만으로 빌드합니다.
검색엔진과 애드센스 심사가 읽을 수 있도록 모든 페이지를 미리 HTML로 만들어 둡니다.

## 명령어
```bash
npm test        # 빌드 규칙 테스트 (광고·제휴 문구 위치 포함)
npm run build   # dist/ 생성
npm run dev     # 빌드 후 http://localhost:4321 미리보기
```

## 일정 추가
`data/plans/<시작일 YYYY-MM-DD>.json` 파일을 추가하고 다시 빌드합니다. 형식은 기존 파일을 참고하세요.
준비물에 쿠팡 제휴 링크를 달 때는 `{ "name": "돗자리", "coupangUrl": "https://link.coupang.com/a/..." }` 형식을 씁니다. 쿠팡 설정이 꺼져 있으면 링크 없이 이름만 표시됩니다.

## 만들어지는 페이지
- `/` 일정 목록 (방문 시점 기준으로 다음 일정 강조, 지난 일정 접기, D-day)
- `/plans/<id>/` 일정 상세 (날짜별 행사, 예약·접수, 노선도 모양 동선, 준비물 체크, 출처)
- `/about/`, `/disclosure/`, `/privacy/`, `/terms/`, `404.html`
- `sitemap.xml`, `robots.txt`, `manifest.webmanifest`, `sw.js`(오프라인 대비), 애드센스를 켜면 `ads.txt`

## 배포
정적 호스팅이면 어디든 됩니다 (Cloudflare Pages, Netlify, Vercel, GitHub Pages 등).
- 빌드 명령: `npm run build`
- 루트 디렉터리: `web`
- 출력 디렉터리: `dist`

배포 전에 `site.config.js`의 `siteUrl`, `operator`를 채우고 개인정보처리방침의 TODO를 채우세요.

## 광고·제휴
`site.config.js`의 `monetization`에서 켭니다. 켜기 전에 반드시 `../docs/monetization.md`의 절차를 따르세요.
