// PT/EN copy for /phishing/. Shares the home page's saved language ('lang' in localStorage).
(function () {
  const DICT = {
    pt: {
      'meta.title': 'Uma viagem pelo tempo do phishing | Thales Sgarbi Salata',
      'nav.back': '← Voltar ao portfólio',
      'nav.langLabel': 'Idioma',
      'journey.kicker': 'pesquisa → curso → pôster → desafio',
      'journey.title': 'Uma viagem pelo tempo do phishing',
      'journey.lead': '40 anos, a mesma isca. Escolha uma década e tente não cair.',
      'journey.dialLabel': 'Escolha uma década',
      'journey.sceneHint': 'Ilustração da época',
      'journey.challengeLabel': 'Mini-desafio',
      'journey.resultScam': 'Acertou: é golpe.',
      'journey.resultMissed': 'Caiu na isca.',
      'journey.coverAlt': 'Capa do curso para esta época',
      'challenge.cta': 'Jogar o desafio completo (5 níveis)',
      'challenge.credit': 'Desafio criado para o estande do VESPAS na Tecnológica 2026, feira que recebeu mais de 3 mil visitantes.',
      'challenge.languageNote': 'O desafio é em português.',
      'origin.title': 'De onde isso veio',
      'curso.kicker': 'curso · MOOC',
      'curso.title': 'Curso no Portal Sophia-CT',
      'curso.badge': 'em destaque no Portal Sophia',
      'curso.body': 'Curso aberto sobre phishing com narrativa histórica: seis paradas, dos BBS dos anos 80 ao deepfake de voz, com atividades práticas e simulações.',
      'curso.login': 'exige login no Sophia-CT',
      'curso.cta': 'Fazer o curso',
      'tcc.kicker': 'pesquisa · TCC · UTFPR',
      'tcc.title': 'A pesquisa por trás do curso',
      'tcc.body': 'Pesquisa aplicada de métodos mistos que desenvolveu e avaliou uma intervenção educativa em cibersegurança, combinando o MOOC, a narrativa histórica e simulações de phishing mapeadas ao MITRE ATT&CK.',
      'tcc.grade': '9,5',
      'tcc.gradeLabel': 'nota final da banca',
      'tcc.approved': 'aprovado em 14/07/2026',
      'tcc.cta': 'Ler o TCC (PDF)',
      'tcc.post': 'Post no LinkedIn',
      'poster.kicker': 'pôster · VESPAS\' Con 26',
      'poster.title': 'Uma viagem pelo tempo do phishing, no papel',
      'poster.status': 'Aceito para apresentação na VESPAS\' Con 26 (10/11/2026).',
      'poster.body': 'O pôster resume o curso em seis paradas e a evolução do phishing em palavras-chave, com coautoria do orientador Daniel Fernando Pigatto.',
      'poster.alt': 'Pôster "Uma viagem pelo tempo do phishing", feito para a VESPAS\' Con 26.',
      'poster.cta': 'Baixar o pôster (PDF)',
      'desafio.kicker': 'desafio · Tecnológica 2026',
      'desafio.title': 'Cuidado que o tubarão phishing vai te pegar',
      'desafio.body': 'Cinco pares de links, do typosquatting ao link mascarado. Criei o desafio e representei o VESPAS no estande, onde o público jogava pelo QR code.',
      'desafio.cta': 'Jogar o desafio',
      'footer.text': 'Thales Sgarbi Salata · educação em cibersegurança',
    },
    en: {
      'meta.title': 'A time-travel journey through phishing | Thales Sgarbi Salata',
      'nav.back': '← Back to the portfolio',
      'nav.langLabel': 'Language',
      'journey.kicker': 'research → course → poster → challenge',
      'journey.title': 'A time-travel journey through phishing',
      'journey.lead': '40 years, the same bait. Pick a decade and try not to get hooked.',
      'journey.dialLabel': 'Pick a decade',
      'journey.sceneHint': 'Illustration of the era',
      'journey.challengeLabel': 'Mini-challenge',
      'journey.resultScam': 'Right: that is the scam.',
      'journey.resultMissed': 'You took the bait.',
      'journey.coverAlt': 'Course cover for this era',
      'challenge.cta': 'Play the full challenge (5 levels)',
      'challenge.credit': 'Challenge created for the VESPAS booth at Tecnológica 2026, a fair that welcomed more than 3,000 visitors.',
      'challenge.languageNote': 'The challenge is in Portuguese.',
      'origin.title': 'Where this came from',
      'curso.kicker': 'course · MOOC',
      'curso.title': 'Course on Portal Sophia-CT',
      'curso.badge': 'featured on Portal Sophia',
      'curso.body': 'An open course on phishing told as history: six stops, from 1980s BBSs to voice deepfakes, with hands-on activities and simulations.',
      'curso.login': 'Sophia-CT login required',
      'curso.cta': 'Take the course',
      'tcc.kicker': 'research · final paper · UTFPR',
      'tcc.title': 'The research behind the course',
      'tcc.body': 'Mixed-methods applied research that built and evaluated a cybersecurity education intervention, combining the MOOC, historical storytelling and phishing simulations mapped to MITRE ATT&CK.',
      'tcc.grade': '9.5',
      'tcc.gradeLabel': 'final committee grade',
      'tcc.approved': 'approved on 14 Jul 2026',
      'tcc.cta': 'Read the paper (PDF)',
      'tcc.post': 'LinkedIn post',
      'poster.kicker': 'poster · VESPAS\' Con 26',
      'poster.title': 'The phishing time-travel journey, on paper',
      'poster.status': 'Accepted for presentation at VESPAS\' Con 26 (10 Nov 2026).',
      'poster.body': 'The poster sums up the course in six stops and the evolution of phishing in keywords, co-authored with advisor Daniel Fernando Pigatto.',
      'poster.alt': 'Poster "A time-travel journey through phishing", made for VESPAS\' Con 26.',
      'poster.cta': 'Download the poster (PDF)',
      'desafio.kicker': 'challenge · Tecnológica 2026',
      'desafio.title': 'Watch out, the phishing shark will get you',
      'desafio.body': 'Five pairs of links, from typosquatting to a masked link. I built the challenge and represented VESPAS at the booth, where visitors played through a QR code.',
      'desafio.cta': 'Play the challenge',
      'footer.text': 'Thales Sgarbi Salata · cybersecurity education',
    },
  };

  function resolveLang(saved, navigatorLang) {
    if (saved === 'pt' || saved === 'en') return saved;
    return String(navigatorLang || '').toLowerCase().startsWith('en') ? 'en' : 'pt';
  }

  function apply(root, lang) {
    const dict = DICT[lang] || DICT.pt;
    root.querySelectorAll('[data-i18n]').forEach(el => {
      const value = dict[el.getAttribute('data-i18n')];
      if (value !== undefined) el.textContent = value;
    });
    root.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
      const value = dict[el.getAttribute('data-i18n-aria-label')];
      if (value !== undefined) el.setAttribute('aria-label', value);
    });
    root.querySelectorAll('[data-i18n-alt]').forEach(el => {
      const value = dict[el.getAttribute('data-i18n-alt')];
      if (value !== undefined) el.setAttribute('alt', value);
    });
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang === 'en' ? 'en' : 'pt-BR';
      document.title = dict['meta.title'];
    }
  }

  globalThis.PhishingI18n = { DICT, resolveLang, apply };
})();
