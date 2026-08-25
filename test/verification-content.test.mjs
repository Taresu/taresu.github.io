import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(path.join(projectRoot, 'index.html'), 'utf8');

test('public verification copy is direct and the score badge keeps its score visible', () => {
  assert.match(html, /verification\.sub[^>]*>Veja como o site se sai em verificações públicas e consulte os detalhes de cada análise\./);
  assert.doesNotMatch(html, /Resultados de scanners externos, ligados às páginas que explicam o teste/);
  assert.match(html, /data-verification-agent-card[^>]*hidden/);
  assert.match(html, /data-verification-badge[^>]*href="https:\/\/crawlindex\.org\/site\/thales-salata\.dev"/);
  assert.match(html, /src="https:\/\/crawlindex\.org\/badge\/thales-salata\.dev\.svg"/);
  assert.match(html, /width="260" height="56"/);
  assert.match(html, /data-verification-image[^>]*hidden/);
  assert.match(html, /data-verification-fallback(?![^>]*hidden)/);
  assert.match(html, /data-verification-image/);
  assert.match(html, /CrawlIndex by Fidget Labs BV/);
  assert.match(html, /href="https:\/\/crawlindex\.org\/submit"/);
  assert.match(html, /https:\/\/validator\.w3\.org\/nu\/\?doc=https%3A%2F%2Fthales-salata\.dev%2F&out=html/);
  assert.match(html, /https:\/\/webanalyzer\.dev\/\?url=https%3A%2F%2Fthales-salata\.dev%2F&amp;utm_source=badge/);
  assert.match(html, /https:\/\/webanalyzer\.dev\/api\/badge\/cmt8a0f620007gztbaf8dpxwt/);
  assert.match(html, /https:\/\/pagespeed\.web\.dev\/analysis\?url=https%3A%2F%2Fthales-salata\.dev%2F/);
  assert.match(html, /Google PageSpeed Insights/);
  assert.match(html, /data-i18n="verification\.w3c"/);
  assert.match(html, /ferramenta automatizada de avaliação de acessibilidade/);
  assert.doesNotMatch(html, /AIM automatizado 6\/10/);
  assert.doesNotMatch(html, /data-verification-score/);
});
