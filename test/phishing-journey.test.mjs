import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Runs the browser scripts the way the page does: classic scripts sharing one global.
function loadJourney(files = ['phishing-iso.js', 'phishing-eras.js', 'phishing-i18n.js', 'phishing-journey.js']) {
  const context = vm.createContext({ console });
  for (const file of files) {
    const source = readFileSync(path.join(projectRoot, 'assets', 'js', file), 'utf8');
    vm.runInContext(source, context, { filename: file });
  }
  return context;
}

const pilotScore = /7[,.]54|9[,.]85/;

test('there are exactly six eras in the spec order', () => {
  const { PhishingEras } = loadJourney(['phishing-eras.js']);
  assert.deepEqual(Array.from(PhishingEras.ERAS, era => era.key), ['1980s', '1990s', '2000s', '2010s', '2020s', 'agora']);
});

test('every era is fully written in both languages', () => {
  const { PhishingEras } = loadJourney(['phishing-eras.js']);
  for (const era of PhishingEras.ERAS) {
    assert.equal(era.cover, `assets/phishing/covers/${era.key}.webp`);
    assert.equal(typeof era.scene, 'function');
    for (const lang of ['pt', 'en']) {
      const text = era.text[lang];
      for (const field of ['title', 'chapter', 'sceneLabel', 'question', 'why', 'milestone']) {
        assert.ok(typeof text[field] === 'string' && text[field].trim(), `${era.key}.${lang}.${field}`);
      }
      assert.equal(text.options.length, 2, `${era.key}.${lang}.options`);
      assert.ok(text.options.every(option => typeof option === 'string' && option.trim()));
      assert.ok([0, 1].includes(text.scamIndex), `${era.key}.${lang}.scamIndex`);
    }
  }
});

test('mini-challenges match the reviewed draft', () => {
  const { PhishingEras } = loadJourney(['phishing-eras.js']);
  const scam = era => era.text.pt.options[era.text.pt.scamIndex];
  assert.match(scam(PhishingEras.ERAS[2]), /paypa1/);
  assert.match(scam(PhishingEras.ERAS[5]), /lojabbela\.com\.br/);
});

test('no pilot score anywhere', () => {
  const { PhishingEras, PhishingI18n } = loadJourney(['phishing-eras.js', 'phishing-i18n.js']);
  const texts = PhishingEras.ERAS.flatMap(era => ['pt', 'en'].flatMap(lang => {
    const { options, scamIndex, ...rest } = era.text[lang];
    return [...Object.values(rest), ...options];
  }));
  texts.push(...Object.values(PhishingI18n.DICT.pt), ...Object.values(PhishingI18n.DICT.en));
  assert.equal(texts.filter(text => pilotScore.test(text)).length, 0);
});

test('dictionaries have identical keys', () => {
  const { PhishingI18n } = loadJourney(['phishing-i18n.js']);
  assert.deepEqual(Object.keys(PhishingI18n.DICT.pt).sort(), Object.keys(PhishingI18n.DICT.en).sort());
});

test('spec copy is exact', () => {
  const { DICT } = loadJourney(['phishing-i18n.js']).PhishingI18n;
  assert.equal(DICT.pt['journey.title'], 'Uma viagem pelo tempo do phishing');
  assert.equal(DICT.pt['journey.lead'], '40 anos, a mesma isca. Escolha uma década e tente não cair.');
  assert.match(DICT.pt['challenge.credit'], /mais de 3 mil visitantes/);
  assert.equal(DICT.pt['tcc.grade'], '9,5');
  assert.match(DICT.pt['poster.status'], /10\/11\/2026/);
});

test('english warns that the challenge is in portuguese', () => {
  const { DICT } = loadJourney(['phishing-i18n.js']).PhishingI18n;
  assert.match(DICT.en['challenge.languageNote'], /Portuguese/);
});

test('resolveLang honours the saved preference', () => {
  const { resolveLang } = loadJourney(['phishing-i18n.js']).PhishingI18n;
  assert.equal(resolveLang('en', 'pt-BR'), 'en');
  assert.equal(resolveLang(null, 'en-US'), 'en');
  assert.equal(resolveLang(null, 'pt-BR'), 'pt');
  assert.equal(resolveLang('xx', 'pt-BR'), 'pt');
});

const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 0.01, `${actual} ≈ ${expected}`);

test('project follows the 30-degree isometric axes', () => {
  const { project } = loadJourney(['phishing-iso.js']).PhishingIso;
  const [ax, ay] = project(1, 0, 0);
  near(ax, 19.05); near(ay, 11);
  const [bx, by] = project(0, 1, 0);
  near(bx, -19.05); near(by, 11);
  const [cx, cy] = project(0, 0, 1);
  near(cx, 0); near(cy, -22);
});

test('shade keeps one light source', () => {
  const { shade } = loadJourney(['phishing-iso.js']).PhishingIso;
  const red = color => Number(/rgb\((\d+)/.exec(color)[1]);
  const top = red(shade('#808080', 'top'));
  const right = red(shade('#808080', 'right'));
  const left = red(shade('#808080', 'left'));
  assert.ok(top > right && right > left, `${top} > ${right} > ${left}`);
});

test('answering twice keeps the first answer', () => {
  const { createState, answer } = loadJourney().PhishingJourney;
  assert.equal(answer(answer(createState(), 1), 0).picked, 1);
});

test('changing era clears the previous answer', () => {
  const { createState, answer, select } = loadJourney().PhishingJourney;
  const state = select(answer(createState(), 0), 3);
  assert.deepEqual({ ...state }, { index: 3, answered: false, picked: null });
});

test('select clamps to the six eras', () => {
  const { createState, select } = loadJourney().PhishingJourney;
  assert.equal(select(createState(), 9).index, 5);
  assert.equal(select(createState(), -1).index, 0);
});

test('the challenge title strikes through the shark', () => {
  const { DICT } = loadJourney(['phishing-i18n.js']).PhishingI18n;
  assert.equal(DICT.pt['desafio.titleStrike'], 'tubarão');
  assert.equal(DICT.en['desafio.titleStrike'], 'shark');
  const page = readFileSync(path.join(projectRoot, 'phishing', 'index.html'), 'utf8');
  assert.match(page, /<s data-i18n="desafio\.titleStrike">tubarão<\/s>/);
});

test('fitFontSize shrinks long text to the available width', () => {
  const { fitFontSize, UNIT } = loadJourney(['phishing-iso.js']).PhishingIso;
  const size = fitFontSize('lojabbela.com.br', 1.2);
  assert.ok(size * 'lojabbela.com.br'.length * 0.62 <= 1.2 * UNIT + 0.01, `size ${size} fits 1.2 units`);
  assert.equal(fitFontSize('OK', 3), 6, 'short text keeps the base size');
});

test('every era carries the identity of its course module', () => {
  const { ERAS } = loadJourney(['phishing-eras.js']).PhishingEras;
  const accents = new Set();
  for (const era of ERAS) {
    assert.match(era.theme?.accent || '', /^#[0-9a-f]{6}$/i, `${era.key} accent`);
    assert.ok(era.theme.font?.trim(), `${era.key} font`);
    accents.add(era.theme.accent.toLowerCase());
  }
  assert.equal(accents.size, 6, 'each decade has its own accent');
  assert.equal(ERAS[0].theme.accent.toLowerCase(), '#00ff41');
  assert.equal(ERAS[1].theme.accent.toLowerCase(), '#000080');
});

test('the course is presented as my free hands-on short course on a busy portal', () => {
  const { DICT } = loadJourney(['phishing-i18n.js']).PhishingI18n;
  assert.match(DICT.pt['curso.title'], /minicurso/);
  assert.match(DICT.pt['curso.body'], /minicurso prático e gratuito/);
  assert.match(DICT.pt['curso.portal'], /47 cursos/);
  assert.match(DICT.pt['curso.portal'], /6\.848 usuários/);
  assert.match(DICT.en['curso.portal'], /6,848 users/);
  const loose = Object.entries(DICT.pt).filter(([key, value]) => key !== 'curso.portal' && /\bcurso\b/i.test(value));
  assert.deepEqual(loose.map(([key]) => key), [], 'PT copy says minicurso, not curso');
});

test('the shark illustration is the game original, safe and standalone', () => {
  const svg = readFileSync(path.join(projectRoot, 'assets', 'phishing', 'shark.svg'), 'utf8');
  assert.match(svg, /^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  assert.match(svg, /viewBox="0 0 600 560"/);
  assert.doesNotMatch(svg, /<script|<foreignObject|javascript:|(?:href|src)="https?:\/\//i);
  assert.ok(Buffer.byteLength(svg) < 8000, 'stays small');
});

test('the TCC taxonomy figure is safe and standalone', () => {
  const svg = readFileSync(path.join(projectRoot, 'assets', 'phishing', 'figures', 'taxonomia-phishing.svg'), 'utf8');
  assert.match(svg, /^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  assert.doesNotMatch(svg, /<script|<foreignObject|javascript:|@import|(?:href|src)="https?:\/\//i);
});

test('quick insights quote the poster reflections and stats', () => {
  const { DICT } = loadJourney(['phishing-i18n.js']).PhishingI18n;
  assert.equal(DICT.pt['insights.r1Title'], '40 anos, a mesma isca.');
  assert.equal(DICT.pt['insights.r3Title'], 'A IA apagou os sinais clássicos.');
  assert.equal(DICT.pt['insights.stat1Value'], '553 mi');
  assert.equal(DICT.pt['insights.stat2Value'], '68–95%');
});

test('the "what I built" cards read as numbered first-person steps', () => {
  const { DICT } = loadJourney(['phishing-i18n.js']).PhishingI18n;
  const steps = ['tcc', 'curso', 'poster', 'desafio'];
  steps.forEach((key, i) => assert.ok(DICT.pt[`${key}.kicker`].startsWith(`0${i + 1} ·`), `${key} is step ${i + 1}`));
  assert.deepEqual(steps.map(key => DICT.pt[`${key}.title`].split(' ')[0]), ['Pesquisei', 'Criei', 'Levei', 'Coloquei']);
  assert.deepEqual(steps.map(key => DICT.en[`${key}.title`].split(' ')[0]), ['I', 'I', 'I', 'I']);
});
