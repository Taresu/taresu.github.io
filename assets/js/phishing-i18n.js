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
      'challenge.credit': 'Criei este desafio para o estande do VESPAS na Tecnológica 2026, feira que recebeu mais de 3 mil visitantes.',
      'challenge.languageNote': 'O desafio é em português.',
      'origin.title': 'O que eu construí pelo caminho',
      'curso.kicker': 'curso · MOOC',
      'curso.title': 'O curso que eu criei',
      'curso.badge': 'em destaque no Portal Sophia',
      'curso.body': 'Transformei 40 anos de phishing num curso aberto contado como história: seis paradas, dos BBS dos anos 80 ao deepfake de voz, com atividades práticas e simulações. Hoje ele está em destaque no Portal Sophia.',
      'curso.login': 'exige login no Sophia-CT',
      'curso.cta': 'Fazer o curso',
      'tcc.kicker': 'pesquisa · TCC · UTFPR',
      'tcc.title': 'A pesquisa por trás do curso',
      'tcc.body': 'No meu TCC, desenvolvi e avaliei essa intervenção educativa com métodos mistos, unindo o curso, a narrativa histórica e simulações de phishing mapeadas ao MITRE ATT&CK.',
      'tcc.grade': '9,5',
      'tcc.gradeLabel': 'nota final da banca',
      'tcc.approved': 'aprovado em 14/07/2026',
      'tcc.cta': 'Ler o TCC (PDF)',
      'tcc.post': 'Post no LinkedIn',
      'poster.kicker': 'pôster · VESPAS\' Con 26',
      'poster.title': 'Levei a viagem para o papel',
      'poster.status': 'Fui aceito para apresentá-lo na VESPAS\' Con 26 (10/11/2026).',
      'poster.body': 'Resumi o curso em seis paradas e a evolução do phishing em palavras-chave, com coautoria do meu orientador, Daniel Fernando Pigatto.',
      'poster.alt': 'Pôster "Uma viagem pelo tempo do phishing", feito para a VESPAS\' Con 26.',
      'poster.cta': 'Ver o pôster',
      'desafio.kicker': 'desafio · Tecnológica 2026',
      'desafio.titleBefore': 'Cuidado que o',
      'desafio.titleStrike': 'tubarão',
      'desafio.titleAfter': 'phishing vai te pegar',
      'desafio.body': 'Cinco pares de links, do typosquatting ao link mascarado. Representei o VESPAS no estande, e o público jogava pelo QR code no celular.',
      'desafio.cta': 'Jogar o desafio',
      'footer.text': 'Thales Sgarbi Salata · educação em cibersegurança',
      'poster.download': 'Baixar (PDF, 2,6 MB)',
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
      'challenge.credit': 'I built this challenge for the VESPAS booth at Tecnológica 2026, a fair that welcomed more than 3,000 visitors.',
      'challenge.languageNote': 'The challenge is in Portuguese.',
      'origin.title': 'What I built along the way',
      'curso.kicker': 'course · MOOC',
      'curso.title': 'The course I created',
      'curso.badge': 'featured on Portal Sophia',
      'curso.body': 'I turned 40 years of phishing into an open course told as history: six stops, from 1980s BBSs to voice deepfakes, with hands-on activities and simulations. Today it is featured on Portal Sophia.',
      'curso.login': 'Sophia-CT login required',
      'curso.cta': 'Take the course',
      'tcc.kicker': 'research · final paper · UTFPR',
      'tcc.title': 'The research behind the course',
      'tcc.body': 'In my final paper, I built and evaluated this education intervention with mixed methods, bringing together the course, historical storytelling and phishing simulations mapped to MITRE ATT&CK.',
      'tcc.grade': '9.5',
      'tcc.gradeLabel': 'final committee grade',
      'tcc.approved': 'approved on 14 Jul 2026',
      'tcc.cta': 'Read the paper (PDF)',
      'tcc.post': 'LinkedIn post',
      'poster.kicker': 'poster · VESPAS\' Con 26',
      'poster.title': 'I put the journey on paper',
      'poster.status': 'I was accepted to present it at VESPAS\' Con 26 (10 Nov 2026).',
      'poster.body': 'I summed up the course in six stops and the evolution of phishing in keywords, co-authored with my advisor, Daniel Fernando Pigatto.',
      'poster.alt': 'Poster "A time-travel journey through phishing", made for VESPAS\' Con 26.',
      'poster.cta': 'View the poster',
      'desafio.kicker': 'challenge · Tecnológica 2026',
      'desafio.titleBefore': 'Watch out, the',
      'desafio.titleStrike': 'shark',
      'desafio.titleAfter': 'phishing will get you',
      'desafio.body': 'Five pairs of links, from typosquatting to a masked link. I represented VESPAS at the booth, and visitors played on their phones through a QR code.',
      'desafio.cta': 'Play the challenge',
      'footer.text': 'Thales Sgarbi Salata · cybersecurity education',
      'poster.download': 'Download (PDF, 2.6 MB)',
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
