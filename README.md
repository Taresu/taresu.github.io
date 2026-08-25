# Thales Sgarbi Salata — Portfólio Pessoal

> Portfólio profissional (recrutadores/empregadores) — Full Stack · DevSecOps · Segurança da Informação.
> Bilíngue PT-BR / EN, tema dark cyber/terminal, página única e autocontida.

Este repositório contém o perfil pessoal, com sobre, experiência, projetos, skills, certificações e contato.

---

## Estrutura

```text
Personal-Portfolio/
├── index.html        # Site inteiro (HTML + CSS + JS vanilla)
├── assets/
│   ├── curriculo-thales-salata.pdf   # CV PT-BR para download
│   ├── resume-thales-salata-en.pdf   # Résumé EN para download
│   └── TCC_Thales_Sgarbi_Salata_corrigido_revisado-1.pdf
├── serve.mjs         # Servidor de desenvolvimento (porta 3000)
├── screenshot.mjs    # Captura de tela via Puppeteer
├── worker.js          # Headers e negociação Markdown no Cloudflare Worker
├── test/              # Testes de segurança, SEO, hooks e higiene do repositório
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

## Deploy no Cloudflare Workers

`wrangler.toml` publica o diretório raiz, mas `.assetsignore` permite somente os arquivos públicos do site: HTML/Markdown, descoberta, sitemap, robots e `assets/`. Código de desenvolvimento, testes, configuração e documentação não são enviados como assets.

```bash
npm run build:pages       # monta uma cópia local da publicação
npm run deploy:cloudflare
```

## Manutenção de conteúdo

- Textos bilíngues: dicionário `I18N` no final do `index.html` (chaves `data-i18n`)
- O conteúdo público é mantido no dicionário `I18N`, no HTML e no `index.md`.
- Ao atualizar um documento publicado, substitua o PDF correspondente em `assets/` e valide os links com `npm run test:seo`.

## Tecnologias

- HTML + Tailwind runtime auto-hospedado em `assets/vendor/`
- Vanilla JavaScript (i18n, animação de terminal, scroll reveal)
- Google Fonts: Space Grotesk, Inter, JetBrains Mono
- Node.js + Puppeteer (apenas desenvolvimento)

## Arquivos locais

Screenshots, sessões de ferramentas, planos de trabalho, instaladores, ambientes e chaves são ignorados pelo Git e não fazem parte do projeto público. Os únicos documentos deliberadamente publicados são os dois currículos e o TCC vinculados pelo portfólio.
