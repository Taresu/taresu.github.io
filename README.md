# Thales Sgarbi Salata — Portfólio Pessoal

> Portfólio profissional (recrutadores/empregadores) — DevSecOps · Purple Team.
> Bilíngue PT-BR / EN, tema dark cyber/terminal, página única e autocontida.

Este é o perfil pessoal, com sobre, experiência, projetos, skills, certificações e contato.

---

## Estrutura

```text
Personal-Portfolio/
├── index.html        # Site inteiro (HTML + Tailwind CDN + JS vanilla)
├── assets/
│   └── curriculo-thales-salata.pdf   # CV para download (cópia de Curriculum/)
├── serve.mjs         # Servidor de desenvolvimento (porta 3000)
├── screenshot.mjs    # Captura de tela via Puppeteer
└── package.json
```

## Como rodar

**Pré-requisito:** Node.js instalado.

```bash
npm install        # só necessário para screenshots (puppeteer)
node serve.mjs
```

Acesse **http://localhost:3000**

### Screenshots

```bash
node screenshot.mjs http://localhost:3000 portfolio
```

Imagens salvas em `temporary screenshots/` (não versionado).

## Idiomas

- **PT-BR** é o padrão; botão **PT / EN** na navbar troca todos os textos
- A escolha fica salva em `localStorage`
- O conteúdo do terminal animado do hero é sempre em inglês (proposital — identidade)

## Deploy no GitHub Pages

1. Crie um repositório (ex.: `portfolio` ou `<usuario>.github.io`)
2. Faça push de `index.html` + `assets/` (os `.mjs` e `package.json` são só para dev, mas não atrapalham)
3. No GitHub: **Settings → Pages → Source: Deploy from a branch → main / root**
4. O site fica em `https://<usuario>.github.io/<repo>/`

Não há build: o que está no repositório é o que vai ao ar.

## Manutenção de conteúdo

- Textos bilíngues: dicionário `I18N` no final do `index.html` (chaves `data-i18n`)
- Fonte de verdade do conteúdo: `../Curriculum/` (CV PDF, LinkedIn-BIO.md, GitHub-README.md)
- Ao atualizar o CV, substitua `assets/curriculo-thales-salata.pdf`

## Tecnologias

- HTML + Tailwind CSS via CDN (versão pinada com SRI)
- Vanilla JavaScript (i18n, animação de terminal, scroll reveal)
- Google Fonts: Space Grotesk, Inter, JetBrains Mono
- Node.js + Puppeteer (apenas desenvolvimento)
