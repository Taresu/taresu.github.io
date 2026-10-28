import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';

// Real-browser acceptance; called by verify.mjs with its existing Chromium instance.
export async function verifyMascot(browser, base, outDir) {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  const state = () => page.$eval('[data-mascot]', node => node.dataset.mascotEffectState);
  const until = value => page.waitForFunction(expected =>
    document.querySelector('[data-mascot]')?.dataset.mascotEffectState === expected,
  { polling: 'raf', timeout: 5000 }, value);
  const clearCanvas = () => page.$eval('[data-mascot-effects]', canvas =>
    !canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data.some((v, i) => i % 4 === 3 && v));
  try {
    await page.setViewport({ width: 1440, height: 1000, hasTouch: false });
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    await page.keyboard.press('Escape');
    await page.$eval('[data-mascot-stage]', node => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await page.waitForSelector('[data-mascot-stage][data-mascot-live="true"]', { timeout: 20000 });
    await page.waitForFunction(() => document.querySelectorAll('.mascot-stat-trigger:not(:disabled)').length === 4);
    assert.equal(await page.evaluate(() => matchMedia('(pointer: fine)').matches), true, 'desktop verification requires a fine pointer');
    const values = await page.$$eval('[data-mascot-stat]', nodes => nodes.map(node => node.textContent));
    assert.deepEqual(values, ['4', '370', '3', '9.85']);
    // Hover intent is cancelled before 180 ms.
    await page.hover('[data-mascot-stat="voip"]');
    await page.mouse.move(15, 90);
    await wait(250);
    assert.equal(await state(), 'idle');
    // Focus alone does not animate; native Enter activates.
    await page.focus('.mascot-stat-trigger');
    await wait(250);
    assert.equal(await state(), 'idle');
    await page.keyboard.down('Enter');
    const beamHandle = await page.waitForFunction(() => {
      if (document.querySelector('[data-mascot]')?.dataset.mascotEffectState !== 'firing') return false;
      return document.querySelector('[data-mascot-effects]').toDataURL();
    }, { polling: 'raf', timeout: 5000 });
    const beamData = await beamHandle.jsonValue();
    await page.keyboard.up('Enter');
    fs.writeFileSync(path.join(outDir, 'mascot-beams.png'), Buffer.from(beamData.split(',')[1], 'base64'));
    await until('burning');
    assert.equal(await clearCanvas(), false, 'fire draws visible pixels');
    await page.click('[data-mascot-stat="nerdz"]');
    assert.equal(await state(), 'burning', 'second activation cannot restart the sequence');
    await until('idle');
    assert.equal(await clearCanvas(), true, 'completed effects leave no pixels');
    await page.click('[data-mascot-stat="voip"]');
    assert.equal(await state(), 'idle', 'cooldown rejects immediate repeat');
    await wait(4200);
    await page.focus('.mascot-stat-trigger:has([data-mascot-stat="voip"])');
    await page.keyboard.down('Space');
    await until('firing');
    await page.evaluate(() => window.scrollBy(0, 1));
    await page.keyboard.up('Space');
    await until('idle');
    assert.equal(await clearCanvas(), true, 'scroll cancels the canvas');
    // A held primary mouse button sustains BOTH beam and flame past burst duration.
    await wait(4200);
    await page.hover('[data-mascot-stat="voip"]');
    await page.mouse.down();
    await until('firing');
    await wait(3000);
    assert.equal(await state(), 'firing', 'holding sustains the beam beyond a normal burst');
    assert.equal(await clearCanvas(), false);
    await page.screenshot({ path: path.join(outDir, 'mascot-held-beams.png') });
    await page.mouse.move(20, 90);
    assert.equal(await state(), 'firing', 'pointer capture keeps the same target while held');
    await page.mouse.up();
    await until('burning');
    await page.screenshot({ path: path.join(outDir, 'mascot-fire.png') });
    await until('idle');
    assert.equal(await clearCanvas(), true, 'release eventually clears the afterglow');
    await wait(4200);
    await page.hover('[data-mascot-stat="nerdz"]');
    await page.mouse.down();
    await until('firing');
    const resizeSession = await page.createCDPSession();
    await resizeSession.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 1000, deviceScaleFactor: 1, mobile: false });
    await until('idle');
    assert.equal(await clearCanvas(), true, 'resize cancels the canvas');
    await page.mouse.up();
    await resizeSession.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
    await page.$eval('[data-mascot-stage]', node => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await page.waitForFunction(() => document.querySelectorAll('.mascot-stat-trigger:not(:disabled)').length === 4);
    // Re-enable after cooldown, then change motion preference while burning.
    await wait(4200);
    await page.click('[data-mascot-stat="tcc"]');
    await until('burning');
    await resizeSession.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await page.waitForFunction(() => getComputedStyle(document.querySelector('[data-mascot-stage] canvas')).display === 'none');
    await until('idle');
    assert.equal(await clearCanvas(), true);
    assert.equal(await page.$eval('[data-mascot-stage] canvas', node => getComputedStyle(node).display), 'none');
    assert.equal(await page.$$eval('.mascot-stat-trigger', nodes => nodes.every(node => node.disabled)), true);
    await resizeSession.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
    await page.waitForFunction(() => document.querySelector('[data-mascot-stage]').dataset.mascotLive === 'true' && !document.querySelector('[data-mascot-stage] canvas').hidden);
    assert.equal(await state(), 'idle', 'preference restoration never resumes fire');
    await page.click('#lang-pt');
    assert.match(await page.$eval('.mascot-stat-trigger', node => node.getAttribute('aria-label')), /^Acender efeito verde em/);
    await page.click('#lang-en');
    assert.match(await page.$eval('.mascot-stat-trigger', node => node.getAttribute('aria-label')), /^Trigger green fire on/);
    assert.deepEqual(await page.$$eval('[data-mascot-stat]', nodes => nodes.map(node => node.textContent)), values);
    assert.deepEqual(errors, [], 'mascot introduces no browser exceptions');
  } finally {
    await page.close();
  }
  for (const mode of ['reduce', 'touch', 'model-error', 'effects-error']) {
    const fallback = await browser.newPage();
    let blocked = 0;
    try {
      await fallback.setViewport({ width: mode === 'touch' ? 390 : 1440, height: 1000, hasTouch: mode === 'touch', isMobile: mode === 'touch' });
      if (mode === 'reduce') await fallback.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
      if (mode.endsWith('-error')) {
        await fallback.setRequestInterception(true);
        fallback.on('request', request => {
          const suffix = mode === 'model-error' ? '/mascot-robot.glb' : '/mascot-effects.js';
          if (request.url().endsWith(suffix)) { blocked++; request.abort(); } else request.continue();
        });
      }
      await fallback.goto(base, { waitUntil: 'domcontentloaded' });
      await fallback.keyboard.press('Escape');
      await fallback.$eval('[data-mascot-stage]', node => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
      if (mode === 'effects-error') await fallback.waitForSelector('[data-mascot-live="true"]', { timeout: 20000 });
      else if (mode === 'model-error') {
        // The 3D boots only after the recon-scan intro leaves, then fetches Three.js before the model.
        const deadline = Date.now() + 20000;
        while (!blocked && Date.now() < deadline) await wait(100);
        await wait(500);
      } else await wait(2000);
      assert.equal(await fallback.$$eval('.mascot-stat-trigger', nodes => nodes.length), 0, `${mode}: keep static values`);
      if (mode.endsWith('-error')) assert.equal(blocked, 1, `${mode}: request actually blocked`);
      if (mode !== 'effects-error') assert.notEqual(await fallback.$eval('[data-mascot-stage]', node => node.dataset.mascotLive), 'true');
    } finally { await fallback.close(); }
  }
  return { passed: true, scenarios: ['hover', 'keyboard', 'hold-release', 'cooldown', 'resize', 'scroll', 'motion-change', 'localization', 'touch', 'model-error', 'effects-error'] };
}
