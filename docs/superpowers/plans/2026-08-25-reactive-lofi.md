# Reactive Lo-Fi Soundtrack Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing ambient track with the selected CC0 loop and add a restrained Brazilian cyber-noir Web Audio layer that reacts to page sections and deliberate interactions.

**Architecture:** Retain the lazy-loaded `<audio>` element as transport and progressively enhance it after the play gesture with one Web Audio graph, an `IntersectionObserver` scene controller, synthesized oscillator/noise cues, and an analyser-driven equalizer. The conventional player remains the fallback, while existing browser acceptance and CSP tests provide observable state through stable player data attributes.

**Tech Stack:** Static HTML/CSS, vanilla JavaScript, HTMLMediaElement, Web Audio API, IntersectionObserver, Puppeteer, Node.js test runner, FFmpeg for the reproducible CC0 transcode.

**Spec:** `docs/superpowers/specs/2026-08-25-reactive-lofi-design.md`

## Global Constraints

- Work only in the existing `feat/lofi-player` worktree, now based on current `main`.
- Preserve the stable `data-ambient-*`, `data-audio-*`, `data-project`, `data-skill-hub`, and `data-skill` selectors.
- Use two-space indentation, semicolons, single quotes, camelCase JavaScript names, and `UPPER_SNAKE_CASE` constants.
- Keep playback opt-in, `preload="none"`, default volume at 0.3, pause-on-hide, and no automatic resume.
- Add no runtime dependencies, remote audio, external samples, autoplay, analytics, workers, or CDN scripts.
- Use `Chill Lofi Inspired` by omfgdude, loop edit by qubodup, published under CC0.
- Use the 97.253878-second MP3 transcode at 44.1 kHz stereo, SHA-256 `78a47d301a61ae686362dd863fa7743ad7abc6b82009cf6d927a7d7e814c4535`.
- Quantize reactive scheduling at 79 BPM with beat offset 0 seconds; the loop is 32 bars in 4/4.
- Limit interactive cues to one per 800 ms and derive variation deterministically from existing data attributes.
- Keep synthesized layers below the source track and use a safety compressor only as a limiter.
- Disable analyser animation under `prefers-reduced-motion`, but keep user-controlled audio and gradual scene transitions.
- Recalculate all executable inline-script hashes and update both `_headers` and `worker.js` after changing `index.html`.
- Do not add generated `public/`, screenshots, temporary audio downloads, or unrelated files to commits.

## File Structure

- Create `assets/audio/chill-lofi-inspired-loop.mp3`: cross-browser local transcode of the selected CC0 seamless loop.
- Create `assets/audio/LICENSE-chill-lofi-inspired.md`: exact source, editor, license, conversion, size, duration, and checksum.
- Create `test/audio-assets.test.mjs`: deterministic asset integrity and provenance checks.
- Modify `index.html`: player metadata, localized scene label, reactive styles, Web Audio graph, scene controller, cue scheduler, fallback, and visualization.
- Modify `verify.mjs`: browser acceptance for the new track, enhanced/fallback modes, scene changes, cue cooldown, localization, reduced motion, and lifecycle behavior.
- Modify `_headers`: replace the changed main inline-script CSP hash.
- Modify `worker.js`: apply the same replacement hash to Worker responses.
- Delete `assets/audio/dimly-lit.mp3` and `assets/audio/LICENSE-dimly-lit.md` after the replacement passes its integrity test.

---

### Task 1: Replace and Verify the CC0 Audio Asset

**Files:**

- Create: `test/audio-assets.test.mjs`
- Create: `assets/audio/chill-lofi-inspired-loop.mp3`
- Create: `assets/audio/LICENSE-chill-lofi-inspired.md`
- Delete: `assets/audio/dimly-lit.mp3`
- Delete: `assets/audio/LICENSE-dimly-lit.md`

**Interfaces:**

- Consumes: the public OpenGameArt file `https://opengameart.org/sites/default/files/chilllofir-loop.ogg`.
- Produces: `assets/audio/chill-lofi-inspired-loop.mp3`, exactly 1,945,645 bytes with SHA-256 `78a47d301a61ae686362dd863fa7743ad7abc6b82009cf6d927a7d7e814c4535`.
- Produces: a license record containing both source pages and the exact FFmpeg conversion command.

- [ ] **Step 1: Write the failing asset-integrity test**

Create `test/audio-assets.test.mjs`:

```js
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const audioPath = path.join(projectRoot, 'assets/audio/chill-lofi-inspired-loop.mp3');
const licensePath = path.join(projectRoot, 'assets/audio/LICENSE-chill-lofi-inspired.md');

test('reactive lo-fi asset matches the reviewed CC0 transcode', () => {
  const audio = readFileSync(audioPath);
  assert.equal(statSync(audioPath).size, 1_945_645);
  assert.equal(
    createHash('sha256').update(audio).digest('hex'),
    '78a47d301a61ae686362dd863fa7743ad7abc6b82009cf6d927a7d7e814c4535',
  );

  const license = readFileSync(licensePath, 'utf8');
  assert.match(license, /Chill Lofi Inspired/);
  assert.match(license, /omfgdude/);
  assert.match(license, /qubodup/);
  assert.match(license, /CC0 1\.0 Universal/);
  assert.match(license, /chill-lofi-inspired-loop-edit/);
  assert.match(license, /78a47d301a61ae686362dd863fa7743ad7abc6b82009cf6d927a7d7e814c4535/);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test test/audio-assets.test.mjs`

Expected: FAIL with `ENOENT` for `assets/audio/chill-lofi-inspired-loop.mp3`.

- [ ] **Step 3: Reproduce and install the reviewed MP3**

Run:

```bash
curl -L --fail --output /tmp/chill-lofi-inspired-loop.ogg https://opengameart.org/sites/default/files/chilllofir-loop.ogg
ffmpeg -hide_banner -loglevel error -y -i /tmp/chill-lofi-inspired-loop.ogg -codec:a libmp3lame -b:a 160k /tmp/chill-lofi-inspired-loop.mp3
sha256sum /tmp/chill-lofi-inspired-loop.mp3
cp /tmp/chill-lofi-inspired-loop.mp3 assets/audio/chill-lofi-inspired-loop.mp3
```

Expected checksum: `78a47d301a61ae686362dd863fa7743ad7abc6b82009cf6d927a7d7e814c4535`.

Create `assets/audio/LICENSE-chill-lofi-inspired.md` with:

```markdown
# Chill Lofi Inspired — Audio License

- Composition: `Chill Lofi Inspired`
- Composer: `omfgdude`
- Composition source: https://opengameart.org/content/chill-lofi-inspired
- Seamless-loop editor: `qubodup`
- Loop source: https://opengameart.org/content/chill-lofi-inspired-loop-edit
- Original loop file: `chilllofir-loop.ogg`
- Downloaded: 2026-08-25
- License: CC0 1.0 Universal / public-domain dedication
- License text: https://creativecommons.org/publicdomain/zero/1.0/
- Local conversion: `ffmpeg -i chilllofir-loop.ogg -codec:a libmp3lame -b:a 160k chill-lofi-inspired-loop.mp3`
- Local duration: `97.253878` seconds
- Local encoding: MP3, 160 kbps, 44.1 kHz stereo
- Local size: `1,945,645` bytes
- Local SHA-256: `78a47d301a61ae686362dd863fa7743ad7abc6b82009cf6d927a7d7e814c4535`

Both OpenGameArt pages mark the work and seamless edit as CC0. Attribution is optional; the portfolio keeps visible provenance.
```

Delete the superseded Dimly Lit MP3 and license file only after the checksum matches.

- [ ] **Step 4: Run the asset and repository tests**

Run: `node --test test/audio-assets.test.mjs test/repository-hygiene.test.mjs`

Expected: PASS with two audio-integrity assertions and all hygiene assertions.

- [ ] **Step 5: Commit the asset replacement**

```bash
git add test/audio-assets.test.mjs assets/audio/chill-lofi-inspired-loop.mp3 assets/audio/LICENSE-chill-lofi-inspired.md assets/audio/dimly-lit.mp3 assets/audio/LICENSE-dimly-lit.md
git commit -m "feat(audio): replace ambient track with CC0 lo-fi loop"
```

---

### Task 2: Update the Player Identity and Localized Scene UI

**Files:**

- Modify: `verify.mjs:384-407,555-575,941-958`
- Modify: `index.html:712-857,1809-1831,1846-1848,1924-1926`

**Interfaces:**

- Consumes: `assets/audio/chill-lofi-inspired-loop.mp3` from Task 1.
- Produces: player datasets `data-audio-mode="pending"`, `data-scene="top"`, `data-cue-count="0"`, and `data-visualizer="stopped"`.
- Produces: `[data-audio-scene]` with localized values from `ambient.scene.<scene>`.
- Preserves: every existing control selector and transport label.

- [ ] **Step 1: Change browser assertions first**

Extend `results.audioPlayerInitial` in `verify.mjs` with:

```js
title: player?.querySelector('.ambient-player__title')?.textContent.trim(),
scene: player?.dataset.scene,
audioMode: player?.dataset.audioMode,
cueCount: Number(player?.dataset.cueCount),
visualizer: player?.dataset.visualizer,
sceneLabel: player?.querySelector('[data-audio-scene]')?.textContent.trim(),
```

Change the initial assertions to require:

```js
results.audioPlayerInitial.src === 'assets/audio/chill-lofi-inspired-loop.mp3' &&
results.audioPlayerInitial.title === 'Chill Lofi Inspired · omfgdude' &&
results.audioPlayerInitial.creditHref === 'https://opengameart.org/content/chill-lofi-inspired-loop-edit' &&
results.audioPlayerInitial.scene === 'top' &&
results.audioPlayerInitial.audioMode === 'pending' &&
results.audioPlayerInitial.cueCount === 0 &&
results.audioPlayerInitial.visualizer === 'stopped' &&
results.audioPlayerInitial.sceneLabel === 'signal://início'
```

Add `sceneLabel` to `results.en.audioLabels` and require `signal://home` after language switching.

- [ ] **Step 2: Run acceptance verification to confirm the identity test fails**

Start the server in one terminal: `npm start`

Run in another: `node verify.mjs http://localhost:3000`

Expected: FAIL because the player still references `dimly-lit.mp3` and has no scene data.

- [ ] **Step 3: Update markup, translations, and static styles**

Change the player opening and metadata to:

```html
<aside class="ambient-player" data-ambient-player data-state="idle" data-audio-mode="pending" data-scene="top" data-cue-count="0" data-visualizer="stopped" aria-label="Player de música ambiente" data-i18n-aria-label="ambient.playerLabel">
  <audio data-ambient-audio src="assets/audio/chill-lofi-inspired-loop.mp3" preload="none" loop></audio>
```

Replace the channel/title/credit block with:

```html
<span class="ambient-player__channel" data-audio-scene data-i18n="ambient.scene.top">signal://início</span>
<strong class="ambient-player__title">Chill Lofi Inspired · omfgdude</strong>
<a class="ambient-player__credit" data-audio-credit href="https://opengameart.org/content/chill-lofi-inspired-loop-edit" target="_blank" rel="noopener noreferrer">CC0 ↗</a>
```

Add these keys to both I18N dictionaries:

```js
'ambient.scene.top': 'signal://início', 'ambient.scene.sobre': 'signal://sobre',
'ambient.scene.experiencia': 'signal://experiência', 'ambient.scene.projetos': 'signal://projetos',
'ambient.scene.skills': 'signal://formação', 'ambient.scene.contato': 'signal://contato',
```

```js
'ambient.scene.top': 'signal://home', 'ambient.scene.sobre': 'signal://about',
'ambient.scene.experiencia': 'signal://experience', 'ambient.scene.projetos': 'signal://projects',
'ambient.scene.skills': 'signal://skills', 'ambient.scene.contato': 'signal://contact',
```

Remove the CSS keyframe-driven equalizer animation. Give `.ambient-eq-bar` `transform-origin: center bottom; transform: scaleY(.2); will-change: transform;` and retain the reduced-motion override with `transform: none !important`.

- [ ] **Step 4: Update the scene label on language changes**

Add near the existing ambient label helpers:

```js
const ambientScene = ambientPlayer.querySelector('[data-audio-scene]');
const syncAmbientSceneLabel = () => {
  const key = `ambient.scene.${ambientPlayer.dataset.scene || 'top'}`;
  ambientScene.dataset.i18n = key;
  ambientScene.textContent = ambientText(key);
};
```

Call `syncAmbientSceneLabel()` during initialization and inside the existing `portfolio:languagechange` listener.

- [ ] **Step 5: Run verification and commit the player identity**

Run: `npm run verify:static && node verify.mjs http://localhost:3000`

Expected: the new identity/scene assertions pass; CSP security tests are deferred until Task 4 because the inline script hash has changed.

```bash
git add index.html verify.mjs
git commit -m "feat(audio): expose localized reactive player scene"
```

---

### Task 3: Implement the Reactive Web Audio Engine

**Files:**

- Modify: `verify.mjs:662-761,923-932,946-994,1449-1467`
- Modify: `index.html:2067-2182`

**Interfaces:**

- Consumes: player datasets and `[data-audio-scene]` from Task 2.
- Produces: `AMBIENT_AUDIO_CONFIG` with `tempoBpm`, `beatOffsetSeconds`, `cueCooldownMs`, `motifHz`, and `scenes`.
- Produces: `initAmbientGraph(): Promise<boolean>`, `setAmbientScene(sceneName, immediate = false): void`, `scheduleAmbientCue(kind, variationKey): boolean`, `stopAmbientVoices(): void`, `startAmbientVisualizer(): void`, and `stopAmbientVisualizer(reason): void`.
- Produces: dataset modes `enhanced` and `fallback`; scenes `top`, `sobre`, `experiencia`, `projetos`, `skills`, `contato`; visualizer states `running`, `stopped`, and `reduced`.

- [ ] **Step 1: Add failing enhanced/fallback and scene tests**

After playback starts on `audioPage`, record:

```js
const enhancedMode = await audioPage.evaluate(() =>
  document.querySelector('[data-ambient-player]')?.dataset.audioMode
);
```

Navigate without changing transport time:

```js
const timeBeforeScene = await audioPage.evaluate(() =>
  document.querySelector('[data-ambient-audio]')?.currentTime
);
await gotoSection(audioPage, '#projetos');
await audioPage.waitForFunction(() =>
  document.querySelector('[data-ambient-player]')?.dataset.scene === 'projetos'
);
const projectScene = await audioPage.evaluate(() => ({
  scene: document.querySelector('[data-ambient-player]')?.dataset.scene,
  label: document.querySelector('[data-audio-scene]')?.textContent.trim(),
  time: document.querySelector('[data-ambient-audio]')?.currentTime,
}));
```

Exercise deterministic cooldown:

```js
const cueCountBefore = await audioPage.$eval('[data-ambient-player]', node => Number(node.dataset.cueCount));
await audioPage.hover('[data-project="tcc"]');
const firstCueCount = await audioPage.$eval('[data-ambient-player]', node => Number(node.dataset.cueCount));
await audioPage.hover('[data-project="veripkg"]');
const cooledCueCount = await audioPage.$eval('[data-ambient-player]', node => Number(node.dataset.cueCount));
await sleep(850);
await gotoSection(audioPage, '#skills');
await audioPage.focus('[data-skill="kali-linux"]');
const skillCueCount = await audioPage.$eval('[data-ambient-player]', node => Number(node.dataset.cueCount));
```

Add a separate `fallbackPage`; before navigation disable both constructors:

```js
await fallbackPage.evaluateOnNewDocument(() => {
  Object.defineProperty(window, 'AudioContext', { configurable: true, value: undefined });
  Object.defineProperty(window, 'webkitAudioContext', { configurable: true, value: undefined });
});
```

Play and assert its media starts while `data-audio-mode` becomes `fallback`.

Update reduced-motion evaluation to require `data-visualizer="reduced"` after play and empty inline bar transforms.

Expected assertions:

```js
enhancedMode === 'enhanced'
projectScene.scene === 'projetos'
projectScene.label === 'signal://projetos'
projectScene.time >= timeBeforeScene
firstCueCount === cueCountBefore + 1
cooledCueCount === firstCueCount
skillCueCount === firstCueCount + 1
fallback.started && fallback.audioMode === 'fallback'
reducedMotion.visualizer === 'reduced' && reducedMotion.transforms.every(value => value === '')
```

- [ ] **Step 2: Run verification to confirm reactive tests fail**

Run: `node verify.mjs http://localhost:3000`

Expected: FAIL because `data-audio-mode` stays `pending`, scenes do not change, and cue counts stay zero.

- [ ] **Step 3: Define the concrete audio configuration and graph state**

Inside the existing ambient-player guard, add:

```js
const AMBIENT_AUDIO_CONFIG = Object.freeze({
  tempoBpm: 79,
  beatOffsetSeconds: 0,
  cueCooldownMs: 800,
  motifHz: [261.63, 329.63, 392, 493.88],
  scenes: Object.freeze({
    top: { frequency: 2600, gain: .88, pulse: false, percussion: false },
    sobre: { frequency: 3400, gain: .9, pulse: true, percussion: false },
    experiencia: { frequency: 3900, gain: .92, pulse: true, percussion: true },
    projetos: { frequency: 5200, gain: .95, pulse: false, percussion: false },
    skills: { frequency: 4300, gain: .92, pulse: false, percussion: false },
    contato: { frequency: 2200, gain: .86, pulse: false, percussion: false },
  }),
});

let ambientContext;
let ambientSource;
let ambientFilter;
let ambientMaster;
let ambientCompressor;
let ambientAnalyser;
let ambientNoiseBuffer;
let ambientVisualizerFrame;
let ambientLastCueAt = -Infinity;
let ambientSceneTimer;
const ambientVoices = new Set();
```

Create the graph exactly once in `initAmbientGraph()`. Connect source and procedural voices to the filter, then master, compressor, analyser, and destination. Configure the compressor as a limiter with threshold `-8`, knee `3`, ratio `12`, attack `.003`, and release `.25`. On any partial failure after source creation, connect the source directly to `ambientContext.destination`, set `data-audio-mode="fallback"`, and return `false`.

- [ ] **Step 4: Implement master state, beat timing, and scene ramps**

Implement `syncAmbientMasterGain()` so enhanced mode uses `ambientMaster.gain` and fallback uses `ambientAudio.volume`/`ambientAudio.muted`. The enhanced target is zero when muted and otherwise the stored volume multiplied by the active scene gain.

Compute the next beat from media time:

```js
const ambientBeatSeconds = 60 / AMBIENT_AUDIO_CONFIG.tempoBpm;
const nextAmbientBeatDelay = () => {
  const elapsed = Math.max(0, ambientAudio.currentTime - AMBIENT_AUDIO_CONFIG.beatOffsetSeconds);
  return ambientBeatSeconds - (elapsed % ambientBeatSeconds);
};
```

`setAmbientScene(sceneName, immediate)` must validate the scene, update `data-scene` and the localized label immediately, cancel the prior scene timer, then apply frequency and gain with 500 ms `linearRampToValueAtTime`. When playing with a running context and `immediate === false`, delay the ramp by `nextAmbientBeatDelay() * 1000`; otherwise apply it immediately.

Create one observer for the six section IDs with thresholds `[0, .35, .5, .75, 1]`. Track current ratios and select the highest ratio at or above `.35`.

- [ ] **Step 5: Implement deterministic synthesized cues and section layers**

Create short voices with oscillator/noise envelopes and always register/dispose them through `ambientVoices`.

- Terminal/project motif: sine/triangle notes selected from `motifHz`; 10 ms attack, 180 ms release, peak gain no more than `.035`.
- Low pulse/surdo: sine oscillator at `65.41` Hz, exponential fall to `49` Hz, 220 ms release, peak gain `.025`.
- Rim: filtered in-memory noise through a bandpass at `1800` Hz, 45 ms release, peak gain `.012`.
- Shaker: high-pass the same noise at `5200` Hz, 70 ms release, peak gain `.008`.

Generate one deterministic two-second noise buffer after graph creation. Do not use `Math.random()` for cue selection; hash `variationKey` by summing character codes and use modulo `motifHz.length`.

`scheduleAmbientCue(kind, variationKey)` returns `false` when paused, muted, fallback, context not running, or within the 800 ms cooldown. On success it schedules the appropriate voice, increments `data-cue-count`, stores the monotonic timestamp, and returns `true`.

Use one low-volume pulse when entering `sobre`, the muted surdo/rim/shaker cell when entering `experiencia`, the four-note motif only after the first enhanced play on `top`, project accents on project `pointerenter`, `focusin`, and click/touch, skill responses at each `[data-skill-hub]` on `pointerenter` and `focusin`, and one resolving C-major cadence on first entry to `contato`.

- [ ] **Step 6: Implement analyser visualization and lifecycle cleanup**

Configure the analyser with `fftSize = 128` and `smoothingTimeConstant = .78`. Each animation frame samples frequency data and maps five evenly distributed bands to `scaleY(.2 + level * .8)`.

`startAmbientVisualizer()` must set `data-visualizer="reduced"` without scheduling a frame when reduced motion matches; otherwise set `running` and schedule exactly one frame loop. `stopAmbientVisualizer()` cancels the frame, clears inline transforms, and sets `stopped`, except reduced-motion mode remains `reduced`.

Integrate with existing events:

- First play gesture calls `await initAmbientGraph()` before `ambientAudio.play()`.
- `play` starts visualization, applies the current scene, and schedules the one-time top motif.
- `pause`, media error, visibility hiding, and seek call `stopAmbientVoices()` and cancel pending scene timers.
- `pause` and media error stop visualization.
- Volume and mute update both persistent controls and the enhanced master gain.
- `seeked` reapplies the active scene immediately.
- Language changes also call `syncAmbientSceneLabel()`.

- [ ] **Step 7: Run reactive acceptance tests and commit**

Run: `npm run verify:static && node verify.mjs http://localhost:3000`

Expected: all track, enhanced/fallback, scene, cooldown, transport, localization, mobile, and reduced-motion assertions PASS.

```bash
git add index.html verify.mjs
git commit -m "feat(audio): react soundtrack to portfolio exploration"
```

---

### Task 4: Synchronize CSP and Complete End-to-End Verification

**Files:**

- Modify: `_headers:5`
- Modify: `worker.js:8`
- Verify: `test/security-headers.test.mjs`
- Verify: all files changed in Tasks 1-3

**Interfaces:**

- Consumes: final `index.html` inline executable scripts.
- Produces: identical complete `script-src` hash lists in `_headers` and `worker.js`.

- [ ] **Step 1: Run the security test and observe the stale hash failure**

Run: `npm run test:security`

Expected: FAIL from `script-src must authorize 'sha256-…'` for the changed main inline script.

- [ ] **Step 2: Compute all executable inline-script hashes**

Run this read-only Node command:

```bash
node -e "const fs=require('fs'),crypto=require('crypto');const h=fs.readFileSync('index.html','utf8');for(const m of h.matchAll(/<script\\b([^>]*)>([\\s\\S]*?)<\\/script>/gi)){if(/\\bsrc\\s*=/i.test(m[1]))continue;const t=m[1].match(/\\btype\\s*=\\s*['\"]([^'\"]+)['\"]/i)?.[1].toLowerCase();if(t&&!['application/javascript','text/javascript','module'].includes(t))continue;console.log(crypto.createHash('sha256').update(m[2]).digest('base64'));}"
```

Expected: four base64 digests, with only the digest for the main application script changed from the current policy.

- [ ] **Step 3: Replace the changed hash in both policy locations**

In `_headers`, replace the stale main-script `'sha256-…'` token in the `script-src` directive with the newly computed token. Make the identical replacement inside `CONTENT_SECURITY_POLICY` in `worker.js`; preserve every other directive and hash.

- [ ] **Step 4: Run all automated checks**

Run:

```bash
npm run verify:static
npm run test:hooks
npm run test:security
npm run test:seo
npm run test:hygiene
node --test test/audio-assets.test.mjs
node verify.mjs http://localhost:3000
npm run build:pages
rm -rf public
```

Expected: every verification command exits 0, browser acceptance prints no failed assertion, the build completes, and only the ignored generated `public/` directory is removed afterward.

- [ ] **Step 5: Capture and inspect responsive screenshots**

Run:

```bash
npm run screenshot -- http://localhost:3000 reactive-lofi
```

Inspect desktop and mobile images for viewport containment, final-content clearance, readable scene label, non-overlapping controls, and a static equalizer in the reduced-motion capture. Do not stage screenshot output.

- [ ] **Step 6: Verify repository scope and commit CSP synchronization**

Run:

```bash
git diff --check
git status --short
git diff --stat main...HEAD
```

Expected tracked scope: design/plan documents, the replacement audio/license/test, `index.html`, `verify.mjs`, `_headers`, and `worker.js`; no temporary downloads, screenshots, generated `public/`, or unrelated files.

```bash
git add _headers worker.js
git commit -m "fix(security): authorize reactive audio script"
```

- [ ] **Step 7: Final verification after the last commit**

Run:

```bash
npm run verify:static
npm run test:security
node --test test/audio-assets.test.mjs
git status --short --branch
```

Expected: all checks PASS and the worktree is clean except for ignored user-owned temporary screenshots.
