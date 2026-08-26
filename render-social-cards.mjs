import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const brandDirectory = path.join(projectRoot, 'assets', 'brand');

function dataUrl(filePath, mimeType) {
  return `data:${mimeType};base64,${fs.readFileSync(filePath).toString('base64')}`;
}

const shield = dataUrl(path.join(brandDirectory, 'thales-salata-shield.png'), 'image/png');
const asciiArt = dataUrl(path.join(brandDirectory, 'ascii-self-portrait.svg'), 'image/svg+xml');
const displayFont = dataUrl(path.join(projectRoot, 'assets', 'fonts', 'space-grotesk-latin.woff2'), 'font/woff2');
const monoFont = dataUrl(path.join(projectRoot, 'assets', 'fonts', 'jetbrains-mono-latin.woff2'), 'font/woff2');

const cards = [
  {
    output: 'portfolio-social.png',
    kicker: '// PORTFÓLIO PESSOAL',
    title: 'Thales Sgarbi Salata',
    subtitle: 'Full Stack · DevSecOps · Segurança da Informação',
    label: 'produto · operação · segurança',
  },
  {
    output: 'services-social.png',
    kicker: '// SERVIÇOS',
    title: 'Perfil no Google, conserto e criação de sites',
    subtitle: 'Diagnóstico gratuito · preço fechado antes de começar',
    label: 'atendimento remoto · Brasil',
    compact: true,
  },
];

function cardMarkup(card) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <style>
    @font-face { font-family: 'Space Grotesk'; src: url('${displayFont}') format('woff2'); font-weight: 700; }
    @font-face { font-family: 'JetBrains Mono'; src: url('${monoFont}') format('woff2'); font-weight: 500; }
    * { box-sizing: border-box; }
    html, body { width: 1200px; height: 630px; margin: 0; overflow: hidden; }
    body {
      position: relative;
      display: grid;
      grid-template-columns: minmax(0, 1fr) 360px;
      align-items: center;
      gap: 54px;
      padding: 74px 82px 68px;
      color: #EDF1F7;
      background:
        radial-gradient(circle at 79% 18%, rgba(124, 58, 237, .2), transparent 35%),
        linear-gradient(135deg, #0A0E14 0%, #0A1019 58%, #0E1420 100%);
    }
    body::before {
      content: '';
      position: absolute;
      inset: 0;
      opacity: .18;
      background-image:
        linear-gradient(rgba(30, 42, 58, .52) 1px, transparent 1px),
        linear-gradient(90deg, rgba(30, 42, 58, .52) 1px, transparent 1px);
      background-size: 48px 48px;
    }
    body::after { content: ''; position: absolute; inset: 22px; border: 1px solid rgba(124, 58, 237, .28); }
    .ascii { position: absolute; inset: -130px -60px -160px 390px; background: url('${asciiArt}') center / cover no-repeat; opacity: .085; mix-blend-mode: screen; }
    .content, .mark { position: relative; z-index: 2; }
    .kicker { margin: 0 0 26px; color: #00FF87; font: 500 17px/1.4 'JetBrains Mono', monospace; letter-spacing: .09em; }
    h1 { max-width: 710px; margin: 0; font: 700 ${card.compact ? '54px' : '68px'}/1.02 'Space Grotesk', sans-serif; letter-spacing: -.035em; }
    .subtitle { max-width: 700px; margin: 28px 0 0; color: #C4B5FD; font: 500 21px/1.45 'JetBrains Mono', monospace; }
    .meta { display: flex; align-items: center; gap: 14px; margin-top: 52px; color: #8B98AC; font: 500 15px/1.4 'JetBrains Mono', monospace; }
    .meta .node { width: 8px; height: 8px; border-radius: 50%; background: #00FF87; box-shadow: 0 0 18px rgba(0, 255, 135, .7); }
    .mark { display: grid; place-items: center; width: 340px; height: 340px; }
    .mark::before { content: ''; position: absolute; inset: 12px; border: 1px solid rgba(196, 181, 253, .25); border-radius: 42px; transform: rotate(4deg); }
    .mark img { width: 310px; height: 310px; object-fit: contain; filter: drop-shadow(0 24px 44px rgba(124, 58, 237, .28)); }
    .domain { position: absolute; right: 82px; bottom: 48px; z-index: 3; color: #8B98AC; font: 500 14px/1 'JetBrains Mono', monospace; letter-spacing: .05em; }
  </style>
</head>
<body>
  <div class="ascii" aria-hidden="true"></div>
  <main class="content">
    <p class="kicker">${card.kicker}</p>
    <h1>${card.title}</h1>
    <p class="subtitle">${card.subtitle}</p>
    <div class="meta"><span class="node"></span><span>${card.label}</span></div>
  </main>
  <div class="mark"><img src="${shield}" alt=""></div>
  <div class="domain">thales-salata.dev</div>
</body>
</html>`;
}

const browser = await puppeteer.launch({ headless: true });

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });

  for (const card of cards) {
    await page.setContent(cardMarkup(card), { waitUntil: 'domcontentloaded' });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map(image => image.decode()));
    });
    await page.screenshot({ path: path.join(brandDirectory, card.output), type: 'png' });
  }
} finally {
  await browser.close();
}
