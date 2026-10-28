// Six stops of the phishing time-travel journey: the same eras as the MOOC and the VESPAS' Con 26 poster.
// Mini-challenge domains are fictitious and rendered as text only.
(function () {
  const scene = () => {};

  const ERAS = [
    {
      key: '1980s',
      cover: 'assets/phishing/covers/1980s.webp',
      scene,
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
      scene,
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
      scene,
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
      scene,
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
      scene,
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
      scene,
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
