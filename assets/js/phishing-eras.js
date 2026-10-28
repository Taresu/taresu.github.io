// Six stops of the phishing time-travel journey: the same eras as the MOOC and the VESPAS' Con 26 poster.
// Mini-challenge domains are fictitious and rendered as text only.
(function () {
  // Every scene shares the same desk, grid and framing so switching eras reads as one desk through time.
  function desk(iso, g) {
    iso.polygon(g, [[-0.9, -0.9, -0.5], [9, -0.9, -0.5], [9, 7, -0.5], [-0.9, 7, -0.5]], 'rgba(0,0,0,.28)');
    iso.box(g, -0.4, -0.4, -0.5, 8.8, 6.8, 0.5, '#2b3345');
  }

  function keyboard(iso, g, x, y, width, color) {
    iso.box(g, x, y, 0, width, 1.0, 0.16, color);
    const keyColor = color === '#c9bfa3' ? '#e6dfcc' : '#cbd2db';
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < Math.floor((width - 0.2) / 0.32); col++) {
        iso.box(g, x + 0.12 + col * 0.32, y + 0.12 + row * 0.27, 0.16, 0.24, 0.2, 0.06, keyColor);
      }
    }
  }

  function laptop(iso, g, body, lid, glass) {
    iso.box(g, 2.0, 2.6, 0.16, 3.4, 0.14, 2.2, lid);
    iso.screen(g, 2.15, 2.741, 0.35, 3.1, 1.85, glass);
    iso.box(g, 2.0, 2.74, 0, 3.4, 2.4, 0.16, body);
    iso.box(g, 2.25, 3.0, 0.16, 2.9, 1.3, 0.02, '#6b7280');
    iso.box(g, 3.2, 4.5, 0.16, 1.0, 0.5, 0.02, '#9aa3af');
  }

  function phoneOnStand(iso, g, glass) {
    iso.box(g, 3.0, 3.2, 0, 1.6, 1.0, 0.2, '#374151');
    iso.box(g, 3.2, 3.0, 0.2, 1.2, 0.2, 1.2, '#4b5563');
    iso.box(g, 3.0, 3.2, 0.2, 1.6, 0.16, 3.0, '#0b1220');
    iso.screen(g, 3.1, 3.361, 0.35, 1.4, 2.7, glass);
  }

  const scenes = {
    '1980s': (iso, g) => {
      desk(iso, g);
      iso.box(g, 2.4, 1.0, 0, 2.6, 2.4, 2.5, '#cfc6ad');
      iso.screen(g, 2.65, 3.401, 0.5, 2.1, 1.6, '#0a1a10');
      iso.screen(g, 2.8, 3.402, 0.62, 1.8, 1.36, '#073d1d');
      iso.label(g, 2.95, 3.403, 1.6, 'LOGIN: _', 'scene-text scene-text--green');
      iso.label(g, 2.95, 3.403, 1.25, 'PASSWORD:', 'scene-text scene-text--green');
      keyboard(iso, g, 2.3, 4.0, 2.9, '#c9bfa3');
    },
    '1990s': (iso, g) => {
      desk(iso, g);
      iso.box(g, 0.6, 1.0, 0, 1.1, 2.6, 3.0, '#d8cfb6');
      iso.screen(g, 0.8, 3.601, 2.2, 0.7, 0.12, '#1b1b1b');
      iso.screen(g, 1.45, 3.601, 0.4, 0.12, 0.12, '#00ff87');
      iso.box(g, 2.2, 1.2, 0, 2.6, 2.2, 2.3, '#e2d9c0');
      iso.screen(g, 2.45, 3.401, 0.5, 2.1, 1.5, '#1e3a8a');
      iso.screen(g, 2.7, 3.402, 0.75, 1.6, 1.0, '#cbd5e1');
      iso.screen(g, 2.7, 3.403, 1.6, 1.6, 0.15, '#1d4ed8');
      iso.label(g, 2.78, 3.404, 1.63, 'AOL', 'scene-text scene-text--light');
      iso.label(g, 2.85, 3.404, 1.05, '****', 'scene-text scene-text--dark');
      keyboard(iso, g, 2.1, 4.0, 3.0, '#c9bfa3');
      iso.box(g, 5.8, 3.6, 0, 0.9, 0.9, 0.05, '#222831');
      iso.box(g, 5.6, 4.2, 0, 0.9, 0.9, 0.05, '#e3803a');
    },
    '2000s': (iso, g) => {
      desk(iso, g);
      laptop(iso, g, '#b4bcc7', '#8b95a3', '#f1f5f9');
      iso.screen(g, 2.15, 2.742, 1.95, 3.1, 0.25, '#1e40af');
      iso.label(g, 2.3, 2.743, 1.4, 'paypa1-seguro.com', 'scene-text scene-text--red');
      iso.screen(g, 2.3, 2.743, 0.9, 2.2, 0.08, '#cbd5e1');
      iso.screen(g, 2.3, 2.743, 0.7, 1.6, 0.08, '#cbd5e1');
      iso.box(g, 6.2, 4.4, 0, 0.4, 0.6, 0.15, '#d1d5db');
    },
    '2010s': (iso, g) => {
      desk(iso, g);
      laptop(iso, g, '#4b5563', '#374151', '#0f172a');
      iso.label(g, 2.3, 2.743, 1.55, 'NF-2016.zip', 'scene-text scene-text--amber');
      iso.label(g, 2.3, 2.743, 1.15, 'URGENTE', 'scene-text scene-text--red');
      iso.box(g, 6.0, 3.6, 0, 0.75, 1.4, 0.1, '#111827');
      iso.polygon(g, [[6.07, 3.67, 0.101], [6.68, 3.67, 0.101], [6.68, 4.93, 0.101], [6.07, 4.93, 0.101]], '#1e293b');
      iso.polygon(g, [[6.12, 3.75, 0.102], [6.63, 3.75, 0.102], [6.63, 4.0, 0.102], [6.12, 4.0, 0.102]], '#f5b041');
    },
    '2020s': (iso, g) => {
      desk(iso, g);
      phoneOnStand(iso, g, '#0f2a1f');
      iso.screen(g, 3.2, 3.362, 1.7, 1.1, 0.55, '#14532d');
      [0.12, 0.3, 0.2, 0.42, 0.26, 0.36, 0.16].forEach((height, i) => {
        iso.screen(g, 3.28 + i * 0.13, 3.363, 1.98 - height / 2, 0.06, height, '#00ff87');
      });
      iso.label(g, 3.22, 3.363, 1.25, 'PIX ▸ 0:12', 'scene-text scene-text--green');
    },
    agora: (iso, g) => {
      desk(iso, g);
      phoneOnStand(iso, g, '#0b2a3a');
      iso.polygon(g, [[3.45, 3.362, 1.9], [4.25, 3.362, 1.9], [4.0, 3.362, 2.75]], '#7dd3fc');
      iso.screen(g, 3.15, 3.362, 1.2, 1.3, 0.3, '#1e293b');
      iso.screen(g, 3.15, 3.362, 0.7, 1.3, 0.3, '#1e293b');
      iso.label(g, 3.2, 3.363, 1.28, 'lojabela', 'scene-text scene-text--light');
      iso.label(g, 3.2, 3.363, 0.78, 'lojabbela', 'scene-text scene-text--light');
    },
  };

  const ERAS = [
    {
      key: '1980s',
      cover: 'assets/phishing/covers/1980s.webp',
      scene: scenes['1980s'],
      text: {
        pt: {
          title: 'O início do cibercrime',
          chapter: 'A curiosidade vira ameaça: BBS, phreaks e as primeiras senhas roubadas.',
          sceneLabel: 'Terminal com monitor de fósforo verde e teclado sobre a mesa, pedindo login.',
          question: 'Mensagem no BBS. Qual destas é golpe?',
          options: ['"Sou o sysop. Me passe sua senha para manutenção."', 'Aviso no mural: manutenção às 22h, nenhuma ação necessária.'],
          scamIndex: 0,
          why: 'Nenhum administrador precisa da sua senha.',
        },
        en: {
          title: 'The dawn of cybercrime',
          chapter: 'Curiosity turns into threat: BBSs, phreaks and the first stolen passwords.',
          sceneLabel: 'Green-phosphor terminal and keyboard on the desk, asking for a login.',
          question: 'A BBS message. Which one is the scam?',
          options: ['"I\'m the sysop. Send me your password for maintenance."', 'Board notice: maintenance at 10 pm, no action needed.'],
          scamIndex: 0,
          why: 'No administrator needs your password.',
        },
      },
    },
    {
      key: '1990s',
      cover: 'assets/phishing/covers/1990s.webp',
      scene: scenes['1990s'],
      text: {
        pt: {
          title: 'A origem do phishing',
          chapter: 'Contas AOL, AOHell e falsos funcionários pedindo senha.',
          sceneLabel: 'PC bege com monitor de tubo e disquetes, com uma janela pedindo a senha da conta.',
          question: 'Janela de mensagem da AOL. Qual destas é golpe?',
          options: ['Sua fatura está disponível na área do assinante.', '"Verifique sua conta: digite sua senha abaixo."'],
          scamIndex: 1,
          why: 'Pedido de senha por mensagem: a isca clássica dos anos 90.',
        },
        en: {
          title: 'The origin of phishing',
          chapter: 'AOL accounts, AOHell and fake staff asking for passwords.',
          sceneLabel: 'Beige PC with a CRT monitor and floppy disks, showing a window that asks for the account password.',
          question: 'An AOL message window. Which one is the scam?',
          options: ['Your bill is available in the member area.', '"Verify your account: type your password below."'],
          scamIndex: 1,
          why: 'A password request by message: the classic 90s bait.',
        },
      },
    },
    {
      key: '2000s',
      cover: 'assets/phishing/covers/2000s.webp',
      scene: scenes['2000s'],
      text: {
        pt: {
          title: 'A ascensão do phishing',
          chapter: 'Bancos on-line, PayPal e eBay falsos: o golpe vira negócio.',
          sceneLabel: 'Notebook prata aberto com um e-mail de banco pedindo atualização de dados.',
          question: 'E-mail do "PayPal". Qual destes é golpe?',
          options: ['"Conta limitada! Acesse paypa1-seguro.com"', 'Recibo de pagamento de R$ 49,90.'],
          scamIndex: 0,
          why: 'paypa1, com o número 1 no lugar do L: domínio falso.',
        },
        en: {
          title: 'The rise of phishing',
          chapter: 'Online banking, fake PayPal and eBay: the scam becomes a business.',
          sceneLabel: 'Open silver laptop with a bank e-mail asking you to update your details.',
          question: 'A "PayPal" e-mail. Which one is the scam?',
          options: ['"Account limited! Go to paypa1-seguro.com"', 'Payment receipt for R$ 49.90.'],
          scamIndex: 0,
          why: 'paypa1, with the digit 1 instead of an L: a fake domain.',
        },
      },
    },
    {
      key: '2010s',
      cover: 'assets/phishing/covers/2010s.webp',
      scene: scenes['2010s'],
      text: {
        pt: {
          title: 'O ataque direcionado',
          chapter: 'Spear phishing, OSINT e ransomware: o ataque fica direcionado.',
          sceneLabel: 'Notebook e celular sobre a mesa, com um anexo de fatura suspeito na tela.',
          question: 'Mensagem do "diretor". Qual destas é golpe?',
          options: ['Reunião de alinhamento na sexta, sala 3.', '"Pague esta fatura hoje, urgente, e não comente com ninguém."'],
          scamIndex: 1,
          why: 'Urgência, sigilo e dinheiro: o padrão da fraude do CEO.',
        },
        en: {
          title: 'The targeted attack',
          chapter: 'Spear phishing, OSINT and ransomware: attacks get targeted.',
          sceneLabel: 'Laptop and phone on the desk, with a suspicious invoice attachment on screen.',
          question: 'A message from the "director". Which one is the scam?',
          options: ['Alignment meeting on Friday, room 3.', '"Pay this invoice today, it\'s urgent, and don\'t tell anyone."'],
          scamIndex: 1,
          why: 'Urgency, secrecy and money: the CEO fraud pattern.',
        },
      },
    },
    {
      key: '2020s',
      cover: 'assets/phishing/covers/2020s.webp',
      scene: scenes['2020s'],
      text: {
        pt: {
          title: 'Fazendas de phishing e IA',
          chapter: 'Kits de phishing, páginas realistas, IA generativa e deepfake de voz.',
          sceneLabel: 'Smartphone sobre a mesa recebendo um áudio que pede um PIX urgente.',
          question: 'Áudio no WhatsApp. Qual destes é golpe?',
          options: ['A voz idêntica à do seu chefe pedindo um PIX urgente.', 'Seu chefe pede para confirmar a reunião pelo Teams.'],
          scamIndex: 0,
          why: 'Voz clonada por IA: confirme sempre por outro canal.',
        },
        en: {
          title: 'Phishing farms and AI',
          chapter: 'Phishing kits, realistic pages, generative AI and voice deepfakes.',
          sceneLabel: 'Smartphone on the desk receiving a voice message asking for an urgent transfer.',
          question: 'A WhatsApp voice note. Which one is the scam?',
          options: ['Your boss\'s exact voice asking for an urgent PIX transfer.', 'Your boss asks you to confirm the meeting on Teams.'],
          scamIndex: 0,
          why: 'An AI-cloned voice: always confirm through another channel.',
        },
      },
    },
    {
      key: 'agora',
      cover: 'assets/phishing/covers/agora.webp',
      scene: scenes['agora'],
      text: {
        pt: {
          title: 'Como se proteger',
          chapter: '40 anos, a mesma isca: urgência, autoridade e confiança. Confirme por outro canal.',
          sceneLabel: 'Smartphone com o tubarão do desafio e dois links lado a lado para escolher.',
          question: 'Promoção da Loja Bela (site oficial: lojabela.com.br). Qual link é golpe?',
          options: ['lojabela.com.br/promo', 'lojabbela.com.br/promo'],
          scamIndex: 1,
          why: 'Uma letra a mais: typosquatting.',
        },
        en: {
          title: 'How to protect yourself',
          chapter: '40 years, the same bait: urgency, authority and trust. Confirm through another channel.',
          sceneLabel: 'Smartphone with the challenge shark and two links side by side to choose from.',
          question: 'A Loja Bela promotion (official site: lojabela.com.br). Which link is the scam?',
          options: ['lojabela.com.br/promo', 'lojabbela.com.br/promo'],
          scamIndex: 1,
          why: 'One extra letter: typosquatting.',
        },
      },
    },
  ];

  globalThis.PhishingEras = { ERAS };
})();
