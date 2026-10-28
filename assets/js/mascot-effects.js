/* Decorative effects share the mascot's animation frame and viewport coordinates. */
(() => {
  const TIMING = { hover: 180, aim: 300, beam: 180, fire: 1800, cooldown: 4000 };
  window.createMascotEffects = ({ targets, figure, getEyes, aimAt, releaseAim, canAnimate }) => {
    const abort = new AbortController();
    const listen = (node, type, handler, options = {}) => node.addEventListener(type, handler, { ...options, signal: abort.signal });
    const canvas = document.createElement('canvas');
    canvas.className = 'mascot-effects';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.dataset.mascotEffects = '';
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    document.body.appendChild(canvas);
    let phase = 'idle';
    let startedAt = 0;
    let nextAllowedAt = 0;
    let active = null;
    let held = false;
    let holdSource = null;
    let pending = null;
    let hoverAt = 0;
    let lastFrame = 0;
    let width = 0;
    let height = 0;
    let particles = [];
    const buttons = targets.map(span => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'mascot-stat-trigger';
      button.setAttribute('aria-describedby', `mascot-stat-${span.dataset.mascotStat}-label`);
      span.before(button);
      button.appendChild(span);
      return button;
    });
    function state(value) {
      phase = value;
      figure.dataset.mascotEffectState = value;
    }
    function rectFor(button) { return button.querySelector('[data-mascot-stat]').getBoundingClientRect(); }
    function inView(rect) {
      return rect.width > 0 && rect.height > 0 && rect.left >= 0 && rect.top >= 0 && rect.right <= innerWidth && rect.bottom <= innerHeight;
    }
    function eligible(button) {
      return canAnimate() && !document.hidden && Boolean(getEyes()) && inView(rectFor(button));
    }
    function refresh() {
      const label = document.documentElement.lang.startsWith('pt') ? 'Acender efeito verde em' : 'Trigger green fire on';
      buttons.forEach(button => {
        button.disabled = !eligible(button);
        button.setAttribute('aria-label', `${label} ${button.textContent.trim()}`);
      });
    }
    function clear() { ctx.clearRect(0, 0, width, height); }
    function resize() {
      width = innerWidth;
      height = innerHeight;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.ceil(width * dpr);
      canvas.height = Math.ceil(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function cancel() {
      pending = null;
      held = false;
      holdSource = null;
      if (phase !== 'idle') releaseAim();
      active = null;
      particles = [];
      state('idle');
      clear();
    }
    function requestFire(button, now) {
      pending = null;
      if (phase !== 'idle' || now < nextAllowedAt || !eligible(button)) return false;
      active = button;
      startedAt = now;
      lastFrame = now;
      nextAllowedAt = now + TIMING.cooldown;
      const rect = rectFor(button);
      aimAt({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      state('aiming');
      return true;
    }
    function startHold(button, source) {
      const now = performance.now();
      if (held || !eligible(button)) return false;
      if (active !== button && !requestFire(button, now)) return false;
      pending = null;
      held = true;
      holdSource = source;
      if (phase === 'burning') {
        startedAt = now - TIMING.aim;
        state('firing');
      }
      return true;
    }
    function releaseHold() {
      if (!held) return;
      held = false;
      holdSource = null;
      if (phase === 'firing') {
        // Release stops beams immediately; flames retain a short afterglow.
        startedAt = performance.now() - TIMING.aim - TIMING.beam;
        state('burning');
        clear();
      }
    }
    buttons.forEach(button => {
      listen(button, 'pointerenter', event => {
        if (event.pointerType !== 'mouse' || phase !== 'idle' || performance.now() < nextAllowedAt || !eligible(button)) return;
        pending = button;
        hoverAt = performance.now();
      });
      listen(button, 'pointerleave', () => { if (pending === button) pending = null; });
      listen(button, 'pointerdown', event => {
        if (event.pointerType !== 'mouse' || event.button !== 0) return;
        if (startHold(button, { kind: 'pointer', id: event.pointerId })) button.setPointerCapture(event.pointerId);
      });
      listen(button, 'lostpointercapture', event => {
        if (holdSource?.kind === 'pointer' && holdSource.id === event.pointerId) releaseHold();
      });
      listen(button, 'keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        if (!event.repeat) startHold(button, { kind: 'key', key: event.key });
      });
      listen(button, 'keyup', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          if (holdSource?.kind === 'key' && holdSource.key === event.key) releaseHold();
        }
      });
      listen(button, 'blur', releaseHold);
      // Click also supports assistive technology activation without a held key/pointer.
      listen(button, 'click', () => requestFire(button, performance.now()));
    });
    listen(window, 'pointerup', event => {
      if (event.button === 0 && holdSource?.kind === 'pointer' && holdSource.id === event.pointerId) releaseHold();
    });
    listen(window, 'pointercancel', event => {
      if (holdSource?.kind === 'pointer' && holdSource.id === event.pointerId) cancel();
    });
    function beam(eyes, rect) {
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      ctx.lineCap = 'round';
      for (const eye of eyes) {
        ctx.beginPath();
        ctx.moveTo(eye.x, eye.y);
        ctx.lineTo(x, y);
        ctx.strokeStyle = 'rgba(0,255,135,.15)';
        ctx.lineWidth = 9;
        ctx.stroke();
        ctx.strokeStyle = '#00ff87';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.strokeStyle = '#dbffe9';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
    function spawn(particle, rect, initial = false) {
      const side = Math.random();
      particle.x = side < 0.7 ? rect.left + Math.random() * rect.width : side < 0.85 ? rect.left - 2 : rect.right + 2;
      particle.y = side < 0.7 ? rect.top + 2 : rect.top + Math.random() * rect.height * 0.65;
      particle.originY = particle.y;
      particle.life = initial ? Math.random() * 0.5 : 0;
      particle.duration = 0.45 + Math.random() * 0.35;
      particle.size = 2 + Math.random() * 3;
      particle.drift = Math.random() * Math.PI * 2;
    }
    function fire(rect, dt, elapsed, continuous = false) {
      const fade = Math.min(1, elapsed / 120, continuous ? 1 : (TIMING.fire - elapsed) / 300);
      for (let i = 0; i < 6; i++) {
        const x = rect.left + rect.width * (i + 0.5) / 6;
        const y = rect.top + 1;
        const height = 12 + 7 * (0.5 + 0.5 * Math.sin(elapsed / 160 + i * 2));
        const sway = Math.sin(elapsed / 240 + i) * 3;
        const gradient = ctx.createLinearGradient(x, y, x, y - height);
        gradient.addColorStop(0, `rgba(0,255,135,${fade * 0.55})`);
        gradient.addColorStop(0.5, `rgba(92,255,163,${fade * 0.8})`);
        gradient.addColorStop(1, 'rgba(0,255,135,0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(x - 3, y);
        ctx.bezierCurveTo(x - 6, y - height * 0.5, x + sway, y - height * 0.6, x + sway, y - height);
        ctx.bezierCurveTo(x + sway + 4, y - height * 0.45, x + 5, y - height * 0.3, x + 3, y);
        ctx.fill();
      }
      for (const p of particles) {
        p.life += dt;
        if (p.life >= p.duration) {
          if (!continuous && elapsed > TIMING.fire - 300) continue;
          spawn(p, rect);
        }
        const age = p.life / p.duration;
        const x = p.x + Math.sin(age * 5 + p.drift) * 2;
        const y = p.originY - age * 24;
        const radius = p.size * (1 - age * 0.75);
        const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
        glow.addColorStop(0, `rgba(177,255,204,${(1 - age) * fade})`);
        glow.addColorStop(0.4, `rgba(0,255,135,${(1 - age) * fade * 0.8})`);
        glow.addColorStop(1, 'rgba(0,255,135,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.ellipse(x, y, radius, radius * 2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    function seedParticles(rect) {
      particles = Array.from({ length: 36 }, () => {
        const particle = {};
        spawn(particle, rect, true);
        return particle;
      });
    }
    function update(now) {
      if (pending && now - hoverAt >= TIMING.hover) requestFire(pending, now);
      if (phase === 'idle') return;
      if (!active || !eligible(active)) { cancel(); refresh(); return; }
      const elapsed = now - startedAt;
      const dt = Math.min((now - lastFrame) / 1000, 0.05);
      lastFrame = now;
      const rect = rectFor(active);
      clear();
      if (elapsed < TIMING.aim) return;
      if (held) {
        state('firing');
        if (!particles.length) seedParticles(rect);
        beam(getEyes(), rect);
        fire(rect, dt, elapsed - TIMING.aim, true);
        return;
      }
      if (elapsed < TIMING.aim + TIMING.beam) {
        state('firing');
        beam(getEyes(), rect);
        return;
      }
      const fireElapsed = elapsed - TIMING.aim - TIMING.beam;
      if (fireElapsed >= TIMING.fire) { cancel(); return; }
      if (phase !== 'burning' || !particles.length) {
        state('burning');
        seedParticles(rect);
      }
      fire(rect, dt, fireElapsed);
    }
    listen(window, 'scroll', () => { cancel(); refresh(); }, { passive: true, capture: true });
    listen(window, 'resize', () => { cancel(); resize(); refresh(); });
    listen(window, 'blur', cancel);
    listen(document, 'visibilitychange', () => { cancel(); refresh(); });
    const languageObserver = new MutationObserver(refresh);
    languageObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    resize();
    state('idle');
    refresh();
    return {
      update, cancel, refresh,
      destroy() {
        cancel();
        abort.abort();
        languageObserver.disconnect();
        buttons.forEach(button => button.replaceWith(button.firstElementChild));
        canvas.remove();
      },
    };
  };
})();
