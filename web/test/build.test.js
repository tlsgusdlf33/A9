import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, access, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import baseConfig from '../site.config.js';
import { build } from '../src/build.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DISCLOSURE = baseConfig.monetization.coupang.disclosure;

function configWith(monetization = {}) {
  const config = structuredClone(baseConfig);
  Object.assign(config.monetization.adsense, monetization.adsense);
  Object.assign(config.monetization.coupang, monetization.coupang);
  return config;
}

const samplePlan = {
  title: '테스트 주말 <script>',
  startDate: '2030-05-04',
  endDate: '2030-05-05',
  days: [
    { date: '2030-05-04', status: '추천', event: '어린이날 축제', timeline: [{ time: '10:00', what: '출발' }] },
    { date: '2030-05-05', status: '쉬기' },
  ],
  prep: ['물', { name: '돗자리', coupangUrl: 'https://link.coupang.com/a/abc123' }, { name: '가짜 링크', coupangUrl: 'https://evil.example/x' }],
  sources: [{ label: '출처', url: 'https://example.org/news' }, { label: '나쁜 링크', url: 'javascript:alert(1)' }],
};

async function buildWith(config, plan = samplePlan) {
  const dir = await mkdtemp(path.join(tmpdir(), 'nadeuli-'));
  const dataDir = path.join(dir, 'data');
  await mkdir(dataDir);
  await writeFile(path.join(dataDir, '2030-05-04.json'), JSON.stringify(plan));
  const outDir = path.join(dir, 'dist');
  await build({ config, dataDir, publicDir: path.join(root, 'public'), outDir });
  const read = (p) => readFile(path.join(outDir, p), 'utf8');
  const exists = (p) => access(path.join(outDir, p)).then(() => true, () => false);
  return { read, exists };
}

test('기본 빌드: 필수 페이지가 만들어지고 광고·제휴는 꺼져 있다', async () => {
  const { read, exists } = await buildWith(configWith());
  for (const p of ['index.html', 'plans/2030-05-04/index.html', 'about/index.html', 'privacy/index.html', 'terms/index.html', 'disclosure/index.html', '404.html', 'sitemap.xml', 'robots.txt', 'manifest.webmanifest', 'sw.js']) {
    assert.ok(await exists(p), `${p} 없음`);
  }
  const plan = await read('plans/2030-05-04/index.html');
  assert.ok(!plan.includes('adsbygoogle'), '애드센스 코드가 꺼져 있어야 함');
  assert.ok(!plan.includes('link.coupang.com'), '쿠팡이 꺼져 있으면 링크가 없어야 함');
  assert.ok(!plan.includes(DISCLOSURE), '제휴 링크가 없으면 대가성 문구도 없어야 함');
  assert.equal(await exists('ads.txt'), false);
});

test('데이터의 HTML은 이스케이프되고 http(s)가 아닌 링크는 버린다', async () => {
  const { read } = await buildWith(configWith());
  const plan = await read('plans/2030-05-04/index.html');
  assert.ok(plan.includes('테스트 주말 &lt;script&gt;'));
  assert.ok(!plan.includes('javascript:alert'));
});

test('애드센스를 켜면 head 스크립트와 ads.txt가 생긴다', async () => {
  const client = 'ca-pub-1234567890123456';
  const { read } = await buildWith(configWith({ adsense: { enabled: true, client, slots: { planTop: '111', planBottom: '', home: '222' } } }));
  const plan = await read('plans/2030-05-04/index.html');
  const head = plan.slice(0, plan.indexOf('</head>'));
  assert.ok(head.includes(`adsbygoogle.js?client=${client}`));
  assert.ok(plan.includes('data-ad-slot="111"'));
  assert.ok(plan.includes('class="ad-label">광고'));
  assert.equal(await read('ads.txt'), 'google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0\n');
  const privacy = await read('privacy/index.html');
  assert.ok(privacy.includes('Google 애드센스'), '개인정보처리방침에 애드센스 쿠키 안내가 있어야 함');
});

test('잘못된 애드센스 client는 빌드를 막는다', async () => {
  await assert.rejects(buildWith(configWith({ adsense: { enabled: true, client: 'pub-123' } })), /adsense.client/);
});

test('쿠팡을 켜면 대가성 문구가 제목 위, 첫 제휴 링크보다 앞에 나온다', async () => {
  const { read } = await buildWith(configWith({ coupang: { enabled: true } }));
  const plan = await read('plans/2030-05-04/index.html');
  const main = plan.slice(plan.indexOf('<main'));
  const disclosureAt = main.indexOf(DISCLOSURE);
  assert.ok(disclosureAt >= 0, '대가성 문구가 없음');
  assert.ok(disclosureAt < main.indexOf('<h1'), '대가성 문구는 제목보다 앞(첫 부분)에 있어야 함');
  assert.ok(disclosureAt < main.indexOf('link.coupang.com'), '대가성 문구는 첫 제휴 링크보다 앞에 있어야 함');
  assert.ok(main.includes('rel="sponsored nofollow noopener"'));
  assert.ok(!main.includes('evil.example'), '쿠팡 도메인이 아닌 링크는 제휴 링크로 쓰지 않음');
  const disclosure = await read('disclosure/index.html');
  assert.ok(disclosure.includes(DISCLOSURE));
});

test('쿠팡이 켜져 있어도 제휴 링크가 없는 페이지에는 문구를 넣지 않는다', async () => {
  const plan = { ...samplePlan, prep: ['물'] };
  const { read } = await buildWith(configWith({ coupang: { enabled: true } }), plan);
  assert.ok(!(await read('plans/2030-05-04/index.html')).includes(DISCLOSURE));
});

test('대가성 문구가 빠진 쿠팡 설정은 빌드를 막는다', async () => {
  await assert.rejects(buildWith(configWith({ coupang: { enabled: true, disclosure: '' } })), /coupang.disclosure/);
});

test('저장소의 실제 일정 데이터로 빌드된다', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'nadeuli-real-'));
  const result = await build({ config: baseConfig, dataDir: path.join(root, 'data/plans'), publicDir: path.join(root, 'public'), outDir: dir });
  assert.ok(result.plans >= 1);
});
