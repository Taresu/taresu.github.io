# Thales Sgarbi Salata

**Full Stack · DevSecOps · Information Security**<br>
Curitiba, Brazil

I build and maintain web and mobile products, automate infrastructure, and bring security into the development lifecycle.

[Portfolio](https://thales-salata.dev/) · [GitHub](https://github.com/Taresu) · [LinkedIn](https://www.linkedin.com/in/thales-sgarbi-salata/) · [Email](mailto:thales.salata@gmail.com)

## Profile

I am an Information Systems graduate from UTFPR working across application development, platform integration, cloud operations, and cybersecurity. My current work includes the UTFPR institutional portal, the Nerdz cross-platform product, security research, and AI-assisted engineering with careful human review.

## Selected work

### UTFPR Portal

React and Volto interfaces integrated with Plone 6, aligned with the Gov.br Design System and supported by GitLab CI/CD.

[Visit UTFPR](https://www.utfpr.edu.br/)

### Nerdz

A group-study product for web, Android, and iOS built with React Native, Expo, NestJS, Prisma, PostgreSQL, and AWS delivery services.

[View product](https://landing.nerdz.aurasec.dev/)

### VeriPkg

A dependency-free Go CLI for honest verification of downloaded packages using OpenPGP signatures, pinned hashes, and explicit trust levels.

[View repository](https://github.com/Taresu/veripkg)

### VESPAS

Cybersecurity alerts, CTF labs, and security research through UTFPR’s VESPAS extension program.

[View organization](https://github.com/vespas-utfpr)

## Capabilities

- **Development:** React, TypeScript, React Native, Expo, NestJS, Plone, Volto, Python, Go, PostgreSQL, Prisma
- **DevSecOps:** GitLab CI/CD, Git, Docker, Ansible, Vagrant, Molecule, AWS S3/CloudFront
- **Offensive security:** CTF, penetration testing, phishing simulation, OWASP Top 10, MITRE ATT&CK, LLM risks
- **Defense and detection:** IAM, Active Directory, SOC operations, vulnerability management, Axur, Prisma Cloud, ISO 27001
- **AI-assisted engineering:** Anthropic API, MCP, multi-agent orchestration, generative AI tooling

## Public resources

- [Portuguese CV](https://thales-salata.dev/assets/curriculo-thales-salata.pdf)
- [English résumé](https://thales-salata.dev/assets/resume-thales-salata-en.pdf)
- [TCC / final paper](https://thales-salata.dev/assets/TCC_Thales_Sgarbi_Salata_corrigido_revisado-1.pdf)
- [Machine-readable portfolio](https://thales-salata.dev/index.md)

The linked documents are intentionally public portfolio material. Local screenshots, tool sessions, plans, installers, environments, and keys are excluded from the repository and deployment.

## Run locally

Requires Node.js.

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000).

Useful checks:

```bash
npm run verify:static
npm run test:security
npm run test:seo
npm run test:hygiene
npm run test:hooks
```

To capture reference screenshots while the server is running:

```bash
npm run screenshot -- http://localhost:3000 portfolio
```

## Deploy

The site is a zero-build static portfolio with a Cloudflare Worker for response headers and Markdown content negotiation. `wrangler.toml` points Cloudflare at the repository root, while `.assetsignore` publishes only the website assets and discovery files.

```bash
npm run build:pages
npm run deploy:cloudflare
```

## Repository map

```text
index.html       Portfolio interface, styles, translations, and browser logic
index.md         Machine-readable portfolio profile
assets/          Published documents, media, logos, icons, and vendor assets
worker.js        Cloudflare response headers and Markdown negotiation
serve.mjs        Loopback development server
test/            Security, SEO, hook, and repository-hygiene tests
wrangler.toml    Cloudflare deployment configuration
package.json     Development commands and tooling
```

## License

The project is released under the [MIT License](LICENSE).
