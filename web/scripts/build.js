import path from 'node:path';
import { fileURLToPath } from 'node:url';
import config from '../site.config.js';
import { build } from '../src/build.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const result = await build({
  config,
  dataDir: path.join(root, 'data/plans'),
  publicDir: path.join(root, 'public'),
  outDir: path.join(root, 'dist'),
});
console.log(`빌드 완료: 일정 ${result.plans}개, 페이지 ${result.pages}개 → dist/`);
if (config.siteUrl.includes('example.com')) console.warn('주의: site.config.js의 siteUrl이 아직 example.com입니다.');
