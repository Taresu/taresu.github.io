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
      for (const field of ['title', 'chapter', 'sceneLabel', 'question', 'why']) {
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
