// Browser scenarios for /phishing/, run by verify.mjs with its Puppeteer instance.
import assert from 'node:assert/strict';

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

async function openJourney(browser, base, setup = async () => {}) {
  const page = await browser.newPage();
  const errors = [];
  const external = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('request', request => { if (!request.url().startsWith(base) && !request.url().startsWith('data:')) external.push(request.url()); });
  await setup(page);
  await page.goto(`${base}/phishing/`, { waitUntil: 'networkidle0' });
  return { page, errors, external };
}

const dialButtons = page => page.$$('[data-journey-dial] button');

export async function verifyPhishing(browser, base) {
  const scenarios = [];

  {
    // Headless Chrome reports en-US; pin Portuguese the way a returning PT visitor would have it saved.
    const { page, errors, external } = await openJourney(browser, base, p =>
      p.evaluateOnNewDocument(() => localStorage.setItem('lang', 'pt')));
    try {
      assert.deepEqual(errors, [], 'loads without errors');
      assert.deepEqual(external, [], 'no external requests');
      scenarios.push('loads without errors');

      const buttons = await dialButtons(page);
      assert.equal(buttons.length, 6, 'six eras');
      await buttons[2].click();
      await page.waitForFunction(() => document.querySelector('[data-journey-cover]').src.endsWith('covers/2000s.webp'));
      await page.click('[data-journey-options] button');
      const first = await page.evaluate(() => ({
        scam: Boolean(document.querySelector('[data-journey-options] [data-result="scam"]')),
        picked: [...document.querySelectorAll('[data-journey-options] button')].findIndex(b => b.dataset.picked === 'true'),
        feedback: document.querySelector('[data-journey-feedback]').textContent.trim(),
      }));
      assert.ok(first.scam && first.feedback, 'answering marks the scam and explains why');
      const options = await page.$$('[data-journey-options] button');
      await options[1].click();
      const pickedAfter = await page.evaluate(() =>
        [...document.querySelectorAll('[data-journey-options] button')].findIndex(b => b.dataset.picked === 'true'));
      assert.equal(pickedAfter, first.picked, 'a second click does not change the answer');
      scenarios.push('six eras and a working challenge');

      await (await dialButtons(page))[5].click();
      const finalStop = await page.evaluate(() => {
        const final = document.querySelector('[data-journey-final]');
        return { hidden: final.hidden, href: final.querySelector('a')?.getAttribute('href'), text: final.textContent };
      });
      assert.equal(finalStop.hidden, false, 'final stop is visible on agora');
      assert.equal(finalStop.href, '/phishing/desafio/');
      assert.match(finalStop.text, /mais de 3 mil visitantes/);
      scenarios.push('final stop opens the hosted challenge');

      const links = await page.evaluate(() => Object.fromEntries(['curso', 'tcc', 'poster', 'desafio'].map(id => {
        const link = document.querySelector(`#${id} [data-product-link]`);
        return [id, { href: link?.getAttribute('href'), target: link?.target, rel: link?.rel }];
      })));
      assert.equal(links.curso.href, 'https://sophia.ct.utfpr.edu.br/course/view.php?id=118');
      assert.equal(links.curso.target, '_blank');
      assert.match(links.curso.rel, /noopener/);
      assert.equal(links.tcc.href, '/assets/TCC_Thales_Sgarbi_Salata_corrigido_revisado-1.pdf');
      assert.equal(links.poster.href, '/assets/phishing/poster-vespascon26.pdf');
      assert.equal(links.desafio.href, '/phishing/desafio/');
      const body = await page.evaluate(() => document.body.textContent);
      assert.ok(body.includes('9,5') && body.includes('10/11/2026'), 'grade and poster date are shown');
      assert.doesNotMatch(body, /7[,.]54|9[,.]85/, 'no pilot score');
      scenarios.push('real product links are correct and safe');

      await page.focus('[data-journey-dial] button[aria-pressed="true"]');
      await (await dialButtons(page))[0].click();
      await page.focus('[data-journey-dial] button');
      await page.keyboard.press('ArrowRight');
      assert.equal(await page.$eval('[data-journey-dial] button:nth-child(2)', b => b.getAttribute('aria-pressed')), 'true');
      await page.keyboard.press('End');
      assert.equal(await page.$eval('[data-journey-dial] button:nth-child(6)', b => b.getAttribute('aria-pressed')), 'true');
      const outline = await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle);
      assert.notEqual(outline, 'none', 'focus is visible');
      await page.focus('[data-journey-options] button');
      await page.keyboard.press('Enter');
      assert.ok(await page.$eval('[data-journey-feedback]', el => el.textContent.trim().length > 0), 'Enter answers');
      scenarios.push('keyboard drives the dial and the answers');
    } finally {
      await page.close();
    }
  }

  {
    const { page } = await openJourney(browser, base, p => p.evaluateOnNewDocument(() => localStorage.setItem('lang', 'en')));
    try {
      assert.equal(await page.$eval('html', el => el.lang), 'en');
      assert.equal(await page.$eval('h1', el => el.textContent.trim()), 'A time-travel journey through phishing');
      await (await dialButtons(page))[5].click();
      assert.match(await page.$eval('[data-journey-final]', el => el.textContent), /Portuguese/);
      scenarios.push('english from saved preference');
    } finally {
      await page.close();
    }
  }

  {
    const { page } = await openJourney(browser, base, p => p.setViewport({ width: 320, height: 740 }));
    try {
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= 320), 'no horizontal overflow at 320px');
      scenarios.push('mobile has no horizontal overflow at 320px');
    } finally {
      await page.close();
    }
  }

  {
    const { page } = await openJourney(browser, base, p =>
      p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]));
    try {
      assert.equal(await page.$eval('[data-journey-scene]', el => getComputedStyle(el).transitionDuration), '0s');
      scenarios.push('reduced motion has no transitions');
    } finally {
      await page.close();
    }
  }

  {
    const { page } = await openJourney(browser, base, async p => {
      await p.setRequestInterception(true);
      p.on('request', request => (request.url().endsWith('/phishing-journey.js') ? request.abort() : request.continue()));
    });
    try {
      const fallback = await page.evaluate(() => ({
        sections: ['curso', 'tcc', 'poster', 'desafio'].every(id => {
          const section = document.getElementById(id);
          return section && section.offsetHeight > 0 && section.querySelector('[data-product-link]');
        }),
        cover: document.querySelector('[data-journey-cover]')?.getAttribute('src'),
      }));
      assert.ok(fallback.sections, 'sections stay readable without the journey script');
      assert.match(fallback.cover, /covers\/1980s\.webp$/);
      scenarios.push('content survives without the journey script');
    } finally {
      await page.close();
    }
  }

  {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
      await page.goto(`${base}/phishing/desafio/`, { waitUntil: 'networkidle0' });
      await wait(300);
      assert.deepEqual(errors, [], 'hosted challenge loads without errors');
      assert.ok(await page.$('a[href="/phishing/"]'), 'hosted challenge links back to the journey');
      scenarios.push('hosted challenge loads');
    } finally {
      await page.close();
    }
  }

  return { passed: true, scenarios };
}
