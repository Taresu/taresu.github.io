'use strict';

// Each URL is plain text. Only the relevant domain portion is marked after answering.
const questions = [
  {
    level: 'Fácil',
    technique: 'Uma letra a mais no endereço (typosquatting)',
    message: '“Loja Farol: você recebeu um cupom de 50% de desconto. Aproveite pelo link abaixo.”',
    scenario: 'Você recebeu um cupom da Loja Farol. Qual dos links é da loja?',
    official: 'lojafarol.com.br',
    options: [
      { url: 'https://lojafarol.com.br/ofertas', highlight: 'lojafarol.com.br' },
      { url: 'https://lojaafarol.com.br/ofertas', highlight: 'lojaafarol.com.br' },
    ],
    correct: 0,
    explanation: 'O link B tem um “a” a mais: “lojaafarol”. É fácil passar batido, mas esse endereço é diferente de “lojafarol.com.br”.',
    takeaway: 'Antes de abrir, confira se o nome está escrito exatamente como no endereço oficial.',
  },
  {
    level: 'Básico',
    technique: 'Nome da empresa com uma palavra a mais (combosquatting)',
    message: '“Entrega Já: sua encomenda está retida. Pague a taxa de R$ 4,90 até hoje para evitar a devolução.”',
    scenario: 'Chegou uma mensagem sobre sua encomenda. Qual endereço pertence à Entrega Já?',
    official: 'entregaja.com.br',
    options: [
      { url: 'https://entregaja-taxas.com.br/rastreio', highlight: 'entregaja-taxas.com.br' },
      { url: 'https://entregaja.com.br/rastreio/taxas', highlight: 'entregaja.com.br' },
    ],
    correct: 1,
    explanation: 'O link falso põe “-taxas” no nome do site: “entregaja-taxas.com.br”. No verdadeiro, “taxas” aparece depois da barra, dentro do endereço oficial “entregaja.com.br”. A pressa para evitar a devolução é outro sinal de alerta.',
    takeaway: 'Recebeu uma cobrança de entrega? Confira o pedido pelo aplicativo ou site que você já usa.',
  },
  {
    level: 'Intermediário',
    technique: 'Nome da escola depois da barra (path confusion)',
    message: '“Escola Horizonte: inscrições abertas para cursos gratuitos com certificado. Consulte as vagas.”',
    scenario: 'Você recebeu esta divulgação de cursos. Qual link leva ao site da Escola Horizonte?',
    official: 'escolahorizonte.com.br',
    options: [
      { url: 'https://escolahorizonte.com.br/cursos/abertos', highlight: 'escolahorizonte.com.br' },
      { url: 'https://portal.com.br/escolahorizonte.com.br', highlight: 'portal.com.br' },
    ],
    correct: 0,
    explanation: 'No link B, o site é “portal.com.br”. O nome da escola só aparece depois da barra, como parte do nome da página. Qualquer site pode colocar esse texto ali.',
    takeaway: 'Para identificar o site nestes links, confira o trecho entre “https://” e a próxima barra.',
  },
  {
    level: 'Difícil',
    technique: 'Subdomínio enganoso (deceptive subdomain)',
    message: '“Sua vaga na Mostra Tech está reservada. Confirme sua inscrição.”',
    scenario: 'Você se inscreveu na Mostra Tech e recebeu esta mensagem. Os dois links têm o nome do evento. Qual é o oficial?',
    official: 'mostratech.com.br',
    options: [
      { url: 'https://mostratech.com.br.conta-segura.com.br/confirmar', highlight: 'conta-segura.com.br' },
      { url: 'https://inscricao.mostratech.com.br/confirmacao-da-vaga', highlight: 'mostratech.com.br' },
    ],
    correct: 1,
    explanation: 'O link A pertence a “conta-segura.com.br”. Colocaram “mostratech.com.br” antes para parecer o site do evento. Já “inscricao.mostratech.com.br”, no link B, fica dentro do domínio oficial.',
    takeaway: 'Não pare de ler quando encontrar um nome conhecido. Confira o restante do endereço também.',
  },
  {
    level: 'Desafio final',
    technique: 'O link mostra um endereço, mas leva a outro (hyperlink spoofing)',
    message: '“Conta Viva: identificamos um acesso suspeito. Confirme seus dados em até 10 minutos para evitar o bloqueio.”',
    scenario: 'Na tela, os links parecem iguais. Copie e cole cada um em outra aba para ver se são mesmo.',
    official: 'contaviva.com.br',
    masked: true,
    displayText: 'https://contaviva.com.br/seguranca/portal-de-acesso',
    options: [
      { url: 'https://contaviva.com.br/seguranca/portal-de-acesso', highlight: 'contaviva.com.br' },
      { url: 'https://contaviva.com.br.verifica.com.br/seguranca', highlight: 'verifica.com.br' },
    ],
    correct: 0,
    explanation: 'Ao colar o link B, aparece “verifica.com.br”. Esse era o destino escondido atrás do texto. O link A copia o mesmo endereço que mostra na tela.',
    takeaway: 'Se receber um alerta de bloqueio, abra o aplicativo da sua conta e confira por lá.',
  },
];

const $ = (id) => document.getElementById(id);
const loader = $('page-loader');
const loaderStartedAt = performance.now();
window.addEventListener('load', () => {
  const minimumDisplay = 5000;
  const remaining = Math.max(0, minimumDisplay - (performance.now() - loaderStartedAt));
  window.setTimeout(() => loader.classList.add('is-done'), remaining);
}, { once: true });
let round = 0;
let score = 0;
let answered = false;
let copiedLinks = new Set();
let questionVersion = 0;

function showScreen(id) {
  clearAnswerEffects();
  if (id === 'game') document.body.dataset.level = String(round + 1);
  else delete document.body.dataset.level;
  ['intro', 'game', 'result'].forEach((screen) => { $(screen).hidden = screen !== id; });
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function renderQuestion() {
  answered = false;
  const question = questions[round];
  copiedLinks = new Set();
  questionVersion += 1;
  $('inspect-panel').hidden = !question.masked;
  $('copy-progress').textContent = 'Primeiro, copie e confira os dois links. Depois você pode responder.';
  $('progress').replaceChildren(...questions.map(() => document.createElement('span')));
  $('progress-label').textContent = `Nível ${round + 1} de ${questions.length}`;
  $('difficulty').textContent = question.level;
  [...$('progress').children].forEach((segment, index) => {
    segment.className = index < round ? 'done' : index === round ? 'active' : '';
  });
  $('scenario').textContent = question.scenario;
  $('message').textContent = question.message;
  $('options').replaceChildren();
  question.options.forEach((option, index) => {
    const card = document.createElement('div');
    card.className = 'option';
    const label = document.createElement('label');
    label.className = 'choice-label';
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'link';
    radio.value = String(index);
    radio.required = true;
    radio.disabled = Boolean(question.masked);
    const content = document.createElement('span');
    content.className = 'option-content';
    const heading = document.createElement('span');
    heading.className = 'option-heading';
    heading.textContent = `Link ${index === 0 ? 'A' : 'B'}`;
    const url = document.createElement('span');
    url.className = 'url';
    url.textContent = option.url;
    url.hidden = Boolean(question.masked);
    content.append(heading);
    if (question.masked) {
      const display = document.createElement('span');
      display.className = 'display-link';
      display.tabIndex = 0;
      display.textContent = question.displayText;
      content.append(display);
    }
    content.append(url);
    label.append(radio, content);
    card.append(label);
    if (question.masked) addCopyControls(card, option, index);
    $('options').append(card);
  });
  $('confirm').hidden = false;
  $('confirm').disabled = true;
  $('feedback').hidden = true;
  $('next').textContent = round === questions.length - 1 ? 'Ver meu resultado ↗' : 'Próxima pergunta ↗';
  showScreen('game');
  $('question-title').focus({ preventScroll: true });
}

function highlightDomain(element, option) {
  const start = option.url.indexOf(option.highlight);
  const mark = document.createElement('mark');
  mark.textContent = option.highlight;
  element.replaceChildren(
    document.createTextNode(option.url.slice(0, start)),
    mark,
    document.createTextNode(option.url.slice(start + option.highlight.length)),
  );
}

$('start').addEventListener('click', () => {
  round = 0;
  score = 0;
  renderQuestion();
});

$('answer-form').addEventListener('change', () => {
  if (!answered) $('confirm').disabled = !$('answer-form').querySelector('input:checked');
});

$('answer-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const selected = $('answer-form').querySelector('input:checked');
  if (answered || !selected || (questions[round].masked && copiedLinks.size < questions[round].options.length)) return;
  answered = true;
  const question = questions[round];
  const isCorrect = Number(selected.value) === question.correct;
  if (isCorrect) score += 1;
  [...$('options').children].forEach((label, index) => {
    const correct = index === question.correct;
    label.classList.add('locked', correct ? 'correct' : 'incorrect');
    label.querySelector('input').disabled = true;
    label.querySelector('.url').hidden = false;
    label.querySelectorAll('.copy-controls').forEach((controls) => { controls.hidden = true; });
    highlightDomain(label.querySelector('.url'), question.options[index]);
    const status = document.createElement('span');
    status.className = 'option-status';
    status.textContent = `${correct ? '✓ Domínio oficial' : '× Imitação'}${Number(selected.value) === index ? ' · Sua escolha' : ''}`;
    label.querySelector('.option-content').append(status);
  });
  $('confirm').hidden = true;
  $('confirm').disabled = true;
  $('feedback-title').textContent = isCorrect ? 'Acertou!' : 'Esse era o falso.';
  $('technique').textContent = `A técnica: ${question.technique}`;
  $('explanation').textContent = question.explanation;
  $('takeaway').textContent = question.takeaway;
  $('feedback').hidden = false;
  $('feedback-title').focus();
  showAnswerEffects(isCorrect);
});

$('next').addEventListener('click', () => {
  if (!answered) return;
  if (round < questions.length - 1) {
    round += 1;
    renderQuestion();
    return;
  }
  $('score').textContent = `${score} / ${questions.length}`;
  $('result-title').textContent = score === questions.length ? 'Acertou os cinco!' : score >= 3 ? 'Você acertou a maioria.' : 'Alguns links enganaram você.';
  $('result-copy').textContent = score === questions.length
    ? 'Uma letra, uma palavra a mais ou um destino escondido: você identificou todos neste desafio.'
    : 'Vale olhar de novo os detalhes que passaram batido. Você pode repetir o desafio quando quiser.';
  showScreen('result');
  $('result-title').focus({ preventScroll: true });
});

$('restart').addEventListener('click', () => {
  round = 0;
  score = 0;
  answered = false;
  questionVersion += 1;
  copiedLinks = new Set();
  $('options').replaceChildren();
  $('feedback').hidden = true;
  showScreen('intro');
  $('start').focus({ preventScroll: true });
});

// A cópia é só manual (selecionar e copiar); o jogo nunca escreve nem lê a área de transferência por conta própria.
function addCopyControls(card, option, index) {
  const version = questionVersion;
  const letter = index === 0 ? 'A' : 'B';
  const controls = document.createElement('div');
  controls.className = 'copy-controls';
  const status = document.createElement('p');
  status.className = 'copy-status';
  status.setAttribute('role', 'status');
  function markCopied() {
    if (version !== questionVersion || answered) return;
    copiedLinks.add(index);
    status.textContent = `Link ${letter} copiado. Cole em outra aba sem pressionar Enter; depois volte aqui.`;
    const ready = copiedLinks.size === questions[round].options.length;
    $('copy-progress').textContent = ready
      ? 'Você já copiou os dois. Confira os destinos e escolha o endereço oficial.'
      : 'Um link conferido. Agora copie o outro e compare.';
    $('options').querySelectorAll('input').forEach((radio) => { radio.disabled = !ready; });
  }
  // Ao copiar, entrega o destino real no lugar do texto exibido, como "copiar endereço do link".
  card.addEventListener('copy', (event) => {
    if (answered || version !== questionVersion || !event.clipboardData) return;
    event.preventDefault();
    event.clipboardData.setData('text/plain', option.url);
    markCopied();
  });
  // Pelo teclado, focar o endereço já o seleciona para copiar com Ctrl+C; o toque não seleciona sozinho.
  const display = card.querySelector('.display-link');
  display.addEventListener('focus', () => {
    if (display.matches(':focus-visible')) getSelection().selectAllChildren(display);
  });
  controls.append(status);
  card.append(controls);
}

let soundEnabled = true;
let audioContext;
let effectTimer;
let confettiTimer;
let effectVersion = 0;
const activeTones = new Set();

function stopTones() {
  activeTones.forEach((oscillator) => {
    try { oscillator.stop(); } catch { /* Already stopped. */ }
  });
  activeTones.clear();
}

function clearAnswerEffects() {
  effectVersion += 1;
  clearTimeout(effectTimer);
  clearTimeout(confettiTimer);
  document.querySelector('.confetti-layer')?.remove();
  delete document.body.dataset.answerEffect;
  delete $('feedback').dataset.outcome;
  stopTones();
}

function showAnswerEffects(correct) {
  clearAnswerEffects();
  const outcome = correct ? 'correct' : 'wrong';
  document.body.dataset.answerEffect = outcome;
  $('feedback').dataset.outcome = outcome;
  effectTimer = setTimeout(() => { delete document.body.dataset.answerEffect; }, 850);
  if (correct) launchConfetti();
  void playAnswerSound(correct, effectVersion);
}

async function playAnswerSound(correct, version) {
  if (!soundEnabled) return;
  try {
    const AudioEngine = window.AudioContext || window.webkitAudioContext;
    if (!AudioEngine) return;
    audioContext ||= new AudioEngine();
    if (audioContext.state === 'suspended') await audioContext.resume();
    if (!soundEnabled || version !== effectVersion || audioContext.state !== 'running') return;
    const now = audioContext.currentTime;
    // Original short cues: a rising chime and a softer descending pair.
    const notes = correct ? [523.25, 659.25, 880] : [233.08, 174.61];
    notes.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const envelope = audioContext.createGain();
      const start = now + index * (correct ? 0.09 : 0.14);
      const duration = correct ? 0.28 : 0.23;
      oscillator.type = correct ? 'sine' : 'triangle';
      oscillator.frequency.setValueAtTime(frequency, start);
      envelope.gain.setValueAtTime(0, start);
      envelope.gain.linearRampToValueAtTime(correct ? 0.11 : 0.065, start + 0.012);
      envelope.gain.exponentialRampToValueAtTime(0.001, start + duration);
      oscillator.connect(envelope);
      envelope.connect(audioContext.destination);
      activeTones.add(oscillator);
      oscillator.onended = () => {
        oscillator.disconnect();
        envelope.disconnect();
        activeTones.delete(oscillator);
      };
      oscillator.start(start);
      oscillator.stop(start + duration + 0.02);
    });
  } catch {
    // A browser audio restriction must never prevent answering or advancing.
    stopTones();
  }
}

$('sound-toggle').addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  $('sound-toggle').setAttribute('aria-pressed', String(soundEnabled));
  $('sound-toggle').textContent = soundEnabled ? 'Som ligado' : 'Som desligado';
  if (!soundEnabled) {
    effectVersion += 1;
    stopTones();
  }
});

function launchConfetti() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const layer = document.createElement('div');
  layer.className = 'confetti-layer';
  layer.setAttribute('aria-hidden', 'true');
  const colors = ['#ffd562', '#79e4d8', '#98edb0', '#ffaaa6', '#ffffff'];
  for (let i = 0; i < 48; i += 1) {
    const piece = document.createElement('span');
    const fromLeft = i % 2 === 0;
    const direction = fromLeft ? 1 : -1;
    piece.className = 'confetti-piece';
    piece.style.left = fromLeft ? '-12px' : 'calc(100% + 12px)';
    piece.style.top = `${55 + Math.random() * 18}%`;
    piece.style.backgroundColor = colors[i % colors.length];
    piece.style.setProperty('--drift', `${direction * (15 + Math.random() * 55)}vw`);
    piece.style.setProperty('--rise', `${-(18 + Math.random() * 35)}vh`);
    piece.style.setProperty('--fall', `${30 + Math.random() * 35}vh`);
    piece.style.setProperty('--spin', `${direction * (360 + Math.random() * 720)}deg`);
    piece.style.animationDuration = `${1.5 + Math.random() * 0.5}s`;
    piece.style.animationDelay = `${Math.random() * 0.12}s`;
    layer.append(piece);
  }
  document.body.append(layer);
  confettiTimer = setTimeout(() => layer.remove(), 2200);
}
