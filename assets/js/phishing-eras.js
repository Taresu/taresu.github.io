// Six stops of the phishing time-travel journey: the same eras as the MOOC and the VESPAS' Con 26 poster.
// Mini-challenge domains are fictitious and rendered as text only.
(function () {
  // Every scene shares the same desk, grid and framing so switching eras reads as one desk through time.
  function desk(iso, g) {
    iso.polygon(g, [[0.55, 0.45, -0.5], [7.25, 0.45, -0.5], [7.25, 5.65, -0.5], [0.55, 5.65, -0.5]], 'rgba(0,0,0,.28)');
    iso.box(g, 0.8, 0.7, -0.5, 6.2, 4.7, 0.5, '#2b3345');
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

  // Visual identity of each course module (colors and type), reused by the scenes and the stop panel.
  const THEMES = {
    '1980s': { accent: '#00ff41', font: "'Courier New', Courier, monospace" },
    '1990s': { accent: '#000080', font: 'Arial, Helvetica, sans-serif' },
    '2000s': { accent: '#2176cc', font: 'Arial, Helvetica, sans-serif' },
    '2010s': { accent: '#1565c0', font: "Roboto, 'Segoe UI', Arial, sans-serif" },
    '2020s': { accent: '#58a6ff', font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" },
    agora: { accent: '#4ade80', font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" },
  };

  const scenes = {
    '1980s': (iso, g) => {
      const font = THEMES['1980s'].font;
      desk(iso, g);
      iso.box(g, 2.4, 1.0, 0, 2.6, 2.4, 2.5, '#cfc6ad');
      iso.screen(g, 2.65, 3.401, 0.5, 2.1, 1.6, '#1a1a1a');
      iso.screen(g, 2.8, 3.402, 0.62, 1.8, 1.36, '#0c0c0c', true);
      iso.label(g, 2.92, 3.403, 1.6, 'LOGIN: _', { fill: '#00ff41', font, maxUnits: 1.56 });
      iso.label(g, 2.92, 3.403, 1.26, 'PASSWORD:', { fill: '#00ff41', font, maxUnits: 1.56 });
      iso.label(g, 2.92, 3.403, 0.92, '> _', { fill: '#a8f0c0', font, maxUnits: 1.56 });
      keyboard(iso, g, 2.3, 4.0, 2.9, '#c9bfa3');
    },
    '1990s': (iso, g) => {
      const font = THEMES['1990s'].font;
      desk(iso, g);
      iso.box(g, 1.0, 1.0, 0, 1.1, 2.6, 3.0, '#d8cfb6');
      iso.screen(g, 1.2, 3.601, 2.2, 0.7, 0.12, '#1b1b1b');
      iso.screen(g, 1.85, 3.601, 0.4, 0.12, 0.12, '#00ff87');
      iso.box(g, 2.2, 1.2, 0, 2.6, 2.2, 2.3, '#e2d9c0');
      iso.screen(g, 2.45, 3.401, 0.5, 2.1, 1.5, '#008080');
      iso.screen(g, 2.65, 3.402, 0.62, 1.7, 1.05, '#c0c0c0', true);
      iso.screen(g, 2.78, 3.403, 0.82, 1.44, 0.3, '#ffffff');
      iso.label(g, 2.84, 3.404, 0.9, '********', { fill: '#000000', font, maxUnits: 1.3, size: 5 });
      iso.screen(g, 2.65, 3.403, 1.48, 1.7, 0.19, '#000080', true);
      iso.label(g, 2.72, 3.404, 1.52, 'AOL', { fill: '#ffffff', font, maxUnits: 1.5, size: 3.4, weight: 700 });
      keyboard(iso, g, 2.1, 4.0, 3.0, '#c9bfa3');
      iso.box(g, 5.8, 3.6, 0, 0.9, 0.9, 0.05, '#222831');
      iso.box(g, 5.6, 4.2, 0, 0.9, 0.9, 0.05, '#e3803a');
    },
    '2000s': (iso, g) => {
      const font = THEMES['2000s'].font;
      desk(iso, g);
      laptop(iso, g, '#b4bcc7', '#8b95a3', '#ffffff');
      iso.screen(g, 2.15, 2.742, 1.85, 3.1, 0.35, '#2176cc', true);
      iso.label(g, 2.25, 2.743, 1.94, 'paypa1-seguro.com', { fill: '#ffffff', font, maxUnits: 2.9, size: 5, weight: 700 });
      iso.screen(g, 2.3, 2.743, 0.5, 2.8, 1.2, '#cce8ff', true);
      iso.label(g, 2.42, 2.744, 1.38, '⚠ 24h', { fill: '#c62828', font, maxUnits: 2.5, size: 5, weight: 700 });
      iso.screen(g, 2.42, 2.744, 1.0, 2.2, 0.08, '#8899aa');
      iso.screen(g, 2.42, 2.744, 0.82, 1.6, 0.08, '#8899aa');
      iso.screen(g, 2.42, 2.744, 0.58, 0.9, 0.16, '#2176cc');
      iso.box(g, 6.2, 4.4, 0, 0.4, 0.6, 0.15, '#d1d5db');
    },
    '2010s': (iso, g) => {
      const font = THEMES['2010s'].font;
      desk(iso, g);
      laptop(iso, g, '#4b5563', '#374151', '#ffffff');
      iso.screen(g, 2.15, 2.742, 1.85, 3.1, 0.35, '#1565c0', true);
      iso.label(g, 2.25, 2.743, 1.94, 'Inbox', { fill: '#ffffff', font, maxUnits: 2.9, size: 5, weight: 700 });
      iso.screen(g, 2.25, 2.743, 1.2, 2.9, 0.48, '#e3f2fd', true);
      iso.label(g, 2.35, 2.744, 1.32, 'NF-2016.zip', { fill: '#212121', font, maxUnits: 1.9, size: 5, weight: 700 });
      iso.screen(g, 4.45, 2.744, 1.3, 0.55, 0.22, '#d32f2f');
      iso.screen(g, 2.35, 2.743, 0.85, 2.4, 0.08, '#bdbdbd');
      iso.screen(g, 2.35, 2.743, 0.6, 1.8, 0.08, '#bdbdbd');
      iso.box(g, 6.0, 3.6, 0, 0.75, 1.4, 0.1, '#111827');
      iso.polygon(g, [[6.07, 3.67, 0.101], [6.68, 3.67, 0.101], [6.68, 4.93, 0.101], [6.07, 4.93, 0.101]], '#ffffff');
      iso.polygon(g, [[6.12, 3.75, 0.102], [6.63, 3.75, 0.102], [6.63, 4.0, 0.102], [6.12, 4.0, 0.102]], '#1565c0');
    },
    '2020s': (iso, g) => {
      const font = THEMES['2020s'].font;
      desk(iso, g);
      phoneOnStand(iso, g, '#161b22');
      iso.screen(g, 3.2, 3.362, 1.62, 1.2, 0.7, '#21262d', true);
      iso.label(g, 3.28, 3.363, 1.7, '▶ 0:12', { fill: '#8b949e', font, maxUnits: 1.0, size: 4.5 });
      [0.12, 0.26, 0.18, 0.3, 0.22, 0.28, 0.14].forEach((height, i) => {
        iso.screen(g, 3.3 + i * 0.13, 3.363, 2.07 - height / 2, 0.06, height, '#3fb950');
      });
      iso.screen(g, 3.2, 3.362, 0.6, 1.2, 0.42, '#1f6feb', true);
      iso.label(g, 3.28, 3.363, 0.7, 'PIX ?', { fill: '#e6edf3', font, maxUnits: 1.0, size: 5, weight: 700 });
    },
    agora: (iso, g) => {
      const font = THEMES.agora.font;
      desk(iso, g);
      phoneOnStand(iso, g, '#0d1a12');
      iso.polygon(g, [[3.45, 3.362, 1.9], [4.25, 3.362, 1.9], [4.0, 3.362, 2.75]], '#4ade80');
      iso.screen(g, 3.15, 3.362, 1.2, 1.3, 0.32, '#1a3326', true);
      iso.label(g, 3.22, 3.363, 1.28, 'lojabela', { fill: '#d1fae5', font, maxUnits: 1.15, size: 5 });
      iso.screen(g, 3.15, 3.362, 0.7, 1.3, 0.32, '#1a3326', true);
      iso.label(g, 3.22, 3.363, 0.78, 'lojabbela', { fill: '#d1fae5', font, maxUnits: 1.15, size: 5 });
    },
  };

  const ERAS = [
    {
      key: '1980s',
      cover: 'assets/phishing/covers/1980s.webp',
      theme: THEMES['1980s'],
      scene: scenes['1980s'],
      text: {
        pt: {
          title: 'O início do cibercrime',
          milestone: 'BBS',
          chapter: 'A curiosidade vira ameaça: BBS, phreaks e as primeiras senhas roubadas.',
          sceneLabel: 'Terminal com monitor de fósforo verde e teclado sobre a mesa, pedindo login.',
          question: 'Mensagem no BBS. Qual destas é golpe?',
          options: ['"Sou o sysop. Me passe sua senha para manutenção."', 'Aviso no mural: manutenção às 22h, nenhuma ação necessária.'],
          scamIndex: 0,
          why: 'O administrador do sistema (sysop) já tem acesso a tudo e nunca precisa pedir a sua senha. Quem pede senha por mensagem está tentando roubá-la.',
        },
        en: {
          title: 'The dawn of cybercrime',
          milestone: 'BBS',
          chapter: 'Curiosity turns into threat: BBSs, phreaks and the first stolen passwords.',
          sceneLabel: 'Green-phosphor terminal and keyboard on the desk, asking for a login.',
          question: 'A BBS message. Which one is the scam?',
          options: ['"I\'m the sysop. Send me your password for maintenance."', 'Board notice: maintenance at 10 pm, no action needed.'],
          scamIndex: 0,
          why: 'A system administrator (sysop) already has full access and never needs to ask for your password. Anyone asking for it by message is trying to steal it.',
        },
      },
    },
    {
      key: '1990s',
      cover: 'assets/phishing/covers/1990s.webp',
      theme: THEMES['1990s'],
      scene: scenes['1990s'],
      text: {
        pt: {
          title: 'A origem do phishing',
          milestone: 'AOL',
          chapter: 'Contas AOL, AOHell e falsos funcionários pedindo senha.',
          sceneLabel: 'PC bege com monitor de tubo e disquetes, com uma janela pedindo a senha da conta.',
          question: 'Janela de mensagem da AOL. Qual destas é golpe?',
          options: ['Sua fatura está disponível na área do assinante.', '"Verifique sua conta: digite sua senha abaixo."'],
          scamIndex: 1,
          why: 'Pedido de senha por mensagem: a isca clássica dos anos 90.',
        },
        en: {
          title: 'The origin of phishing',
          milestone: 'AOL',
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
      theme: THEMES['2000s'],
      scene: scenes['2000s'],
      text: {
        pt: {
          title: 'A ascensão do phishing',
          milestone: 'PayPal',
          chapter: 'Bancos on-line, PayPal e eBay falsos: o golpe vira negócio.',
          sceneLabel: 'Notebook prata aberto com um e-mail de banco pedindo atualização de dados.',
          question: 'E-mail do "PayPal". Qual destes é golpe?',
          options: ['"Conta limitada! Acesse paypa1-seguro.com"', 'Recibo de pagamento de R$ 49,90, sem link e sem pedido de dados.'],
          scamIndex: 0,
          why: 'paypa1, com o número 1 no lugar do L: domínio falso.',
        },
        en: {
          title: 'The rise of phishing',
          milestone: 'PayPal',
          chapter: 'Online banking, fake PayPal and eBay: the scam becomes a business.',
          sceneLabel: 'Open silver laptop with a bank e-mail asking you to update your details.',
          question: 'A "PayPal" e-mail. Which one is the scam?',
          options: ['"Account limited! Go to paypa1-seguro.com"', 'Payment receipt for R$ 49.90, with no link and no request for your details.'],
          scamIndex: 0,
          why: 'paypa1, with the digit 1 instead of an L: a fake domain.',
        },
      },
    },
    {
      key: '2010s',
      cover: 'assets/phishing/covers/2010s.webp',
      theme: THEMES['2010s'],
      scene: scenes['2010s'],
      text: {
        pt: {
          title: 'O ataque direcionado',
          milestone: 'RSA',
          chapter: 'Spear phishing, OSINT e ransomware: o ataque fica direcionado.',
          sceneLabel: 'Notebook e celular sobre a mesa, com um anexo de fatura suspeito na tela.',
          question: 'Mensagem do "diretor". Qual destas é golpe?',
          options: ['Reunião de alinhamento na sexta, sala 3.', '"Pague esta fatura hoje, urgente, e não comente com ninguém."'],
          scamIndex: 1,
          why: 'Urgência, sigilo e dinheiro: o padrão da fraude do CEO.',
        },
        en: {
          title: 'The targeted attack',
          milestone: 'RSA',
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
      theme: THEMES['2020s'],
      scene: scenes['2020s'],
      text: {
        pt: {
          title: 'Fazendas de phishing e IA',
          milestone: 'IA',
          chapter: 'Kits de phishing, páginas realistas, IA generativa e deepfake de voz.',
          sceneLabel: 'Smartphone sobre a mesa recebendo um áudio que pede um PIX urgente.',
          question: 'Dois áudios no WhatsApp. Qual destes é golpe?',
          options: ['Áudio com a voz do seu chefe pedindo um PIX urgente para um fornecedor novo.', 'Áudio do seu chefe avisando que a reunião mudou para as 15h.'],
          scamIndex: 0,
          why: 'Mesmo com a voz certa, PIX urgente é sinal de golpe: a IA já clona vozes. Confirme por outro canal.',
        },
        en: {
          title: 'Phishing farms and AI',
          milestone: 'AI',
          chapter: 'Phishing kits, realistic pages, generative AI and voice deepfakes.',
          sceneLabel: 'Smartphone on the desk receiving a voice message asking for an urgent transfer.',
          question: 'Two WhatsApp voice notes. Which one is the scam?',
          options: ['Your boss\'s voice asking for an urgent PIX transfer to a new supplier.', 'Your boss letting you know the meeting moved to 3 pm.'],
          scamIndex: 0,
          why: 'Even with the right voice, an urgent transfer is a red flag: AI can already clone voices. Confirm through another channel.',
        },
      },
    },
    {
      key: 'agora',
      cover: 'assets/phishing/covers/agora.webp',
      theme: THEMES.agora,
      scene: scenes['agora'],
      text: {
        pt: {
          title: 'Como se proteger',
          milestone: 'você',
          chapter: '40 anos, a mesma isca: urgência, autoridade e confiança. Confirme por outro canal.',
          sceneLabel: 'Smartphone com o tubarão do desafio e dois links lado a lado para escolher.',
          question: 'Promoção da Loja Bela (site oficial: lojabela.com.br). Qual link é golpe?',
          options: ['lojabela.com.br/promo', 'lojabbela.com.br/promo'],
          scamIndex: 1,
          why: 'Uma letra a mais: typosquatting.',
        },
        en: {
          title: 'How to protect yourself',
          milestone: 'you',
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
