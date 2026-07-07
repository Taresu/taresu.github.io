// Verificação end-to-end: screenshots desktop/mobile, toggle PT/EN, link do CV.
// Usa o puppeteer já instalado em ../WebDev-Portfolio (evita novo download do Chromium).
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(__dirname, '../WebDev-Portfolio/package.json'));
const puppeteer = require('puppeteer');

const BASE = process.argv[2] || 'http://localhost:3100';
const outDir = path.join(__dirname, 'temporary screenshots');
fs.mkdirSync(outDir, { recursive: true });

const shot = (page, name) => page.screenshot({ path: path.join(outDir, `${name}.png`) });
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function revealAll(page) {
  await page.evaluate(async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    for (let y = 0; y <= document.body.scrollHeight; y += 350) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await sleep(70);
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await sleep(900);
}

async function gotoSection(page, id) {
  await page.evaluate(sel => {
    const el = document.querySelector(sel);
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'instant' });
  }, id);
  await sleep(400);
}

const results = {};
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

// ── Desktop ──
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 });
await sleep(9000); // animação de digitação do terminal
await shot(page, 'desktop-01-hero-pt');

await revealAll(page);
for (const [id, name] of [['#sobre', 'sobre'], ['#experiencia', 'experiencia'], ['#projetos', 'projetos'], ['#skills', 'skills'], ['#contato', 'contato']]) {
  await gotoSection(page, id);
  await shot(page, `desktop-02-${name}-pt`);
}

// ── Toggle EN ──
await page.evaluate(() => { window.scrollTo({ top: 0, behavior: 'instant' }); });
await page.click('#lang-en');
await sleep(300);
results.en = await page.evaluate(() => ({
  htmlLang: document.documentElement.lang,
  heroRole: document.querySelector('[data-i18n="hero.role"]').textContent.trim(),
  aboutTitle: document.querySelector('[data-i18n="about.title"]').textContent.trim(),
  contactTitle: document.querySelector('[data-i18n="contact.title"]').textContent.trim(),
  saved: localStorage.getItem('lang'),
  untranslated: [...document.querySelectorAll('[data-i18n]')].filter(el => !el.textContent.trim()).length,
}));
await shot(page, 'desktop-03-hero-en');
await gotoSection(page, '#experiencia');
await shot(page, 'desktop-04-experiencia-en');
await gotoSection(page, '#contato');
await shot(page, 'desktop-05-contato-en');

// volta para PT e confere persistência
await page.reload({ waitUntil: 'networkidle0' });
results.persistedAfterReload = await page.evaluate(() => localStorage.getItem('lang'));
await page.evaluate(() => localStorage.removeItem('lang'));

// ── Link do CV ──
const resp = await page.goto(`${BASE}/assets/curriculo-thales-salata.pdf`, { timeout: 15000 }).catch(e => null);
results.cvPdf = resp ? { status: resp.status(), type: resp.headers()['content-type'] } : 'FAILED';

// ── Mobile ──
const mob = await browser.newPage();
await mob.setViewport({ width: 390, height: 844 });
await mob.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 });
await sleep(9000);
await shot(mob, 'mobile-01-hero-pt');
await revealAll(mob);
for (const [id, name] of [['#sobre', 'sobre'], ['#experiencia', 'experiencia'], ['#projetos', 'projetos'], ['#contato', 'contato']]) {
  await gotoSection(mob, id);
  await shot(mob, `mobile-02-${name}-pt`);
}
results.mobileOverflowX = await mob.evaluate(() => document.body.scrollWidth > window.innerWidth);

await browser.close();
console.log(JSON.stringify(results, null, 2));
console.log(`Screenshots em: ${outDir}`);
