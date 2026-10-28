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

  // A current smartphone on a slim stand: thin aluminium frame, edge-to-edge glass, camera island,
  // status bar and home indicator. Screens hosting text start at y = 3.322, just in front of the glass.
  function phoneOnStand(iso, g, glass, font) {
    iso.box(g, 2.9, 2.9, 0, 1.8, 1.1, 0.08, '#4b5563');
    iso.box(g, 3.25, 2.95, 0.08, 1.1, 0.25, 1.6, '#374151');
    iso.box(g, 3.0, 3.2, 0.08, 1.6, 0.12, 3.1, '#9aa4b2');
    iso.box(g, 4.6, 3.24, 2.2, 0.03, 0.05, 0.35, '#6b7280');
    iso.screen(g, 3.04, 3.321, 0.12, 1.52, 3.02, '#05070b');
    iso.screen(g, 3.07, 3.3215, 0.15, 1.46, 2.96, glass);
    iso.screen(g, 3.1, 3.322, 2.84, 1.4, 0.2, glass, true);
    iso.label(g, 3.14, 3.323, 2.88, '9:41', { fill: '#e6edf3', font, maxUnits: 0.4, size: 3, weight: 700 });
    iso.screen(g, 3.6, 3.323, 2.9, 0.38, 0.09, '#000000');
    [0.04, 0.07, 0.1].forEach((height, i) => iso.screen(g, 4.12 + i * 0.07, 3.323, 2.88, 0.04, height, '#e6edf3'));
    iso.screen(g, 4.36, 3.323, 2.88, 0.13, 0.08, '#e6edf3');
    iso.screen(g, 3.6, 3.323, 0.22, 0.4, 0.035, '#e5e7eb');
  }

  // Soft diagonal glare on the glass, drawn last so it sits over the content.
  function glare(iso, g) {
    iso.polygon(g, [[3.1, 3.324, 2.6], [3.55, 3.324, 2.8], [4.5, 3.324, 1.2], [4.5, 3.324, 0.8]], 'rgba(255,255,255,.05)');
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
      phoneOnStand(iso, g, '#161b22', font);
      iso.screen(g, 3.1, 3.322, 2.48, 1.4, 0.28, '#21262d', true);
      iso.label(g, 3.16, 3.323, 2.56, '● +55 41 9····', { fill: '#3fb950', font, maxUnits: 1.25, size: 4 });
      iso.screen(g, 3.2, 3.322, 1.62, 1.2, 0.7, '#21262d', true);
      iso.label(g, 3.28, 3.323, 1.7, '▶ 0:12', { fill: '#8b949e', font, maxUnits: 1.0, size: 4.5 });
      [0.12, 0.26, 0.18, 0.3, 0.22, 0.28, 0.14].forEach((height, i) => {
        iso.screen(g, 3.3 + i * 0.13, 3.323, 2.07 - height / 2, 0.06, height, '#3fb950');
      });
      iso.screen(g, 3.2, 3.322, 0.6, 1.2, 0.42, '#1f6feb', true);
      iso.label(g, 3.28, 3.323, 0.7, 'PIX ?', { fill: '#e6edf3', font, maxUnits: 1.0, size: 5, weight: 700 });
      glare(iso, g);
    },
    agora: (iso, g) => {
      const font = THEMES.agora.font;
      desk(iso, g);
      phoneOnStand(iso, g, '#0d1a12', font);
      iso.screen(g, 3.12, 3.322, 2.46, 1.36, 0.28, '#1a3326', true);
      iso.label(g, 3.18, 3.323, 2.54, '🔒 black friday', { fill: '#d1fae5', font, maxUnits: 1.2, size: 4 });
      iso.polygon(g, [[3.45, 3.323, 1.75], [4.25, 3.323, 1.75], [4.0, 3.323, 2.35]], '#4ade80');
      iso.screen(g, 3.15, 3.322, 1.2, 1.3, 0.32, '#1a3326', true);
      iso.label(g, 3.22, 3.323, 1.28, 'lojabela', { fill: '#d1fae5', font, maxUnits: 1.15, size: 5 });
      iso.screen(g, 3.15, 3.322, 0.7, 1.3, 0.32, '#1a3326', true);
      iso.label(g, 3.22, 3.323, 0.78, 'lojabeia', { fill: '#d1fae5', font, maxUnits: 1.15, size: 5 });
      glare(iso, g);
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
          question: 'Dois avisos do sysop no BBS. Qual é golpe?',
          options: ['SYSOP: migramos o BBS para um disco novo e algumas contas foram corrompidas. Responda esta mensagem com seu login e senha para restaurarmos o seu acesso.', 'SYSOP: migramos o BBS para um disco novo. Se a sua conta falhar, troque a senha no menu Usuário > Senha ao entrar.'],
          scamIndex: 0,
          why: 'Os dois falam da mesma migração, mas o golpe pede a senha por mensagem. O sysop de verdade já tem acesso a tudo e manda você trocar a senha no próprio sistema.',
        },
        en: {
          title: 'The dawn of cybercrime',
          milestone: 'BBS',
          chapter: 'Curiosity turns into threat: BBSs, phreaks and the first stolen passwords.',
          sceneLabel: 'Green-phosphor terminal and keyboard on the desk, asking for a login.',
          question: 'Two notices from the BBS sysop. Which one is the scam?',
          options: ['SYSOP: we moved the BBS to a new disk and some accounts were corrupted. Reply to this message with your login and password so we can restore your access.', 'SYSOP: we moved the BBS to a new disk. If your account fails, change your password in the User > Password menu when you log in.'],
          scamIndex: 0,
          why: 'Both mention the same migration, but the scam asks for your password by message. A real sysop already has full access and sends you to change it in the system itself.',
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
          question: 'Duas mensagens instantâneas da AOL sobre cobrança. Qual é golpe?',
          options: ['AOL Billing: o cartão cadastrado vence este mês. Atualize os dados em Keyword: Billing antes de 31/12.', 'AOL Member Services: houve um erro no cadastro do seu cartão. Para evitar o cancelamento, confirme aqui na conversa a sua senha e o número do cartão.'],
          scamIndex: 1,
          why: 'As duas tratam de cobrança, mas só o golpe pede senha e cartão dentro da conversa. A legítima manda você para a área oficial da AOL.',
        },
        en: {
          title: 'The origin of phishing',
          milestone: 'AOL',
          chapter: 'AOL accounts, AOHell and fake staff asking for passwords.',
          sceneLabel: 'Beige PC with a CRT monitor and floppy disks, showing a window that asks for the account password.',
          question: 'Two AOL instant messages about billing. Which one is the scam?',
          options: ['AOL Billing: the card on file expires this month. Update it at Keyword: Billing before 12/31.', 'AOL Member Services: there was an error with your card on file. To avoid cancellation, confirm your password and card number here in the chat.'],
          scamIndex: 1,
          why: 'Both are about billing, but only the scam asks for your password and card in the chat. The real one sends you to AOL\'s official area.',
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
          question: 'Dois e-mails do "PayPal" sobre acesso incomum. Qual é golpe?',
          options: ['Detectamos um acesso incomum e limitamos a sua conta. Restaure o acesso em https://www.paypal.com.br.secure-login.net/br', 'Detectamos um acesso incomum. Se não foi você, entre pelo app ou digite paypal.com no navegador e troque a sua senha.'],
          scamIndex: 0,
          why: 'O link começa com paypal.com.br, mas o domínio de verdade é secure-login.net, o que vem antes é só subdomínio. A mensagem legítima não manda link: pede que você entre por conta própria.',
        },
        en: {
          title: 'The rise of phishing',
          milestone: 'PayPal',
          chapter: 'Online banking, fake PayPal and eBay: the scam becomes a business.',
          sceneLabel: 'Open silver laptop with a bank e-mail asking you to update your details.',
          question: 'Two "PayPal" e-mails about unusual activity. Which one is the scam?',
          options: ['We detected unusual activity and limited your account. Restore access at https://www.paypal.com.br.secure-login.net/br', 'We detected unusual activity. If it wasn\'t you, open the app or type paypal.com in your browser and change your password.'],
          scamIndex: 0,
          why: 'The link starts with paypal.com.br, but the real domain is secure-login.net; everything before it is just a subdomain. The real message has no link: it asks you to go there yourself.',
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
          question: 'Dois e-mails da diretora financeira, Carla Mendes. Qual é golpe?',
          options: ['De carla.mendes@empresa.com.br: a NF do fornecedor já está no sistema de pagamentos para aprovação. Consegue conferir até sexta?', 'De carla.mendes@empresa-grupo.com: estou entrando em reunião com o cliente. Pague hoje a NF anexa; o fornecedor mudou de banco e os dados novos estão no PDF.'],
          scamIndex: 1,
          why: 'Mesmo nome, domínio parecido (empresa-grupo.com no lugar de empresa.com.br), troca de conta bancária e pressa fora do processo: o padrão da fraude do CEO.',
        },
        en: {
          title: 'The targeted attack',
          milestone: 'RSA',
          chapter: 'Spear phishing, OSINT and ransomware: attacks get targeted.',
          sceneLabel: 'Laptop and phone on the desk, with a suspicious invoice attachment on screen.',
          question: 'Two e-mails from the CFO, Carla Mendes. Which one is the scam?',
          options: ['From carla.mendes@empresa.com.br: the supplier invoice is in the payment system awaiting approval. Can you check it by Friday?', 'From carla.mendes@empresa-grupo.com: I\'m heading into a client meeting. Pay the attached invoice today; the supplier changed banks and the new details are in the PDF.'],
          scamIndex: 1,
          why: 'Same name, a look-alike domain (empresa-grupo.com instead of empresa.com.br), a bank change and rush outside the process: the CEO fraud pattern.',
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
          question: 'Dois áudios no WhatsApp com a voz do seu chefe. Qual é golpe?',
          options: ['De um número novo, com a foto dele: "Troquei de número. Consegue fazer um PIX de R$ 4.800 para o fornecedor agora? Depois te explico."', 'Do número que você já tem salvo: "Pode aprovar o pedido de compra 4521 no sistema? A cotação está anexada lá."'],
          scamIndex: 0,
          why: 'Foto e voz convincentes não bastam: número novo e PIX fora do processo são o sinal. Ligue para o número que você já conhece antes de pagar.',
        },
        en: {
          title: 'Phishing farms and AI',
          milestone: 'AI',
          chapter: 'Phishing kits, realistic pages, generative AI and voice deepfakes.',
          sceneLabel: 'Smartphone on the desk receiving a voice message asking for an urgent transfer.',
          question: 'Two WhatsApp voice notes in your boss\'s voice. Which one is the scam?',
          options: ['From a new number, with his photo: "I changed numbers. Can you send a R$ 4,800 PIX to the supplier now? I\'ll explain later."', 'From the number you already have saved: "Can you approve purchase order 4521 in the system? The quote is attached there."'],
          scamIndex: 0,
          why: 'A convincing photo and voice are not enough: a new number and a transfer outside the process are the tell. Call the number you already know before paying.',
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
          question: 'Black Friday da Loja Bela (site oficial: lojabela.com.br). Qual link é golpe?',
          options: ['lojabela.com.br/black-friday', 'lojabeia.com.br/black-friday'],
          scamIndex: 1,
          why: 'lojabeia troca o L por um i: em muitas fontes quase não se nota. É typosquatting.',
        },
        en: {
          title: 'How to protect yourself',
          milestone: 'you',
          chapter: '40 years, the same bait: urgency, authority and trust. Confirm through another channel.',
          sceneLabel: 'Smartphone with the challenge shark and two links side by side to choose from.',
          question: 'Loja Bela\'s Black Friday (official site: lojabela.com.br). Which link is the scam?',
          options: ['lojabela.com.br/black-friday', 'lojabeia.com.br/black-friday'],
          scamIndex: 1,
          why: 'lojabeia swaps the L for an i: in many fonts you barely notice. That is typosquatting.',
        },
      },
    },
  ];

  globalThis.PhishingEras = { ERAS };
})();
