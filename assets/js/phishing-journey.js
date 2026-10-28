// Controller for /phishing/: era dial, isometric scene, mini-challenge and the final stop.
(function () {
  const COUNT = 6;

  function createState() {
    return { index: 0, answered: false, picked: null };
  }

  function select(state, index) {
    return { index: Math.max(0, Math.min(COUNT - 1, index)), answered: false, picked: null };
  }

  function answer(state, optionIndex) {
    if (state.answered) return state;
    return { index: state.index, answered: true, picked: optionIndex };
  }

  const reduceMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function mount(root, lang) {
    const { ERAS } = globalThis.PhishingEras;
    const { DICT } = globalThis.PhishingI18n;
    const iso = globalThis.PhishingIso;
    const q = selector => root.querySelector(selector);
    const sceneSvg = q('[data-journey-scene]');
    const dial = q('[data-journey-dial]');
    const cover = q('[data-journey-cover]');
    const optionsBox = q('[data-journey-options]');
    const feedback = q('[data-journey-feedback]');
    const final = q('[data-journey-final]');
    const prev = q('[data-journey-prev]');
    const next = q('[data-journey-next]');
    let state = createState();
    let current = lang;

    const t = key => DICT[current][key];
    const eraLabel = era => (era.key === 'agora' ? (current === 'en' ? 'now' : 'agora') : era.key);

    function drawScene(era) {
      const group = iso.node('g', {});
      era.scene(iso, group);
      sceneSvg.replaceChildren(group);
      sceneSvg.setAttribute('aria-label', era.text[current].sceneLabel);
    }

    function renderScene(era) {
      if (reduceMotion()) { drawScene(era); return; }
      sceneSvg.classList.add('is-switching');
      setTimeout(() => { drawScene(era); sceneSvg.classList.remove('is-switching'); }, 120);
    }

    function renderDial() {
      [...dial.children].forEach((button, i) => {
        const selected = i === state.index;
        button.querySelector('[data-year]').textContent = eraLabel(ERAS[i]);
        button.querySelector('[data-milestone]').textContent = ERAS[i].text[current].milestone;
        button.setAttribute('aria-pressed', String(selected));
        button.dataset.passed = String(i < state.index);
        button.tabIndex = selected ? 0 : -1;
      });
      dial.style.setProperty('--progress', `${Math.round((state.index / (COUNT - 1)) * 100)}%`);
      if (prev) prev.disabled = state.index === 0;
      if (next) next.disabled = state.index === COUNT - 1;
    }

    function renderStop() {
      const era = ERAS[state.index];
      const text = era.text[current];
      root.style.setProperty('--era-accent', era.theme.accent);
      root.style.setProperty('--era-font', era.theme.font);
      cover.src = `/${era.cover}`;
      cover.alt = `${t('journey.coverAlt')}: ${text.title}`;
      q('[data-journey-title]').textContent = text.title;
      q('[data-journey-chapter]').textContent = text.chapter;
      q('[data-journey-question]').textContent = text.question;
      renderAnswer();
      final.hidden = era.key !== 'agora';
    }

    function renderAnswer() {
      const text = ERAS[state.index].text[current];
      optionsBox.replaceChildren(...text.options.map((option, i) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'journey-option';
        button.textContent = option;
        if (state.answered) {
          button.dataset.result = i === text.scamIndex ? 'scam' : 'safe';
          if (i === state.picked) button.dataset.picked = 'true';
          button.setAttribute('aria-disabled', 'true');
        }
        button.addEventListener('click', () => {
          if (state.answered) return;
          state = answer(state, i);
          renderAnswer();
          optionsBox.children[i].focus();
        });
        return button;
      }));
      feedback.textContent = state.answered
        ? `${t(state.picked === text.scamIndex ? 'journey.resultScam' : 'journey.resultMissed')} ${text.why}`
        : '';
    }

    function go(index, focus) {
      const next = select(state, index);
      const changed = next.index !== state.index;
      state = next;
      renderDial();
      renderStop();
      if (changed) renderScene(ERAS[state.index]);
      if (focus) dial.children[state.index].focus();
    }

    dial.replaceChildren(...ERAS.map((era, i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'journey-dial-button';
      for (const part of ['dot', 'year', 'milestone']) {
        const span = document.createElement('span');
        span.className = `journey-dial-${part}`;
        if (part !== 'dot') span.setAttribute(`data-${part}`, '');
        button.appendChild(span);
      }
      button.addEventListener('click', () => go(i, false));
      return button;
    }));
    prev?.addEventListener('click', () => go(state.index - 1, false));
    next?.addEventListener('click', () => go(state.index + 1, false));
    dial.addEventListener('keydown', event => {
      const moves = { ArrowRight: state.index + 1, ArrowLeft: state.index - 1, Home: 0, End: COUNT - 1 };
      if (!(event.key in moves)) return;
      event.preventDefault();
      go(moves[event.key], true);
    });

    renderDial();
    renderStop();
    drawScene(ERAS[state.index]);

    return {
      setLang(next) {
        current = next;
        renderDial();
        renderStop();
        sceneSvg.setAttribute('aria-label', ERAS[state.index].text[current].sceneLabel);
      },
    };
  }

  globalThis.PhishingJourney = { createState, select, answer, mount };

  if (typeof document === 'undefined') return;
  document.addEventListener('DOMContentLoaded', () => {
    const { resolveLang, apply } = globalThis.PhishingI18n;
    let saved = null;
    try { saved = localStorage.getItem('lang'); } catch (e) { /* storage blocked: fall back to the browser language */ }
    const lang = resolveLang(saved, navigator.language);
    apply(document, lang);
    const root = document.querySelector('[data-journey]');
    const journey = root ? mount(root, lang) : null;
    document.querySelectorAll('[data-lang-switch]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.langSwitch === lang));
      button.addEventListener('click', () => {
        const next = button.dataset.langSwitch;
        try { localStorage.setItem('lang', next); } catch (e) { /* the choice still applies to this page */ }
        apply(document, next);
        journey?.setLang(next);
        document.querySelectorAll('[data-lang-switch]').forEach(other => {
          other.setAttribute('aria-pressed', String(other === button));
        });
      });
    });
  });
})();
