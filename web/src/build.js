import { readdir, readFile, writeFile, mkdir, rm, cp } from 'node:fs/promises';
import path from 'node:path';
import { homePage, planPage, staticPage } from './templates.js';
import { aboutBody, disclosureBody, privacyBody, termsBody } from './pages.js';
import { validateMonetization, adsTxt } from './monetization.js';
import { arr, isIsoDate } from './util.js';

export async function loadPlans(dataDir) {
  const files = (await readdir(dataDir)).filter((f) => f.endsWith('.json')).sort();
  const plans = [];
  for (const file of files) {
    const plan = JSON.parse(await readFile(path.join(dataDir, file), 'utf8'));
    plan.id = path.basename(file, '.json');
    validatePlan(plan, file);
    plans.push(plan);
  }
  return plans;
}

export function validatePlan(plan, file) {
  const problems = [];
  if (!/^[\w.~-]+$/.test(plan.id)) problems.push('파일 이름은 영문·숫자·- 만 쓸 수 있습니다');
  if (!plan.title) problems.push('title이 없습니다');
  if (!isIsoDate(plan.startDate) || !isIsoDate(plan.endDate)) problems.push('startDate/endDate는 YYYY-MM-DD 형식이어야 합니다');
  if (plan.startDate > plan.endDate) problems.push('startDate가 endDate보다 늦습니다');
  arr(plan.days).forEach((d, i) => {
    if (!isIsoDate(d.date)) problems.push(`days[${i}].date 형식 오류`);
  });
  if (problems.length) throw new Error(`${file}: ${problems.join(', ')}`);
}

async function writePage(outDir, urlPath, html) {
  const dir = path.join(outDir, urlPath);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'index.html'), html);
}

export async function build({ config, dataDir, publicDir, outDir }) {
  validateMonetization(config.monetization);
  const plans = await loadPlans(dataDir);

  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });
  await cp(publicDir, outDir, { recursive: true });

  await writePage(outDir, '/', homePage(config, plans));
  for (const plan of plans) await writePage(outDir, `/plans/${plan.id}/`, planPage(config, plan));

  const pages = [
    ['/about/', '소개', aboutBody(config)],
    ['/disclosure/', '광고·제휴 안내', disclosureBody(config)],
    ['/privacy/', '개인정보처리방침', privacyBody(config)],
    ['/terms/', '이용약관', termsBody(config)],
  ];
  for (const [urlPath, title, body] of pages) await writePage(outDir, urlPath, staticPage(config, { title, path: urlPath, body }));
  await writeFile(
    path.join(outDir, '404.html'),
    staticPage(config, { title: '페이지를 찾을 수 없어요', path: '/404.html', body: '<p><a href="/">처음으로 돌아가기</a></p>', noindex: true }),
  );

  const urls = ['/', ...plans.map((p) => `/plans/${p.id}/`), ...pages.map((p) => p[0])];
  await writeFile(
    path.join(outDir, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${config.siteUrl}${u}</loc></url>`).join('\n')}\n</urlset>\n`,
  );
  await writeFile(path.join(outDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${config.siteUrl}/sitemap.xml\n`);

  const ads = adsTxt(config.monetization);
  if (ads) await writeFile(path.join(outDir, 'ads.txt'), ads);

  return { plans: plans.length, pages: urls.length };
}
