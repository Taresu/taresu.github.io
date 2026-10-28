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

      // Picking the legitimate option must say so plainly, not read as if it were the scam.
      await (await dialButtons(page))[1].click();
      await (await page.$$('[data-journey-options] button'))[0].click();
      const safePick = await page.evaluate(() => ({
        feedback: document.querySelector('[data-journey-feedback]').textContent.trim(),
        labels: [...document.querySelectorAll('[data-journey-options] button')].map(b => b.dataset.label),
      }));
      assert.match(safePick.feedback, /^Essa é legítima\. O golpe era a outra opção\./, 'a safe pick is called legitimate');
      assert.deepEqual(safePick.labels, ['legítima', 'golpe'], 'each option is tagged after answering');
      await (await dialButtons(page))[2].click();
      const timeline = await page.evaluate(() => {
        const dial = document.querySelector('[data-journey-dial]');
        return {
          progress: dial.style.getPropertyValue('--progress').trim(),
          milestones: [...dial.querySelectorAll('button')].map(b => b.querySelector('[data-milestone]')?.textContent.trim()),
        };
      });
      assert.equal(timeline.progress, '40%', 'the timeline fills up to the selected era');
      assert.deepEqual(timeline.milestones, ['BBS', 'AOL', 'PayPal', 'RSA', 'IA', 'você']);
      await page.click('[data-journey-next]');
      assert.equal(await page.$eval('[data-journey-dial] button:nth-child(4)', b => b.getAttribute('aria-pressed')), 'true', 'next moves forward');
      await page.click('[data-journey-prev]');
      await page.click('[data-journey-prev]');
      assert.equal(await page.$eval('[data-journey-dial] button:nth-child(2)', b => b.getAttribute('aria-pressed')), 'true', 'previous moves back');
      await (await dialButtons(page))[2].click();
      scenarios.push('six eras and a working challenge');
      scenarios.push('interactive timeline with progress and milestones');

      for (let i = 0; i < 6; i++) {
        await (await dialButtons(page))[i].click();
        await wait(200);
        const overflow = await page.evaluate(() => {
          const svg = document.querySelector('[data-journey-scene]');
          const out = [];
          let host = null;
          for (const el of svg.querySelectorAll('polygon[data-screen], text')) {
            if (el.matches('polygon')) { host = el.getBoundingClientRect(); continue; }
            const r = el.getBoundingClientRect();
            if (!host || r.left < host.left - 1 || r.right > host.right + 1 || r.top < host.top - 1 || r.bottom > host.bottom + 1) {
              out.push(el.textContent);
            }
          }
          return out;
        });
        assert.deepEqual(overflow, [], `scene ${i}: texts stay inside their screens`);
      }
      scenarios.push('scene texts stay inside their screens');

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
      const posterActions = await page.evaluate(() => ({
        thumbnail: document.querySelector('#poster a:has(> img)')?.getAttribute('href'),
        download: document.querySelector('#poster [data-poster-download]')?.getAttribute('href'),
        downloadName: document.querySelector('#poster [data-poster-download]')?.getAttribute('download'),
      }));
      assert.equal(posterActions.thumbnail, '/assets/phishing/poster-vespascon26.pdf', 'the poster thumbnail opens the poster');
      assert.equal(posterActions.download, '/assets/phishing/poster-vespascon26.pdf');
      assert.ok(posterActions.downloadName, 'the poster can be downloaded directly');
      assert.equal(links.desafio.href, '/phishing/desafio/');
      const body = await page.evaluate(() => document.body.textContent);
      assert.ok(body.includes('9,5') && body.includes('10/11/2026'), 'grade and poster date are shown');
      assert.doesNotMatch(body, /7[,.]54|9[,.]85/, 'no pilot score');
      // Lazy images below the fold load only near the viewport: bring them in before checking.
      await page.evaluate(async () => {
        for (const img of document.querySelectorAll('img[loading="lazy"]')) {
          img.scrollIntoView({ block: 'center' });
          if (!img.complete) await new Promise(resolve => { img.addEventListener('load', resolve, { once: true }); img.addEventListener('error', resolve, { once: true }); });
        }
        window.scrollTo(0, 0);
      });
      const extras = await page.evaluate(() => {
        const loaded = img => Boolean(img?.complete && img.naturalWidth > 0);
        const hero = document.querySelector('a[href="https://sophia.ct.utfpr.edu.br/course/view.php?id=118"] img[data-hero-cover]');
        const tccThumb = document.querySelector('#tcc a[href="/assets/TCC_Thales_Sgarbi_Salata_corrigido_revisado-1.pdf"] img');
        const figures = [...document.querySelectorAll('#insights figure a img')];
        return {
          hero: loaded(hero) && hero.getAttribute('src'),
          tccThumb: loaded(tccThumb) && tccThumb.getAttribute('src'),
          reflections: document.querySelectorAll('#insights [data-insight]').length,
          stats: document.querySelectorAll('#insights [data-insight-stat]').length,
          figures: figures.map(img => loaded(img) && img.getAttribute('src')),
          figureLinks: [...document.querySelectorAll('#insights figure a')].map(a => a.getAttribute('href')),
        };
      });
      assert.equal(extras.hero, '/assets/phishing/course-cover.webp', 'the course cover opens the journey and links to the course');
      assert.equal(extras.tccThumb, '/assets/phishing/tcc-folha-rosto.webp', 'the TCC title page thumbnail opens the paper');
      assert.equal(extras.reflections, 4, 'four poster reflections');
      assert.equal(extras.stats, 2, 'two poster stats');
      assert.deepEqual(extras.figures, ['/assets/phishing/figures/mapa-mental-evolucao.webp', '/assets/phishing/figures/taxonomia-phishing.svg']);
      assert.deepEqual(extras.figureLinks, ['/assets/phishing/figures/mapa-mental-evolucao.webp', '/assets/phishing/figures/taxonomia-phishing.svg']);
      const shark = await page.evaluate(() => {
        const img = document.querySelector('#desafio a[href="/phishing/desafio/"] img[src="/assets/phishing/shark.svg"]');
        return { present: Boolean(img), loaded: Boolean(img?.complete && img.naturalWidth > 0), alt: img?.alt };
      });
      assert.ok(shark.present && shark.loaded && shark.alt, `the challenge card shows the game shark and links to the game ${JSON.stringify(shark)}`);
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
    const { page } = await openJourney(browser, base, p => p.setViewport({ width: 1440, height: 900 }));
    try {
      const layout = await page.evaluate(() => {
        const scene = document.querySelector('[data-journey-scene]').getBoundingClientRect();
        const title = document.querySelector('[data-journey-title]').getBoundingClientRect();
        return { height: scene.height, right: scene.right, titleLeft: title.left, titleTop: title.top, sceneTop: scene.top };
      });
      assert.ok(layout.height <= 420, `scene stays compact on desktop (${Math.round(layout.height)}px)`);
      const sizes = await page.evaluate(() => ({
        cover: document.querySelector('[data-journey-cover]').getBoundingClientRect().width,
        thumbs: [...document.querySelectorAll('[data-thumb]')].map(el => {
          const r = el.getBoundingClientRect();
          return [Math.round(r.width), Math.round(r.height)];
        }),
        stage: Boolean(document.querySelector('[data-journey-stage] [data-journey-dial]') &&
          document.querySelector('[data-journey-stage] [data-journey-scene]') &&
          document.querySelector('[data-journey-stage] [data-journey-question]')),
      }));
      assert.ok(sizes.cover <= 200, `the era cover is a thumbnail beside the title (${Math.round(sizes.cover)}px)`);
      assert.equal(sizes.thumbs.length, 4, 'every product card has a thumbnail');
      assert.ok(sizes.thumbs.every(([w, h]) => w === sizes.thumbs[0][0] && h === sizes.thumbs[0][1]),
        `product thumbnails share one size ${JSON.stringify(sizes.thumbs)}`);
      assert.ok(sizes.stage, 'timeline, scene and stop live in one stage');
      assert.ok(layout.right <= layout.titleLeft && layout.titleTop < layout.sceneTop + layout.height,
        'scene sits beside the stop on desktop');
      scenarios.push('desktop scene is compact and beside the stop');
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
